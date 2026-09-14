/**
 * URL-safe identifier derived from a name or title.
 *
 * Lives on its own (rather than in site-data.ts) because the admin panel is a
 * client component: importing it from site-data would pull the server-side
 * Supabase readers into the browser bundle.
 */
export function slugify(input: string): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
