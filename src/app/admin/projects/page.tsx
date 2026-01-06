'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Hammer, Plus, Edit, Trash2, ArrowRight, Search, Github, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const statusConfig = {
  idea: {
    label: 'Idea',
    color: 'bg-gray-500/10 text-gray-600',
    icon: '💡'
  },
  'in-progress': {
    label: 'In Progress',
    color: 'bg-blue-500/10 text-blue-600',
    icon: '🔨'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-500/10 text-green-600',
    icon: '✅'
  },
  archived: {
    label: 'Archived',
    color: 'bg-gray-500/10 text-gray-500',
    icon: '📦'
  }
}

import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'

export default function ProjectsList() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/admin/projects')
        if (response.ok) {
          const data = await response.json()
          setProjects(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/projects`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        alert('Project deleted successfully!')
        const updatedProjects = projects.filter(p => p.id !== id)
        setProjects(updatedProjects)
      } else {
        alert('Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Error deleting project')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 relative overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12"
          >
            <div>
              <h1 className="text-5xl sm:text-7xl font-black mb-4 tracking-tight">
                Project <span className="text-purple-600 italic">Forge</span>.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Management portal for your engineered experiments and products.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-2 rounded-xl border-purple-500/20 focus-visible:ring-purple-500/20"
                />
              </div>
              <Link href="/admin/projects/new" className="w-full sm:w-auto">
                <Button className="w-full gap-2 h-12 px-6 font-bold bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20">
                  <Plus className="h-5 w-5" />
                  New Project
                </Button>
              </Link>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin h-10 w-10 border-b-2 border-purple-500 rounded-full"></div>
              <p className="text-muted-foreground font-medium">Forging results...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, i) => {
                const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.idea
                const techStack = project.techStack ? JSON.parse(project.techStack) : []

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="h-full flex flex-col border-2 hover:border-purple-500/50 transition-all hover:shadow-2xl group overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <Badge className={status.color + " border border-purple-500/10"}>
                            {status.icon} {status.label}
                          </Badge>
                          <div className="p-2 bg-muted rounded-lg text-sm font-mono flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            {project.viewCount || 0}
                          </div>
                        </div>
                        <CardTitle className="text-2xl font-bold group-hover:text-purple-600 transition-colors line-clamp-2">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="text-base line-clamp-3 mt-2 leading-relaxed">
                          {project.description || 'No description provided'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="mt-auto pt-6 border-t bg-muted/5 flex flex-col gap-6">
                        <div className="flex flex-wrap gap-2">
                          {techStack.map((tech: any) => (
                            <Badge key={tech.name} variant="secondary" className="bg-purple-500/5 text-purple-700 border-purple-500/10">
                              {tech.name}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/projects/${project.slug}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full gap-2 border-2 hover:bg-purple-50 hover:text-purple-600 border-purple-500/20">
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/admin/projects/${project.id}/edit`} className="flex-1">
                            <Button variant="secondary" size="sm" className="w-full gap-2">
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}

          {!loading && filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-purple-500/5 rounded-3xl border-2 border-dashed border-purple-500/20"
            >
              <Hammer className="h-16 w-16 text-purple-500/50 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? 'Try adjusting your search terms' : 'Begin engineering your first project.'}
              </p>
              <Link href="/admin/projects/new">
                <Button className="h-12 px-8 font-bold bg-purple-600 hover:bg-purple-700 shadow-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Forge New Project
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

