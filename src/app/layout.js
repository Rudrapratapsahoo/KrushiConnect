import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "KrushiConnect - Smart Agriculture Platform",
  description: "Connecting farmers and buyers with smart crop guidance and weather analytics.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          .goog-te-banner-frame,
          iframe.goog-te-banner-frame,
          .skiptranslate > iframe { display: none !important; }
          body { top: 0px !important; }
          .goog-logo-link { display:none !important; } 
          .goog-te-gadget { color: transparent !important; font-size: 0px !important; }
        `}} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-foreground">
        <AuthProvider>
          {children}
        </AuthProvider>
        
        {/* Google Translate Integration */}
        <div id="google_translate_element" style={{ display: "none" }}></div>
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,hi,or',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            `,
          }}
        />
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
