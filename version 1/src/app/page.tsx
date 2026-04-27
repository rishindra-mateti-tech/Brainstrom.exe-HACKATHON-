'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/base';
import { ArrowRight, ShieldCheck, Sparkles, Wind } from 'lucide-react';
import * as Motion from 'framer-motion';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] overflow-x-hidden">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <Logo />
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium hover:text-[hsl(var(--primary))] transition-colors">
            Sign In
          </Link>
          <Link href="/admin/login" className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">
            Admin Portal
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-16 pb-32 relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[hsl(var(--primary)/0.15)] rounded-full blur-[100px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[hsl(var(--secondary)/0.15)] rounded-full blur-[80px] -z-10" />

        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-3 h-3" />
            AI-Powered Skincare Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]"
          >
            Skincare that learns <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">with you.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto leading-relaxed"
          >
            CUTIeS-IQ evaluates your products based on ingredient history, climate, and personal experience—without the medical guesswork.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/signup">
              <Button size="lg" className="group shadow-lg shadow-[hsl(var(--primary)/20%)] hover:scale-105 transition-all duration-300">
                Start Analysis <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white/50 backdrop-blur-md py-24 border-t border-[hsl(var(--border))]">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--secondary)/0.1)] flex items-center justify-center text-[hsl(var(--secondary))]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Ingredient OCR</h3>
              <p className="text-[hsl(var(--muted-foreground))]">
                Snap a photo of any product. Our AI extracts and analyzes ingredients in seconds.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))]">
                <Wind className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Climate Context</h3>
              <p className="text-[hsl(var(--muted-foreground))]">
                Your skin needs change with the weather. We adjust recommendations based on your local environment.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100/50 flex items-center justify-center text-amber-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Reaction Memory</h3>
              <p className="text-[hsl(var(--muted-foreground))]">
                Mark ingredients that caused irritation. We&apos;ll warn you if they show up in future products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Disclaimer */}
      <footer className="container mx-auto px-6 py-12 border-t border-[hsl(var(--border))] text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-lg mx-auto italic">
          &ldquo;This platform does not provide medical advice. All recommendations are informational and based on user preferences, reported experiences, and publicly available ingredient data.&rdquo;
        </p>
        <div className="mt-8 flex justify-center gap-6 opacity-50 grayscale">
          <Logo />
        </div>
      </footer>
    </div>
  );
}
