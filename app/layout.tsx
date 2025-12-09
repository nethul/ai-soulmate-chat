import type { Metadata } from "next";
import { ClerkProvider, SignedIn, UserButton, SignedOut, SignInButton } from "@clerk/nextjs";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  metadataBase: new URL('https://aispicychat.online'),
  title: {
    default: "AI Spicy Chat | Experience the Heat with Your AI Companion",
    template: "%s | AI Spicy Chat"
  },
  description: "Chat with realistic, spicy AI characters. Create your perfect partner, explore roleplay, and experience deep connections with AI Spicy Chat.",
  keywords: ["AI chat", "spicy ai", "virtual girlfriend", "virtual boyfriend", "roleplay ai", "chat bot", "soulmate ai"],
  authors: [{ name: "AI Spicy Chat Team" }],
  creator: "AI Spicy Chat Team",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aispicychat.online',
    title: "AI Spicy Chat | Your Perfect Virtual Partner",
    description: "Connect with spicy, realistic AI characters for immersive roleplay and companionship.",
    siteName: "AI Spicy Chat",
    images: [
      {
        url: '/opengraph-image.png', // We should ensure this image exists or use a default
        width: 1200,
        height: 630,
        alt: 'AI Spicy Chat Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "AI Spicy Chat | Interactive AI Companions",
    description: "Experience the next level of AI companionship. Chat, roleplay, and connect.",
    images: ['/opengraph-image.png'], // Fallback to OG image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased bg-stone-950 text-orange-50 min-h-screen">
          <header className="p-4 flex justify-between items-center absolute top-0 left-0 right-0 z-50 w-full pointer-events-none px-6">
            <div className="pointer-events-auto">
              <a href="/blog" className="text-orange-200 hover:text-white font-medium transition-colors bg-stone-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-orange-900/30 hover:bg-orange-900/50">Blog</a>
            </div>
            <div className="pointer-events-auto shadow-lg bg-stone-900/50 backdrop-blur-md rounded-full p-1.5 border border-orange-900/30">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-rose-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-rose-500 transition-colors">Sign In</button>
                </SignInButton>
              </SignedOut>
            </div>
          </header>
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
