'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import HeroParticles from '@/components/HeroParticles';
import { Leaf, User, Mail, Lock, MapPin, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const { user, signUp, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('buyer'); // default role is buyer
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

    if (!name || !email || !password || !location) {
      setError('Please fill in all fields.');
      setAuthLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setAuthLoading(false);
      return;
    }

    try {
      const res = await signUp({ email, password, name, role, location });
      if (!res.success) {
        setError(res.error || 'Failed to register account.');
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
    <div className="relative min-h-screen flex items-center justify-center bg-bg px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background leaves particle system */}
      <HeroParticles />

      <div className="relative z-10 max-w-lg w-full space-y-6 glass p-6 sm:p-10 rounded-3xl shadow-2xl border border-white/40 my-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Leaf className="h-10 w-10 text-primary animate-bounce-slow" />
            <span className="font-extrabold text-2xl text-earth-dark">
              Krushi<span className="text-primary">Connect</span>
            </span>
          </Link>
          <h2 className="mt-4 text-3xl font-extrabold text-earth-dark tracking-tight">
            Create an account
          </h2>
          <p className="mt-1 text-sm text-earth">
            Join the Smart Agriculture Network
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start space-x-2 animate-fade-in-up">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Role selector */}
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-earth mb-2">
              Select Your Role
            </span>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`py-3 px-4 rounded-xl border text-sm font-bold flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                  role === 'buyer'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-stone-200 bg-white/70 text-earth hover:bg-stone-50'
                }`}
              >
                <span className="text-xl mb-1">🛒</span>
                <span>I want to buy crops</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`py-3 px-4 rounded-xl border text-sm font-bold flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                  role === 'farmer'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-stone-200 bg-white/70 text-earth hover:bg-stone-50'
                }`}
              >
                <span className="text-xl mb-1">🌾</span>
                <span>I am a farmer / seller</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="full-name" className="block text-xs font-bold uppercase tracking-wider text-earth mb-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-earth">
                  <User className="h-5 w-5" />
                </span>
                <input
                  id="full-name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-2.5 border border-stone-200 placeholder-stone-400 text-earth-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white/70 backdrop-blur-sm transition duration-200"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-2.5 border border-stone-200 placeholder-stone-400 text-earth-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white/70 backdrop-blur-sm transition duration-200"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-earth mb-1">
                Location (City / Region)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-earth">
                  <MapPin className="h-5 w-5" />
                </span>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-2.5 border border-stone-200 placeholder-stone-400 text-earth-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white/70 backdrop-blur-sm transition duration-200"
                  placeholder="Maharashtra, India"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-earth mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-earth">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-2.5 border border-stone-200 placeholder-stone-400 text-earth-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white/70 backdrop-blur-sm transition duration-200"
                  placeholder="Min. 6 characters"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={authLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-dark hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg hover:shadow-xl transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <span className="flex items-center">
                  Register Account <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-earth">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-primary hover:text-primary-dark hover:underline transition">
              Sign In
            </Link>
          </p>
          <p className="text-xs text-stone-400 mt-3">
            <Link href="/" className="hover:underline">Back to homepage</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
