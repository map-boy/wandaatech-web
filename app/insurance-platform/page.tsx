import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "InsureRw Assistant — NBR FinTech Innovation Hackathon 2026",
  description:
    "InsureRw Assistant is a bilingual (Kinyarwanda & English) AI-powered insurance claims chatbot built for the National Bank of Rwanda FinTech Innovation Hackathon 2026, accessible via WhatsApp and web.",
}

export default function InsurancePlatformPage() {
  return (
    <main className="min-h-screen w-full bg-black text-white">
      {/* Hero */}
      <section className="w-full border-b border-white/10 bg-gradient-to-b from-amber-950/40 to-black px-6 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-amber-400">
            National Bank of Rwanda &middot; FinTech Innovation Hackathon 2026
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
            InsureRw Assistant
          </h1>
          <p className="mt-3 text-base sm:text-lg text-white/70">
            An AI-powered insurance claims chatbot in{" "}
            <span className="text-white font-medium">Kinyarwanda &amp; English</span>,
            accessible via WhatsApp or a simple web app.
          </p>
          <p className="mt-2 text-sm text-white/50">
            Built by VAF UBWENGE TECH &middot; Kigali, Rwanda
          </p>
        </div>
      </section>

      {/* Video */}
      <section className="w-full flex items-center justify-center bg-black px-4 py-8 sm:py-10">
        <div className="w-full max-w-4xl">
          <video
            src="/insurance-platform.mp4"
            controls
            autoPlay
            playsInline
            className="w-full h-auto rounded-xl shadow-2xl shadow-amber-900/20 border border-white/10"
          >
            Your browser does not support the video tag.
          </video>
          <div className="mt-3 text-center">
            
              href="/insurance-platform.mp4"
              download
              className="text-sm text-amber-400 hover:text-amber-300 underline underline-offset-4"
            >
              Download the demo video
            </a>
          </div>
        </div>
      </section>

      {/* Context */}
      <section className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-amber-400 mb-2">The Challenge</h2>
            <p className="text-sm text-white/70 leading-relaxed">
              The National Bank of Rwanda invited fintech innovators to build
              practical solutions for Rwanda&apos;s financial sector, in line
              with the FSDS 2025&ndash;2029 and the National FinTech Strategy
              2024&ndash;2029 &mdash; under the thematic area of{" "}
              <span className="text-white font-medium">
                enhancing access and innovation in digital insurance
              </span>.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-amber-400 mb-2">Our Solution</h2>
            <p className="text-sm text-white/70 leading-relaxed">
              InsureRw Assistant lets Rwandan policyholders file and track
              insurance claims through natural conversation in Kinyarwanda or
              English, on WhatsApp or the web &mdash; removing paperwork and
              language barriers from the claims process.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-amber-400 mb-3">How It Works</h2>
          <ul className="space-y-2 text-sm text-white/70 list-disc list-inside">
            <li>User starts a claim conversation via WhatsApp or the web app</li>
            <li>AI assistant understands and responds in Kinyarwanda or English</li>
            <li>Claim details are captured, structured, and validated automatically</li>
            <li>User receives real-time status updates on their claim</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {["Kinyarwanda NLP", "WhatsApp Integration", "AI Chatbot", "Web App", "Digital Insurance"].map(
            (tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
              >
                {tag}
              </span>
            )
          )}
        </div>

        <div className="mt-10 text-center">
          
            href="/"
            className="text-sm text-white/50 hover:text-white underline underline-offset-4"
          >
            &larr; Back to VAF UBWENGE TECH
          </a>
        </div>
      </section>
    </main>
  )
}