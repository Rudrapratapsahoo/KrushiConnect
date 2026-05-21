'use client';

import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import HeroParticles from '@/components/HeroParticles';
import {
  Sprout,
  ShoppingBag,
  CloudSun,
  ShieldCheck,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-bg py-20 px-4 sm:px-6 lg:px-8">
        {/* Animated leaf particles background */}
        <HeroParticles />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 animate-fade-in-up">

          {/* Big bold credit line */}
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-earth-dark">
            Designed & Developed{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-500 to-primary animate-gradient-x">
              by Rudra
            </span>
          </p>

          <div className="inline-flex items-center space-x-2 bg-primary-light/60 text-primary-dark px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-primary/20 backdrop-blur-md shadow-sm">
            <Sparkles className="h-4 w-4 animate-spin-slow" />
            <span>Empowering Sustainable Agriculture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-earth-dark leading-tight max-w-4xl mx-auto">
            Directly Connecting <span className="text-primary">Farmers</span> & <span className="text-primary">Buyers</span>
          </h1>

          <p className="text-lg sm:text-xl text-earth max-w-2xl mx-auto font-medium leading-relaxed">
            KrushiConnect is a smart agriculture ecosystem. Trade high-quality crops securely, predict weather changes, and get data-driven crop recommendations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/marketplace"
              className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition duration-200 flex items-center justify-center space-x-2"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-white/80 hover:bg-white text-earth-dark border border-stone-200 px-8 py-4 rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition duration-200 flex items-center justify-center"
            >
              <span>Join as a Member</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition Grid (3 Columns) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs uppercase font-extrabold text-primary tracking-widest">Platform Pillars</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-earth-dark">Everything a Modern Farmer Needs</h3>
            <p className="text-earth font-medium">We design simple, efficient digital tools built on actual farmer needs and soil capabilities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Marketplace */}
            <div className="bg-stone-50/50 p-8 rounded-3xl border border-stone-100 hover:border-primary/25 hover:shadow-xl transition-all duration-355 group">
              <div className="bg-primary-light/60 p-4 rounded-2xl w-14 h-14 flex items-center justify-center text-primary mb-6 transition group-hover:scale-110">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h4 className="text-xl font-bold text-earth-dark mb-3">Direct Marketplace</h4>
              <p className="text-earth text-sm leading-relaxed mb-6 font-medium">
                Eliminate middlemen commissions. Farmers set their price, choose locations, and sell directly to buyers with secure online order creation.
              </p>
              <Link href="/marketplace" className="inline-flex items-center text-primary font-bold text-sm hover:underline">
                <span>Browse Products</span>
                <ArrowRight className="h-4 w-4 ml-1 transition group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Feature 2: Crop Guidance */}
            <div className="bg-stone-50/50 p-8 rounded-3xl border border-stone-100 hover:border-primary/25 hover:shadow-xl transition-all duration-355 group">
              <div className="bg-primary-light/60 p-4 rounded-2xl w-14 h-14 flex items-center justify-center text-primary mb-6 transition group-hover:scale-110">
                <Sprout className="h-7 w-7" />
              </div>
              <h4 className="text-xl font-bold text-earth-dark mb-3">Crop Advisor</h4>
              <p className="text-earth text-sm leading-relaxed mb-6 font-medium">
                Not sure what to plant next? Tell us your soil type, current season, and region, and our rule-based algorithm recommends the most profitable options.
              </p>
              <Link href="/crop-advisor" className="inline-flex items-center text-primary font-bold text-sm hover:underline">
                <span>Get Recommendations</span>
                <ArrowRight className="h-4 w-4 ml-1 transition group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Feature 3: Weather Station */}
            <div className="bg-stone-50/50 p-8 rounded-3xl border border-stone-100 hover:border-primary/25 hover:shadow-xl transition-all duration-355 group">
              <div className="bg-primary-light/60 p-4 rounded-2xl w-14 h-14 flex items-center justify-center text-primary mb-6 transition group-hover:scale-110">
                <CloudSun className="h-7 w-7" />
              </div>
              <h4 className="text-xl font-bold text-earth-dark mb-3">Live Weather Suggestions</h4>
              <p className="text-earth text-sm leading-relaxed mb-6 font-medium">
                Sync with professional weather forecasts based on your local area. Receive real-time soil and farming suggestions to shield crops.
              </p>
              <Link href="/weather" className="inline-flex items-center text-primary font-bold text-sm hover:underline">
                <span>View Weather Station</span>
                <ArrowRight className="h-4 w-4 ml-1 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-16 bg-primary text-white text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-extrabold">2,00,000+</div>
            <div className="text-xs uppercase tracking-widest font-bold text-primary-light/80">Active Farmers</div>
          </div>
          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-extrabold">1,200+</div>
            <div className="text-xs uppercase tracking-widest font-bold text-primary-light/80">Trusted Buyers</div>
          </div>
          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-extrabold">15,000+</div>
            <div className="text-xs uppercase tracking-widest font-bold text-primary-light/80">Tons Traded</div>
          </div>
          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-extrabold">₹12 Cr+</div>
            <div className="text-xs uppercase tracking-widest font-bold text-primary-light/80">Farmer Earnings</div>
          </div>
        </div>
        <div className="absolute inset-0 bg-primary-dark/30 opacity-60 pointer-events-none" />
      </section>

      {/* Trust & Verification Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-xs uppercase font-extrabold text-primary tracking-widest">Safe & Secured</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-earth-dark">Restoring Fairness to Agricultural Commerce</h3>
            <p className="text-earth font-medium leading-relaxed">
              We leverage clean technology and direct Supabase database integrations to protect farmers and buyers from hidden commission pricing, fraudulent agents, and unpredictable supply shortages.
            </p>
            <div className="space-y-3.5">
              <div className="flex items-center space-x-3 text-earth-dark font-semibold">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>100% Identity verification upon onboarding</span>
              </div>
              <div className="flex items-center space-x-3 text-earth-dark font-semibold">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Real-time SMS & Dashboard order status updates</span>
              </div>
              <div className="flex items-center space-x-3 text-earth-dark font-semibold">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Ecosystem data-backed by Supabase Postgres security</span>
              </div>
            </div>
            <div className="pt-4">
              <Link
                href="/signup"
                className="inline-flex bg-primary hover:bg-primary-dark text-white px-7 py-3 rounded-full font-bold shadow-md hover:-translate-y-0.5 transition duration-200 text-sm"
              >
                Register Now
              </Link>
            </div>
          </div>

          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm flex flex-col items-center justify-center text-center space-y-2">
              <ShieldCheck className="h-10 w-10 text-primary" />
              <h4 className="font-bold text-earth-dark text-base">Secure Trade</h4>
              <p className="text-xs text-earth font-semibold">Robust RLS security policy safeguarding sales</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm flex flex-col items-center justify-center text-center space-y-2 mt-6">
              <Users className="h-10 w-10 text-primary" />
              <h4 className="font-bold text-earth-dark text-base">Direct Contact</h4>
              <p className="text-xs text-earth font-semibold">Eliminate middle agent fees instantly</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm flex flex-col items-center justify-center text-center space-y-2">
              <CloudSun className="h-10 w-10 text-primary" />
              <h4 className="font-bold text-earth-dark text-base">Soil Mapping</h4>
              <p className="text-xs text-earth font-semibold">Precision crop suggestions matching soils</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm flex flex-col items-center justify-center text-center space-y-2 mt-6">
              <TrendingUp className="h-10 w-10 text-primary" />
              <h4 className="font-bold text-earth-dark text-base">High Profits</h4>
              <p className="text-xs text-earth font-semibold">Maximize yields via data-driven selection</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
