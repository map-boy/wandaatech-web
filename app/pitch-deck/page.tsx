import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "InsureRw Assistant - Pitch Deck - NBR FinTech Innovation Hackathon 2026",
  description:
    "Pitch deck for InsureRw Assistant, a bilingual AI insurance claims chatbot built for the National Bank of Rwanda FinTech Innovation Hackathon 2026.",
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 sm:p-7">
      <h2 className="text-lg sm:text-xl font-semibold text-amber-400 mb-3">
        {title}
      </h2>
      <div className="text-sm sm:text-[15px] text-white/75 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  )
}

export default function PitchDeckPage() {
  return (
    <main className="min-h-screen w-full bg-black text-white">
      <section className="w-full border-b border-white/10 bg-gradient-to-b from-amber-950/40 to-black px-6 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-amber-400">
            National Bank of Rwanda - FinTech Innovation Hackathon 2026
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
            InsureRw Assistant - Pitch Deck
          </h1>
          <p className="mt-3 text-base sm:text-lg text-white/70">
            A bilingual AI-powered insurance claims chatbot for Rwanda,
            accessible via WhatsApp and web.
          </p>
          <p className="mt-4">
            <a
              href="/insurance-platform"
              className="text-sm text-amber-400 hover:text-amber-300 underline underline-offset-4"
            >
              Watch the live product demo
            </a>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10 sm:py-14 space-y-6">
        <Section title="1. Problem Statement">
          <p>
            Most Rwandan policyholders, especially outside Kigali, struggle to
            file and track insurance claims. Claims forms and insurer portals
            are typically English or French only, the process is
            paperwork-heavy, and rural clients have limited access to agents
            or branches. This friction discourages people from claiming what
            they are owed and undermines trust in insurance, which is a key
            barrier to Rwanda&apos;s financial inclusion goals under the
            FSDS 2025-2029.
          </p>
        </Section>

        <Section title="2. Innovation and Differentiation">
          <p>
            InsureRw Assistant is a bilingual (Kinyarwanda and English)
            conversational AI purpose-built for insurance claims, delivered
            over WhatsApp, the channel Rwandans already use daily, alongside
            a lightweight web app. Unlike existing insurer portals (English
            or French, low WhatsApp reach) or generic chatbots (not
            insurance-aware, not Kinyarwanda-fluent), our assistant
            understands claim-specific language, extracts structured claim
            data automatically, and gives real-time status updates. This
            removes the need to download an app, visit a branch, or fill in
            paper forms, which increases usage by meeting users where they
            already are.
          </p>
        </Section>

        <Section title="3. Readiness for Testing and Market Deployment">
          <p>
            A functional prototype is live and demonstrated in the submitted
            video: bilingual chat intake, WhatsApp and web channels, and a
            structured claims flow. It is built by VAF UBWENGE TECH, a
            Kigali-based team with a track record shipping production
            fintech and mobile apps (including a ride-hailing and payments
            platform and a real estate marketplace) on Firebase and modern AI
            infrastructure. To move from pilot to launch we need: (a) a
            partnership with one or more licensed insurers for live claims
            data and payout rails, (b) access to the NBR Regulatory Sandbox
            to test with real policyholders under supervision, and (c) modest
            funding to cover WhatsApp Business API and cloud compute costs at
            scale.
          </p>
        </Section>

        <Section title="4. Expected Impact, Implementation Plan and Scalability">
          <p>
            <span className="text-white font-medium">Impact:</span> faster
            claims turnaround, higher trust and uptake of insurance among
            under-insured and rural, Kinyarwanda-speaking populations, and
            reduced routine workload for insurer call centers and agents.
          </p>
          <p>
            <span className="text-white font-medium">Implementation plan:</span>{" "}
            Phase 1 (0-3 months): pilot with one insurance partner inside the
            NBR sandbox. Phase 2 (3-9 months): expand to additional insurers
            and product lines such as motor, health, and agriculture
            insurance. Phase 3 (9+ months): national scale-up over WhatsApp
            with mobile money-integrated payouts.
          </p>
          <p>
            <span className="text-white font-medium">Scalability:</span> the
            same conversational core extends to other financial products
            (savings, credit, agricultural insurance) and can be adapted to
            other East African markets with similar language and
            mobile-money usage patterns.
          </p>
        </Section>

        <Section title="5. User Journey">
          <p>1. Policyholder messages our WhatsApp number or opens the web app.</p>
          <p>2. They are greeted bilingually and choose Kinyarwanda or English.</p>
          <p>3. They describe the incident in natural language, by text or voice.</p>
          <p>4. The assistant extracts the policy number and incident details and requests supporting photos or documents.</p>
          <p>5. The claim is validated against policy rules and routed to the insurer&apos;s system.</p>
          <p>6. The user receives a reference number and real-time status updates.</p>
          <p>7. On approval, payout is initiated automatically.</p>
          <p>8. The user confirms receipt and can leave feedback, closing the loop.</p>
        </Section>

        <Section title="6. Payment Process Flow">
          <p>
            <span className="text-white font-medium">Claim payouts:</span>{" "}
            once an insurer approves a claim, a payout request is triggered
            automatically and funds are disbursed via the MTN Mobile Money
            API directly to the policyholder&apos;s registered MoMo number.
            The user receives a WhatsApp confirmation with a transaction ID,
            and the transaction is logged for insurer and NBR audit purposes.
          </p>
          <p>
            <span className="text-white font-medium">Premium payments:</span>{" "}
            policyholders can pay or renew premiums from within the chat via
            an MTN MoMo push-USSD prompt initiated by the assistant, with
            instant confirmation and a receipt sent over WhatsApp.
          </p>
        </Section>

        <div className="pt-4 text-center">
          <a
            href="/"
            className="text-sm text-white/50 hover:text-white underline underline-offset-4"
          >
            Back to VAF UBWENGE TECH
          </a>
        </div>
      </section>
    </main>
  )
}
