import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MiM Youth Sports | Custom Team Drops',
  description: 'Create custom team drops for your youth sports team. Upload your logo and get high-quality apparel delivered to your door.',
  keywords: 'youth sports, team merchandise, custom apparel, team shirts, team hats, sports gear',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-primary-700">
                  🏆 MiM Youth Sports
                </h1>
                <span className="ml-3 text-sm text-gray-500">
                  Custom Team Drops
                </span>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="#how-it-works" className="text-gray-600 hover:text-primary-600">
                  How It Works
                </a>
                <a href="#gallery" className="text-gray-600 hover:text-primary-600">
                  Gallery
                </a>
                <a href="#contact" className="text-gray-600 hover:text-primary-600">
                  Contact
                </a>
              </nav>
            </div>
          </div>
        </header>
        
        <main className="min-h-screen">
          {children}
        </main>
        
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">MiM Youth Sports</h3>
                <p className="text-gray-400">
                  Creating custom team drops that builds team spirit and lasting memories.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/gallery" className="hover:text-white">Design Gallery</a></li>
                  <li><a href="/how-it-works" className="hover:text-white">How It Works</a></li>
                  <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/shipping" className="hover:text-white">Shipping Info</a></li>
                  <li><a href="/returns" className="hover:text-white">Returns</a></li>
                  <li><a href="/faq" className="hover:text-white">FAQ</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 MiM Youth Sports. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
} 