import { Header } from '@/components/header'
import { QRGenerator } from '@/components/qr-generator'
import { Footer } from '@/components/footer'

export default function QREnginePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <QRGenerator />
      </main>
      <Footer />
    </div>
  )
}