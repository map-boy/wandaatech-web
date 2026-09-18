import { Header } from '@/components/header'
import { QRGenerator } from '@/components/qr-generator'
import { Footer } from '@/components/site-footer'
import { ToolExplainer } from '@/components/tool-explainer'

export default function QREnginePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <QRGenerator />

        <ToolExplainer
          lead="A free QR code generator that runs entirely in your browser. Paste a link or any text, choose a colour, and download a PNG you can put on a poster, a menu, a delivery label or a business card."
          sections={[
            {
              heading: 'How it works',
              paragraphs: [
                'The code is drawn on a canvas in your browser as you type, and the download is that canvas saved as a PNG. Nothing is uploaded, so whatever you encode — an internal link, a phone number, a draft URL — stays on your machine.',
                'Recently generated codes are kept in a short list so you can come back to one without retyping it. That list lives in your browser only and is cleared when you clear it.',
              ],
            },
            {
              heading: 'Getting a code that actually scans',
              bullets: [
                { term: 'Keep the contrast high', description: 'a dark code on a light background scans reliably; light-on-dark and low-contrast colour pairs often do not.' },
                { term: 'Shorter content, denser code', description: 'long URLs produce more modules, which need a larger print size to stay readable.' },
                { term: 'Leave the quiet zone', description: 'the white margin around the code is part of the code — cropping it tight is the most common reason a printed code fails.' },
                { term: 'Test before you print', description: 'scan the downloaded PNG at the size you intend to print it, with more than one phone.' },
              ],
            },
          ]}
        />
      </main>
      <Footer />
    </div>
  )
}