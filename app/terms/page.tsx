'use client'

import { FileText, Clock, AlertTriangle, CreditCard, Scale, Ban, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { LegalSubNav } from '@/components/legal'

export default function TermsPage() {
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

        {/* Legal Tabs Navigation - Same as Privacy Page */}
        <LegalSubNav />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-12 border-b border-border pb-8">
          <div className="p-3 bg-emerald-500/10 rounded-2xl w-fit">
            <FileText className="w-10 h-10 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Terms & Conditions</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4" /> 
              <span>Last Updated: March 11, 2026</span>
            </p>
          </div>
        </div>

        <div className="prose prose-emerald dark:prose-invert max-w-none space-y-12">
          
          {/* 1. Service Usage */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <Ban className="w-5 h-5" />
              <h2 className="text-2xl font-bold m-0 text-foreground">1. Service Usage & Restrictions</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              By accessing WANDAA TECH platforms, you agree to provide accurate and truthful data. 
              Any attempt to manipulate our <strong>FastAPI pricing models</strong>, spoof <strong>GPS tracking</strong>, 
              or interfere with the <strong>Easy GO</strong> logistics network is strictly prohibited.
            </p>
          </section>

          {/* 2. Pricing & Estimates */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-2xl font-bold m-0 text-foreground">2. Pricing Estimates</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Our price predictor uses machine learning to estimate delivery costs. Please note that these are 
              <strong> estimates</strong>. WANDAA TECH reserves the right to adjust final costs if actual 
              delivery routes differ significantly from the initial request.
            </p>
          </section>

          {/* 3. Payments (MoMo) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <CreditCard className="w-5 h-5" />
              <h2 className="text-2xl font-bold m-0 text-foreground">3. Payment Terms</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Payments are processed through integrated <strong>Mobile Money (MoMo)</strong> gateways. 
              WANDAA TECH is not liable for transaction failures caused by third-party telecom network issues.
            </p>
          </section>

          {/* 4. Limitation of Liability */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <Scale className="w-5 h-5" />
              <h2 className="text-2xl font-bold m-0 text-foreground">4. Limitation of Liability</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              WANDAA TECH acts as a technology facilitator. We are not liable for service interruptions 
              caused by maintenance, cloud provider outages, or unforeseen regional infrastructure challenges.
            </p>
          </section>

          <footer className="pt-8 border-t border-border text-sm text-muted-foreground italic">
            For further legal inquiries regarding WANDAA TECH operations in Kigali, please reach out to our legal department.
          </footer>

        </div>
      </div>
    </main>
  )
}