'use client';

import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    // Read the current language from the googtrans cookie
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    
    const googtrans = getCookie('googtrans');
    if (googtrans) {
      // googtrans format is typically "/en/hi"
      const langCode = googtrans.split('/').pop();
      if (langCode) {
        setCurrentLang(langCode);
      }
    }
  }, []);

  const switchLanguage = (langCode) => {
    // Set the cookie for google translate
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain};`;
    
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // Reload to apply the translation natively across all text immediately
    window.location.reload();
  };

  const languages = [
    { code: 'en', name: 'English', symbol: 'EN' },
    { code: 'hi', name: 'हिन्दी', symbol: 'HI' },
    { code: 'or', name: 'ଓଡ଼ିଆ', symbol: 'OD' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 bg-stone-100 hover:bg-stone-200 text-earth-dark px-3 py-2 rounded-full text-sm font-semibold transition duration-200 cursor-pointer focus:outline-none border border-stone-200"
      >
        <Globe className="h-4 w-4 text-primary" />
        <span className="font-bold">{languages.find(l => l.code === currentLang)?.symbol || 'EN'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white shadow-xl py-2 border border-stone-100 animate-fade-in-up z-[60]">
          <div className="px-4 py-2 border-b border-stone-100 mb-1">
            <p className="text-xs text-earth uppercase font-bold tracking-wider">Language</p>
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`w-full text-left px-4 py-2.5 text-sm transition cursor-pointer font-bold ${
                currentLang === lang.code 
                  ? 'bg-primary/10 text-primary-dark' 
                  : 'text-earth hover:bg-stone-50 hover:text-primary'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
