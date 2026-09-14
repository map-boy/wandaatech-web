/**
 * Renders an admin-authored `richtext` value.
 *
 * Blank lines become paragraphs. Nothing is parsed as HTML — an admin can
 * write freely without being able to inject markup or script into the public
 * site, which matters because the panel is password-shared rather than
 * per-user.
 */
export function RichText({
  value,
  className = '',
  paragraphClassName = 'leading-relaxed text-muted-foreground',
}: {
  value: string
  className?: string
  paragraphClassName?: string
}) {
  const paragraphs = (value || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (paragraphs.length === 0) return null

  return (
    <div className={className || 'space-y-4'}>
      {paragraphs.map((p, i) => (
        <p key={i} className={paragraphClassName}>
          {p}
        </p>
      ))}
    </div>
  )
}
