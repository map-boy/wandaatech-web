'use client'
import { ShieldCheck, Clock, MapPin, Bell, Database, Users, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SmartMotosPrivacyPage() {
  return (
    <main className="min-h-screen py-12 bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb / Back Link */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-500 transition-colors mb-8 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-12 border-b border-border pb-8">
          <div className="p-3 bg-emerald-500/10 rounded-2xl w-fit">
            <ShieldCheck className="w-10 h-10 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">SmartMotos Privacy Policy</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4" />
              <span>Last Updated: August 23, 2026</span>
            </p>
          </div>
        </div>

        <div className="prose prose-emerald dark:prose-invert max-w-none space-y-12">
          {/* Intro */}
          <section>
            <p>
              SmartMotos is a ride-hailing app for Kigali, Rwanda, developed by VAF UBWENGE TECH.
              This policy explains what information we collect, why we collect it, and how it is used
              when you use the SmartMotos mobile app.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Database className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">1. Information We Collect</h2>
            </div>
            <ul className="space-y-2">
              <li><strong>Account information:</strong> name, phone number, and email address when you sign up.</li>
              <li><strong>Location data:</strong> precise (GPS) and approximate location, used to match riders with nearby drivers, set pickup/drop-off points, and show routes on the map.</li>
              <li><strong>Trip data:</strong> pickup/drop-off addresses, trip history, fare, and payment status.</li>
              <li><strong>Device data:</strong> device identifiers and push notification tokens, used to deliver trip updates.</li>
            </ul>
          </section>

          {/* 2. Location Use */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <MapPin className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">2. How We Use Location</h2>
            </div>
            <p>
              Location access is used only to power core ride-hailing features: showing your position
              on the map, finding nearby drivers, calculating routes and fares, and sharing live trip
              location between rider and driver during an active trip. We do not sell location data.
            </p>
          </section>

          {/* 3. Notifications */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Bell className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">3. Notifications</h2>
            </div>
            <p>
              We send notifications for trip status changes (driver assigned, arrival, trip completion)
              and account-related alerts. You can manage notification permissions in your device settings.
            </p>
          </section>

          {/* 4. Third-Party Services */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Users className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">4. Third-Party Services</h2>
            </div>
            <ul className="space-y-2">
              <li><strong>Firebase (Google):</strong> authentication, database, cloud storage, and push notifications.</li>
              <li><strong>Google Maps:</strong> map display, geocoding, and route calculation.</li>
              <li><strong>Mobile Money (MTN MoMo):</strong> payment processing for trip fares. SmartMotos does not store your mobile money PIN.</li>
            </ul>
          </section>

          {/* 5. Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Sharing</h2>
            <p>
              We share trip and location data between matched riders and drivers only as needed to
              complete a trip. We do not sell personal data to third parties.
            </p>
          </section>

          {/* 6. Data Retention & Deletion */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention & Account Deletion</h2>
            <p>
              We retain account and trip data for as long as your account is active. You may request
              account and data deletion at any time by contacting us below.
            </p>
          </section>

          {/* 7. Contact */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Mail className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">7. Contact Us</h2>
            </div>
            <p>
              Questions about this policy or your data? Contact VAF UBWENGE TECH at{' '}
              <a href="mailto:techubwenge@gmail.com" className="text-emerald-500 hover:underline">
                techubwenge@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
