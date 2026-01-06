import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { calculateRelevance, generateAIContent } from '@/lib/ai'

// POST /api/search - Semantic search, RAG, and AI Q&A
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, limit = 10, mode = 'auto' } = body // mode: 'auto' | 'search' | 'ask'

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // 1. Fetch all searchable content from Prisma
    // We include more fields for better context
    const [posts, gardenNotes, projects] = await Promise.all([
      db.post.findMany({
        where: { published: true },
        include: { tags: { include: { tag: true } } }
      }),
      db.gardenNote.findMany({
        include: { tags: { include: { tag: true } } }
      }),
      db.project.findMany({
        include: { tags: { include: { tag: true } } }
      })
    ])

    // 2. Prepare the Knowledge Base
    const allContent = [
      ...posts.map(post => ({
        type: 'blog',
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        tags: post.tags.map(t => t.tag.name).join(', '),
        date: post.createdAt.toISOString().split('T')[0]
      })),
      ...gardenNotes.map(note => ({
        type: 'garden',
        id: note.id,
        slug: note.slug,
        title: note.title,
        excerpt: note.summary, // Using summary as excerpt
        content: note.content, // Full content for deep search
        tags: note.tags.map(t => t.tag.name).join(', '),
        date: note.createdAt.toISOString().split('T')[0]
      })),
      ...projects.map(project => ({
        type: 'project',
        id: project.id,
        slug: project.slug,
        title: project.title,
        excerpt: project.description,
        content: project.longDescription || project.description,
        tags: project.tags.map(t => t.tag.name).join(', '),
        date: project.createdAt.toISOString().split('T')[0]
      }))
    ]

    // 3. Local filtering/ranking first (Hybrid Search Approach)
    // This helps reduce the token count sent to LLM if the dataset is huge, 
    // but for this blog size, we might send most valid text.
    // However, let's score them to prioritize top context.
    const scoredContent = allContent.map(item => ({
      ...item,
      score: calculateRelevance(query, {
        title: item.title,
        content: item.content || undefined,
        description: item.excerpt || undefined
      })
    })).sort((a, b) => b.score - a.score)

    // Take top results to fit in context context window 
    // (Assuming ~30 items max for context to strictly avoid limits on standard models)
    const contextItems = scoredContent.slice(0, 30)

    // Format context for the LLM
    const contextText = contextItems.map((item, index) => {
      return `[${index + 1}] Type: ${item.type.toUpperCase()} | Title: "${item.title}" | Tags: ${item.tags}\nSummary: ${item.excerpt}\nContent Snippet: ${item.content?.slice(0, 800)}...`
    }).join('\n\n---\n\n')

    // 4. Construct Prompt based on intent
    const systemPrompt = `You are the AI Assistant for a developer's personal blog/digital garden. 
Your goal is to help users find content and answer questions.

Context: The user is searching or asking about: "${query}"

Instructions:
1. Analyze the 'Knowledge Base' provided below.
2. If the user's query matches content in the Knowledge Base:
   - prioritization finding relevant content.
   - Answer their question using that content.
   - Return valid 'results' referencing the source items.
3. If the user's query is a GENERAL QUESTION (e.g., "what is 1+1", "explain generics in general") and NO specific blog content is found:
   - Answer the question helpfully using your own general knowledge.
   - clearly state: "I couldn't find specific matches in the blog, but here is a general answer:"
   - Return empty 'results'.
4. ALWAYS return a JSON response with: 
   - 'answer': A helpful natural language summary/answer.
   - 'results': An array of the top relevant items (if any). { id, type, title, slug, relevanceScore, reason }.

Knowledge Base:
${contextText}`

    // 5. Call AI
    let aiData: any = null
    try {
      const aiResponse = await generateAIContent({
        messages: [
          { role: 'system', content: 'You are a helpful JSON-speaking assistant.' },
          { role: 'user', content: systemPrompt }
        ]
      })

      if (aiResponse) {
        // Attempt to extract JSON from potential markdown wrapping
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          aiData = JSON.parse(jsonMatch[0])
        } else {
          // Fallback if AI didn't return JSON but plain text
          console.warn("AI returned non-JSON text", aiResponse.slice(0, 100))
          aiData = {
            answer: aiResponse,
            results: []
          }
        }
      }
    } catch (err) {
      console.error("AI Generation failed:", err)
      // Fallback relies on local scoring below
    }

    // 6. Fail-safe / Fallback (if AI fails or API key missing)
    // We use the local `scoredContent` we calculated earlier ONLY if AI gave us nothing usable.
    // If AI returned an answer (even with 0 results), we trust it (e.g. for general questions).
    if (!aiData) {
      console.log("Using local fallback mechanism")
      const localTop = scoredContent.filter(i => i.score > 0.1).slice(0, limit)

      return NextResponse.json({
        query,
        answer: localTop.length > 0
          ? `I found ${localTop.length} items that match your keywords.`
          : "I couldn't find any exact matches for your query.",
        results: localTop.map(item => ({
          id: item.id,
          type: item.type,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          matchScore: Math.round(item.score * 100) // normalized for UI
        })),
        isFallback: true
      })
    }

    // 7. Merge AI findings with real data to ensure slugs/ids are correct
    // (AI might hallucinate IDs, so we match by Title or loose comparison if needed, 
    // but best to trust the data structure we passed if prompt followed instructions)

    // However, since we passed the raw data, the AI "results" should ideally just copy them.
    // To be safe, we map the AI result IDs back to our `contextItems` to get full objects.
    const finalResults = (aiData.results || []).map((r: any) => {
      const original = contextItems.find(i => i.id === r.id || i.title === r.title)
      return original ? {
        ...original,
        matchScore: Math.round((r.relevanceScore || original.score || 0.5) * 100),
        reason: r.reason
      } : null
    }).filter(Boolean)

    return NextResponse.json({
      query,
      answer: aiData.answer,
      results: finalResults,
      total: finalResults.length
    })

  } catch (error) {
    console.error('Search API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
