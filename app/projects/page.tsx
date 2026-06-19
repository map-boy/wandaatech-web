import { MarqueeBar } from '@/components/marquee-bar'
import { Header } from '@/components/header'
import { Project } from '@/components/project'
import { Footer } from '@/components/footer'

const PROJECT_VIDEOS = [
  {
    src: '/bustag_video.mp4',
    title: 'BusTag',
    label: 'Transit Technology',
    description:
      'Real-time bus tracking and ticketing for Rwanda — featuring MTN Mobile Money integration, live maps, and multilingual support.',
    accent: 'emerald',
  },
  {
    src: '/wandaa_ai_video.mp4',
    title: 'WANDAA AI',
    label: 'Language Model',
    description:
      'Kinyarwanda-first conversational AI — built from the ground up for local language fluency and scenario-based reasoning.',
    accent: 'sky',
  },
]

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarqueeBar />
      <Header />

      <main className="pt-32 pb-20">
        {/* ── Page Title ── */}
        <div className="container mx-auto px-6 mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
            Our <span className="text-emerald-500">Projects</span>
          </h1>
          <p className="text-slate-400 mt-4 max-w-2xl font-mono text-xs uppercase tracking-widest">
            VAF Intelligence Deployment Archive
          </p>
        </div>

        {/* ── Video Showcase ── */}
        <section className="container mx-auto px-6 mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-10">
            <span className="text-emerald-500 font-mono text-[11px] font-bold uppercase tracking-widest">
              🎬 Project Demos
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {PROJECT_VIDEOS.map((vid) => {
              const isEmerald = vid.accent === 'emerald'
              return (
                <div
                  key={vid.src}
                  className={`group rounded-2xl border overflow-hidden transition-all duration-300 ${
                    isEmerald
                      ? 'border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10'
                      : 'border-sky-500/20 hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/10'
                  } bg-card`}
                >
                  {/* Video */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <video
                      src={vid.src}
                      className="w-full h-full object-cover"
                      controls
                      muted
                      playsInline
                      preload="metadata"
                    />
                    {/* Subtle overlay on corners */}
                    <div
                      className={`absolute inset-0 pointer-events-none rounded-t-2xl border-b ${
                        isEmerald ? 'border-emerald-500/10' : 'border-sky-500/10'
                      }`}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                          isEmerald
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}
                      >
                        {vid.label}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">
                      {vid.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {vid.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Project Cards (existing component) ── */}
        <Project />
      </main>

      <Footer />
    </div>
  )
}