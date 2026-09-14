import { getContent } from '@/lib/site-content'
import { FooterView } from '@/components/footer'

/** Server wrapper that feeds the footer its admin-managed content. */
export async function Footer() {
  const c = await getContent()

  return (
    <FooterView
      blurb={c.t('footer.blurb')}
      copyright={c.t('footer.copyright')}
      email={c.t('contact.email')}
      linkedin={c.t('footer.linkedin')}
      twitter={c.t('footer.twitter')}
      github={c.t('footer.github')}
    />
  )
}
