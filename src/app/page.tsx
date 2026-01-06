import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { StatsSection } from '@/components/StatsSection'
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { SectionPreview } from '@/components/home/SectionPreview'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection />

        <FeaturesSection />

        <SectionPreview />

        {/* Stats Section (Server Component) */}
        <StatsSection />

        {/* Interactive Playground Section */}
        <section className="py-24 bg-zinc-950 text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent)] pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                  <Badge className="bg-emerald-500 text-white mb-4">Interactive</Badge>
                  <h2 className="text-4xl font-black tracking-tight mb-4">Code Playground</h2>
                  <p className="text-zinc-400 text-lg">
                    Test snippets, run experiments, and visualize algorithms directly in the browser.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center p-12 border border-zinc-800 rounded-3xl bg-zinc-900/50 border-dashed">
                <p className="text-zinc-500 italic">Interactive playground coming soon...</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
