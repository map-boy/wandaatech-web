'use client'

import { useState } from 'react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  return (
    <section id="contact" className="py-20 sm:py-32 bg-background border-b border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Section Header */}
          <div className="space-y-4 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Get in Touch
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a question or partnership opportunity? We'd love to hear from you.
            </p>
          </div>

          {/* Contact Container */}
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              {/* Email */}
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Email</h3>
                <a href="Contact us:vafubwengetech@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  vafubwengetech@gmail.com
                </a>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Location</h3>
                <p className="text-muted-foreground">Kigali, Rwanda</p>
              </div>

              {/* Social */}
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Social Media</h3>
                <div className="flex gap-3">
                  {['LinkedIn', 'Twitter', 'Instagram'].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium text-foreground">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="What's this about?"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-foreground">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  placeholder="Your message..."
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitted}
                >
                  {submitted ? '✓ Message Sent!' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
