-- ===========================================================================
-- VAF UBWENGE TECH — Headless CMS + Monetization schema
-- Run this once in the Supabase SQL editor (it is safe to re-run).
-- ===========================================================================

-- ── 1. site_content : key/value store backing every editable string on site ──
CREATE TABLE IF NOT EXISTS site_content (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT UNIQUE NOT NULL,
  type        TEXT NOT NULL DEFAULT 'text'
              CHECK (type IN ('text', 'richtext', 'image', 'url', 'color', 'number', 'boolean', 'list')),
  value       TEXT NOT NULL DEFAULT '',
  section     TEXT NOT NULL DEFAULT 'general',
  label       TEXT NOT NULL DEFAULT '',
  sort_order  INT DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. site_sections : show/hide + reorder whole page sections ───────────────
CREATE TABLE IF NOT EXISTS site_sections (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT UNIQUE NOT NULL,
  title          TEXT NOT NULL,
  component_type TEXT NOT NULL DEFAULT 'custom',
  is_visible     BOOLEAN DEFAULT TRUE,
  sort_order     INT DEFAULT 0,
  body           TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. site_images : reusable media catalogue ───────────────────────────────
CREATE TABLE IF NOT EXISTS site_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key          TEXT NOT NULL,
  storage_path TEXT,
  public_url   TEXT NOT NULL,
  alt_text     TEXT,
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. team : leadership directory, each member owns a project portfolio ────
CREATE TABLE IF NOT EXISTS team (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  role           TEXT NOT NULL,
  photo          TEXT,
  bio            TEXT,
  social_links   TEXT DEFAULT '{}',
  portfolio_link TEXT,
  projects       JSONB DEFAULT '[]'::jsonb,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE team ADD COLUMN IF NOT EXISTS projects    JSONB   DEFAULT '[]'::jsonb;
ALTER TABLE team ADD COLUMN IF NOT EXISTS slug        TEXT;
ALTER TABLE team ADD COLUMN IF NOT EXISTS sort_order  INT     DEFAULT 0;
ALTER TABLE team ADD COLUMN IF NOT EXISTS is_visible  BOOLEAN DEFAULT TRUE;
ALTER TABLE team ADD COLUMN IF NOT EXISTS headline    TEXT;
ALTER TABLE team ADD COLUMN IF NOT EXISTS skills      TEXT;
ALTER TABLE team ADD COLUMN IF NOT EXISTS location    TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS team_slug_key ON team (slug) WHERE slug IS NOT NULL;

-- ── 5. projects : company-wide portfolio ────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tags        TEXT[],
  image       TEXT,
  link        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug       TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS body       TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status     TEXT DEFAULT 'live';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured   BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_id   UUID;

CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_key ON projects (slug) WHERE slug IS NOT NULL;

-- ── 6. gallery : visual archive ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  image_url   TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gallery ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS category   TEXT DEFAULT 'general';

-- ── 7. articles : original long-form content (AdSense needs real content) ───
CREATE TABLE IF NOT EXISTS articles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  excerpt      TEXT DEFAULT '',
  body         TEXT NOT NULL DEFAULT '',
  cover_image  TEXT,
  author       TEXT DEFAULT 'VAF UBWENGE TECH',
  tags         TEXT[],
  published    BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. ad_slots : AdSense placements, editable without a redeploy ───────────
CREATE TABLE IF NOT EXISTS ad_slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement   TEXT UNIQUE NOT NULL,
  slot_id     TEXT NOT NULL DEFAULT '',
  format      TEXT NOT NULL DEFAULT 'auto',
  layout_key  TEXT,
  full_width  BOOLEAN DEFAULT TRUE,
  enabled     BOOLEAN DEFAULT FALSE,
  label       TEXT DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. admin_settings : global switches (ad client id, consent text, …) ─────
CREATE TABLE IF NOT EXISTS admin_settings (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key   TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT ''
);

-- ── 10. contact_messages : inbox for the contact form ──────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT DEFAULT '',
  message    TEXT NOT NULL,
  handled    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- Row Level Security
--   Public (anon) may READ published content only.
--   All writes happen server-side through the service-role key, which
--   bypasses RLS — so no anon write policy is granted anywhere.
-- ===========================================================================

ALTER TABLE site_content     ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_sections    ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_images      ENABLE ROW LEVEL SECURITY;
ALTER TABLE team             ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery          ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_slots         ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read site_content"  ON site_content;
DROP POLICY IF EXISTS "public read site_sections" ON site_sections;
DROP POLICY IF EXISTS "public read site_images"   ON site_images;
DROP POLICY IF EXISTS "public read team"          ON team;
DROP POLICY IF EXISTS "public read projects"      ON projects;
DROP POLICY IF EXISTS "public read gallery"       ON gallery;
DROP POLICY IF EXISTS "public read articles"      ON articles;
DROP POLICY IF EXISTS "public read ad_slots"      ON ad_slots;

CREATE POLICY "public read site_content"  ON site_content  FOR SELECT USING (true);
CREATE POLICY "public read site_sections" ON site_sections FOR SELECT USING (true);
CREATE POLICY "public read site_images"   ON site_images   FOR SELECT USING (true);
CREATE POLICY "public read team"          ON team          FOR SELECT USING (true);
CREATE POLICY "public read projects"      ON projects      FOR SELECT USING (true);
CREATE POLICY "public read gallery"       ON gallery       FOR SELECT USING (true);
CREATE POLICY "public read articles"      ON articles      FOR SELECT USING (published = true);
CREATE POLICY "public read ad_slots"      ON ad_slots      FOR SELECT USING (enabled = true);

-- admin_settings and contact_messages stay server-only: no anon policy at all.

-- ===========================================================================
-- Storage bucket for admin image uploads
-- ===========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-media', 'site-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "public read site-media" ON storage.objects;
CREATE POLICY "public read site-media" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-media');

-- ===========================================================================
-- Default ad placements (disabled until you paste real slot IDs in /admin)
-- ===========================================================================
INSERT INTO ad_slots (placement, label, format, enabled) VALUES
  ('home-top',      'Home — below hero',        'auto',       false),
  ('home-mid',      'Home — between sections',  'auto',       false),
  ('article-top',   'Article — above the fold', 'auto',       false),
  ('article-inline','Article — in-article',     'fluid',      false),
  ('article-bottom','Article — end of article', 'auto',       false),
  ('list-grid',     'Listing pages — in-feed',  'fluid',      false),
  ('sidebar',       'Sidebar / rail',           'auto',       false)
ON CONFLICT (placement) DO NOTHING;
