'use client'

const galleryItems = [
  { id: 1, title: 'Team Meeting' },
  { id: 2, title: 'Development Session' },
  { id: 3, title: 'Brainstorming' },
  { id: 4, title: 'Product Launch' },
  { id: 5, title: 'Team Event' },
  { id: 6, title: 'Innovation Day' },
]

export function Gallery() {
  return (
    <section className="py-20 sm:py-32 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Section Header */}
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Team Gallery
            </h2>
            <p className="text-lg text-muted-foreground">
              Moments from our journey building WANDAA TECH
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square bg-gradient-to-br from-secondary to-secondary/50 rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer hover:shadow-lg"
              >
                {/* Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary/50 to-secondary/30">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-foreground font-medium">{item.title}</p>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
