import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Sparkles, Gift } from 'lucide-react'
import { Logo } from '../../components/layout/Logo'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(46,125,50,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(249,168,37,0.16),_transparent_28%),linear-gradient(180deg,_#fbfdf9_0%,_#f4f8f3_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(46,125,50,0.25),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(249,168,37,0.18),_transparent_28%),linear-gradient(180deg,_#05070a_0%,_#090d0a_100%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/" className="inline-flex items-center gap-3">
          <Logo />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-stretch">
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden lg:flex flex-col justify-between rounded-[2rem] p-10 xl:p-12 text-white overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-slate-950" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_white,_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(249,168,37,0.6),_transparent_30%)]" />
            <div className="relative space-y-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm text-white/90 backdrop-blur">
                <Sparkles className="w-4 h-4" />
                Production-grade food redistribution
              </span>
              <div>
                <h1 className="text-5xl font-bold tracking-tight leading-tight">{title}</h1>
                <p className="mt-4 text-white/75 text-lg max-w-xl">{subtitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                {[
                  { label: 'Live pickups', value: '24/7' },
                  { label: 'Verified orgs', value: '890+' },
                  { label: 'Meals saved', value: '2.8M+' },
                  { label: 'Response time', value: '< 15m' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-white/10 backdrop-blur p-4 border border-white/10">
                    <p className="text-2xl font-bold">{item.value}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative grid gap-3">
              {[
                'Secure JWT sessions and role-based access',
                'Donation tracking with QR verification',
                'Simple address capture with no map integration',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur px-4 py-3 border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  <span className="text-sm text-white/85">{item}</span>
                </div>
              ))}
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start justify-center lg:pt-4"
          >
            <div className="w-full max-w-xl rounded-[2rem] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-[0_30px_100px_rgba(15,23,42,0.12)] border border-white/60 dark:border-gray-800 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                  <p className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">Food Bridge</p>
                  <h2 className="text-3xl font-bold mt-1">{title}</h2>
                  <p className="text-sm text-text-secondary mt-2">{subtitle}</p>
                </div>
                <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary">
                  <Gift className="w-6 h-6" />
                </div>
              </div>

              {children}

              <p className="text-xs text-text-secondary mt-6">
                By continuing, you agree to our Terms and Privacy Policy. Session state is stored locally in this frontend demo.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
