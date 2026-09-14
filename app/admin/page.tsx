'use client'

// ==========================================================================
// SQL MIGRATION FOR NEW TABLES + RLS POLICIES
// Run this directly in your Supabase SQL Editor to establish the database schema
// ==========================================================================
/*
-- 1. Create site_content for key-value headless CMS capability
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'richtext', 'image', 'url', 'color', 'number')),
  value TEXT NOT NULL,
  section TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create site_sections for managing dynamic tabs and layout states
CREATE TABLE IF NOT EXISTS site_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  component_type TEXT NOT NULL DEFAULT 'custom',
  is_visible BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create site_images to manage platform media catalog
CREATE TABLE IF NOT EXISTS site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  storage_path TEXT,
  public_url TEXT NOT NULL,
  alt_text TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create team table for full team directory management
CREATE TABLE IF NOT EXISTS team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo TEXT,
  bio TEXT,
  social_links TEXT,
  portfolio_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create projects table for full project portfolio management
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[],
  image TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create gallery table for visual graphics assets management
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS across all new tables
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy Bindings: Public Read access for frontend consumption
CREATE POLICY "Allow public read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Allow public read site_sections" ON site_sections FOR SELECT USING (true);
CREATE POLICY "Allow public read site_images" ON site_images FOR SELECT USING (true);
CREATE POLICY "Allow public read team" ON team FOR SELECT USING (true);
CREATE POLICY "Allow public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read gallery" ON gallery FOR SELECT USING (true);

-- Admin authorization management policies (Granting full write access)
CREATE POLICY "Allow admin write site_content" ON site_content ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin write site_sections" ON site_sections ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin write site_images" ON site_images ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin write team" ON team ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin write projects" ON projects ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin write gallery" ON gallery ALL TO authenticated USING (true) WITH CHECK (true);
*/

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { adminApi } from '@/lib/admin-api'
import { ImageField } from '@/components/admin/image-field'
import { SITE_CONTENT_DEFAULTS, CONTENT_SECTIONS } from '@/lib/site-defaults'
import { slugify } from '@/lib/slug'
import { Header } from '@/components/header'
import Link from 'next/link'
import {
  Lock, ShieldCheck, Eye, EyeOff,
  Trophy, Users, Briefcase, FileText,
  Plus, Trash2, Save, X, Edit3,
  CheckCircle, AlertCircle, Loader2,
  BarChart2, LogOut, Globe, Copy,
  Download, RefreshCw, Filter, Layers, 
  Image, UserCheck, FolderGit2, Film, 
  ArrowUp, ArrowDown, Search, Upload,
  DollarSign, BookOpen, Inbox, Sparkles, ExternalLink
} from 'lucide-react'

// ── Existing & Expanded Type Contracts ──────────────────────────────────────

interface Competition {
  id: string
  title: string
  summary: string
  description: string
  dataset_url: string
  rules: string
  prize: string
  tags: string[]
  deadline: string
  status: 'open' | 'closed' | 'upcoming'
  participants: number
}

interface Registration {
  id: string
  type: 'individual' | 'team'
  display_name: string
  email: string
  university: string
  members: string[]
  registered_at: string
  competition_id: string | null
}

interface Submission {
  id: string
  username: string
  model_name: string
  accuracy_score: number
  f1_score: number
  code_score: number
  final_score: number
  created_at: string
  competition_id: string | null
  feedback: string[]
}

interface SiteSetting {
  id: string
  key: string
  value: string
}

interface SiteContent {
  id: string
  key: string
  type: 'text' | 'richtext' | 'image' | 'url' | 'color' | 'number'
  value: string
  section: string
  label: string
  sort_order: number
}

interface SiteSection {
  id: string
  slug: string
  title: string
  component_type: string
  is_visible: boolean
  sort_order: number
}

interface SiteImage {
  id: string
  key: string
  storage_path?: string
  public_url: string
  alt_text?: string
}

type Tab =
  | 'overview' | 'sitetext' | 'sections' | 'images'
  | 'competitions' | 'registrations' | 'leaderboard' | 'submissions'
  | 'team' | 'projects' | 'gallery'
  | 'articles' | 'monetization' | 'messages'

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  cover_image: string
  author: string
  tags: string[]
  published: boolean
  published_at: string
}

interface AdSlotRow {
  id: string
  placement: string
  slot_id: string
  format: string
  layout_key: string | null
  full_width: boolean
  enabled: boolean
  label: string
}

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  handled: boolean
  created_at: string
}

// ── CSV Download Helper ────────────────────────────────────────────────────

function downloadCSV(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const escape = (v: any) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers, ...rows].map(r => r.map(escape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function AdminPage() {
  // ── Authentication States ──
  const [authed,      setAuthed]      = useState(false)
  const [password,    setPassword]    = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [authError,   setAuthError]   = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // ── Application Context Navigation ──
  const [tab, setTab] = useState<Tab>('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // ── Central Dynamic Data Repositories ──
  const [competitions,  setCompetitions]  = useState<Competition[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [submissions,   setSubmissions]   = useState<Submission[]>([])
  const [siteSettings,  setSiteSettings]  = useState<SiteSetting[]>([])
  
  const [siteContent,   setSiteContent]   = useState<SiteContent[]>([])
  const [siteSections,  setSiteSections]  = useState<SiteSection[]>([])
  const [siteImages,    setSiteImages]    = useState<SiteImage[]>([])
  const [teamMembers,   setTeamMembers]   = useState<any[]>([])
  const [projects,      setProjects]      = useState<any[]>([])
  const [galleryItems,  setGalleryItems]  = useState<any[]>([])
  const [articles,      setArticles]      = useState<Article[]>([])
  const [adSlots,       setAdSlots]       = useState<AdSlotRow[]>([])
  const [messages,      setMessages]      = useState<ContactMessage[]>([])

  // Surfaced in the UI so a deployment missing SUPABASE_SERVICE_ROLE_KEY
  // says so up front instead of failing on the first save.
  const [serviceRoleReady, setServiceRoleReady] = useState(true)

  // ── Dynamic Operations Form Structs ──
  const [showCompForm, setShowCompForm] = useState(false)
  const [editingComp,  setEditingComp]  = useState<Competition | null>(null)
  const [compForm, setCompForm] = useState({
    title: '', summary: '', description: '', dataset_url: '', rules: '', prize: '', tags: '', deadline: '', status: 'open' as Competition['status'], participants: 0,
  })

  const [showContentForm, setShowContentForm] = useState(false)
  const [editingContent,  setEditingContent]  = useState<SiteContent | null>(null)
  const [contentForm, setContentForm] = useState({
    key: '', type: 'text' as SiteContent['type'], value: '', section: '', label: '', sort_order: 0
  })

  const [showSectionForm, setShowSectionForm] = useState(false)
  const [editingSection,  setEditingSection]  = useState<SiteSection | null>(null)
  const [sectionForm, setSectionForm] = useState({
    slug: '', title: '', component_type: 'custom', is_visible: true, sort_order: 0
  })

  const [showImageForm, setShowImageForm] = useState(false)
  const [imageForm, setImageForm] = useState({
    key: '', public_url: '', alt_text: ''
  })

  const [showTeamForm, setShowTeamForm] = useState(false)
  const [editingTeam,  setEditingTeam]  = useState<any | null>(null)
  const [teamForm, setTeamForm] = useState({
    name: '', role: '', headline: '', location: '', skills: '',
    photo: '', bio: '', portfolio_link: '',
    whatsapp: '', email: '', linkedin: '', github: '', website: '',
    slug: '', sort_order: 0, is_visible: true,
    projects: [] as any[],
  })

  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject,  setEditingProject]  = useState<any | null>(null)
  const [projectForm, setProjectForm] = useState({
    title: '', description: '', body: '', tags: '', image: '', link: '',
    status: 'live', featured: false, sort_order: 0, owner_id: '',
  })

  const [showGalleryForm, setShowGalleryForm] = useState(false)
  const [editingGallery,  setEditingGallery]  = useState<any | null>(null)
  const [galleryForm, setGalleryForm] = useState({
    title: '', image_url: '', description: '', category: 'General', sort_order: 0
  })

  const [showArticleForm, setShowArticleForm] = useState(false)
  const [editingArticle,  setEditingArticle]  = useState<Article | null>(null)
  const [articleForm, setArticleForm] = useState({
    slug: '', title: '', excerpt: '', body: '', cover_image: '',
    author: 'VAF UBWENGE TECH', tags: '', published: false,
  })

  const [seeding, setSeeding] = useState(false)

  // ── Competition Scoring Ground Truth Assets ──
  const [truthFile,         setTruthFile]         = useState<File | null>(null)
  const [truthUploadStatus, setTruthUploadStatus] = useState('')

  // ── Filters & Search Contexts ──
  const [regCompFilter, setRegCompFilter] = useState('all')
  const [lbCompFilter,  setLbCompFilter]  = useState('all')
  const [subCompFilter, setSubCompFilter] = useState('all')
  const [contentSearch, setContentSearch] = useState('')
  const [contentSectionFilter, setContentSectionFilter] = useState('all')

  // ── UI Status Utilities ──
  const [copiedId,  setCopiedId]  = useState<string | null>(null)
  const [saving,    setSaving]    = useState(false)
  const [success,   setSuccess]   = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  // ── Authentication Management Gateway ──
  // The password is exchanged for a signed, httpOnly session cookie. Every
  // write below travels through /api/admin/* and is authorised server-side,
  // so flipping `authed` in devtools no longer grants anything.
  async function handleAuth() {
    setAuthLoading(true); setAuthError('')
    const res = await adminApi.login(password)
    setAuthLoading(false)
    if (res.error) { setAuthError(res.error); return }
    setAuthed(true)
    setPassword('')
    loadAll()
  }

  // Restore an existing session on reload instead of asking again.
  useEffect(() => {
    let cancelled = false
    adminApi.session().then((session) => {
      if (cancelled) return
      setServiceRoleReady(session.serviceRoleConfigured)
      if (session.authed) { setAuthed(true); loadAll() }
    })
    return () => { cancelled = true }
  }, [])

  // ── Master Data Synchronization Loader ──
  async function loadAll() {
    setLoading(true)
    try {
      const [c, r, s, st, sc, ss, si, tm, pr, gl, ar, ad] = await Promise.all([
        supabase.from('competitions').select('*').order('created_at', { ascending: false }),
        supabase.from('registrations').select('*').order('registered_at', { ascending: false }),
        supabase.from('submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('admin_settings').select('*'),
        supabase.from('site_content').select('*').order('sort_order', { ascending: true }),
        supabase.from('site_sections').select('*').order('sort_order', { ascending: true }),
        supabase.from('site_images').select('*').order('uploaded_at', { ascending: false }),
        supabase.from('team').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('gallery').select('*').order('sort_order', { ascending: true }),
        supabase.from('articles').select('*').order('published_at', { ascending: false }),
        supabase.from('ad_slots').select('*').order('placement', { ascending: true }),
      ])
      
      if (c.data)  setCompetitions(c.data)
      if (r.data)  setRegistrations(r.data as Registration[])
      if (s.data)  setSubmissions(s.data as Submission[])
      if (st.data) setSiteSettings(st.data)
      if (sc.data) setSiteContent(sc.data as SiteContent[])
      if (ss.data) setSiteSections(ss.data as SiteSection[])
      if (si.data) setSiteImages(si.data as SiteImage[])
      if (tm.data) setTeamMembers(tm.data)
      if (pr.data) setProjects(pr.data)
      if (gl.data) setGalleryItems(gl.data)
      if (ar.data) setArticles(ar.data as Article[])
      if (ad.data) setAdSlots(ad.data as AdSlotRow[])

      // Messages and settings are server-only (no public read policy), so
      // they come back through the authenticated admin route.
      const inbox = await adminApi.select('contact_messages', {
        order: { column: 'created_at', ascending: false },
      })
      if (Array.isArray(inbox.data)) setMessages(inbox.data as ContactMessage[])
    } catch (e) {
      console.error('Data pipeline error:', e)
    }
    setLoading(false)
  }

  function flash(msg: string, isError = false) {
    if (isError) { setError(msg);   setTimeout(() => setError(''),   4000) }
    else         { setSuccess(msg); setTimeout(() => setSuccess(''), 4000) }
  }

  // ── Dynamic Site Content Keys (Headless CMS) CRUD ─────────────────────────
  function openNewContent() {
    setEditingContent(null)
    setContentForm({ key: '', type: 'text', value: '', section: '', label: '', sort_order: 0 })
    setShowContentForm(true)
  }

  function openEditContent(c: SiteContent) {
    setEditingContent(c)
    setContentForm({ key: c.key, type: c.type, value: c.value, section: c.section, label: c.label, sort_order: c.sort_order })
    setShowContentForm(true)
  }

  async function saveSiteContent() {
    if (!contentForm.key.trim() || !contentForm.value.trim()) { flash('Key and Value requirements must be fulfilled.', true); return }
    setSaving(true)
    const res = editingContent
      ? await adminApi.update('site_content', editingContent.id, contentForm)
      : await adminApi.insert('site_content', contentForm)
    setSaving(false)
    if (res.error) { flash(res.error, true); return }
    flash('Content saved. It is live on the site now.')
    setShowContentForm(false); loadAll()
  }

  async function deleteSiteContent(id: string) {
    if (!confirm('Remove this content key? The site falls back to its built-in default text.')) return
    const res = await adminApi.remove('site_content', id)
    if (res.error) { flash(res.error, true); return }
    flash('Content key removed.'); loadAll()
  }

  /** Adds any content key the code can render but the database is missing. */
  async function syncContentKeys() {
    setSeeding(true)
    const res = await adminApi.seedContent()
    setSeeding(false)
    if (res.error) { flash(res.error, true); return }
    const inserted = (res.data as any)?.inserted ?? 0
    flash(inserted > 0 ? `Added ${inserted} new editable field(s).` : 'Every editable field is already listed.')
    loadAll()
  }

  // ── Dynamic Navigation Sections Layout CRUD ──────────────────────────────
  function openNewSection() {
    setEditingSection(null)
    setSectionForm({ slug: '', title: '', component_type: 'custom', is_visible: true, sort_order: 0 })
    setShowSectionForm(true)
  }

  function openEditSection(s: SiteSection) {
    setEditingSection(s)
    setSectionForm({ slug: s.slug, title: s.title, component_type: s.component_type, is_visible: s.is_visible, sort_order: s.sort_order })
    setShowSectionForm(true)
  }

  async function saveSiteSection() {
    if (!sectionForm.slug.trim() || !sectionForm.title.trim()) { flash('Slug and Title parameters required.', true); return }
    setSaving(true)
    const res = editingSection
      ? await adminApi.update('site_sections', editingSection.id, sectionForm)
      : await adminApi.insert('site_sections', sectionForm)
    setSaving(false)
    if (res.error) { flash(res.error, true); return }
    flash('Section saved.')
    setShowSectionForm(false); loadAll()
  }

  async function toggleSectionVisibility(s: SiteSection) {
    const res = await adminApi.update('site_sections', s.id, { is_visible: !s.is_visible })
    if (res.error) { flash(res.error, true); return }
    flash(s.is_visible ? 'Section hidden from the site.' : 'Section is now visible.'); loadAll()
  }

  async function deleteSection(id: string) {
    if (!confirm('Delete this section entry? The section becomes visible again by default.')) return
    const res = await adminApi.remove('site_sections', id)
    if (res.error) { flash(res.error, true); return }
    flash('Section entry deleted.'); loadAll()
  }

  async function moveSectionOrder(s: SiteSection, direction: 'up' | 'down') {
    const idx = siteSections.findIndex(item => item.id === s.id)
    if (idx === -1) return
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= siteSections.length) return
    
    const sibling = siteSections[targetIdx]
    setLoading(true)
    await adminApi.update('site_sections', s.id, { sort_order: sibling.sort_order })
    await adminApi.update('site_sections', sibling.id, { sort_order: s.sort_order })
    loadAll()
  }

  // ── Media Catalog / Images Store Controller ───────────────────────────────
  async function saveSiteImage() {
    if (!imageForm.key.trim() || !imageForm.public_url.trim()) { flash('Key lookup reference and asset URL mapping required.', true); return }
    setSaving(true)
    const res = await adminApi.insert('site_images', { ...imageForm })
    setSaving(false)
    if (res.error) { flash(res.error, true); return }
    flash('Image added to the media library.')
    setShowImageForm(false); setImageForm({ key: '', public_url: '', alt_text: '' }); loadAll()
  }

  async function deleteSiteImage(id: string) {
    if (!confirm('Remove this image from the library? Anything already using its URL keeps working.')) return
    const res = await adminApi.remove('site_images', id)
    if (res.error) { flash(res.error, true); return }
    flash('Image removed from the library.'); loadAll()
  }

  // ── Team Directory CRUD Controls ─────────────────────────────────────────
  const EMPTY_TEAM_FORM = {
    name: '', role: '', headline: '', location: '', skills: '',
    photo: '', bio: '', portfolio_link: '',
    whatsapp: '', email: '', linkedin: '', github: '', website: '',
    slug: '', sort_order: 0, is_visible: true,
    projects: [] as any[],
  }

  function openNewTeam() {
    setEditingTeam(null)
    setTeamForm({ ...EMPTY_TEAM_FORM })
    setShowTeamForm(true)
  }

  function openEditTeam(t: any) {
    // social_links is stored as a JSON string; unpack it into real fields so
    // an admin never has to hand-write JSON.
    let social: Record<string, string> = {}
    try {
      const parsed = typeof t.social_links === 'string' ? JSON.parse(t.social_links || '{}') : t.social_links
      if (parsed && typeof parsed === 'object') social = parsed
    } catch { social = {} }

    setEditingTeam(t)
    setTeamForm({
      name: t.name ?? '',
      role: t.role ?? '',
      headline: t.headline ?? '',
      location: t.location ?? '',
      skills: t.skills ?? '',
      photo: t.photo ?? '',
      bio: t.bio ?? '',
      portfolio_link: t.portfolio_link ?? '',
      whatsapp: social.whatsapp ?? '',
      email: social.email ?? '',
      linkedin: social.linkedin ?? '',
      github: social.github ?? '',
      website: social.website ?? '',
      slug: t.slug ?? '',
      sort_order: Number(t.sort_order ?? 0),
      is_visible: t.is_visible !== false,
      projects: Array.isArray(t.projects) ? t.projects : [],
    })
    setShowTeamForm(true)
  }

  function addTeamProject() {
    setTeamForm({
      ...teamForm,
      projects: [...teamForm.projects, { title: '', description: '', image: '', link: '', year: '', tags: '' }],
    })
  }

  function updateTeamProject(i: number, field: string, value: string) {
    const next = [...teamForm.projects]
    next[i] = { ...next[i], [field]: value }
    setTeamForm({ ...teamForm, projects: next })
  }

  function removeTeamProject(i: number) {
    setTeamForm({ ...teamForm, projects: teamForm.projects.filter((_, idx) => idx !== i) })
  }

  async function saveTeamMember() {
    if (!teamForm.name.trim() || !teamForm.role.trim()) { flash('Name and role are required.', true); return }

    const payload = {
      name: teamForm.name.trim(),
      role: teamForm.role.trim(),
      headline: teamForm.headline,
      location: teamForm.location,
      skills: teamForm.skills,
      photo: teamForm.photo,
      bio: teamForm.bio,
      portfolio_link: teamForm.portfolio_link,
      // Repacked into the JSON column the public site reads.
      social_links: JSON.stringify({
        whatsapp: teamForm.whatsapp,
        email: teamForm.email,
        linkedin: teamForm.linkedin,
        github: teamForm.github,
        website: teamForm.website,
      }),
      // The slug is this member's profile URL, so derive one when it is blank.
      slug: (teamForm.slug.trim() ? slugify(teamForm.slug) : slugify(teamForm.name)) || null,
      sort_order: Number(teamForm.sort_order) || 0,
      is_visible: teamForm.is_visible,
      projects: teamForm.projects,
    }

    setSaving(true)
    const res = editingTeam
      ? await adminApi.update('team', editingTeam.id, payload)
      : await adminApi.insert('team', payload)
    setSaving(false)
    if (res.error) { flash(res.error, true); return }
    flash(`Saved. Profile is live at /team/${payload.slug}`)
    setShowTeamForm(false); loadAll()
  }

  async function deleteTeamMember(id: string) {
    if (!confirm('Delete this team member and their project portfolio?')) return
    const res = await adminApi.remove('team', id)
    if (res.error) { flash(res.error, true); return }
    flash('Team member deleted.'); loadAll()
  }

  // ── Projects Portfolio CRUD Controls ──────────────────────────────────────
  function openNewProject() {
    setEditingProject(null)
    setProjectForm({ title: '', description: '', body: '', tags: '', image: '', link: '', status: 'live', featured: false, sort_order: 0, owner_id: '' })
    setShowProjectForm(true)
  }

  function openEditProject(p: any) {
    setEditingProject(p)
    setProjectForm({
      title: p.title ?? '',
      description: p.description ?? '',
      body: p.body ?? '',
      tags: (p.tags || []).join(', '),
      image: p.image ?? '',
      link: p.link ?? '',
      status: p.status ?? 'live',
      featured: Boolean(p.featured),
      sort_order: Number(p.sort_order ?? 0),
      owner_id: p.owner_id ?? '',
    })
    setShowProjectForm(true)
  }

  async function saveProject() {
    if (!projectForm.title.trim()) { flash('A project title is required.', true); return }
    setSaving(true)
    const payload = {
      title: projectForm.title,
      description: projectForm.description,
      body: projectForm.body,
      image: projectForm.image,
      link: projectForm.link,
      status: projectForm.status,
      featured: projectForm.featured,
      sort_order: Number(projectForm.sort_order) || 0,
      // Attributing a project to a member makes it show on their profile.
      owner_id: projectForm.owner_id || null,
      slug: slugify(projectForm.title) || null,
      tags: projectForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    const res = editingProject
      ? await adminApi.update('projects', editingProject.id, payload)
      : await adminApi.insert('projects', payload)
    setSaving(false)
    if (res.error) { flash(res.error, true); return }
    flash('Project saved.')
    setShowProjectForm(false); loadAll()
  }

  async function deleteProject(id: string) {
    if (!confirm('Delete this project?')) return
    const res = await adminApi.remove('projects', id)
    if (res.error) { flash(res.error, true); return }
    flash('Project deleted.'); loadAll()
  }

  // ── Visual Gallery CRUD Controls ──────────────────────────────────────────
  function openNewGallery() {
    setEditingGallery(null)
    setGalleryForm({ title: '', image_url: '', description: '', category: 'General', sort_order: 0 })
    setShowGalleryForm(true)
  }

  function openEditGallery(g: any) {
    setEditingGallery(g)
    setGalleryForm({
      title: g.title ?? '',
      image_url: g.image_url ?? '',
      description: g.description ?? '',
      category: g.category || 'General',
      sort_order: Number(g.sort_order ?? 0),
    })
    setShowGalleryForm(true)
  }

  async function saveGalleryItem() {
    if (!galleryForm.title.trim() || !galleryForm.image_url.trim()) {
      flash('A caption and an image are required.', true); return
    }
    setSaving(true)
    const payload = { ...galleryForm, sort_order: Number(galleryForm.sort_order) || 0 }
    const res = editingGallery
      ? await adminApi.update('gallery', editingGallery.id, payload)
      : await adminApi.insert('gallery', payload)
    setSaving(false)
    if (res.error) { flash(res.error, true); return }
    flash('Gallery photo saved.')
    setShowGalleryForm(false); loadAll()
  }

  async function deleteGalleryItem(id: string) {
    if (!confirm('Delete this gallery photo?')) return
    const res = await adminApi.remove('gallery', id)
    if (res.error) { flash(res.error, true); return }
    flash('Gallery photo deleted.'); loadAll()
  }

  // ── Articles (public /insights) ───────────────────────────────────────────
  function openNewArticle() {
    setEditingArticle(null)
    setArticleForm({ slug: '', title: '', excerpt: '', body: '', cover_image: '', author: 'VAF UBWENGE TECH', tags: '', published: false })
    setShowArticleForm(true)
  }

  function openEditArticle(a: Article) {
    setEditingArticle(a)
    setArticleForm({
      slug: a.slug ?? '',
      title: a.title ?? '',
      excerpt: a.excerpt ?? '',
      body: a.body ?? '',
      cover_image: a.cover_image ?? '',
      author: a.author || 'VAF UBWENGE TECH',
      tags: (a.tags || []).join(', '),
      published: Boolean(a.published),
    })
    setShowArticleForm(true)
  }

  async function saveArticle() {
    if (!articleForm.title.trim() || !articleForm.body.trim()) {
      flash('An article needs a title and a body.', true); return
    }
    const slug = slugify(articleForm.slug || articleForm.title)
    if (!slug) { flash('Could not build a URL from that title — set a slug manually.', true); return }

    setSaving(true)
    const payload = {
      slug,
      title: articleForm.title,
      excerpt: articleForm.excerpt,
      body: articleForm.body,
      cover_image: articleForm.cover_image,
      author: articleForm.author,
      tags: articleForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      published: articleForm.published,
      updated_at: new Date().toISOString(),
    }
    const res = editingArticle
      ? await adminApi.update('articles', editingArticle.id, payload)
      : await adminApi.insert('articles', { ...payload, published_at: new Date().toISOString() })
    setSaving(false)
    if (res.error) { flash(res.error, true); return }
    flash(articleForm.published ? `Published at /insights/${slug}` : 'Saved as a draft.')
    setShowArticleForm(false); loadAll()
  }

  async function toggleArticlePublished(a: Article) {
    const res = await adminApi.update('articles', a.id, { published: !a.published })
    if (res.error) { flash(res.error, true); return }
    flash(a.published ? 'Article unpublished.' : 'Article published.'); loadAll()
  }

  async function deleteArticle(id: string) {
    if (!confirm('Delete this article permanently?')) return
    const res = await adminApi.remove('articles', id)
    if (res.error) { flash(res.error, true); return }
    flash('Article deleted.'); loadAll()
  }

  // ── Ad slots ──────────────────────────────────────────────────────────────
  async function saveAdSlot(slot: AdSlotRow, patch: Partial<AdSlotRow>) {
    const res = await adminApi.update('ad_slots', slot.id, { ...patch, updated_at: new Date().toISOString() })
    if (res.error) { flash(res.error, true); return }
    flash('Ad placement updated.'); loadAll()
  }

  // ── Contact inbox ─────────────────────────────────────────────────────────
  async function toggleMessageHandled(m: ContactMessage) {
    const res = await adminApi.update('contact_messages', m.id, { handled: !m.handled })
    if (res.error) { flash(res.error, true); return }
    loadAll()
  }

  async function deleteMessage(id: string) {
    if (!confirm('Delete this message?')) return
    const res = await adminApi.remove('contact_messages', id)
    if (res.error) { flash(res.error, true); return }
    flash('Message deleted.'); loadAll()
  }

  // ── Legacy / Existing Competition Infrastructure Operations ───────────────
  function openNewComp() {
    setEditingComp(null)
    setCompForm({ title:'', summary:'', description:'', dataset_url:'', rules:'', prize:'', tags:'', deadline:'', status:'open', participants:0 })
    setTruthFile(null); setTruthUploadStatus(''); setShowCompForm(true)
  }

  function openEditComp(c: Competition) {
    setEditingComp(c)
    setCompForm({ title:c.title, summary:c.summary, description:c.description, dataset_url:c.dataset_url, rules:c.rules, prize:c.prize, tags:c.tags.join(', '), deadline:c.deadline.split('T')[0], status:c.status, participants:c.participants })
    setTruthFile(null); setTruthUploadStatus(''); setShowCompForm(true)
  }

  async function saveComp() {
    if (!compForm.title.trim()) { flash('Title structural configuration missing.', true); return }
    setSaving(true)
    const payload = { ...compForm, tags: compForm.tags.split(',').map(t => t.trim()).filter(Boolean) }
    let competitionId = editingComp?.id ?? null
    let err

    if (editingComp) {
      const res = await adminApi.update('competitions', editingComp.id, payload)
      err = res.error
    } else {
      const res = await adminApi.insert('competitions', payload)
      err = res.error
      const inserted = Array.isArray(res.data) ? res.data[0] : res.data
      if (!err && inserted?.id) competitionId = inserted.id
    }

    if (err) { setSaving(false); flash(err, true); return }

    if (truthFile && competitionId) {
      setTruthUploadStatus('Parsing ground truth metrics matrix…')
      try {
        const text   = await truthFile.text()
        const lines  = text.trim().split('\n').filter(Boolean)
        const header = lines[0].split(',').map(s => s.trim().toLowerCase())
        const labelColIdx = (() => {
          const i = header.findIndex(h => h==='true_label'||h==='label'||h==='result'||h.includes('pass')||h.includes('true'))
          return i !== -1 ? i : 1
        })()
        const rows = lines.slice(1).map((line) => {
          const cols = line.split(',').map(s => s.trim())
          const row_id   = cols[0] ?? ''
          let true_label = (cols[labelColIdx] ?? cols[1] ?? '').toLowerCase()
          if (true_label==='1')   true_label='pass'
          if (true_label==='0')   true_label='fail'
          if (true_label==='yes') true_label='pass'
          if (true_label==='no')  true_label='fail'
          const diffIdx   = header.indexOf('difficulty_tier')
          const advIdx    = header.indexOf('adversarial')
          const weightIdx = header.indexOf('column_weight')
          return {
            row_id, true_label, competition_id: competitionId,
            difficulty_tier: diffIdx   !== -1 ? (cols[diffIdx] || 'easy') : 'easy',
            adversarial:     advIdx    !== -1 ? cols[advIdx]==='true' : false,
            column_weight:   weightIdx !== -1 ? parseFloat(cols[weightIdx]) || 1.0 : 1.0,
          }
        }).filter(r => r.row_id !== '')

        setTruthUploadStatus(`Processing batch array arrays (${rows.length} records)…`)
        const res = await fetch('/api/admin-upload-truth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ competition_id: competitionId, rows }),
        })
        const result = await res.json()
        if (!res.ok) flash(`Saved but score sequence validation failed: ${result.error}`, true)
        else { setTruthUploadStatus(`✓ Matrix verified`); flash(`Saved configuration + uploaded score validation records!`) }
      } catch (e: any) { flash(`Saved parameters but CSV matrix compilation broke: ${e.message}`, true) }
    } else {
      flash(editingComp ? 'Competition metadata structural layout mutated.' : 'New challenge profile instantiated.')
    }

    setSaving(false); setShowCompForm(false); setTruthFile(null); setTruthUploadStatus(''); loadAll()
  }

  async function deleteComp(id: string) {
    if (!confirm('Delete this competition? Its submissions and registrations go with it.')) return
    const res = await adminApi.remove('competitions', id)
    if (res.error) { flash(res.error, true); return }
    flash('Competition deleted.'); loadAll()
  }

  async function downloadGroundTruth(compId: string, compTitle: string) {
    const { data, error } = await supabase
      .from('ground_truth')
      .select('row_id,true_label,difficulty_tier,adversarial,column_weight')
      .eq('competition_id', compId)
      .order('row_id')
    if (error || !data) { flash('Failure fetching validation matrix data vectors.', true); return }
    downloadCSV(
      `matrix_truth_${compTitle.replace(/\s+/g, '_').toLowerCase()}.csv`,
      ['row_id', 'true_label', 'difficulty_tier', 'adversarial', 'column_weight'],
      data.map(r => [r.row_id, r.true_label, r.difficulty_tier, r.adversarial, r.column_weight])
    )
  }

  // ── Legacy/Existing General Text Setting Persistence ─────────────────────
  async function saveSiteSetting(key: string, value: string) {
    setSaving(true)
    const res = await adminApi.upsert('admin_settings', { key, value }, 'key')
    setSaving(false)
    if (res.error) { flash(res.error, true); return }
    flash('Setting saved.'); loadAll()
  }

  async function logout() {
    await adminApi.logout()
    setAuthed(false); setPassword(''); setTab('overview')
  }

  // ── Derived Data Visual Analytics ─────────────────────────────────────────
  const participantsByComp = registrations.reduce((acc, r) => {
    if (r.competition_id) acc[r.competition_id] = (acc[r.competition_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const compName = (id: string | null) => competitions.find(c => c.id === id)?.title ?? '—'
  const filteredRegs = regCompFilter === 'all' ? registrations : registrations.filter(r => r.competition_id === regCompFilter)

  const lbSubmissions = (lbCompFilter === 'all' ? submissions : submissions.filter(s => s.competition_id === lbCompFilter))
  const seen = new Set<string>()
  const leaderboard = [...lbSubmissions]
    .sort((a, b) => b.final_score - a.final_score)
    .filter(s => { const key = `${s.username}-${s.competition_id}`; if (seen.has(key)) return false; seen.add(key); return true })

  const filteredSubs = subCompFilter === 'all' ? submissions : submissions.filter(s => s.competition_id === subCompFilter)
  const filteredContent = siteContent.filter(item => {
    const matchesSearch = item.key.toLowerCase().includes(contentSearch.toLowerCase()) || item.value.toLowerCase().includes(contentSearch.toLowerCase()) || item.label.toLowerCase().includes(contentSearch.toLowerCase())
    const matchesSection = contentSectionFilter === 'all' || item.section === contentSectionFilter
    return matchesSearch && matchesSection
  })
  
  const contentSectionsList = Array.from(new Set(siteContent.map(i => i.section)))

  // ==========================================================================
  // VIEW RENDERER A: SKEUOMORPHIC SCHEMATIC ACCESS INTERFACE (LOGIN)
  // ==========================================================================
  if (!authed) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex items-center justify-center px-4 font-sans selection:bg-[hsl(var(--skeuo-accent))] selection:text-black">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[hsl(var(--skeuo-accent-glow))] opacity-5 blur-[160px] rounded-full" />
        </div>
        
        <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }}
          className="skeuo-card w-full max-w-md bg-[hsl(var(--background))] p-8 sm:p-10 border border-neutral-800 rounded-3xl shadow-2xl relative z-10">
          <div className="text-center space-y-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-[hsl(var(--skeuo-accent))]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="skeuo-glow-text text-2xl font-black uppercase tracking-tight text-[hsl(var(--skeuo-accent))]">SYSTEM TERMINAL ACCESS</h1>
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">WANDAA / VAF UBWENGE TECH — DEVELOPER PLATFORM</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">ENCRYPTED CREDENTIAL PASSWORD</label>
              <div className="skeuo-inset relative flex items-center bg-black/60 border border-neutral-800 rounded-xl px-4 py-3">
                <Lock className="w-4 h-4 text-neutral-500 mr-3 shrink-0" />
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                  placeholder="Enter panel authentication hash..."
                  className="w-full bg-transparent border-none text-sm text-[hsl(var(--foreground))] placeholder-neutral-600 focus:outline-none" />
                <button onClick={() => setShowPw(!showPw)} className="text-neutral-500 hover:text-neutral-300 transition-colors ml-2">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-2.5 p-3.5 bg-neutral-950 border border-red-900/40 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs text-red-400 font-mono">{authError}</p>
              </div>
            )}

            <button onClick={handleAuth} disabled={authLoading || !password}
              className="skeuo-button w-full py-3.5 bg-[hsl(var(--skeuo-accent))] text-black font-black rounded-xl text-xs uppercase tracking-wider transition-transform active:translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-30 cursor-pointer">
              {authLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> VERIFYING VECTOR...</> : <><ShieldCheck className="w-4 h-4" /> SECURE HANDSHAKE</>}
            </button>
          </div>

          <p className="text-center text-xs mt-6">
            <Link href="/" className="text-neutral-500 hover:text-[hsl(var(--skeuo-accent))] transition-colors font-mono uppercase tracking-tight">← TERMINATE SESSION</Link>
          </p>
        </motion.div>
      </div>
    )
  }

  // ==========================================================================
  // NAVIGATION TAB CONTROL ARRAYS & CORE CONTAINER VISUALIZATION
  // ==========================================================================
  const MANAGEMENT_TABS = [
    { id: 'overview',      label: 'DASHBOARD',      icon: BarChart2 },
    { id: 'sitetext',      label: 'SITE CONTENT',   icon: Globe },
    { id: 'sections',      label: 'SECTIONS & TABS',icon: Layers },
    { id: 'images',        label: 'IMAGE MEDIA',    icon: Image },
    { id: 'competitions',  label: 'COMPETITIONS',   icon: Briefcase },
    { id: 'registrations', label: 'REGISTRATIONS',  icon: Users },
    { id: 'leaderboard',   label: 'LEADERBOARD',    icon: Trophy },
    { id: 'submissions',   label: 'SUBMISSIONS',    icon: FileText },
    { id: 'team',          label: 'TEAM ROSTER',    icon: UserCheck },
    { id: 'projects',      label: 'PROJECT BLOCKS', icon: FolderGit2 },
    { id: 'gallery',       label: 'GALLERY LAYERS', icon: Film },
    { id: 'articles',      label: 'ARTICLES',       icon: BookOpen },
    { id: 'monetization',  label: 'MONETIZATION',   icon: DollarSign },
    { id: 'messages',      label: 'INBOX',          icon: Inbox },
  ] as const

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] font-sans selection:bg-[hsl(var(--skeuo-accent))] selection:text-black">
      <Header />
      
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[hsl(var(--skeuo-accent-glow))] opacity-5 blur-[180px] rounded-full" />
      </div>

      <main className="relative z-10 pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SYSTEM MANAGEMENT OVERHEAD METRIC INTERFACE */}
        <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-900 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--skeuo-accent))] animate-pulse" />
              <h1 className="skeuo-glow-text text-xl font-black uppercase tracking-tight text-[hsl(var(--skeuo-accent))]">CORE CENTRAL CONTROLLER</h1>
            </div>
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">WANDAA MANAGEMENT PLATFORM // SUPABASE DYNAMIC SCHEMA INTEGRATION</p>
          </div>
          
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button onClick={loadAll} title="Synchronize Repository Matrices"
              className="skeuo-button p-2.5 bg-neutral-900 text-neutral-400 border border-neutral-800 rounded-xl hover:text-[hsl(var(--skeuo-accent))] transition-all shrink-0 cursor-pointer">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </button>
            <button onClick={logout}
              className="skeuo-button px-4 py-2 bg-neutral-900 text-neutral-400 border border-neutral-800 rounded-xl hover:text-red-400 text-xs font-bold uppercase tracking-wider font-mono shrink-0 cursor-pointer">
              <LogOut className="w-3.5 h-3.5 inline mr-1.5" /> DISCONNECT
            </button>
            {/* Mobile Navigation Toggle Trigger */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden skeuo-button px-4 py-2 bg-neutral-900 text-neutral-300 border border-neutral-800 rounded-xl text-xs font-bold uppercase tracking-wider w-full text-center cursor-pointer">
              MENU SECTIONS
            </button>
          </div>
        </div>

        {!serviceRoleReady && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-950 border border-amber-900/50 mb-6 text-sm">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="font-mono text-xs text-amber-300/90 space-y-1">
              <p className="font-black uppercase tracking-widest">Saving is disabled</p>
              <p className="text-neutral-400">
                SUPABASE_SERVICE_ROLE_KEY is not set on the server, so this panel can read but not
                write. Add it to your environment variables and redeploy.
              </p>
            </div>
          </div>
        )}

        {/* NOTIFICATION FEEDBACK STATUS ENGINE */}
        <AnimatePresence mode="wait">
          {success && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-neutral-950 border border-neutral-800 mb-6 shadow-inner text-sm text-neutral-200">
              <CheckCircle className="w-4 h-4 text-[hsl(var(--skeuo-accent))] shrink-0" />
              <p className="font-mono text-xs">{success}</p>
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-neutral-950 border border-red-950/40 mb-6 shadow-inner text-sm text-neutral-200">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="font-mono text-xs text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WORKSPACE AREA SYSTEM SPLIT */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* SIDEBAR CONTROL MAPPING RENDERER PANEL */}
          <aside className={`w-full lg:w-64 shrink-0 lg:block ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="skeuo-card bg-neutral-950 p-4 space-y-1 rounded-2xl border border-neutral-900">
              <div className="px-3 pb-2 border-b border-neutral-900 text-[10px] font-mono text-neutral-600 uppercase tracking-widest font-black">SYSTEM TREE SECTIONS</div>
              {MANAGEMENT_TABS.map((t) => {
                const ActiveIcon = t.icon
                const isSelected = tab === t.id
                return (
                  <button key={t.id} onClick={() => { setTab(t.id); setIsMobileMenuOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-mono text-xs uppercase tracking-tight transition-all font-bold cursor-pointer border ${
                      isSelected
                        ? 'bg-[hsl(var(--skeuo-accent))] text-black border-[hsl(var(--skeuo-accent))] font-black shadow-inner'
                        : 'bg-transparent text-neutral-400 border-transparent hover:bg-neutral-900 hover:text-neutral-200'
                    }`}>
                    <ActiveIcon className="w-4 h-4 shrink-0" />
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* MAIN MONITOR WORKSPACE ARRAY */}
          <section className="flex-1 min-w-0 w-full">
            
            {/* ──────────────────────────────────────────────────────────────
                TAB LAYER 1: ANALYTICS OVERVIEW DASHBOARD
                ────────────────────────────────────────────────────────────── */}
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'CONTENT METRICS', value: siteContent.length, icon: Globe },
                    { label: 'ACTIVE SECTIONS', value: siteSections.length, icon: Layers },
                    { label: 'MEDIA CHANNELS',  value: siteImages.length, icon: Image },
                    { label: 'OPEN CHALLENGES', value: competitions.filter(c => c.status === 'open').length, icon: Briefcase },
                  ].map((stat, i) => (
                    <div key={i} className="skeuo-card bg-neutral-950 p-5 rounded-xl border border-neutral-900 text-center relative overflow-hidden">
                      <p className="text-3xl font-black text-[hsl(var(--skeuo-accent))] font-mono tracking-tight">{stat.value}</p>
                      <p className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest mt-1.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-900">
                  <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[hsl(var(--skeuo-accent))] mb-4">COMPETITION DATAFEED PIPELINES</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b border-neutral-900 text-neutral-500 text-[10px]">
                          <th className="pb-3 uppercase tracking-widest">CHALLENGE TITLE</th>
                          <th className="pb-3 uppercase tracking-widest">STATUS VECTOR</th>
                          <th className="pb-3 uppercase tracking-widest">REGISTRATIONS</th>
                          <th className="pb-3 uppercase tracking-widest">SUBMISSIONS MATRIX</th>
                          <th className="pb-3 uppercase tracking-widest">DEADLINE INSTANCE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900/50">
                        {competitions.map(c => (
                          <tr key={c.id} className="hover:bg-neutral-900/20">
                            <td className="py-3.5 pr-4 font-bold text-neutral-200">{c.title}</td>
                            <td className="py-3.5 pr-4">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                                c.status==='open' ? 'bg-neutral-950 text-[hsl(var(--skeuo-accent))] border-[hsl(var(--skeuo-accent))/0.3]' :
                                c.status==='upcoming' ? 'bg-neutral-950 text-neutral-400 border-neutral-800' :
                                'bg-neutral-950 text-neutral-600 border-neutral-900'}`}>
                                {c.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3.5 pr-4 font-bold text-neutral-300">{participantsByComp[c.id] ?? 0}</td>
                            <td className="py-3.5 pr-4 font-bold text-neutral-300">{submissions.filter(s => s.competition_id === c.id).length}</td>
                            <td className="py-3.5 text-neutral-500 text-[11px]">{new Date(c.deadline).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {competitions.length === 0 && (
                          <tr><td colSpan={5} className="text-center py-6 text-neutral-600 text-xs">No active pipelines detected.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────
                TAB LAYER 2: HEADLESS CMS SITE TEXT RECORDS
                ────────────────────────────────────────────────────────────── */}
            {tab === 'sitetext' && (
              <div className="space-y-6">
                <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-900 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-mono font-black uppercase tracking-widest text-[hsl(var(--skeuo-accent))]">SITE CONTENT</h2>
                      <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        EVERY HEADING, PARAGRAPH, BUTTON LABEL AND IMAGE ON THE PUBLIC SITE. EDIT A VALUE AND IT IS LIVE IMMEDIATELY.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={syncContentKeys} disabled={seeding}
                        title="Adds every editable field the site knows about. Existing values are never overwritten."
                        className="skeuo-button px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-40">
                        {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        SYNC FIELDS
                      </button>
                      <button onClick={openNewContent}
                        className="skeuo-button px-4 py-2 bg-[hsl(var(--skeuo-accent))] text-black font-mono font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                        <Plus className="w-3.5 h-3.5" /> NEW KEY
                      </button>
                    </div>
                  </div>

                  {siteContent.length === 0 && (
                    <div className="skeuo-inset rounded-xl border border-neutral-900 bg-black/40 p-4 text-[11px] font-mono text-neutral-400">
                      Nothing here yet. Press <span className="text-[hsl(var(--skeuo-accent))] font-black">SYNC FIELDS</span> to
                      pull in all {SITE_CONTENT_DEFAULTS.length} editable fields with their current text, then change whatever you like.
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="skeuo-inset bg-black/40 border border-neutral-900 rounded-xl px-3 py-2 flex items-center">
                      <Search className="w-3.5 h-3.5 text-neutral-500 mr-2 shrink-0" />
                      <input type="text" placeholder="Filter variables index matrix..." value={contentSearch}
                        onChange={(e) => setContentSearch(e.target.value)}
                        className="bg-transparent border-none text-xs text-neutral-200 focus:outline-none w-full font-mono" />
                    </div>
                    <div className="skeuo-inset bg-black/40 border border-neutral-900 rounded-xl px-3 py-2 flex items-center">
                      <Filter className="w-3.5 h-3.5 text-neutral-500 mr-2 shrink-0" />
                      <select value={contentSectionFilter} onChange={(e) => setContentSectionFilter(e.target.value)}
                        className="bg-transparent border-none text-xs text-neutral-400 focus:outline-none w-full font-mono bg-neutral-950">
                        <option value="all">ALL SECTIONS</option>
                        {Array.from(new Set([...contentSectionsList, ...CONTENT_SECTIONS])).sort().map(sec => (
                          <option key={sec} value={sec}>{sec.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Form Expansion Context */}
                {showContentForm && (
                  <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4">
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                      <h3 className="text-xs font-mono font-black text-[hsl(var(--skeuo-accent))] uppercase tracking-widest">{editingContent ? 'MUTATE SYSTEM CONTENT RECORD' : 'CREATE CONTENT SCHEMATIC ENTRY'}</h3>
                      <button onClick={() => setShowContentForm(false)} className="text-neutral-500 hover:text-neutral-300"><X className="w-4 h-4" /></button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">UNIQUE IDENTIFICATION REFERENCE KEY</label>
                        <input type="text" value={contentForm.key} onChange={(e) => setContentForm({...contentForm, key: e.target.value})} placeholder="e.g. hero_main_title" disabled={!!editingContent}
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none disabled:opacity-40" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">INTERFACE TYPE MAPPING</label>
                        <select value={contentForm.type} onChange={(e) => setContentForm({...contentForm, type: e.target.value as any})}
                          className="skeuo-inset w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none">
                          <option value="text">STANDARD PLAIN TEXT</option>
                          <option value="richtext">LONG PARAGRAPH / RICHTEXT</option>
                          <option value="image">MEDIA LINK / IMAGE PATH</option>
                          <option value="url">HYPERLINK INTERFACE CONFIG</option>
                          <option value="color">HEX THEME SPECIFIER</option>
                          <option value="number">NUMERICAL PARAMETER VALUE</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">SECTION CATEGORY GROUP</label>
                        <input type="text" value={contentForm.section} onChange={(e) => setContentForm({...contentForm, section: e.target.value})} placeholder="e.g. landing_hero"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">DESCRIPTIVE FIELD LABEL</label>
                        <input type="text" value={contentForm.label} onChange={(e) => setContentForm({...contentForm, label: e.target.value})} placeholder="e.g. Hero Section Title text"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">CONTENT DATA STORAGE VALUE</label>
                        <textarea value={contentForm.value} onChange={(e) => setContentForm({...contentForm, value: e.target.value})} rows={6} placeholder="The text shown on the site."
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none resize-y leading-relaxed" />
                        <p className="text-[9px] text-neutral-600">
                          List fields take one item per line. Fields shown as &ldquo;A | B&rdquo; take a value and a label separated by a pipe.
                        </p>
                      </div>
                    </div>

                    {contentForm.type === 'image' && (
                      <div className="border-t border-neutral-900 pt-4">
                        <ImageField
                          label="OR UPLOAD AN IMAGE FOR THIS FIELD"
                          folder="content"
                          value={contentForm.value}
                          onChange={(url) => setContentForm({ ...contentForm, value: url })}
                        />
                      </div>
                    )}

                    <button onClick={saveSiteContent} disabled={saving}
                      className="skeuo-button w-full py-3 bg-[hsl(var(--skeuo-accent))] text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-40">
                      {saving ? 'SAVING…' : 'SAVE CONTENT'}
                    </button>
                  </div>
                )}

                <div className="space-y-3 font-mono">
                  {filteredContent.map((item) => (
                    <div key={item.id} className="skeuo-card bg-neutral-950 p-5 rounded-xl border border-neutral-900 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-900 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black text-[hsl(var(--skeuo-accent))] uppercase tracking-tight">{item.key}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-500">{item.type.toUpperCase()}</span>
                          <span className="text-[9px] text-neutral-600 font-bold">SECTION: {item.section.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditContent(item)} className="text-neutral-400 hover:text-white transition-colors p-1"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteSiteContent(item.id)} className="text-neutral-500 hover:text-red-400 transition-colors p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-500 font-bold">LABEL: {item.label || 'None specified'}</p>
                      <div className="skeuo-inset bg-black/30 p-3 rounded-lg border border-neutral-900 text-xs text-neutral-300 break-words max-h-24 overflow-y-auto">
                        {item.value}
                      </div>
                    </div>
                  ))}
                  {filteredContent.length === 0 && (
                    <p className="text-center text-neutral-600 text-xs py-8">No matching content configuration indices located.</p>
                  )}
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────
                TAB LAYER 3: DYNAMIC WEBSITE SECTIONS ORDERING & CONTROLS
                ────────────────────────────────────────────────────────────── */}
            {tab === 'sections' && (
              <div className="space-y-6">
                <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-mono font-black uppercase tracking-widest text-[hsl(var(--skeuo-accent))]">DYNAMIC COMPONENT ROUTING RENDERER</h2>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">INJECT, ORDER, AND HIDE SYSTEM TEMPLATE LAYERS WITHOUT DEPLOYMENT MANIPULATION.</p>
                  </div>
                  <button onClick={openNewSection}
                    className="skeuo-button px-4 py-2 bg-[hsl(var(--skeuo-accent))] text-black font-mono font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> NEW ROUTE PANEL
                  </button>
                </div>

                {showSectionForm && (
                  <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                      <h3 className="text-xs font-black text-[hsl(var(--skeuo-accent))] uppercase tracking-widest">{editingSection ? 'MUTATE COMPONENT DEFINITION' : 'SCAFFOLD NEW DYNAMIC ROUTE'}</h3>
                      <button onClick={() => setShowSectionForm(false)} className="text-neutral-500 hover:text-neutral-300"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">SECTION UNQIUE SLUG REFERENCE</label>
                        <input type="text" value={sectionForm.slug} onChange={(e) => setSectionForm({...sectionForm, slug: e.target.value})} placeholder="e.g. sponsorship_marquee"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">DISPLAY TEXT COMPONENT TITLE</label>
                        <input type="text" value={sectionForm.title} onChange={(e) => setSectionForm({...sectionForm, title: e.target.value})} placeholder="e.g. Our Global Sponsors"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">COMPONENT ARCHITECTURE PATTERN</label>
                        <select value={sectionForm.component_type} onChange={(e) => setSectionForm({...sectionForm, component_type: e.target.value})}
                          className="skeuo-inset w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none">
                          <option value="hero">HERO FRAME COMPONENT</option>
                          <option value="gallery">GALLERY MOSAIC ARRAY</option>
                          <option value="team">TEAM DIRECTORY BLOCK</option>
                          <option value="ml-lab">MACHINE LEARNING ANALYSIS LAB</option>
                          <option value="custom">CUSTOM TITLE+RICHTEXT PARAGRAPH CONTAINER</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">DEFAULT POSITION SEQUENCE ORDER INDEX</label>
                        <input type="number" value={sectionForm.sort_order} onChange={(e) => setSectionForm({...sectionForm, sort_order: parseInt(e.target.value) || 0})}
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>
                    </div>

                    <button onClick={saveSiteSection} disabled={saving}
                      className="skeuo-button w-full py-3 bg-[hsl(var(--skeuo-accent))] text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer">
                      {saving ? 'SCHEDULING LAYOUTS...' : 'COMMIT STRUCTURAL PANEL DESIGN'}
                    </button>
                  </div>
                )}

                <div className="space-y-3 font-mono">
                  {siteSections.map((sec, idx) => (
                    <div key={sec.id} className="skeuo-card bg-neutral-950 p-5 rounded-xl border border-neutral-900 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-neutral-200">{sec.title}</span>
                          <span className="text-[9px] text-neutral-600 font-bold">/{sec.slug}</span>
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          TYPE RULE SYSTEM: <span className="text-neutral-400">{sec.component_type.toUpperCase()}</span> · STATUS ARRAYS: {' '}
                          <span className={sec.is_visible ? 'text-[hsl(var(--skeuo-accent))] font-bold' : 'text-neutral-700'}>
                            {sec.is_visible ? 'ACTIVE IN FLOW' : 'MUTED ARCHIVE'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => moveSectionOrder(sec, 'up')} disabled={idx === 0}
                          className="p-2 border border-neutral-900 rounded-lg text-neutral-400 hover:text-white disabled:opacity-20 transition-all cursor-pointer">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => moveSectionOrder(sec, 'down')} disabled={idx === siteSections.length - 1}
                          className="p-2 border border-neutral-900 rounded-lg text-neutral-400 hover:text-white disabled:opacity-20 transition-all cursor-pointer">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => toggleSectionVisibility(sec)} title="Toggle Layout Flow Integration"
                          className="p-2 border border-neutral-900 rounded-lg text-neutral-400 hover:text-[hsl(var(--skeuo-accent))] transition-all cursor-pointer">
                          {sec.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-700" />}
                        </button>
                        <button onClick={() => openEditSection(sec)} className="p-2 border border-neutral-900 rounded-lg text-neutral-400 hover:text-white transition-all cursor-pointer">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {siteSections.length === 0 && (
                    <p className="text-center text-neutral-600 text-xs py-8 font-mono">No dynamic structural routing sections declared yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────
                TAB LAYER 4: SYSTEM STATIC ASSETS CATALOG MATRIX (IMAGES)
                ────────────────────────────────────────────────────────────── */}
            {tab === 'images' && (
              <div className="space-y-6">
                <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-mono font-black uppercase tracking-widest text-[hsl(var(--skeuo-accent))]">MEDIA STORAGE ROUTER ASSETS</h2>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">STORE CDN / BUCKET LINK ARRAYS REVERSED FOR DYNAMIC RENDER PIPELINES.</p>
                  </div>
                  <button onClick={() => setShowImageForm(!showImageForm)}
                    className="skeuo-button px-4 py-2 bg-[hsl(var(--skeuo-accent))] text-black font-mono font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> MAP MEDIA INSTANCE
                  </button>
                </div>

                {showImageForm && (
                  <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                      <h3 className="text-xs font-black text-[hsl(var(--skeuo-accent))] uppercase tracking-widest">MAP NEW MEDIA URI RESOURCE</h3>
                      <button onClick={() => setShowImageForm(false)} className="text-neutral-500 hover:text-neutral-300"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">MEDIA IDENTIFIER KEY LOOKUP REFERENCE</label>
                        <input type="text" value={imageForm.key} onChange={(e) => setImageForm({...imageForm, key: e.target.value})} placeholder="e.g. landing_hero_background_path"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>
                      <ImageField
                        label="IMAGE"
                        folder="library"
                        value={imageForm.public_url}
                        onChange={(url) => setImageForm({ ...imageForm, public_url: url })}
                        hint="Uploads are added to this library automatically."
                      />
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">ACCESSIBILITY FRAMEWORK ALT CONFIGURATION DESCRIPTION</label>
                        <input type="text" value={imageForm.alt_text} onChange={(e) => setImageForm({...imageForm, alt_text: e.target.value})} placeholder="e.g. Dark abstract circuitry schematic"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>
                    </div>
                    <button onClick={saveSiteImage} disabled={saving}
                      className="skeuo-button w-full py-3 bg-[hsl(var(--skeuo-accent))] text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer">
                      COMMIT ASSET TO ARCHIVE LOGS
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
                  {siteImages.map((img) => (
                    <div key={img.id} className="skeuo-card bg-neutral-950 p-4 rounded-xl border border-neutral-900 space-y-3 flex flex-col justify-between">
                      <div className="skeuo-inset bg-black rounded-lg overflow-hidden border border-neutral-900 h-32 flex items-center justify-center relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.public_url} alt={img.alt_text || 'Asset object'} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute bottom-1 left-1 right-1 bg-black/80 p-1 rounded text-[8px] text-neutral-400 truncate text-center font-mono">
                          {img.public_url}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-[hsl(var(--skeuo-accent))] truncate uppercase tracking-tight">{img.key}</div>
                        <div className="text-[9px] text-neutral-600 truncate">ALT: {img.alt_text || 'No descriptor value declared.'}</div>
                      </div>

                      <button onClick={() => deleteSiteImage(img.id)}
                        className="w-full py-1.5 border border-neutral-900 hover:border-red-950 rounded-lg text-[10px] text-neutral-500 hover:text-red-400 font-bold uppercase tracking-widest transition-all cursor-pointer">
                        UNLINK MATRIX PATH
                      </button>
                    </div>
                  ))}
                  {siteImages.length === 0 && (
                    <div className="col-span-full text-center text-neutral-600 text-xs py-8">No managed media assets found in catalog files.</div>
                  )}
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────
                TAB LAYER 5: COMPETITIONS MATRIX ADMIN ENVIRONMENT
                ────────────────────────────────────────────────────────────── */}
            {tab === 'competitions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center skeuo-card bg-neutral-950 p-5 rounded-xl border border-neutral-900">
                  <div>
                    <h2 className="text-xs font-mono font-black uppercase tracking-widest text-[hsl(var(--skeuo-accent))]">COMPETITIONS DIRECTORY PIPELINE</h2>
                    <p className="text-[10px] text-neutral-500 font-mono">MANAGE HACKATHONS, DATA CHALLENGES AND VALIDATION SCHEMATICS.</p>
                  </div>
                  <button onClick={openNewComp}
                    className="skeuo-button px-4 py-2 bg-[hsl(var(--skeuo-accent))] text-black font-mono font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> NEW PIPELINE CHALLENGE
                  </button>
                </div>

                <AnimatePresence>
                  {showCompForm && (
                    <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                      className="skeuo-card bg-neutral-950 border border-neutral-800 p-6 rounded-2xl space-y-4 font-mono text-xs">
                      <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                        <h3 className="font-black text-[hsl(var(--skeuo-accent))] uppercase tracking-widest">{editingComp ? 'MUTATE PIPELINE VECTORS' : 'INSTANTIATE COMPETITION RUNTIME'}</h3>
                        <button onClick={() => setShowCompForm(false)}><X className="w-4 h-4 text-neutral-500 hover:text-neutral-200" /></button>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          { key:'title',       label:'CHALLENGE METRIC TITLE',             placeholder:'e.g. Crop Disease Analysis Matrix' },
                          { key:'summary',     label:'ONE-LINE SYSTEM STRAPLINE SUMMARY',   placeholder:'Brief architectural summary pipeline statement.' },
                          { key:'prize',       label:'PRIZE SYSTEM ALLOCATION VALUES',     placeholder:'e.g. 5,000,000 RWF / Academic Tokens' },
                          { key:'dataset_url', label:'SECURE REPOSITORY DATASET URL',      placeholder:'https://storage.wandaa.tech/datasets/...' },
                          { key:'tags',        label:'CLASSIFICATION TAGS (COMMA SEPARATED)', placeholder:'Beginner, Vision Matrix, NLP Processing' },
                          { key:'deadline',    label:'TERMINATION INSTANCE RUNTIME DEADLINE', placeholder:'', type:'date' },
                        ].map((f) => (
                          <div key={f.key} className="space-y-1">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{f.label}</label>
                            <input type={f.type || 'text'} value={(compForm as any)[f.key]}
                              onChange={(e) => setCompForm({ ...compForm, [f.key]: e.target.value })}
                              placeholder={f.placeholder}
                              className="skeuo-inset w-full px-4 py-2.5 bg-black/60 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-700 focus:outline-none" />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">PIPELINE SCHEDULER INSTANCE STATUS</label>
                        <div className="flex gap-2">
                          {(['open','upcoming','closed'] as const).map((s) => (
                            <button key={s} onClick={() => setCompForm({ ...compForm, status:s })}
                              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                                compForm.status===s ? 'bg-[hsl(var(--skeuo-accent))] text-black border-[hsl(var(--skeuo-accent))]' : 'bg-transparent border-neutral-800 text-neutral-500 hover:text-neutral-300'}`}>
                              {s.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">FULL PROJECT SPECIFICATION STATEMENT DESCRIPTION</label>
                        <textarea value={compForm.description} onChange={(e) => setCompForm({ ...compForm, description:e.target.value })}
                          rows={4} placeholder="Full problem statement configuration details array layout text..."
                          className="skeuo-inset w-full px-4 py-2.5 bg-black/60 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-700 focus:outline-none resize-none" />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">SYSTEM BEHAVIOR RULES MATRIX (ONE STATEMENT PER LINE BREAK)</label>
                        <textarea value={compForm.rules} onChange={(e) => setCompForm({ ...compForm, rules:e.target.value })}
                          rows={3} placeholder="1. Only native execution architectures allowed.&#10;2. External pipeline dependencies prohibited."
                          className="skeuo-inset w-full px-4 py-2.5 bg-black/60 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-700 focus:outline-none resize-none" />
                      </div>

                      <div className="space-y-1.5 border-t border-neutral-900 pt-3">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                          SCORING MATRIX ENGINE GROUND TRUTH VALIDATION CSV <span className="text-[hsl(var(--skeuo-accent))] font-black">// COMPULSORY ENGINE HARNESS</span>
                        </label>
                        <label className="skeuo-inset flex items-center gap-3 px-4 py-3 bg-black/40 border-2 border-dashed border-neutral-800 hover:border-neutral-700 rounded-xl cursor-pointer transition-all">
                          <FileText className="w-5 h-5 text-neutral-600 shrink-0" />
                          <span className="text-neutral-500 truncate">
                            {truthFile ? truthFile.name : 'Choose system validation_matrix.csv array file...'}
                          </span>
                          <input type="file" accept=".csv" className="hidden"
                            onChange={(e) => { setTruthFile(e.target.files?.[0] ?? null); setTruthUploadStatus('') }} />
                        </label>
                        {truthFile && <p className="text-[11px] text-[hsl(var(--skeuo-accent))] flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Matrix attached: {truthFile.name} (Will stream on record write confirmation)</p>}
                        {truthUploadStatus && <p className="text-[10px] text-yellow-600">{truthUploadStatus}</p>}
                      </div>

                      <button onClick={saveComp} disabled={saving}
                        className="skeuo-button w-full py-3.5 bg-[hsl(var(--skeuo-accent))] text-black font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
                        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> SYNCHRONIZING ARRAYS...</> : <><Save className="w-4 h-4" /> COMMIT ARCHIVE MATRICES</>}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3 font-mono">
                  {competitions.map((c) => (
                    <div key={c.id} className="skeuo-card bg-neutral-950 p-5 rounded-xl border border-neutral-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-bold text-neutral-200 text-sm truncate">{c.title}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-500">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${c.status==='open' ? 'border border-[hsl(var(--skeuo-accent))/0.3] text-[hsl(var(--skeuo-accent))]':'border border-neutral-800 text-neutral-600'}`}>{c.status.toUpperCase()}</span>
                          <span>VAL: {c.prize}</span>
                          <span>·</span>
                          <span>END: {new Date(c.deadline).toLocaleDateString()}</span>
                          <span>·</span>
                          <span className="text-neutral-400 font-bold">{participantsByComp[c.id] ?? 0} ACTIVE REGISTRATIONS</span>
                        </div>
                        <div className="text-[9px] text-neutral-700 select-all font-mono break-all">ID: {c.id}</div>
                      </div>

                      <div className="flex gap-2 shrink-0 w-full md:w-auto">
                        <button onClick={() => downloadGroundTruth(c.id, c.title)} title="Download Matrix Truth CSV Array"
                          className="skeuo-button flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white text-[10px] font-bold uppercase cursor-pointer">
                          <Download className="w-3.5 h-3.5" /> MATRIX
                        </button>
                        <button onClick={() => openEditComp(c)} className="p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteComp(c.id)} className="p-2 border border-neutral-800 rounded-lg text-neutral-500 hover:text-red-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                  {competitions.length === 0 && (
                    <p className="text-center text-neutral-600 text-xs py-8">No challenges found in workspace indices.</p>
                  )}
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────
                TAB LAYER 6: REGISTRATION AUDIT STREAMS
                ────────────────────────────────────────────────────────────── */}
            {tab === 'registrations' && (
              <div className="space-y-4">
                <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-900 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="text-sm font-mono font-black uppercase tracking-widest text-[hsl(var(--skeuo-accent))]">REGISTRATION AUDIT DATAFEED ({filteredRegs.length})</h2>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">STREAM COMPREHENSIVE RECORDS OF ALL ENROLLED TEAMS AND USER NODES.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <select value={regCompFilter} onChange={(e) => setRegCompFilter(e.target.value)}
                      className="skeuo-inset bg-neutral-950 border border-neutral-800 px-3 py-2 rounded-xl text-neutral-300 focus:outline-none">
                      <option value="all">FILTER BY CHALLENGE VECTOR (ALL)</option>
                      {competitions.map(c => <option key={c.id} value={c.id}>{c.title.toUpperCase()} ({participantsByComp[c.id]??0})</option>)}
                    </select>
                    
                    <button onClick={() => downloadCSV(
                      `registrations_feed_${regCompFilter==='all' ? 'all' : compName(regCompFilter).replace(/\s+/g,'_').toLowerCase()}.csv`,
                      ['Name','Email','Type','University','Members','Competition','Registered'],
                      filteredRegs.map(r => [r.display_name, r.email, r.type, r.university, (r.members||[]).join('; '), compName(r.competition_id), new Date(r.registered_at).toLocaleString()])
                    )} className="skeuo-button px-3 py-2 bg-[hsl(var(--skeuo-accent))] text-black font-bold uppercase rounded-xl tracking-wide text-[10px] flex items-center gap-1.5 cursor-pointer">
                      <Download className="w-3.5 h-3.5" /> COMPILE CSV LOGS
                    </button>
                  </div>
                </div>

                <div className="skeuo-card bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-black/40 text-neutral-500 text-[10px]">
                        <tr className="border-b border-neutral-900">
                          <th className="px-4 py-3.5">#</th>
                          <th className="px-4 py-3.5">ENTITY TYPE</th>
                          <th className="px-4 py-3.5">NODE / TEAM HANDLE</th>
                          <th className="px-4 py-3.5">EMAIL ACCOUNT MASTER</th>
                          <th className="px-4 py-3.5">CAMPUS MATRIX</th>
                          <th className="px-4 py-3.5">TARGET CHANNEL CHALLENGE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900/40 text-neutral-300">
                        {filteredRegs.map((r, i) => (
                          <tr key={r.id} className="hover:bg-neutral-900/10">
                            <td className="px-4 py-3 text-[10px] text-neutral-600 font-bold">{i+1}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${r.type==='team'?'border border-yellow-800 text-yellow-600':'border border-neutral-800 text-neutral-400'}`}>
                                {r.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-neutral-200">{r.display_name}</td>
                            <td className="px-4 py-3 text-neutral-400 select-all text-[11px]">{r.email}</td>
                            <td className="px-4 py-3 text-neutral-500">{r.university || '—'}</td>
                            <td className="px-4 py-3 text-neutral-400 text-[11px]">{compName(r.competition_id)}</td>
                          </tr>
                        ))}
                        {filteredRegs.length === 0 && (
                          <tr><td colSpan={6} className="text-center py-8 text-neutral-600">No active registration entities map to this filter index.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────
                TAB LAYER 7: LEADERBOARD SYSTEM AGGREGATE ARCHIVE
                ────────────────────────────────────────────────────────────── */}
            {tab === 'leaderboard' && (
              <div className="space-y-4">
                <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-900 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="text-sm font-mono font-black uppercase tracking-widest text-[hsl(var(--skeuo-accent))]">AGGREGATE SCORING LEADERBOARD</h2>
                      <p className="text-[10px] text-neutral-500 font-mono mt-0.5">COMPUTING THE HIGHEST ACCURACY SUBMISSION SELECTION VECTOR PER SYSTEM UNIQUE USER NODE.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <select value={lbCompFilter} onChange={(e) => setLbCompFilter(e.target.value)}
                      className="skeuo-inset bg-neutral-950 border border-neutral-800 px-3 py-2 rounded-xl text-neutral-300 focus:outline-none">
                      <option value="all">CHALLENGE SELECTION VECTORS (ALL)</option>
                      {competitions.map(c => <option key={c.id} value={c.id}>{c.title.toUpperCase()}</option>)}
                    </select>
                    
                    <button onClick={() => downloadCSV(
                      `leaderboard_matrix_${lbCompFilter==='all' ? 'all' : compName(lbCompFilter).replace(/\s+/g,'_').toLowerCase()}.csv`,
                      ['Rank','Name','Model','Competition','Accuracy','F1','Code','Final Score','Date'],
                      leaderboard.map((r,i) => [i+1, r.username, r.model_name, compName(r.competition_id), r.accuracy_score, r.f1_score, r.code_score, r.final_score, new Date(r.created_at).toLocaleString()])
                    )} className="skeuo-button px-3 py-2 bg-[hsl(var(--skeuo-accent))] text-black font-bold uppercase rounded-xl tracking-wide text-[10px] flex items-center gap-1.5 cursor-pointer">
                      <Download className="w-3.5 h-3.5" /> EXPORT RANKS CSV
                    </button>
                  </div>
                </div>

                <div className="skeuo-card bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-black/40 text-neutral-500 text-[10px]">
                        <tr className="border-b border-neutral-900">
                          <th className="px-4 py-3.5">RANKING</th>
                          <th className="px-4 py-3.5">USER LOG NODE</th>
                          <th className="px-4 py-3.5">MODEL ARCHITECTURE</th>
                          <th className="px-4 py-3.5">COMPETITION BOUND</th>
                          <th className="px-4 py-3.5">ACCURACY</th>
                          <th className="px-4 py-3.5">F1 VERIFY</th>
                          <th className="px-4 py-3.5">CODE MATRIX</th>
                          <th className="px-4 py-3.5">FINAL CONVERGED SCORE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900/40 text-neutral-300">
                        {leaderboard.map((row, i) => (
                          <tr key={row.id} className="hover:bg-neutral-900/10">
                            <td className="px-4 py-3.5 font-black text-xs text-neutral-400">
                              {i===0 ? '🥇 TOP 01' : i===1 ? '🥈 TOP 02' : i===2 ? '🥉 TOP 03' : `# LAYER ${i+1}`}
                            </td>
                            <td className="px-4 py-3 font-bold text-[hsl(var(--foreground))]">{row.username}</td>
                            <td className="px-4 py-3 text-neutral-400 font-mono text-[11px]">{row.model_name}</td>
                            <td className="px-4 py-3 text-neutral-500">{compName(row.competition_id)}</td>
                            <td className="px-4 py-3 tabular-nums">{Number(row.accuracy_score).toFixed(2)}%</td>
                            <td className="px-4 py-3 tabular-nums">{Number(row.f1_score).toFixed(2)}%</td>
                            <td className="px-4 py-3 tabular-nums">{Number(row.code_score).toFixed(2)}%</td>
                            <td className="px-4 py-3">
                              <span className={`font-black tabular-nums ${i===0 ? 'text-[hsl(var(--skeuo-accent))] text-sm' : 'text-neutral-200'}`}>
                                {Number(row.final_score).toFixed(2)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                        {leaderboard.length === 0 && (
                          <tr><td colSpan={8} className="text-center py-8 text-neutral-600">No scoring profiles computed yet in data indices.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────
                TAB LAYER 8: SUBMISSIONS RAW MATRIX LOG DATASTREAM
                ────────────────────────────────────────────────────────────── */}
            {tab === 'submissions' && (
              <div className="space-y-4">
                <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-900 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="text-sm font-mono font-black uppercase tracking-widest text-[hsl(var(--skeuo-accent))]">RAW TELEMETRY SUBMISSION RECORDS</h2>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">COMPREHENSIVE TRACE STREAM LOGS AUDITING EVERY CONVERGED COMPILATION SIGNAL.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <select value={subCompFilter} onChange={(e) => setSubCompFilter(e.target.value)}
                      className="skeuo-inset bg-neutral-950 border border-neutral-800 px-3 py-2 rounded-xl text-neutral-300 focus:outline-none">
                      <option value="all">ALL CHALLENGES RAW FEEDS ({submissions.length})</option>
                      {competitions.map(c => <option key={c.id} value={c.id}>{c.title} ({submissions.filter(s=>s.competition_id===c.id).length})</option>)}
                    </select>

                    <button onClick={() => downloadCSV(
                      `submissions_raw_dump_${subCompFilter==='all' ? 'all' : compName(subCompFilter).replace(/\s+/g,'_').toLowerCase()}.csv`,
                      ['#','Name','Model','Competition','Accuracy','F1','Code','Final Score','Submitted'],
                      filteredSubs.map((s,i) => [i+1, s.username, s.model_name, compName(s.competition_id), s.accuracy_score, s.f1_score, s.code_score, s.final_score, new Date(s.created_at).toLocaleString()])
                    )} className="skeuo-button px-3 py-2 bg-[hsl(var(--skeuo-accent))] text-black font-bold uppercase rounded-xl tracking-wide text-[10px] flex items-center gap-1.5 cursor-pointer">
                      <Download className="w-3.5 h-3.5" /> DUMP RAW LOG ARRAYS
                    </button>
                  </div>
                </div>

                <div className="skeuo-card bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-black/40 text-neutral-500 text-[10px]">
                        <tr className="border-b border-neutral-900">
                          <th className="px-4 py-3.5">#</th>
                          <th className="px-4 py-3.5">NODE ID</th>
                          <th className="px-4 py-3.5">MODEL TYPE REFERENCE</th>
                          <th className="px-4 py-3.5">CHALLENGE SEGMENT</th>
                          <th className="px-4 py-3.5">ACCURACY</th>
                          <th className="px-4 py-3.5">F1 SIGNAL</th>
                          <th className="px-4 py-3.5">CODE METRIC</th>
                          <th className="px-4 py-3.5">CONVERGED VALUE</th>
                          <th className="px-4 py-3.5">TIMESTAMP VECTOR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900/40 text-neutral-300">
                        {filteredSubs.map((s, i) => (
                          <tr key={s.id} className="hover:bg-neutral-900/10">
                            <td className="px-4 py-3 text-neutral-600 font-bold">{i+1}</td>
                            <td className="px-4 py-3 font-bold text-neutral-200">{s.username}</td>
                            <td className="px-4 py-3 text-neutral-400 text-[11px] font-mono">{s.model_name}</td>
                            <td className="px-4 py-3 text-neutral-500">{compName(s.competition_id)}</td>
                            <td className="px-4 py-3 tabular-nums">{Number(s.accuracy_score).toFixed(1)}%</td>
                            <td className="px-4 py-3 tabular-nums">{Number(s.f1_score).toFixed(1)}%</td>
                            <td className="px-4 py-3 tabular-nums">{Number(s.code_score).toFixed(1)}%</td>
                            <td className="px-4 py-3 text-[hsl(var(--skeuo-accent))] font-black tabular-nums">{Number(s.final_score).toFixed(1)}%</td>
                            <td className="px-4 py-3 text-neutral-600 text-[10px]">
                              {new Date(s.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                        {filteredSubs.length === 0 && (
                          <tr><td colSpan={9} className="text-center py-8 text-neutral-600">No transactional telemetry submission records found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────
                TAB LAYER 9: TEAM DIRECTORY DATABASE MATRIX
                ────────────────────────────────────────────────────────────── */}
            {tab === 'team' && (
              <div className="space-y-6">
                <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-mono font-black uppercase tracking-widest text-[hsl(var(--skeuo-accent))]">TEAM DIRECTORY CRUD INTERFACE</h2>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">REGISTER AND MUTATE BIO AND ACCESS GRAPHICS PATHWAYS FOR ALL OFFICE ENTITIES.</p>
                  </div>
                  <button onClick={openNewTeam}
                    className="skeuo-button px-4 py-2 bg-[hsl(var(--skeuo-accent))] text-black font-mono font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> INSTANTIATE MEMBER
                  </button>
                </div>

                {showTeamForm && (
                  <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                      <h3 className="text-xs font-black text-[hsl(var(--skeuo-accent))] uppercase tracking-widest">{editingTeam ? 'UPDATE RECORD PROFILE' : 'PROVISION DIRECTORY ENTITY'}</h3>
                      <button onClick={() => setShowTeamForm(false)} className="text-neutral-500 hover:text-neutral-300"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">FULL NAME</label>
                        <input type="text" value={teamForm.name} onChange={(e) => setTeamForm({...teamForm, name: e.target.value})} placeholder="e.g. Jean de Dieu Uwase"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">ROLE / TITLE</label>
                        <input type="text" value={teamForm.role} onChange={(e) => setTeamForm({...teamForm, role: e.target.value})} placeholder="e.g. Lead Data Scientist"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>

                      <div className="sm:col-span-2">
                        <ImageField
                          label="PROFILE PHOTO"
                          folder="team"
                          value={teamForm.photo}
                          onChange={(url) => setTeamForm({ ...teamForm, photo: url })}
                          hint="Portrait crops best (4:5). Max 8 MB."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">ONE-LINE HEADLINE</label>
                        <input type="text" value={teamForm.headline} onChange={(e) => setTeamForm({...teamForm, headline: e.target.value})} placeholder="e.g. Builds the models behind WANDAA AI"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">LOCATION</label>
                        <input type="text" value={teamForm.location} onChange={(e) => setTeamForm({...teamForm, location: e.target.value})} placeholder="e.g. Kigali, Rwanda"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">SKILLS (COMMA SEPARATED)</label>
                        <input type="text" value={teamForm.skills} onChange={(e) => setTeamForm({...teamForm, skills: e.target.value})} placeholder="Python, PyTorch, FastAPI, Next.js"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">BIOGRAPHY (BLANK LINE = NEW PARAGRAPH)</label>
                        <textarea value={teamForm.bio} onChange={(e) => setTeamForm({...teamForm, bio: e.target.value})} rows={5} placeholder="What they do, what they have built, what they are working on now."
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none resize-y" />
                      </div>
                    </div>

                    {/* ── Contact & social ── */}
                    <div className="space-y-3 border-t border-neutral-900 pt-4">
                      <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">CONTACT &amp; SOCIAL LINKS</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {([
                          ['email',    'Email address',  'jean@wandaatech.rw'],
                          ['whatsapp', 'WhatsApp number','+250 7XX XXX XXX'],
                          ['linkedin', 'LinkedIn URL',   'linkedin.com/in/handle'],
                          ['github',   'GitHub URL',     'github.com/handle'],
                          ['website',  'Personal site',  'https://example.com'],
                          ['portfolio_link', 'Portfolio URL', 'https://portfolio.example.com'],
                        ] as const).map(([field, label, placeholder]) => (
                          <div key={field} className="space-y-1">
                            <label className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">{label}</label>
                            <input type="text" value={(teamForm as any)[field]} onChange={(e) => setTeamForm({ ...teamForm, [field]: e.target.value })} placeholder={placeholder}
                              className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none text-xs" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── Publishing ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-neutral-900 pt-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">PROFILE URL</label>
                        <input type="text" value={teamForm.slug} onChange={(e) => setTeamForm({...teamForm, slug: e.target.value})} placeholder={slugify(teamForm.name) || 'auto from name'}
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none text-xs" />
                        <p className="text-[9px] text-neutral-600">/team/{teamForm.slug ? slugify(teamForm.slug) : (slugify(teamForm.name) || '…')}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">ORDER</label>
                        <input type="number" value={teamForm.sort_order} onChange={(e) => setTeamForm({...teamForm, sort_order: Number(e.target.value)})}
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none text-xs" />
                        <p className="text-[9px] text-neutral-600">Lower shows first.</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">VISIBILITY</label>
                        <button type="button" onClick={() => setTeamForm({ ...teamForm, is_visible: !teamForm.is_visible })}
                          className={`w-full rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider cursor-pointer border ${teamForm.is_visible ? 'bg-[hsl(var(--skeuo-accent))] text-black border-[hsl(var(--skeuo-accent))]' : 'bg-neutral-900 text-neutral-400 border-neutral-800'}`}>
                          {teamForm.is_visible ? 'Shown on site' : 'Hidden'}
                        </button>
                      </div>
                    </div>

                    {/* ── Portfolio ── */}
                    <div className="space-y-3 border-t border-neutral-900 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">PROJECTS THEY BUILT</label>
                          <p className="text-[9px] text-neutral-600 mt-0.5">Everything listed here appears on their public profile page.</p>
                        </div>
                        <button onClick={addTeamProject} type="button"
                          className="skeuo-button px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--skeuo-accent))] flex items-center gap-1 cursor-pointer">
                          <Plus className="w-3 h-3" /> ADD PROJECT
                        </button>
                      </div>

                      {teamForm.projects.length === 0 && (
                        <p className="text-[10px] text-neutral-600 text-center py-3">No projects added yet.</p>
                      )}

                      {teamForm.projects.map((proj: any, i: number) => (
                        <div key={i} className="skeuo-inset rounded-xl p-4 space-y-3 border border-neutral-900">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-neutral-500 font-bold uppercase">PROJECT #{i + 1}</span>
                            <button onClick={() => removeTeamProject(i)} type="button" className="text-neutral-500 hover:text-red-400 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <input type="text" value={proj.title ?? ''} onChange={(e) => updateTeamProject(i, 'title', e.target.value)} placeholder="Project title"
                            className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none text-xs" />

                          <textarea value={proj.description ?? ''} onChange={(e) => updateTeamProject(i, 'description', e.target.value)} rows={3} placeholder="What it does and what they contributed"
                            className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none text-xs resize-y" />

                          <ImageField
                            label="PROJECT IMAGE"
                            folder="projects"
                            value={proj.image ?? ''}
                            onChange={(url) => updateTeamProject(i, 'image', url)}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input type="text" value={proj.link ?? ''} onChange={(e) => updateTeamProject(i, 'link', e.target.value)} placeholder="Live link / repo"
                              className="skeuo-inset sm:col-span-2 w-full bg-black/60 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none text-xs" />
                            <input type="text" value={proj.year ?? ''} onChange={(e) => updateTeamProject(i, 'year', e.target.value)} placeholder="Year"
                              className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none text-xs" />
                          </div>

                          <input type="text" value={proj.tags ?? ''} onChange={(e) => updateTeamProject(i, 'tags', e.target.value)} placeholder="Tags, comma separated"
                            className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none text-xs" />
                        </div>
                      ))}
                    </div>


                    <button onClick={saveTeamMember} disabled={saving}
                      className="skeuo-button w-full py-3 bg-[hsl(var(--skeuo-accent))] text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer">
                      WRITE DIRECTORY RESOURCE OBJECTS
                    </button>
                  </div>
                )}

                <div className="space-y-3 font-mono">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="skeuo-card bg-neutral-950 p-5 rounded-xl border border-neutral-900 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                          {member.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={member.photo} alt={member.name} className="w-full h-full object-cover opacity-70" />
                          ) : <UserCheck className="w-5 h-5 text-neutral-600" />}
                        </div>
                        <div>
                          <div className="text-xs font-black text-neutral-200 uppercase tracking-tight">{member.name}</div>
                          <div className="text-[10px] text-[hsl(var(--skeuo-accent))] font-bold uppercase">{member.role}</div>
                          <div className="text-[9px] text-neutral-600 truncate max-w-md">{member.bio || 'No profile statement documented.'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditTeam(member)} className="p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteTeamMember(member.id)} className="p-2 border border-neutral-800 rounded-lg text-neutral-500 hover:text-red-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                  {teamMembers.length === 0 && (
                    <p className="text-center text-neutral-600 text-xs py-8">No individual entity metrics populated in roster matrices.</p>
                  )}
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────
                TAB LAYER 10: PROJECT TILES ARCHITECTURE FILES
                ────────────────────────────────────────────────────────────── */}
            {tab === 'projects' && (
              <div className="space-y-6">
                <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-mono font-black uppercase tracking-widest text-[hsl(var(--skeuo-accent))]">PROJECT TILES PORTFOLIO ARRAYS</h2>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">MANAGE SYSTEMS, SOFTWARE ASSETS AND DEPLOYMENT PROFILE INFORMATION RECORD SCHEMAS.</p>
                  </div>
                  <button onClick={openNewProject}
                    className="skeuo-button px-4 py-2 bg-[hsl(var(--skeuo-accent))] text-black font-mono font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> COMPILE NEW TILE
                  </button>
                </div>

                {showProjectForm && (
                  <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                      <h3 className="text-xs font-black text-[hsl(var(--skeuo-accent))] uppercase tracking-widest">{editingProject ? 'MUTATE PROJECT SPECIFICATIONS' : 'INSTANTIATE PROJECT COMPILATION'}</h3>
                      <button onClick={() => setShowProjectForm(false)} className="text-neutral-500 hover:text-neutral-300"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">PROJECT CORE ENGINE TITLE</label>
                        <input type="text" value={projectForm.title} onChange={(e) => setProjectForm({...projectForm, title: e.target.value})} placeholder="e.g. Ubwenge Visual CNN Layer"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <ImageField
                          label="COVER IMAGE"
                          folder="projects"
                          value={projectForm.image}
                          onChange={(url) => setProjectForm({ ...projectForm, image: url })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">LIVE ARTIFACT HYPERLINK DEPLOYMENT URL</label>
                        <input type="text" value={projectForm.link} onChange={(e) => setProjectForm({...projectForm, link: e.target.value})} placeholder="https://lab.vaf.tech/project"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">ARCHITECTURAL ATTRIBUTES TAG FLOWS (COMMA SEPARATED)</label>
                        <input type="text" value={projectForm.tags} onChange={(e) => setProjectForm({...projectForm, tags: e.target.value})} placeholder="Next.js, Tailwind v4, Python Matrix"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">SHORT DESCRIPTION (SHOWN ON CARDS)</label>
                        <textarea value={projectForm.description} onChange={(e) => setProjectForm({...projectForm, description: e.target.value})} rows={3} placeholder="One or two sentences on what it does and who it is for."
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none resize-y" />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">BUILT BY</label>
                        <select value={projectForm.owner_id} onChange={(e) => setProjectForm({...projectForm, owner_id: e.target.value})}
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none cursor-pointer">
                          <option value="">Company project (nobody in particular)</option>
                          {teamMembers.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                        <p className="text-[9px] text-neutral-600">Also lists this project on that person&rsquo;s profile page.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">ORDER</label>
                          <input type="number" value={projectForm.sort_order} onChange={(e) => setProjectForm({...projectForm, sort_order: Number(e.target.value)})}
                            className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-3 py-2.5 text-neutral-200 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">FEATURED</label>
                          <button type="button" onClick={() => setProjectForm({ ...projectForm, featured: !projectForm.featured })}
                            className={`w-full rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-wider cursor-pointer border ${projectForm.featured ? 'bg-[hsl(var(--skeuo-accent))] text-black border-[hsl(var(--skeuo-accent))]' : 'bg-neutral-900 text-neutral-400 border-neutral-800'}`}>
                            {projectForm.featured ? 'Featured' : 'Standard'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button onClick={saveProject} disabled={saving}
                      className="skeuo-button w-full py-3 bg-[hsl(var(--skeuo-accent))] text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer">
                      COMMIT PROJECTS TO PUBLIC STREAMS
                    </button>
                  </div>
                )}

                <div className="space-y-3 font-mono">
                  {projects.map((proj) => (
                    <div key={proj.id} className="skeuo-card bg-neutral-950 p-5 rounded-xl border border-neutral-900 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-neutral-200 uppercase tracking-tight">{proj.title}</div>
                        <p className="text-[10px] text-neutral-500 truncate max-w-xl">{proj.description}</p>
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {(proj.tags || []).map((t: string) => (
                            <span key={t} className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-neutral-900 bg-neutral-950 text-neutral-400 font-mono uppercase">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => openEditProject(proj)} className="p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteProject(proj.id)} className="p-2 border border-neutral-800 rounded-lg text-neutral-500 hover:text-red-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <p className="text-center text-neutral-600 text-xs py-8">No project matrix indices configured.</p>
                  )}
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────
                TAB LAYER 11: VISUAL GRAPHICS GALLERY STACK
                ────────────────────────────────────────────────────────────── */}
            {tab === 'gallery' && (
              <div className="space-y-6">
                <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-mono font-black uppercase tracking-widest text-[hsl(var(--skeuo-accent))]">VISUAL GRAPHICS ASSETS STACK</h2>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">MANAGE VISUAL GRAPHIC TILES, LAB SESSION DIAGRAMS AND SCHEMATICS FLOWS.</p>
                  </div>
                  <button onClick={openNewGallery}
                    className="skeuo-button px-4 py-2 bg-[hsl(var(--skeuo-accent))] text-black font-mono font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> POPULATE TILE
                  </button>
                </div>

                {showGalleryForm && (
                  <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                      <h3 className="text-xs font-black text-[hsl(var(--skeuo-accent))] uppercase tracking-widest">{editingGallery ? 'MUTATE ASSET MAPPING' : 'INSTANTIATE VISUAL FRAME'}</h3>
                      <button onClick={() => setShowGalleryForm(false)} className="text-neutral-500 hover:text-neutral-300"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">GRAPHIC COMPONENT SPECIFICATION TITLE</label>
                        <input type="text" value={galleryForm.title} onChange={(e) => setGalleryForm({...galleryForm, title: e.target.value})} placeholder="e.g. AI Engine Model Loss Curve Diagram"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>
                      <ImageField
                        label="PHOTO"
                        folder="gallery"
                        value={galleryForm.image_url}
                        onChange={(url) => setGalleryForm({ ...galleryForm, image_url: url })}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">CATEGORY (FILTER BUTTON)</label>
                          <input type="text" value={galleryForm.category} onChange={(e) => setGalleryForm({...galleryForm, category: e.target.value})} placeholder="Team / Events / Projects / Lab"
                            className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">ORDER</label>
                          <input type="number" value={galleryForm.sort_order} onChange={(e) => setGalleryForm({...galleryForm, sort_order: Number(e.target.value)})}
                            className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">METADATA CONTEXT CAPTION DESCRIPTION</label>
                        <textarea value={galleryForm.description} onChange={(e) => setGalleryForm({...galleryForm, description: e.target.value})} rows={3} placeholder="Provide descriptive trace context values..."
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none resize-none" />
                      </div>
                    </div>

                    <button onClick={saveGalleryItem} disabled={saving}
                      className="skeuo-button w-full py-3 bg-[hsl(var(--skeuo-accent))] text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer">
                      COMMIT COMPONENT TO DYNAMIC CANVAS
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
                  {galleryItems.map((item) => (
                    <div key={item.id} className="skeuo-card bg-neutral-950 p-4 rounded-xl border border-neutral-900 flex flex-col justify-between gap-3">
                      <div className="space-y-2">
                        <div className="skeuo-inset bg-black h-36 rounded-lg overflow-hidden border border-neutral-900 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover opacity-50" />
                        </div>
                        <div className="text-xs font-black text-neutral-200 uppercase tracking-tight">{item.title}</div>
                        <p className="text-[10px] text-neutral-500 leading-normal">{item.description || 'No complementary annotation string documented.'}</p>
                      </div>

                      <div className="flex items-center gap-2 border-t border-neutral-900/50 pt-2">
                        <button onClick={() => openEditGallery(item)} className="flex-1 py-1 text-[10px] border border-neutral-900 text-neutral-400 rounded-md font-bold uppercase hover:text-white text-center cursor-pointer">EDIT FRAME</button>
                        <button onClick={() => deleteGalleryItem(item.id)} className="flex-1 py-1 text-[10px] border border-neutral-900 text-neutral-500 rounded-md font-bold uppercase hover:text-red-400 text-center cursor-pointer">REMOVE</button>
                      </div>
                    </div>
                  ))}
                  {galleryItems.length === 0 && (
                    <p className="text-center text-neutral-600 text-xs py-8 col-span-full">No graphical display elements bound inside the stack.</p>
                  )}
                </div>
              </div>
            )}


            {/* ──────────────────────────────────────────────────────────────
                TAB: ARTICLES — the public /insights feed
                ────────────────────────────────────────────────────────────── */}
            {tab === 'articles' && (
              <div className="space-y-6">
                <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-mono font-black uppercase tracking-widest text-[hsl(var(--skeuo-accent))]">ARTICLES</h2>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                      PUBLISHED AT /INSIGHTS. ORIGINAL WRITING IS WHAT ADSENSE REVIEWS MOST CLOSELY.
                    </p>
                  </div>
                  <button onClick={openNewArticle}
                    className="skeuo-button px-4 py-2 bg-[hsl(var(--skeuo-accent))] text-black font-mono font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> NEW ARTICLE
                  </button>
                </div>

                {showArticleForm && (
                  <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                      <h3 className="text-xs font-black text-[hsl(var(--skeuo-accent))] uppercase tracking-widest">
                        {editingArticle ? 'EDIT ARTICLE' : 'WRITE ARTICLE'}
                      </h3>
                      <button onClick={() => setShowArticleForm(false)} className="text-neutral-500 hover:text-neutral-300"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">TITLE</label>
                        <input type="text" value={articleForm.title} onChange={(e) => setArticleForm({...articleForm, title: e.target.value})} placeholder="What we learned training a Kinyarwanda tokenizer"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>

                      <div className="sm:col-span-2">
                        <ImageField
                          label="COVER IMAGE"
                          folder="articles"
                          value={articleForm.cover_image}
                          onChange={(url) => setArticleForm({ ...articleForm, cover_image: url })}
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">SUMMARY (SHOWN ON CARDS AND IN SEARCH RESULTS)</label>
                        <textarea value={articleForm.excerpt} onChange={(e) => setArticleForm({...articleForm, excerpt: e.target.value})} rows={2} placeholder="Two sentences that make someone want to read it."
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none resize-y" />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">BODY</label>
                        <textarea value={articleForm.body} onChange={(e) => setArticleForm({...articleForm, body: e.target.value})} rows={16} placeholder={'Blank line = new paragraph.\n\n## Heading\n### Smaller heading\n- bullet\n> quote'}
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none resize-y leading-relaxed" />
                        <p className="text-[9px] text-neutral-600">
                          Blank line starts a paragraph. Lines beginning &ldquo;## &rdquo;, &ldquo;### &rdquo;, &ldquo;- &rdquo; or &ldquo;&gt; &rdquo; become headings, bullets and quotes.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">AUTHOR</label>
                        <input type="text" value={articleForm.author} onChange={(e) => setArticleForm({...articleForm, author: e.target.value})}
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">TAGS (COMMA SEPARATED)</label>
                        <input type="text" value={articleForm.tags} onChange={(e) => setArticleForm({...articleForm, tags: e.target.value})} placeholder="NLP, Kinyarwanda, Training"
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">URL</label>
                        <input type="text" value={articleForm.slug} onChange={(e) => setArticleForm({...articleForm, slug: e.target.value})} placeholder={slugify(articleForm.title) || 'auto from title'}
                          className="skeuo-inset w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none" />
                        <p className="text-[9px] text-neutral-600">/insights/{slugify(articleForm.slug || articleForm.title) || '…'}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">STATUS</label>
                        <button type="button" onClick={() => setArticleForm({ ...articleForm, published: !articleForm.published })}
                          className={`w-full rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-wider cursor-pointer border ${articleForm.published ? 'bg-[hsl(var(--skeuo-accent))] text-black border-[hsl(var(--skeuo-accent))]' : 'bg-neutral-900 text-neutral-400 border-neutral-800'}`}>
                          {articleForm.published ? 'Published' : 'Draft'}
                        </button>
                      </div>
                    </div>

                    <button onClick={saveArticle} disabled={saving}
                      className="skeuo-button w-full py-3 bg-[hsl(var(--skeuo-accent))] text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-40">
                      {saving ? 'SAVING…' : 'SAVE ARTICLE'}
                    </button>
                  </div>
                )}

                <div className="space-y-3 font-mono">
                  {articles.map((article) => (
                    <div key={article.id} className="skeuo-card bg-neutral-950 p-5 rounded-xl border border-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${article.published ? 'bg-[hsl(var(--skeuo-accent))]/15 text-[hsl(var(--skeuo-accent))]' : 'bg-neutral-900 text-neutral-500'}`}>
                            {article.published ? 'Live' : 'Draft'}
                          </span>
                          <span className="text-[9px] text-neutral-600">/insights/{article.slug}</span>
                        </div>
                        <p className="text-xs font-black text-neutral-200 truncate">{article.title}</p>
                        <p className="text-[10px] text-neutral-500 line-clamp-2">{article.excerpt}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {article.published && (
                          <Link href={`/insights/${article.slug}`} target="_blank"
                            className="px-3 py-1.5 text-[10px] border border-neutral-900 text-neutral-400 rounded-md font-bold uppercase hover:text-white flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> View
                          </Link>
                        )}
                        <button onClick={() => toggleArticlePublished(article)}
                          className="px-3 py-1.5 text-[10px] border border-neutral-900 text-neutral-400 rounded-md font-bold uppercase hover:text-white cursor-pointer">
                          {article.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onClick={() => openEditArticle(article)}
                          className="px-3 py-1.5 text-[10px] border border-neutral-900 text-neutral-400 rounded-md font-bold uppercase hover:text-white cursor-pointer">
                          Edit
                        </button>
                        <button onClick={() => deleteArticle(article.id)}
                          className="px-3 py-1.5 text-[10px] border border-neutral-900 text-neutral-500 rounded-md font-bold uppercase hover:text-red-400 cursor-pointer">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {articles.length === 0 && (
                    <p className="text-center text-neutral-600 text-xs py-8">
                      No articles yet. AdSense reviews sites for original, substantial content — a handful of real write-ups here makes a material difference.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────
                TAB: MONETIZATION — AdSense readiness and ad placements
                ────────────────────────────────────────────────────────────── */}
            {tab === 'monetization' && (
              <div className="space-y-6">
                <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-900">
                  <h2 className="text-sm font-mono font-black uppercase tracking-widest text-[hsl(var(--skeuo-accent))]">ADSENSE READINESS</h2>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">EVERYTHING GOOGLE CHECKS BEFORE APPROVING A SITE.</p>

                  <div className="mt-5 space-y-2">
                    {(() => {
                      const checks = [
                        { label: 'Privacy policy with third-party / Google ad cookie disclosures', done: true, note: '/privacy' },
                        { label: 'Cookie policy listing every cookie category', done: true, note: '/cookie-policy' },
                        { label: 'Terms of service', done: true, note: '/terms' },
                        { label: 'Disclaimer covering ads and AI output', done: true, note: '/disclaimer' },
                        { label: 'Reachable contact page with a working form', done: true, note: '/contact' },
                        { label: 'About / company page explaining who publishes the site', done: true, note: '/company' },
                        { label: 'Consent Mode v2 with a real reject option', done: true, note: 'Banner on every page' },
                        { label: 'ads.txt served at the domain root', done: true, note: '/ads.txt' },
                        { label: 'Sitemap and robots.txt allowing AdSense crawlers', done: true, note: '/sitemap.xml' },
                        { label: 'At least 10 substantial original articles', done: articles.filter(a => a.published).length >= 10, note: `${articles.filter(a => a.published).length} published` },
                        { label: 'Team profiles with real names and photos', done: teamMembers.length > 0, note: `${teamMembers.length} member(s)` },
                        { label: 'At least one ad placement enabled with a real slot ID', done: adSlots.some(a => a.enabled && a.slot_id), note: `${adSlots.filter(a => a.enabled && a.slot_id).length} live` },
                      ]
                      const remaining = checks.filter(c => !c.done).length
                      return (
                        <>
                          <p className="text-[10px] font-mono text-neutral-400 mb-3">
                            {remaining === 0
                              ? 'All checks pass — you are ready to submit the site for review.'
                              : `${remaining} item(s) still to do before submitting for review.`}
                          </p>
                          {checks.map((check) => (
                            <div key={check.label} className="flex items-start gap-3 py-2 border-b border-neutral-900/60 last:border-0">
                              {check.done
                                ? <CheckCircle className="w-4 h-4 text-[hsl(var(--skeuo-accent))] shrink-0 mt-0.5" />
                                : <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                              <div className="min-w-0">
                                <p className="text-xs text-neutral-300">{check.label}</p>
                                <p className="text-[10px] font-mono text-neutral-600">{check.note}</p>
                              </div>
                            </div>
                          ))}
                        </>
                      )
                    })()}
                  </div>
                </div>

                <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-900 space-y-4">
                  <div>
                    <h2 className="text-sm font-mono font-black uppercase tracking-widest text-[hsl(var(--skeuo-accent))]">AD PLACEMENTS</h2>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                      PASTE THE SLOT ID FROM ADSENSE → ADS → BY AD UNIT, THEN ENABLE. A PLACEMENT WITH NO SLOT ID RENDERS NOTHING.
                    </p>
                  </div>

                  {adSlots.length === 0 && (
                    <p className="text-center text-neutral-600 text-xs py-8 font-mono">
                      No placements found. Run the SQL migration in supabase/migrations to create them.
                    </p>
                  )}

                  <div className="space-y-3">
                    {adSlots.map((slot) => (
                      <AdSlotEditor key={slot.id} slot={slot} onSave={saveAdSlot} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────────
                TAB: INBOX — messages from the contact form
                ────────────────────────────────────────────────────────────── */}
            {tab === 'messages' && (
              <div className="space-y-6">
                <div className="skeuo-card bg-neutral-950 p-6 rounded-2xl border border-neutral-900">
                  <h2 className="text-sm font-mono font-black uppercase tracking-widest text-[hsl(var(--skeuo-accent))]">CONTACT INBOX</h2>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                    {messages.filter(m => !m.handled).length} UNREAD OF {messages.length} TOTAL.
                  </p>
                </div>

                <div className="space-y-3 font-mono">
                  {messages.map((message) => (
                    <div key={message.id} className={`skeuo-card p-5 rounded-xl border space-y-3 ${message.handled ? 'bg-neutral-950/60 border-neutral-900' : 'bg-neutral-950 border-neutral-800'}`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-neutral-200">
                            {message.name}
                            <a href={`mailto:${message.email}`} className="ml-2 font-normal text-[hsl(var(--skeuo-accent))] hover:underline">{message.email}</a>
                          </p>
                          {message.subject && <p className="text-[10px] text-neutral-500 mt-0.5">{message.subject}</p>}
                        </div>
                        <span className="text-[9px] text-neutral-600 shrink-0">
                          {message.created_at ? new Date(message.created_at).toLocaleString() : ''}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-400 leading-relaxed whitespace-pre-wrap">{message.message}</p>

                      <div className="flex items-center gap-2 border-t border-neutral-900/50 pt-3">
                        <button onClick={() => toggleMessageHandled(message)}
                          className="px-3 py-1.5 text-[10px] border border-neutral-900 text-neutral-400 rounded-md font-bold uppercase hover:text-white cursor-pointer">
                          {message.handled ? 'Mark unread' : 'Mark handled'}
                        </button>
                        <button onClick={() => deleteMessage(message.id)}
                          className="px-3 py-1.5 text-[10px] border border-neutral-900 text-neutral-500 rounded-md font-bold uppercase hover:text-red-400 cursor-pointer">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-center text-neutral-600 text-xs py-8">No messages yet.</p>
                  )}
                </div>
              </div>
            )}

          </section>
        </div>
      </main>
    </div>
  )
}
// ──────────────────────────────────────────────────────────────────────────
// AD PLACEMENT EDITOR
// Kept as a separate component so each row holds its own draft state and
// typing in one slot does not re-render the whole panel.
// ──────────────────────────────────────────────────────────────────────────
function AdSlotEditor({
  slot,
  onSave,
}: {
  slot: AdSlotRow
  onSave: (slot: AdSlotRow, patch: Partial<AdSlotRow>) => Promise<void>
}) {
  const [slotId, setSlotId] = useState(slot.slot_id ?? '')
  const [format, setFormat] = useState(slot.format ?? 'auto')
  const [enabled, setEnabled] = useState(Boolean(slot.enabled))
  const [busy, setBusy] = useState(false)

  const dirty =
    slotId !== (slot.slot_id ?? '') ||
    format !== (slot.format ?? 'auto') ||
    enabled !== Boolean(slot.enabled)

  async function save() {
    setBusy(true)
    await onSave(slot, { slot_id: slotId.trim(), format, enabled })
    setBusy(false)
  }

  return (
    <div className="skeuo-inset rounded-xl border border-neutral-900 p-4 space-y-3 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-neutral-200">
            {slot.label || slot.placement}
          </p>
          <p className="text-[9px] text-neutral-600">placement: {slot.placement}</p>
        </div>

        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer ${
            enabled
              ? 'bg-[hsl(var(--skeuo-accent))] text-black border-[hsl(var(--skeuo-accent))]'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800'
          }`}
        >
          {enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_auto] gap-2">
        <input
          type="text"
          value={slotId}
          onChange={(e) => setSlotId(e.target.value)}
          placeholder="AdSense slot ID, e.g. 1234567890"
          className="w-full rounded-lg border border-neutral-800 bg-black/60 px-3 py-2 text-xs text-neutral-200 outline-none placeholder:text-neutral-600"
        />

        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="w-full cursor-pointer rounded-lg border border-neutral-800 bg-black/60 px-3 py-2 text-xs text-neutral-200 outline-none"
        >
          <option value="auto">auto (responsive)</option>
          <option value="fluid">fluid (in-article / in-feed)</option>
          <option value="rectangle">rectangle</option>
          <option value="horizontal">horizontal</option>
          <option value="vertical">vertical</option>
        </select>

        <button
          type="button"
          onClick={save}
          disabled={!dirty || busy}
          className="rounded-lg bg-[hsl(var(--skeuo-accent))] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-black disabled:opacity-30 cursor-pointer"
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>

      {enabled && !slotId.trim() && (
        <p className="text-[10px] text-amber-400">
          Enabled but no slot ID — this placement will not render until you paste one.
        </p>
      )}
    </div>
  )
}
