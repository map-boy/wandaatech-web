/**
 * Explanatory copy for the tool pages.
 *
 * These pages used to ship almost no server-rendered text — the tool itself is
 * a client component, so a crawler saw a heading and nothing else. That is
 * what Google calls a page without enough unique content. The prose here
 * describes what each tool actually does, which helps a visitor decide whether
 * to use it and gives the page a reason to be indexed.
 */

export interface ExplainerSection {
  heading: string
  paragraphs?: string[]
  bullets?: { term: string; description: string }[]
}

export function ToolExplainer({
  lead,
  sections,
}: {
  lead: string
  sections: ExplainerSection[]
}) {
  return (
    <section className="container mx-auto px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-10">
        <p className="text-lg leading-relaxed text-muted-foreground">{lead}</p>

        {sections.map((section) => (
          <div key={section.heading} className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
              {section.heading}
            </h2>

            {section.paragraphs?.map((paragraph, i) => (
              <p key={i} className="leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}

            {section.bullets && (
              <ul className="space-y-3">
                {section.bullets.map((bullet) => (
                  <li key={bullet.term} className="skeuo-inset rounded-xl px-4 py-3">
                    <span className="font-bold text-foreground">{bullet.term}</span>
                    <span className="text-muted-foreground"> — {bullet.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
