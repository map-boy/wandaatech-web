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
              About WANDAA TECH
            </h2>
            <p className="text-lg text-muted-foreground">
              We are a student-led startup built by passionate innovators
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-foreground">
                  Founded by Data Science Students
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  WANDAA TECH was created by  Data Science students from Université Libre de Kigali (ULK). What started as a vision to solve real-world problems has evolved into a full-fledged technology startup.
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
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Innovation through education
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Real-world impact
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Entrepreneurial spirit
                  </li>
                </ul>
              </div>
            </div>

            {/* Right - Company Image */}
            <div className="relative rounded-2xl aspect-square overflow-hidden border border-border shadow-xl">
              <Image
                src="/company-logo.jpg"
                alt="WANDAA TECH"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Subtle overlay to match the theme */}
              <div className="absolute inset-0 bg-primary/5 hover:bg-transparent transition-colors duration-300" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}