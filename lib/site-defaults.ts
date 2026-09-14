// ===========================================================================
// Every editable string, image and link on the public site lives here.
//
// These are FALLBACKS. Whatever the admin panel stores in `site_content`
// under the same key wins. Because the defaults are real copy (not empty
// placeholders) the site always renders correctly — even before anyone has
// opened /admin, and even if Supabase is unreachable.
//
// To expose a new editable field:
//   1. add an entry here
//   2. read it with  t('your.key')  in a server component, or
//      useContent().t('your.key')  in a client component
//   3. press "Sync content keys" in /admin → Site Content
// ===========================================================================

export type ContentType =
  | 'text'
  | 'richtext'
  | 'image'
  | 'url'
  | 'color'
  | 'number'
  | 'boolean'
  | 'list'

export interface ContentDefinition {
  key: string
  label: string
  section: string
  type: ContentType
  value: string
  help?: string
}

/**
 * `list` values are newline-separated. `richtext` values are plain text where
 * a blank line starts a new paragraph — no HTML is ever injected, so an admin
 * cannot accidentally (or deliberately) script the public site.
 */
export const SITE_CONTENT_DEFAULTS: ContentDefinition[] = [
  // ── Brand ────────────────────────────────────────────────────────────────
  { key: 'brand.name',        section: 'brand', type: 'text', label: 'Company name',      value: 'VAF UBWENGE TECH' },
  { key: 'brand.shortName',   section: 'brand', type: 'text', label: 'Short name',        value: 'VAF' },
  { key: 'brand.tagline',     section: 'brand', type: 'text', label: 'Tagline',           value: 'Intelligence Systems & Digital Solutions' },
  { key: 'brand.logo',        section: 'brand', type: 'image', label: 'Logo',             value: '/vaf-logo.png' },
  { key: 'brand.banner',      section: 'brand', type: 'image', label: 'Social share image', value: '/vaf-tech-banner.png' },
  { key: 'brand.marquee',     section: 'brand', type: 'list',  label: 'Marquee messages',
    value: 'Student-led innovation from Kigali\nBuilding Africa’s digital future\nAI · Data Science · Logistics' },

  // ── Hero ─────────────────────────────────────────────────────────────────
  { key: 'hero.headlines',    section: 'hero', type: 'list',  label: 'Rotating headlines',
    value: 'Building the Future\nInnovating with Data\nCreating Smart Solutions' },
  { key: 'hero.subtitle',     section: 'hero', type: 'text',  label: 'Subtitle',          value: 'Student-led innovation in Data Science' },
  { key: 'hero.image',        section: 'hero', type: 'image', label: 'Background image',  value: '/012.jpg' },
  { key: 'hero.primaryCta',   section: 'hero', type: 'text',  label: 'Primary button',    value: 'Explore Our Work' },
  { key: 'hero.primaryHref',  section: 'hero', type: 'url',   label: 'Primary button link', value: '/projects' },
  { key: 'hero.secondaryCta', section: 'hero', type: 'text',  label: 'Secondary button',  value: 'Learn More' },
  { key: 'hero.secondaryHref',section: 'hero', type: 'url',   label: 'Secondary button link', value: '/company' },

  // ── About (home section) ─────────────────────────────────────────────────
  { key: 'about.eyebrow',     section: 'about', type: 'text', label: 'Eyebrow',           value: 'Who we are' },
  { key: 'about.title',       section: 'about', type: 'text', label: 'Heading',           value: 'About' },
  { key: 'about.titleAccent', section: 'about', type: 'text', label: 'Heading (accent)',  value: 'VAF UBWENGE TECH' },
  { key: 'about.subtitle',    section: 'about', type: 'text', label: 'Subtitle',          value: 'We are a student-led startup built by passionate innovators' },
  { key: 'about.image',       section: 'about', type: 'image', label: 'Section image',    value: '/company-logo.jpg' },
  { key: 'about.block1.title',section: 'about', type: 'text', label: 'Block 1 — title',   value: 'Founded by Data Science Students' },
  { key: 'about.block1.body', section: 'about', type: 'richtext', label: 'Block 1 — body',
    value: 'VAF UBWENGE TECH was created by Data Science students from Université Libre de Kigali (ULK). What started as a vision to solve real-world problems has evolved into a full-fledged technology startup.' },
  { key: 'about.block2.title',section: 'about', type: 'text', label: 'Block 2 — title',   value: 'Our Mission' },
  { key: 'about.block2.body', section: 'about', type: 'richtext', label: 'Block 2 — body',
    value: 'We believe technology should be accessible and empowering. Our mission is to build innovative digital solutions that address the unique challenges faced by communities across Africa.' },
  { key: 'about.values.title',section: 'about', type: 'text', label: 'Values — title',    value: 'Core Values' },
  { key: 'about.values',      section: 'about', type: 'list', label: 'Values — items',
    value: 'Innovation through education\nReal-world impact\nEntrepreneurial spirit' },

  // ── Company page ─────────────────────────────────────────────────────────
  { key: 'company.title',     section: 'company', type: 'text', label: 'Page heading',    value: 'The Company' },
  { key: 'company.subtitle',  section: 'company', type: 'text', label: 'Page subtitle',
    value: 'How a group of data science students in Kigali turned a classroom idea into a working technology company.' },
  { key: 'company.story.title', section: 'company', type: 'text', label: 'Story — title', value: 'Our Story' },
  { key: 'company.story.body',  section: 'company', type: 'richtext', label: 'Story — body',
    value: 'VAF UBWENGE TECH began in a lecture hall at Université Libre de Kigali. A handful of data science students kept running into the same frustration: the tools being taught were built for problems somewhere else. Transport, payments, language, logistics — the systems people actually use every day in Rwanda were either missing or borrowed from contexts that did not fit.\n\nSo the group started building instead of waiting. The first prototypes were rough — a bus-tracking board, a scoring script, a Kinyarwanda chat experiment — but they worked, and people used them. That was the proof the team needed.\n\nToday VAF UBWENGE TECH operates as a working studio: an intelligence lab that researches and trains models, and a product team that ships them. Everything we release is built, tested and maintained by students and recent graduates who live with the problems they are solving.' },
  { key: 'company.mission.title', section: 'company', type: 'text', label: 'Mission — title', value: 'Mission' },
  { key: 'company.mission.body',  section: 'company', type: 'richtext', label: 'Mission — body',
    value: 'To build accessible, locally-grounded technology that solves real problems for African communities — and to train the engineers who will keep building it.' },
  { key: 'company.vision.title',  section: 'company', type: 'text', label: 'Vision — title', value: 'Vision' },
  { key: 'company.vision.body',   section: 'company', type: 'richtext', label: 'Vision — body',
    value: 'A generation of Rwandan engineers who do not have to leave to work on hard problems, because the hard problems — and the companies solving them — are here.' },
  { key: 'company.approach.title', section: 'company', type: 'text', label: 'Approach — title', value: 'How We Work' },
  { key: 'company.approach.body',  section: 'company', type: 'richtext', label: 'Approach — body',
    value: 'We start from the field, not the framework. Every project begins with time spent watching how something is actually done — a bus queue, a market stall, a clinic intake desk — before a line of code is written.\n\nWe build small and ship early. A rough version in real hands beats a polished version in a slide deck, and it tells us within a week whether the idea holds.\n\nWe train while we build. Every project carries at least one student who has never shipped before, because the point is not just the product — it is the engineer who comes out the other side.' },

  { key: 'company.values.title', section: 'company', type: 'text', label: 'Values — heading', value: 'What We Stand For' },
  { key: 'company.values',       section: 'company', type: 'list', label: 'Values (Title | Description per line)',
    value: 'Built for here | We design for Rwandan realities first — language, connectivity, payment rails and cost — rather than adapting something built elsewhere.\nLearning is the product | Every project trains someone. The code ships, and so does the engineer who wrote it.\nShow the work | Open demos, public leaderboards and honest write-ups. If it only works in a slide, it does not work.\nUseful beats impressive | We would rather ship a plain tool people rely on than a clever one they try once.' },

  { key: 'company.stats', section: 'company', type: 'list', label: 'Stats (Value | Label per line)',
    value: '2023 | Founded in Kigali\n12+ | Students trained\n6 | Products shipped\n100% | Built in Rwanda' },

  { key: 'company.services.title', section: 'company', type: 'text', label: 'Services — heading', value: 'What We Do' },
  { key: 'company.services',       section: 'company', type: 'list', label: 'Services (Title | Description per line)',
    value: 'Applied machine learning | Model training, evaluation and deployment — from Kinyarwanda language models to computer-vision classifiers that run in the browser.\nProduct engineering | Full-stack web and mobile products, built to work on the connections and devices people actually have.\nData systems | Pipelines, dashboards and scoring engines that turn raw operational data into something a team can act on.\nResearch & training | An open intelligence lab, public competitions and a leaderboard where students learn by shipping real models.' },

  { key: 'company.timeline.title', section: 'company', type: 'text', label: 'Timeline — heading', value: 'Milestones' },
  { key: 'company.timeline',       section: 'company', type: 'list', label: 'Timeline (Year | Title | Description per line)',
    value: '2023 | The first prototype | A bus-tracking board built for a class project turns into BusTag.\n2024 | The Intelligence Lab opens | In-browser model training and inference, free for any student to use.\n2024 | WANDAA AI | Work begins on a Kinyarwanda-first conversational model.\n2025 | Competitions go live | A public leaderboard and scoring engine for student ML challenges.' },

  // ── Sections shared headings ─────────────────────────────────────────────
  { key: 'projects.title',    section: 'projects', type: 'text', label: 'Heading',         value: 'Our Projects' },
  { key: 'projects.subtitle', section: 'projects', type: 'text', label: 'Subtitle',        value: 'Products and research coming out of the lab.' },
  { key: 'team.title',        section: 'team', type: 'text', label: 'Heading',             value: 'Our' },
  { key: 'team.titleAccent',  section: 'team', type: 'text', label: 'Heading (accent)',    value: 'Leadership' },
  { key: 'team.subtitle',     section: 'team', type: 'text', label: 'Subtitle',
    value: 'Leading the digital transformation at VAF UBWENGE TECH with a focus on AI and Data Science.' },
  { key: 'team.emptyState',   section: 'team', type: 'text', label: 'Empty state message',
    value: 'Team profiles are being updated. Please check back shortly.' },
  { key: 'gallery.title',     section: 'gallery', type: 'text', label: 'Heading',          value: 'Our Gallery' },
  { key: 'gallery.subtitle',  section: 'gallery', type: 'text', label: 'Subtitle',         value: 'Moments from the lab, the field, and everything in between.' },
  { key: 'insights.title',    section: 'insights', type: 'text', label: 'Heading',         value: 'Insights' },
  { key: 'insights.subtitle', section: 'insights', type: 'text', label: 'Subtitle',
    value: 'Notes from the lab — what we are building, what broke, and what we learned.' },

  // ── Contact ──────────────────────────────────────────────────────────────
  { key: 'contact.title',     section: 'contact', type: 'text', label: 'Heading',          value: 'Get in Touch' },
  { key: 'contact.subtitle',  section: 'contact', type: 'text', label: 'Subtitle',
    value: 'Questions, partnerships, or press — we read everything that comes in.' },
  { key: 'contact.email',     section: 'contact', type: 'text', label: 'Email address',    value: 'support@wandaatech.rw' },
  { key: 'contact.phone',     section: 'contact', type: 'text', label: 'Phone',            value: '' },
  { key: 'contact.address',   section: 'contact', type: 'text', label: 'Address',          value: 'Kigali, Rwanda' },
  { key: 'contact.hours',     section: 'contact', type: 'text', label: 'Response time',    value: 'We usually reply within two business days.' },

  // ── Footer ───────────────────────────────────────────────────────────────
  { key: 'footer.blurb',      section: 'footer', type: 'text', label: 'Footer blurb',      value: 'Building innovative digital solutions for Africa' },
  { key: 'footer.copyright',  section: 'footer', type: 'text', label: 'Copyright holder',  value: 'VAF UBWENGE TECH' },
  { key: 'footer.linkedin',   section: 'footer', type: 'url',  label: 'LinkedIn URL',      value: '' },
  { key: 'footer.twitter',    section: 'footer', type: 'url',  label: 'X / Twitter URL',   value: '' },
  { key: 'footer.github',     section: 'footer', type: 'url',  label: 'GitHub URL',        value: '' },

  // ── SEO ──────────────────────────────────────────────────────────────────
  { key: 'seo.siteUrl',       section: 'seo', type: 'url',  label: 'Canonical site URL',   value: 'https://vaf-ubwenge-tech.vercel.app' },
  { key: 'seo.title',         section: 'seo', type: 'text', label: 'Default page title',
    value: 'VAF UBWENGE TECH — Intelligence Systems & Digital Solutions' },
  { key: 'seo.description',   section: 'seo', type: 'text', label: 'Default meta description',
    value: 'VAF UBWENGE TECH is a student-led technology company in Kigali, Rwanda building applied AI, data systems and digital products for African communities.' },

  // ── Legal (used by the policy pages) ─────────────────────────────────────
  { key: 'legal.entity',      section: 'legal', type: 'text', label: 'Legal entity name',  value: 'VAF UBWENGE TECH' },
  { key: 'legal.jurisdiction',section: 'legal', type: 'text', label: 'Governing law',      value: 'the Republic of Rwanda' },
  { key: 'legal.privacyEmail',section: 'legal', type: 'text', label: 'Privacy contact',    value: 'support@wandaatech.rw' },
  { key: 'legal.updated',     section: 'legal', type: 'text', label: 'Policies last updated', value: 'September 2026' },
]

export const DEFAULT_CONTENT_MAP: Record<string, string> = Object.fromEntries(
  SITE_CONTENT_DEFAULTS.map((d) => [d.key, d.value]),
)

export const CONTENT_SECTIONS = Array.from(
  new Set(SITE_CONTENT_DEFAULTS.map((d) => d.section)),
)
