'use client'

import { ShieldCheck, Clock, Lock, Eye, Trash2, Smartphone, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { LegalSubNav } from '@/components/legal'

export default function PrivacyPage() {
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

        {/* Legal Tabs Navigation */}
        <LegalSubNav />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-12 pb-8 border-b border-border">
          <div className="p-3 bg-emerald-500/10 rounded-2xl w-fit">
            <ShieldCheck className="w-10 h-10 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4" /> 
              <span>Effective Date: March 11, 2026</span>
            </p>
          </div>
        </div>
        
        <div className="prose prose-emerald dark:prose-invert max-w-none space-y-12">
          
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <Smartphone className="w-5 h-5" />
              <h2 className="text-2xl font-bold m-0 text-foreground">1. Data Collection</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              In compliance with <strong>Rwanda’s Law Nº 058/2021</strong>, WANDAA TECH collects information 
              to power <strong>Easy GO</strong>. This includes name, phone, and geolocation data necessary 
              for our <strong>FastAPI price predictor</strong> and tracking.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <Eye className="w-5 h-5" />
              <h2 className="text-2xl font-bold m-0 text-foreground">2. Use of Information</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We use data for logistics coordination and secure <strong>Mobile Money (MoMo)</strong> payments. 
              We do not sell your personal data to third parties.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <Lock className="w-5 h-5" />
              <h2 className="text-2xl font-bold m-0 text-foreground">3. Data Security</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard encryption. Data is only accessible to authorized 
              WANDAA TECH personnel for operational purposes.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <Trash2 className="w-5 h-5" />
              <h2 className="text-2xl font-bold m-0 text-foreground">4. Your Rights</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access or delete your account. Contact our support team in 
              Kigali at <a href="mailto:support@wandaatech.rw" className="text-emerald-500 hover:underline">support@wandaatech.rw</a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}