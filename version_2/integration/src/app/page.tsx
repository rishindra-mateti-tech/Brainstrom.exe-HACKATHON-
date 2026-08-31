'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/base';
import { MeshBackground } from '@/components/ui/MeshBackground';
import { trackSpotlight } from '@/lib/utils';
import { ArrowRight, ShieldCheck, Leaf, ScanLine, Wind, FileText } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <MeshBackground />
      {/* Navigation */}
      <nav className="glass sticky top-0 z-30">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              Sign In
            </Link>
            <Link href="/admin/login" className="hidden sm:block text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              Admin Portal
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="grain relative container mx-auto px-6 pt-20 md:pt-28 pb-32">
        <div className="absolute top-[-8%] right-[-6%] w-[560px] h-[560px] bg-[radial-gradient(circle,hsl(var(--primary)/0.16),transparent_70%)] -z-10" />
        <div className="absolute bottom-[-10%] left-[-8%] w-[460px] h-[460px] bg-[radial-gradient(circle,hsl(var(--secondary)/0.14),transparent_70%)] -z-10" />

        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="glass inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[hsl(var(--primary))] text-xs font-semibold uppercase tracking-widest"
          >
            <Leaf className="w-3.5 h-3.5" />
            AI-powered skincare intelligence
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.08 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            Skincare that learns
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">with you.</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.16 }}
            className="text-lg md:text-xl text-[hsl(var(--muted-foreground))] max-w-xl mx-auto leading-relaxed"
          >
            CUTIeS-IQ evaluates your products against your ingredient history, your climate, and your skin, without the medical guesswork.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link href="/signup">
              <Button size="lg" className="group">
                Start Analysis <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="ghost">Sign in</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features — asymmetric bento, not the generic 3-equal-column row */}
      <section className="border-t border-[hsl(var(--border))] py-24 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="max-w-lg mb-14"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">How it works</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">Three signals, one verdict.</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            <motion.div
              variants={fadeUp}
              onMouseMove={trackSpotlight}
              className="glass spotlight-border md:col-span-2 md:row-span-1 rounded-[1.25rem] p-8 md:p-10 relative overflow-hidden"
            >
              <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.12),transparent_70%)]" />
              <div className="relative w-11 h-11 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))] mb-6">
                <ScanLine className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Ingredient OCR</h3>
              <p className="text-[hsl(var(--muted-foreground))] max-w-md leading-relaxed">
                Photograph a label or paste the list directly. A trained classifier extracts, identifies, and cross-checks every ingredient against known safety data in seconds.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              onMouseMove={trackSpotlight}
              className="glass spotlight-border rounded-[1.25rem] p-8"
            >
              <div className="w-11 h-11 rounded-xl bg-[hsl(var(--secondary)/0.15)] flex items-center justify-center text-[hsl(var(--secondary))] mb-6">
                <Wind className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">Climate context</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                Your skin's needs shift with the weather. Recommendations adjust to your local season and humidity.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              onMouseMove={trackSpotlight}
              className="glass spotlight-border md:col-start-3 rounded-[1.25rem] p-8"
            >
              <div className="w-11 h-11 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--accent))] mb-6">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">Reaction memory</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                Mark what irritated your skin once. We'll flag it automatically if it resurfaces in a future product.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="glass md:col-span-2 rounded-[1.25rem] p-8 flex items-center gap-4"
            >
              <FileText className="w-6 h-6 text-[hsl(var(--primary))] shrink-0" />
              <p className="text-sm text-[hsl(var(--foreground))]">
                Every estimate is labeled <strong>Verified</strong> or <strong>AI Estimate</strong>, never presented with false confidence. See the full{' '}
                <Link href="/legal/data-sources" className="underline decoration-[hsl(var(--primary)/0.4)] hover:decoration-[hsl(var(--primary))] font-medium">
                  data sources disclosure
                </Link>.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer Disclaimer */}
      <footer className="container mx-auto px-6 py-12 border-t border-[hsl(var(--border))]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo className="opacity-70" />
          <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-lg text-center md:text-right leading-relaxed">
            This platform does not provide medical advice. Recommendations are informational, based on user preferences, reported experiences, and publicly available ingredient data.
          </p>
        </div>
      </footer>
    </div>
  );
}
