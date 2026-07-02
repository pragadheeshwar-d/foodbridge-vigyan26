import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UtensilsCrossed, Brain, Truck, QrCode, Heart, Search,
  ChevronDown, Leaf, Scale, Store, Handshake, MapPin, PackageCheck, Users,
} from 'lucide-react'
import { Navbar, Footer } from '../components/layout/Navbar'
import { Button } from '../components/ui/Button'
import { AnimatedCounter, FadeIn, StaggerContainer, staggerItem } from '../components/ui/AnimatedCounter'
import { howItWorks, faqs } from '../data/mockData'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePublicStats } from '../hooks/usePublicStats'

const stepIcons = [UtensilsCrossed, Brain, Truck, QrCode, Heart]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const { user } = useAuth()
  const { stats, loading } = usePublicStats()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-gray-950">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden bg-gradient-to-br from-surface via-green-50/60 to-surface dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                Tamil Nadu's Smart Food Redistribution Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Reduce Food Waste.
                <br />
                <span className="gradient-text">Feed More Lives.</span>
              </h1>
              <p className="mt-6 text-lg text-text-secondary max-w-lg leading-relaxed">
                Food Bridge is a B2B platform connecting surplus food from hotels and caterers directly to verified NGOs and shelters. Live coordination helps surplus food reach those who need it most.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/donor/add">
                  <Button variant="primary" size="lg" icon={UtensilsCrossed}>
                    Donate Food
                  </Button>
                </Link>
                <Link to="/receiver">
                  <Button variant="secondary" size="lg" icon={Search}>
                    Find Food
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-text-secondary">
                New here?{' '}
                <Link to="/auth/signup" className="text-primary font-semibold hover:underline">
                  Create an account
                </Link>{' '}
                and choose your path.
              </p>
              <div className="mt-8 flex items-center gap-6 text-sm text-text-secondary">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/40?img=${i + 10}`}
                      alt=""
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900"
                    />
                  ))}
                </div>
                <span>
                  <strong className="text-text dark:text-white">
                    {loading ? '...' : stats.activeUsers.toLocaleString()}
                  </strong>{' '}
                  active users across TN
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
                <div className="relative rounded-3xl overflow-hidden shadow-elevated">
                  <img
                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=600&fit=crop"
                    alt="Food donation hero"
                    className="w-full h-[400px] lg:h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="absolute bottom-6 left-6 right-6 glass-card p-4 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text dark:text-gray-100">Live Impact</p>
                      <p className="text-2xl font-extrabold text-primary">
                        <AnimatedCounter value={stats.mealsSaved} suffix=" meals saved" />
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 -mt-8 relative z-10 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
            <p className="text-text-secondary mt-3 max-w-2xl mx-auto">
              From donation to distribution in five seamless steps with simple, reliable coordination
            </p>
          </FadeIn>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary-light to-accent -translate-y-1/2" />

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {howItWorks.map((step, i) => {
                const Icon = stepIcons[i]
                return (
                  <motion.div key={step.step} variants={staggerItem} className="relative">
                    <div className="glass-card p-6 text-center hover:shadow-elevated transition-all duration-300 group">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                        <Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-xs font-bold text-primary">Step {step.step}</span>
                      <h3 className="font-bold mt-1 mb-2">{step.title}</h3>
                      <p className="text-xs text-text-secondary leading-relaxed">{step.description}</p>
                    </div>
                    {i < howItWorks.length - 1 && (
                      <div className="lg:hidden flex justify-center my-2">
                        <ChevronDown className="w-5 h-5 text-primary animate-bounce" />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="impact" className="py-16 bg-surface dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Real Impact, Measured Daily</h2>
            <p className="text-text-secondary mt-3 max-w-2xl mx-auto">
              Every meal saved is a life touched. Our platform tracks environmental and social impact across Tamil Nadu in real-time.
            </p>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div variants={staggerItem} className="stat-card text-center">
              <Heart className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="stat-value">
                <AnimatedCounter value={loading ? 0 : stats.mealsSaved} suffix="+" />
              </p>
              <p className="text-xs text-text-secondary mt-1 font-medium">Meals Saved</p>
            </motion.div>
            <motion.div variants={staggerItem} className="stat-card text-center">
              <UtensilsCrossed className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="stat-value">
                <AnimatedCounter value={loading ? 0 : stats.activeDonations} />
              </p>
              <p className="text-xs text-text-secondary mt-1 font-medium">Active Donations</p>
            </motion.div>
            <motion.div variants={staggerItem} className="stat-card text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="stat-value">
                <AnimatedCounter value={loading ? 0 : stats.dailyPeopleFed} suffix="+" />
              </p>
              <p className="text-xs text-text-secondary mt-1 font-medium">Daily Avg. People Fed</p>
            </motion.div>
            <motion.div variants={staggerItem} className="stat-card text-center">
              <Scale className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="stat-value">
                <AnimatedCounter value={loading ? 0 : stats.foodWastePrevented} suffix=" tons" />
              </p>
              <p className="text-xs text-text-secondary mt-1 font-medium">Food Waste Prevented</p>
            </motion.div>
          </StaggerContainer>
        </div>
      </section>

      {/* Network */}
      <section id="network" className="py-16 bg-surface dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Network</h2>
            <p className="text-text-secondary mt-3 max-w-2xl mx-auto">
              A growing ecosystem of restaurants, NGOs, and cities across Tamil Nadu working together to end food waste.
            </p>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div variants={staggerItem} className="stat-card text-center">
              <Store className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="stat-value">
                <AnimatedCounter value={loading ? 0 : stats.restaurantsConnected} suffix="+" />
              </p>
              <p className="text-xs text-text-secondary mt-1 font-medium">Restaurants Connected</p>
            </motion.div>
            <motion.div variants={staggerItem} className="stat-card text-center">
              <Handshake className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="stat-value">
                <AnimatedCounter value={loading ? 0 : stats.ngosConnected} suffix="+" />
              </p>
              <p className="text-xs text-text-secondary mt-1 font-medium">NGOs Connected</p>
            </motion.div>
            <motion.div variants={staggerItem} className="stat-card text-center">
              <MapPin className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="stat-value">
                <AnimatedCounter value={loading ? 0 : stats.citiesCovered} suffix="+" />
              </p>
              <p className="text-xs text-text-secondary mt-1 font-medium">Cities Covered</p>
            </motion.div>
            <motion.div variants={staggerItem} className="stat-card text-center">
              <PackageCheck className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="stat-value">
                <AnimatedCounter value={loading ? 0 : stats.successfulDeliveries} suffix="+" />
              </p>
              <p className="text-xs text-text-secondary mt-1 font-medium">Successful Deliveries</p>
            </motion.div>
          </StaggerContainer>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </FadeIn>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="glass-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-semibold text-sm pr-4">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-text-secondary shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                  </motion.div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-surface dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeIn>
            <div className="relative rounded-3xl overflow-hidden p-12 md:p-16">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark" />
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=400&fit=crop')] bg-cover bg-center opacity-10" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to Make a Difference?
                </h2>
                <p className="text-white/80 mb-8 max-w-lg mx-auto">
                  Join thousands of donors and NGOs across Tamil Nadu already making an impact. Start donating or receiving food today.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/donor/add">
                    <Button variant="accent" size="lg">Start Donating</Button>
                  </Link>
                  <Link to="/receiver">
                    <Button variant="secondary" size="lg">Find Food Near You</Button>
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  )
}
