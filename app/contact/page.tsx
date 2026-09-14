import type { Metadata } from 'next'
import { Mail, MapPin, Phone, Clock } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/site-footer'
import { Contact } from '@/components/contact'
import { getContent } from '@/lib/site-content'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with VAF UBWENGE TECH in Kigali, Rwanda — partnerships, press, student programmes or support.',
  alternates: { canonical: '/contact' },
}

export default async function ContactPage() {
  const c = await getContent()

  const details = [
    { icon: Mail, label: 'Email', value: c.t('contact.email'), href: `mailto:${c.t('contact.email')}` },
    { icon: Phone, label: 'Phone', value: c.t('contact.phone'), href: `tel:${c.t('contact.phone').replace(/\s/g, '')}` },
    { icon: MapPin, label: 'Where we are', value: c.t('contact.address'), href: '' },
    { icon: Clock, label: 'Response time', value: c.t('contact.hours'), href: '' },
  ].filter((d) => d.value)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-28">
        <section className="mx-auto max-w-4xl px-4 pb-4 pt-8 text-center sm:px-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter sm:text-5xl">
            Contact <span className="text-emerald-500">Us</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Whether you want to work with us, write about us, join a competition or report a problem
            with something we built — this reaches the whole team.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {details.map((d) => {
              const Icon = d.icon
              const inner = (
                <>
                  <Icon className="mb-3 h-5 w-5 text-emerald-500" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {d.label}
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-foreground">{d.value}</p>
                </>
              )
              return d.href ? (
                <a key={d.label} href={d.href} className="skeuo-card block p-5 transition-transform hover:-translate-y-1">
                  {inner}
                </a>
              ) : (
                <div key={d.label} className="skeuo-card p-5">
                  {inner}
                </div>
              )
            })}
          </div>
        </section>

        <Contact
          title={c.t('contact.title')}
          subtitle={c.t('contact.subtitle')}
          email={c.t('contact.email')}
        />
      </main>

      <Footer />
    </div>
  )
}
