import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { buildMetadata } from '@/lib/metadata'
import { Breadcrumb } from '@/components/Breadcrumb'

interface Step {
  title: string
  content: string
  image_url?: string
}

interface Tutorial {
  id: string
  slug: string
  title: string
  meta_description: string | null
  category: string | null
  tool_slug: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null
  duration_minutes: number | null
  cover_image_url: string | null
  summary: string | null
  content_md: string | null
  steps: Step[] | null
  tags: string[] | null
  is_featured: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from('tutorials')
    .select('slug')
    .eq('is_published', true)

  return (data ?? []).map((row: { slug: string }) => ({ slug: row.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data } = await supabase
    .from('tutorials')
    .select('title, meta_description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!data) return {}

  return buildMetadata({
    title: data.title,
    description: data.meta_description ?? undefined,
  })
}

const difficultyMap: Record<string, { label: string; className: string }> = {
  beginner: { label: '入门', className: 'bg-emerald-100 text-emerald-700' },
  intermediate: { label: '进阶', className: 'bg-amber-100 text-amber-700' },
  advanced: { label: '高级', className: 'bg-rose-100 text-rose-700' },
}

function simpleMarkdown(md: string): string {
  return '<p>' + md.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>'
}

export default async function TutorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: tutorial } = await supabase
    .from('tutorials')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single<Tutorial>()

  if (!tutorial) notFound()

  const difficulty = tutorial.difficulty ? difficultyMap[tutorial.difficulty] : null
  const steps = tutorial.steps ?? []
  const tags = tutorial.tags ?? []

  return (
    <main>
      <Breadcrumb
        items={[
          { name: '教程', url: '/tutorials' },
          { name: tutorial.title, url: `/tutorials/${tutorial.slug}` },
        ]}
      />

      {/* Hero */}
      <section style={{ backgroundColor: '#0f0f12' }} className="py-12 px-4">
        <div className="container-content mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {tutorial.category && (
              <span className="section-label bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                {tutorial.category}
              </span>
            )}
            {difficulty && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${difficulty.className}`}>
                {difficulty.label}
              </span>
            )}
            {tutorial.duration_minutes != null && (
              <span className="text-gray-400 text-sm">{tutorial.duration_minutes} 分钟</span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">{tutorial.title}</h1>

          {tutorial.summary && (
            <p className="text-gray-300 text-lg max-w-2xl mb-6">{tutorial.summary}</p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-white/10 text-gray-300 text-xs px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="container-content mx-auto px-4 py-10 space-y-12">
        {/* Steps */}
        {steps.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">操作步骤</h2>
            <ol className="space-y-6">
              {steps.map((step, index) => (
                <li key={index} className="card flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.content}</p>
                    {step.image_url && (
                      <img
                        src={step.image_url}
                        alt={step.title}
                        className="mt-3 rounded-lg border border-gray-200 max-w-full"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Content */}
        {tutorial.content_md && (
          <section>
            <article
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: simpleMarkdown(tutorial.content_md) }}
            />
          </section>
        )}

        {/* Back link */}
        <div className="pt-4 border-t border-gray-200">
          <Link
            href="/tutorials"
            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
          >
            ← 返回教程列表
          </Link>
        </div>
      </div>
    </main>
  )
}
