'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import HeroParticles from '@/components/HeroParticles';
import { Leaf, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { user, signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setAuthLoading(false);
      return;
    }

    try {
      const res = await signIn({ email, password });
      if (!res.success) {
        setError(res.error || 'Failed to sign in. Please check your credentials.');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Leaves animation */}
      <HeroParticles />

      <div className="relative z-10 max-w-md w-full space-y-8 glass p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/40">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Leaf className="h-10 w-10 text-primary animate-bounce-slow" />
            <span className="font-extrabold text-2xl text-earth-dark">
              Krushi<span className="text-primary">Connect</span>
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-earth-dark tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-earth">
            Access your agricultural dashboard
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start space-x-2 animate-fade-in-up">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold uppercase tracking-wider text-earth mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-earth">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-3 border border-stone-200 placeholder-stone-400 text-earth-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white/70 backdrop-blur-sm transition duration-200"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-earth">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-earth">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-3 border border-stone-200 placeholder-stone-400 text-earth-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white/70 backdrop-blur-sm transition duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={authLoading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-dark hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg hover:shadow-xl transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <span className="flex items-center">
                  Sign In <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-earth">
            Don't have an account?{' '}
            <Link href="/signup" className="font-bold text-primary hover:text-primary-dark hover:underline transition">
              Create an account
            </Link>
          </p>
          <p className="text-xs text-stone-400 mt-4">
            <Link href="/" className="hover:underline">Back to homepage</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
