'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ArrowRight, ArrowLeft, Clock, Tag, ChevronDown, X } from 'lucide-react'

const projectFeatures = [
  'Live GPS Tracking',
  'Price Prediction AI',
  'Mobile Money Integration',
  'Driver Management UI',
  'Real-time Logistics Analytics',
  'Kigali-wide Coverage'
]

const tagStyles: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  sky:     'bg-sky-500/10 text-sky-400 border-sky-500/20',
  amber:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  violet:  'bg-violet-500/10 text-violet-400 border-violet-500/20',
}

const articleContent: Record<string, { sections: { heading: string; paragraphs: string[] }[] }> = {
  'how-we-built-easy-go': {
    sections: [
      {
        heading: 'The Problem We Saw Every Day',
        paragraphs: [
          'Anyone who has tried to send a package across Kigali knows the challenge. You call a moto driver, negotiate a price you are not sure is fair, wait with no way to track where they are, and pay in cash with no receipt. For small business owners — market vendors, boutique shops, home bakers — this broken experience was costing them customers and trust every single day.',
          'As students living in Kigali, we experienced this problem firsthand. We did not want to just write a research paper about it. We wanted to build something that actually worked. That is where Easy GO began.',
        ],
      },
      {
        heading: 'Starting on a Whiteboard',
        paragraphs: [
          'The first version of Easy GO was drawn on a whiteboard in a classroom after lectures. We asked ourselves three questions: Who sends packages? Who delivers them? And what information does each side need to make the experience trustworthy?',
          'The answer was simple: senders need a fair price estimate before they commit. Drivers need clear pickup and drop-off details. Both sides need real-time location visibility. And everyone needs a payment method they already trust — which in Rwanda means Mobile Money.',
          'From that whiteboard session, we identified our four core modules: a price prediction engine, a GPS tracking layer, a driver management interface, and a MoMo payment integration. Four problems. One app.',
        ],
      },
      {
        heading: 'Choosing the Tech Stack',
        paragraphs: [
          'We are a small student team, which means every technology choice has to earn its place. We chose FastAPI for our backend because it gave us async endpoints and automatic API docs — perfect for serving ML model predictions fast. Our team already knew Python from machine learning coursework, so it was a natural fit.',
          'For the frontend and driver dashboard we chose Next.js on Vercel. We could push updates in minutes and get server-side rendering for better performance on lower-end devices common in our market.',
          'Google Maps API gave us reliable road data and distance calculations that fed directly into our price prediction model. And MTN Mobile Money API was non-negotiable — over 90% of digital payments in Rwanda go through MoMo, so we built around it from day one.',
        ],
      },
      {
        heading: 'Building the Price Prediction Engine',
        paragraphs: [
          'The heart of Easy GO is its AI pricing engine. Instead of fixed rates, we trained a machine learning model on delivery distance, time of day, traffic patterns, and historical pricing data to generate fair, dynamic estimates.',
          'We collected initial training data by surveying moto drivers across Kigali districts — Nyarugenge, Gasabo, and Kicukiro — recording real fares for real routes. That data became the foundation of our first model, a gradient boosting regressor that we retrain as new delivery data comes in.',
          'The model is served through a FastAPI endpoint that accepts origin coordinates, destination coordinates, and package weight, then returns a price estimate in under 200 milliseconds — fast enough that users see the price before they even finish entering their destination.',
        ],
      },
      {
        heading: 'The Hardest Part: Real-Time GPS Tracking',
        paragraphs: [
          'Live tracking sounds simple until you try to build it. The challenge was not just getting GPS coordinates from the driver — it was updating them in real time on the customer side without hammering our server with requests.',
          'We solved this with WebSocket connections between the driver app and the customer tracking screen. The driver app sends a location ping every 5 seconds. The customer sees the pin move on the map without refreshing the page.',
          'We also had to handle the reality of mobile internet in Kigali — connections drop, speeds vary, and not everyone has the latest phone. We built reconnection logic that resumes tracking automatically when the driver comes back online, so a brief disconnection does not break the entire delivery experience.',
        ],
      },
      {
        heading: 'What We Launched and What We Learned',
        paragraphs: [
          'Easy GO launched its pilot in Kigali with a small group of drivers and business owners in early 2026. Users loved the price transparency — knowing the cost upfront before confirming a delivery removed the biggest source of friction in the old process.',
          'The biggest lesson we learned was about trust. Technology alone does not make people trust a new platform. We had to show up in person, explain how the app worked, and demonstrate live that their MoMo payment was safe. Building a product for your own community means the community has to believe in you first.',
        ],
      },
    ],
  },

  'fastapi-ml-price-prediction': {
    sections: [
      {
        heading: 'Why We Needed a Custom Pricing Model',
        paragraphs: [
          'Delivery pricing in Kigali is not linear. A 2km trip across flat terrain in the morning costs very differently from a 2km trip up a hill during peak hours. Standard rate cards could not capture this complexity, so we built our own model.',
          'Our goal was a system that could ingest route data and return a fair, explainable price in real time — something both drivers and customers could trust because it was consistent and based on real data, not negotiation.',
        ],
      },
      {
        heading: 'Data Collection: Learning from the Streets',
        paragraphs: [
          'Before writing a single line of model code, we spent weeks in the field. Our team rode with moto drivers across all three Kigali districts, recording origin, destination, distance, time, and agreed fare for hundreds of trips.',
          'We also collected elevation data using the Google Elevation API, because Kigali is famously hilly and gradient has a real effect on fuel cost and driver effort. That data became one of our strongest predictive features.',
        ],
      },
      {
        heading: 'The Model: Gradient Boosting on Route Features',
        paragraphs: [
          'We tested several algorithms — linear regression, random forest, and gradient boosting. Gradient boosting consistently outperformed the others on our validation set, achieving a mean absolute error of under 150 RWF on most routes.',
          'Our feature set includes straight-line distance, road distance from Google Maps, elevation change, time of day, day of week, and package weight category. We retrain the model monthly as new delivery data accumulates.',
        ],
      },
      {
        heading: 'Serving Predictions with FastAPI',
        paragraphs: [
          'The trained model is serialized with joblib and loaded into a FastAPI application at startup. A single POST endpoint accepts origin and destination coordinates plus weight category, calls the Google Maps Distance Matrix API, then passes all features to the model and returns a price estimate.',
          'End-to-end latency from request to response averages under 200ms. We deployed the FastAPI app on a cloud server with auto-scaling so it handles demand spikes during busy delivery hours.',
        ],
      },
      {
        heading: 'What Makes It Fair',
        paragraphs: [
          'Price prediction is only useful if users trust it. We made the pricing transparent by showing users the breakdown: base fare, distance component, and any time-of-day adjustment. No hidden fees.',
          'Drivers also see the estimated fare before accepting a delivery, which reduced disputes significantly during our pilot. When both sides see the same number generated by the same logic, the negotiation problem disappears.',
        ],
      },
    ],
  },

  'ai-changing-logistics-africa': {
    sections: [
      {
        heading: "Africa's Last-Mile Problem",
        paragraphs: [
          'Last-mile delivery — getting a package from a distribution point to a final address — is the most expensive and least efficient part of any logistics network. In African cities, this problem is amplified by informal addressing systems, mixed road quality, and payment infrastructure that differs dramatically from Western markets.',
          'But where legacy logistics companies see obstacles, a new generation of African tech startups sees opportunity. From Lagos to Nairobi to Kigali, AI-powered platforms are being built specifically for African realities, not adapted from tools built elsewhere.',
        ],
      },
      {
        heading: 'How Machine Learning Changes the Equation',
        paragraphs: [
          'Traditional logistics pricing relies on fixed rate cards that cannot adapt to real conditions. Machine learning changes this by learning from actual delivery data — traffic, distance, time, terrain — and generating prices that reflect what a trip actually costs.',
          'More importantly, ML enables demand prediction. Platforms can anticipate where drivers are needed before customers even place orders, reducing wait times and improving driver earnings by keeping them busier with less idle time.',
        ],
      },
      {
        heading: 'Mobile-First by Necessity',
        paragraphs: [
          'Across Africa, mobile penetration far exceeds desktop usage. Any logistics platform that is not mobile-first is not really built for the African market. This shapes every design decision — from screen size assumptions to offline capability to the choice of Mobile Money over credit card payments.',
          'In Rwanda, MTN Mobile Money handles the majority of digital transactions. Building for Africa means building for the specific mobile payment rails of each market, not assuming a universal solution exists.',
        ],
      },
      {
        heading: 'What Startups Like Easy GO Are Proving',
        paragraphs: [
          'Easy GO, built by the student team at VAF UBWENGE TECH in Kigali, demonstrates that AI-powered logistics is not just for large corporations. A small team with access to cloud infrastructure, open-source ML tools, and a deep understanding of their local market can build something that genuinely improves daily life.',
          'The key insight is that the technology is not the hard part. The hard part is understanding the human behavior, trust dynamics, and economic realities of your specific market.',
        ],
      },
      {
        heading: 'What Comes Next for African Logistics Tech',
        paragraphs: [
          'The next wave of innovation will come from combining logistics data with broader urban intelligence — integrating with city planning data, public transport networks, and environmental monitoring to make delivery smarter and more sustainable.',
          'Africa is not catching up to the world in logistics technology. In several dimensions — mobile payment integration, informal market adaptation, community-based delivery networks — African startups are building solutions the rest of the world does not have yet.',
        ],
      },
    ],
  },

  'building-student-startup-rwanda': {
    sections: [
      {
        heading: 'How It Started',
        paragraphs: [
          'VAF UBWENGE TECH did not start with a business plan. It started with a conversation between students who were frustrated that the technology problems they saw around them every day were not being solved by anyone they knew.',
          'We were studying in Kigali, surrounded by a city that was growing fast — new businesses, new residents, new demand for services. And we kept seeing the same gap: digital tools built for other markets being forced onto Rwandan users, with predictably poor results.',
        ],
      },
      {
        heading: 'The First Year Was Not Glamorous',
        paragraphs: [
          'The romanticized version of a startup is late nights fueled by passion and breakthrough moments. The reality of our first year was more mundane: debugging API integrations before an 8am lecture, rewriting the same onboarding flow four times because users kept getting confused, and explaining to skeptical drivers why they should trust an app built by students.',
          'We got a lot wrong. Our first version of the driver app had too many screens. Our initial price model overfit badly to our small training dataset. We spent two weeks building a feature that users told us in five minutes they did not need.',
        ],
      },
      {
        heading: 'What We Got Right',
        paragraphs: [
          'We talked to users constantly. Not surveys — actual conversations. We rode with drivers. We sat with shop owners. We watched people use the app and resisted the urge to explain it when they got confused, because their confusion was data.',
          'We also made a decision early on to keep the team small and trust each other completely. No wasted energy on internal politics. Everyone built, everyone tested, everyone talked to users. That flatness made us faster than any larger team could have been.',
        ],
      },
      {
        heading: 'Balancing School and a Startup',
        paragraphs: [
          'There is no clean answer to this. Some weeks the startup won and our grades reflected it. Some exam periods the startup went quiet and that was fine. We learned to be honest with each other about capacity instead of pretending everything was manageable all the time.',
          'Being students also gave us advantages we did not fully appreciate at first. We had access to faculty with deep technical knowledge, peers who became early users, and institutional credibility when talking to potential partners.',
        ],
      },
      {
        heading: 'What Surprised Us Most',
        paragraphs: [
          'The hardest problems were not technical. Code is patient — you can debug it, refactor it, start over if you need to. Building trust with a community that has every reason to be skeptical of a new technology product requires time and consistency that no sprint can shortcut.',
          'We were also surprised by how much support existed once we started looking for it. The Rwandan tech ecosystem is small but genuinely collaborative. Founders who had been building longer than us were generous with their time and honest about their mistakes.',
        ],
      },
    ],
  },

  'gps-tracking-mobile-money': {
    sections: [
      {
        heading: 'The UX Challenge Nobody Talks About',
        paragraphs: [
          'Most articles about building delivery apps focus on either the tracking technology or the payment integration separately. The harder problem was connecting them into a single seamless flow that felt natural to users who had never used a delivery app before.',
          "Our users needed to confirm a delivery, watch it happen in real time, and pay — all without the experience feeling like three separate things held together with tape. That continuity was the design challenge at the heart of Easy GO's UX.",
        ],
      },
      {
        heading: 'How the GPS Layer Works',
        paragraphs: [
          'When a driver accepts a delivery, their app opens a WebSocket connection to our server and begins sending GPS coordinates every 5 seconds. The customer tracking screen subscribes to that same connection and updates the map pin in real time without any page refresh.',
          'We chose WebSockets over polling because the connection overhead of repeated HTTP requests would have been too high on mobile networks. A persistent connection that only transmits when there is new data is far more efficient for both the server and the device battery.',
          'When the driver marks a delivery complete, the WebSocket closes, the map freezes on the final location, and the payment confirmation screen appears automatically.',
        ],
      },
      {
        heading: 'Integrating MTN Mobile Money',
        paragraphs: [
          'MTN MoMo integration in Rwanda requires working with the MoMo API sandbox during development, then going through an approval process for production access. The edge cases — failed transactions, network timeouts, duplicate payment attempts — required careful handling.',
          'We implemented idempotency keys for every payment request so that if a user tapped the pay button twice due to slow network response, we would not charge them twice. That one decision saved us from a category of support complaints that would have destroyed user trust early on.',
        ],
      },
      {
        heading: 'What We Learned About Rwandan Users',
        paragraphs: [
          'Our users were not reluctant to use technology — they were reluctant to use technology they did not understand. Once we added a simple confirmation screen showing the exact amount, the recipient number, and a plain-language description, MoMo payment completion rates improved significantly.',
          'Transparency is not just a nice design principle — for users making financial transactions on a new platform, it is the difference between completing the payment and abandoning the app.',
        ],
      },
      {
        heading: 'The Result: One Continuous Experience',
        paragraphs: [
          'The flow we shipped: customer confirms delivery and sees price, driver accepts and tracking begins, customer watches live location on map, delivery completes and payment screen appears automatically, customer pays via MoMo with one confirmation, both sides receive a receipt.',
          'Six steps that feel like one. That simplicity took months of iteration to achieve, but it is the feature our users mention most when they tell others about Easy GO.',
        ],
      },
    ],
  },

  'intelligence-lab-vision': {
    sections: [
      {
        heading: 'More Than a Side Project',
        paragraphs: [
          'When we started VAF UBWENGE TECH, we knew that Easy GO was one application of a much larger set of questions we wanted to explore. How do you build AI systems that work reliably in low-resource environments? How do you collect meaningful training data in markets where data infrastructure is nascent?',
          'Those questions needed a dedicated space. That space is the Intelligence Lab.',
        ],
      },
      {
        heading: 'What the Lab Actually Does',
        paragraphs: [
          'The Intelligence Lab is the research and development function of VAF UBWENGE TECH. It is where we prototype ideas before they become product features, run experiments that might fail, and document what we learn whether or not it leads to something we ship.',
          'Current active research areas include geospatial AI for urban mobility in African cities, lightweight ML models optimized for inference on low-spec mobile devices, and natural language interfaces in Kinyarwanda for non-English-speaking users.',
        ],
      },
      {
        heading: 'The Connection to Easy GO',
        paragraphs: [
          'Everything the Intelligence Lab researches eventually finds its way into Easy GO or into tools we share publicly. The price prediction engine powering Easy GO today was first prototyped in the lab. The driver demand forecasting model we are currently testing will become a product feature when it meets our accuracy threshold.',
          'This feedback loop between product and research is intentional. Research without application drifts. Product without research stagnates. The lab keeps our product honest and our product keeps our research grounded.',
        ],
      },
      {
        heading: 'Why Rwanda, Why Now',
        paragraphs: [
          'Rwanda has made deliberate investments in becoming a technology hub for East and Central Africa. The infrastructure — reliable power, growing 4G coverage, a young and educated population, and a government that actively supports innovation — creates conditions where serious technical work is possible.',
          'We are building the Intelligence Lab here because this is where the problems we care about are most acute and where the solutions we develop will have the most direct impact.',
        ],
      },
      {
        heading: 'What We Plan to Publish',
        paragraphs: [
          'We are committed to open research. As our work matures, we plan to publish datasets, model architectures, and findings that other builders in the region can use. The problems of African urban mobility are too large for any one team to solve.',
          'If you are a researcher, engineer, or student who wants to collaborate with the Intelligence Lab, we want to hear from you. The door is open.',
        ],
      },
    ],
  },
}

const blogPosts = [
  {
    slug: 'how-we-built-easy-go',
    tag: 'Behind the Build',
    tagColor: 'emerald',
    title: 'How We Built Easy GO — A Logistics App for Kigali',
    excerpt:
      'From a whiteboard sketch to a live delivery platform: the full story of how a student team at VAF UBWENGE TECH engineered Easy GO from the ground up, including the technical choices we made and why.',
    readTime: '6 min read',
    date: 'March 15, 2026',
  },
  {
    slug: 'fastapi-ml-price-prediction',
    tag: 'Engineering',
    tagColor: 'sky',
    title: 'Using FastAPI and Machine Learning to Predict Delivery Prices in Real Time',
    excerpt:
      'A deep dive into the AI pricing engine behind Easy GO — how we collect geospatial data, train our model, and serve predictions in under 200ms using FastAPI deployed on the cloud.',
    readTime: '8 min read',
    date: 'March 12, 2026',
  },
  {
    slug: 'ai-changing-logistics-africa',
    tag: 'Industry',
    tagColor: 'amber',
    title: 'How Artificial Intelligence Is Transforming Delivery Services Across Africa',
    excerpt:
      'From Lagos to Nairobi to Kigali, a new generation of startups is using machine learning and mobile-first design to solve last-mile logistics. Here is where Africa stands today.',
    readTime: '5 min read',
    date: 'March 10, 2026',
  },
  {
    slug: 'building-student-startup-rwanda',
    tag: 'Startup Life',
    tagColor: 'violet',
    title: 'Building a Student Startup in Rwanda: Lessons from Our First Year',
    excerpt:
      "Balancing coursework, investor meetings, and sprint deadlines is not easy. The VAF UBWENGE TECH founding team shares what we got right, what we got wrong, and what surprised us most.",
    readTime: '7 min read',
    date: 'March 7, 2026',
  },
  {
    slug: 'gps-tracking-mobile-money',
    tag: 'Product',
    tagColor: 'emerald',
    title: 'Integrating Live GPS Tracking with Mobile Money Payments in a Single Flow',
    excerpt:
      "One of Easy GO's core UX challenges was linking real-time driver location to a seamless MoMo payment confirmation. This is how we solved it — and what we learned about building for Rwandan users.",
    readTime: '6 min read',
    date: 'March 3, 2026',
  },
  {
    slug: 'intelligence-lab-vision',
    tag: 'Research',
    tagColor: 'sky',
    title: 'What Is the VAF UBWENGE TECH Intelligence Lab?',
    excerpt:
      "Our Intelligence Lab is not just a side project — it is the R&D backbone of everything we build. Here is the vision behind it, the problems we are tackling, and what we plan to publish next.",
    readTime: '4 min read',
    date: 'February 28, 2026',
  },
]

// ─── INLINE ARTICLE READER ───
function ArticleReader({
  post,
  onClose,
}: {
  post: (typeof blogPosts)[0]
  onClose: () => void
}) {
  const content = articleContent[post.slug]
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-emerald-500/20 bg-card overflow-hidden"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-emerald-500/5">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to articles
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 sm:px-10 py-10 max-w-3xl mx-auto space-y-8">
        {/* Article header */}
        <div className="space-y-4 pb-8 border-b border-border/50">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${tagStyles[post.tagColor]}`}>
              {post.tag}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {post.readTime}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Tag className="w-3 h-3" /> {post.date}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            {post.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>
          <div className="flex items-center gap-3 pt-1">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
              V
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">VAF UBWENGE TECH Team</p>
              <p className="text-xs text-muted-foreground">Kigali, Rwanda</p>
            </div>
          </div>
        </div>

        {/* Sections */}
        {content?.sections.map((section, i) => (
          <section key={i} className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">{section.heading}</h3>
            {section.paragraphs.map((p, j) => (
              <p key={j} className="text-muted-foreground leading-relaxed">{p}</p>
            ))}
          </section>
        ))}

        <div className="pt-8 border-t border-border/50">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to articles
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── MAIN EXPORT ───
export function Project() {
  const [showCaseStudy, setShowCaseStudy] = useState(false)
  const [openArticle, setOpenArticle] = useState<string | null>(null)

  const [featured, ...rest] = blogPosts
  const activePost = blogPosts.find((p) => p.slug === openArticle) ?? null

  const handleOpenArticle = (slug: string) => {
    setOpenArticle(slug)
    setTimeout(() => {
      document.getElementById('article-reader')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleCloseArticle = () => {
    setOpenArticle(null)
    setTimeout(() => {
      document.getElementById('case-study')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <section id="project" className="py-20 sm:py-32 bg-background border-b border-border/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">

          {/* Section Header */}
          <motion.div
            className="space-y-4 max-w-2xl"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
              Our Flagship Project
            </h2>
            <p className="text-lg text-emerald-600 dark:text-emerald-400 font-medium">
              Revolutionizing logistics with Easy GO
            </p>
          </motion.div>

          {/* Project Showcase */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            <motion.div
              className="relative group aspect-square rounded-3xl glass border border-white/10 flex items-center justify-center p-12 overflow-hidden shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-sky-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              <Image
                src="/Gemini_Generated_Image_i81dxxi81dxxi81d.png"
                alt="Easy GO Logo"
                width={500}
                height={500}
                className="relative z-10 object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
                priority
              />
              <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-emerald-500/30 rounded-tl-xl" />
              <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-sky-500/30 rounded-br-xl" />
            </motion.div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h3 className="text-3xl font-bold text-foreground">Easy GO Delivery Platform</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Developed as a comprehensive solution for local commerce, Easy GO combines
                  advanced geospatial tracking with machine learning to predict delivery costs
                  accurately and connect users with efficient transport options across the city.
                </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 gap-4">
                {projectFeatures.map((feature, i) => (
                  <motion.div
                    key={feature}
                    className="flex items-center gap-3 p-3 rounded-xl glass border border-white/5 hover:border-emerald-500/30 transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-foreground font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="pt-4"
              >
                <button
                  onClick={() => {
                    setShowCaseStudy(!showCaseStudy)
                    setOpenArticle(null)
                    if (!showCaseStudy) {
                      setTimeout(() => {
                        document.getElementById('case-study')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }, 100)
                    }
                  }}
                  className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  {showCaseStudy ? 'Hide Case Study' : 'View Case Study'}
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showCaseStudy ? 'rotate-180' : ''}`} />
                </button>
              </motion.div>
            </div>
          </div>

          {/* CASE STUDY */}
          <AnimatePresence>
            {showCaseStudy && (
              <motion.div
                id="case-study"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="space-y-10 pt-4"
              >
                <div className="pb-6 border-b border-border/50">
                  <h3 className="text-3xl font-bold text-foreground tracking-tight">Easy GO — Case Study</h3>
                  <p className="text-muted-foreground mt-1">
                    Engineering notes, product decisions, and lessons from building Kigali&apos;s delivery platform.
                  </p>
                </div>

                {/* Article cards — hide when reading */}
                <AnimatePresence>
                  {!openArticle && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-10"
                    >
                      {/* Featured card */}
                      <div
                        onClick={() => handleOpenArticle(featured.slug)}
                        className="group cursor-pointer"
                      >
                        <div className="relative rounded-3xl border border-border/60 hover:border-emerald-500/40 bg-card transition-all duration-500 p-8 sm:p-12 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                          <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
                            <div className="space-y-6">
                              <div className="flex items-center gap-3">
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${tagStyles[featured.tagColor]}`}>
                                  {featured.tag}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {featured.readTime}
                                </span>
                              </div>
                              <h4 className="text-2xl sm:text-3xl font-bold text-foreground leading-snug group-hover:text-emerald-400 transition-colors">
                                {featured.title}
                              </h4>
                              <p className="text-muted-foreground leading-relaxed">{featured.excerpt}</p>
                              <div className="flex items-center gap-2 text-emerald-500 font-medium">
                                Read article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                            <div className="hidden lg:flex items-center justify-center rounded-2xl bg-emerald-500/5 border border-emerald-500/10 aspect-video">
                              <div className="text-center space-y-2 p-8">
                                <div className="text-5xl font-black text-emerald-500/20 tracking-tighter">EASY GO</div>
                                <div className="text-xs text-muted-foreground/50 uppercase tracking-widest">VAF UBWENGE TECH</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Remaining cards */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rest.map((post, i) => (
                          <motion.div
                            key={post.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.4 }}
                            onClick={() => handleOpenArticle(post.slug)}
                            className="group cursor-pointer"
                          >
                            <div className="h-full rounded-2xl border border-border/60 hover:border-emerald-500/30 bg-card p-6 space-y-4 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${tagStyles[post.tagColor]}`}>
                                  {post.tag}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {post.readTime}
                                </span>
                              </div>
                              <h4 className="font-bold text-foreground leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">
                                {post.title}
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                {post.excerpt}
                              </p>
                              <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Tag className="w-3 h-3" /> {post.date}
                                </span>
                                <span className="flex items-center gap-1 text-emerald-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                  Read <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Inline article reader */}
                <div id="article-reader">
                  <AnimatePresence>
                    {activePost && (
                      <ArticleReader post={activePost} onClose={handleCloseArticle} />
                    )}
                  </AnimatePresence>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </section>
  )
}