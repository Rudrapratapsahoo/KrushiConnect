'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, Leaf, User, LogOut, ChevronDown, BarChart2 } from 'lucide-react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Leaf className="h-7 w-7 text-primary animate-bounce-slow" />
              <span className="font-extrabold text-xl tracking-tight text-earth-dark">
                Krushi<span className="text-primary">Connect</span>
              </span>
            </Link>
            <div className="hidden md:flex space-x-8 ml-10">
              <Link href="/marketplace" className="text-earth hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200">
                Marketplace
              </Link>
              <Link href="/crop-advisor" className="text-earth hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200">
                Crop Advisor
              </Link>
              <Link href="/weather" className="text-earth hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200">
                Weather Insights
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 bg-stone-100 hover:bg-stone-200 text-earth-dark px-3 py-2 rounded-full text-sm font-semibold transition duration-200 cursor-pointer focus:outline-none"
                >
                  <img
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`}
                    alt="avatar"
                    className="w-7 h-7 rounded-full object-cover border border-primary-light"
                  />
                  <span className="max-w-[120px] truncate">{profile?.name || user.email}</span>
                  <ChevronDown className="h-4 w-4 text-earth" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl py-2 border border-stone-100 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs text-earth uppercase font-bold tracking-wider">Signed in as</p>
                      <p className="text-sm font-semibold text-earth-dark truncate">{profile?.name || 'User'}</p>
                      <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-semibold bg-primary-light text-primary-dark">
                        {profile?.role === 'farmer' ? '🌾 Farmer' : '🛒 Buyer'}
                      </span>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-earth hover:bg-stone-50 hover:text-primary transition"
                    >
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer text-left"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-earth hover:text-primary px-4 py-2 text-sm font-bold transition duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="text-earth hover:text-primary focus:outline-none p-1 rounded-md"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 animate-fade-in-up">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/marketplace"
              onClick={toggleMenu}
              className="block px-3 py-2 rounded-md text-base font-semibold text-earth hover:text-primary hover:bg-stone-50"
            >
              Marketplace
            </Link>
            <Link
              href="/crop-advisor"
              onClick={toggleMenu}
              className="block px-3 py-2 rounded-md text-base font-semibold text-earth hover:text-primary hover:bg-stone-50"
            >
              Crop Advisor
            </Link>
            <Link
              href="/weather"
              onClick={toggleMenu}
              className="block px-3 py-2 rounded-md text-base font-semibold text-earth hover:text-primary hover:bg-stone-50"
            >
              Weather Insights
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-stone-150 px-4">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`}
                    alt="avatar"
                    className="w-10 h-10 rounded-full border border-primary-light"
                  />
                  <div>
                    <div className="text-base font-bold text-earth-dark">{profile?.name}</div>
                    <div className="text-sm font-medium text-earth">{user.email}</div>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={toggleMenu}
                  className="block w-full text-center bg-stone-100 hover:bg-stone-200 text-earth-dark py-2 rounded-md text-base font-bold transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    toggleMenu();
                    signOut();
                  }}
                  className="block w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-md text-base font-bold transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/login"
                  onClick={toggleMenu}
                  className="block w-full text-center bg-stone-100 hover:bg-stone-200 text-earth-dark py-2.5 rounded-md text-base font-bold transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={toggleMenu}
                  className="block w-full text-center bg-primary hover:bg-primary-dark text-white py-2.5 rounded-md text-base font-bold transition shadow"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
