'use client'

import Image from 'next/image'

export function About() {
  return (
    <section id="about" className="py-20 sm:py-32 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Section Header */}
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              About <span className="skeuo-glow-text">VAF UBWENGE TECH</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              We are a student-led startup built by passionate innovators
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="skeuo-card p-8 space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-foreground">
                  Founded by Data Science Students
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  VAF UBWENGE TECH was created by  Data Science students from Université Libre de Kigali (ULK). What started as a vision to solve real-world problems has evolved into a full-fledged technology startup.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-foreground">
                  Our Mission
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We believe technology should be accessible and empowering. Our mission is to build innovative digital solutions that address the unique challenges faced by communities across Africa.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-foreground">
                  Core Values
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="skeuo-inset flex items-center gap-3 px-4 py-2.5">
                    <span className="w-2 h-2 rounded-full skeuo-glow-text bg-current" />
                    Innovation through education
                  </li>
                  <li className="skeuo-inset flex items-center gap-3 px-4 py-2.5">
                    <span className="w-2 h-2 rounded-full skeuo-glow-text bg-current" />
                    Real-world impact
                  </li>
                  <li className="skeuo-inset flex items-center gap-3 px-4 py-2.5">
                    <span className="w-2 h-2 rounded-full skeuo-glow-text bg-current" />
                    Entrepreneurial spirit
                  </li>
                </ul>
              </div>
            </div>

            {/* Right - Company Image */}
            <div className="skeuo-card relative rounded-[1.5rem] aspect-square overflow-hidden p-3">
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <Image
                  src="/company-logo.jpg"
                  alt="VAF UBWENGE TECH"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-primary/5 hover:bg-transparent transition-colors duration-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}