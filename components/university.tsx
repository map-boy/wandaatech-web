'use client'

export function University() {
  return (
    <section id="university" className="py-20 sm:py-32 bg-secondary border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Image Placeholder */}
          <div className="bg-background rounded-2xl aspect-square flex items-center justify-center border border-border">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-primary/10 rounded-xl mx-auto flex items-center justify-center">
                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.001m20 0C22 10.998 17.5 6.25 12 6.253m0 13C17.5 30.25 22 25.5 22 19.001m-20 0h20" />
                </svg>
              </div>
              <h4 className="font-semibold text-foreground">ULK Campus</h4>
              <p className="text-sm text-muted-foreground">Université Libre de Kigali</p>
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block">
                <span className="px-4 py-2 bg-background text-foreground text-sm font-medium rounded-full">
                  Our Foundation
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
                Université Libre de Kigali
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We are proud students of Université Libre de Kigali (ULK) studying Data Science in Year 1. Our university has been instrumental in fostering our entrepreneurial spirit and providing the knowledge foundation for building real-world technology projects.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-foreground">3</p>
                <p className="text-muted-foreground">Founding Members</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-foreground">1</p>
                <p className="text-muted-foreground">Data Science Year</p>
              </div>
            </div>

            {/* Key Points */}
            <div className="space-y-4">
              {[
                'Data-driven approach to problem-solving',
                'Hands-on experience in tech entrepreneurship',
                'Strong emphasis on innovation and research',
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-foreground leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
