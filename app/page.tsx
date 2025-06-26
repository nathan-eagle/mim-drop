import React from 'react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="sports-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Custom Team Drops
            <span className="block text-team-gold">Made Simple</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Upload your team logo, choose your products, and get professional-quality 
            drops delivered to your door. Perfect for youth sports teams!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/gallery" className="btn-secondary bg-white text-primary-700 hover:bg-gray-100">
              View Sample Designs
            </Link>
            <a href="#how-it-works" className="btn-primary bg-team-gold hover:bg-yellow-500 text-gray-900">
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Three Simple Steps to Team Gear
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've made custom team merchandise as easy as 1-2-3
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Chat with Our Bot</h3>
              <p className="text-gray-600">
                Send us a message on Slack with your team logo. Our bot will guide you through 
                selecting the perfect products for your team.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-sports-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-sports-green">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Review & Customize</h3>
              <p className="text-gray-600">
                See your design come to life with high-quality mockups. Choose sizes, 
                colors, and quantities that work for your team.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-team-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-team-gold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Order & Enjoy</h3>
              <p className="text-gray-600">
                Complete your secure checkout and we'll handle the rest. Your custom 
                merchandise will be produced and shipped directly to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Teams Choose MiM
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card p-6 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold mb-2">Championship Quality</h3>
              <p className="text-gray-600 text-sm">
                Professional-grade materials and printing that lasts season after season.
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">
                From design to delivery in just days, not weeks. Perfect for urgent orders.
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-semibold mb-2">Team Discounts</h3>
              <p className="text-gray-600 text-sm">
                Better pricing for bulk orders. The more you order, the more you save.
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Perfect Fit</h3>
              <p className="text-gray-600 text-sm">
                Youth-focused sizing and styles designed specifically for young athletes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Create Your Team's Gear?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of teams who trust MiM for their custom drop needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="slack://app" 
              className="btn-primary bg-team-gold hover:bg-yellow-500 text-gray-900"
            >
              Start in Slack
            </a>
            <Link href="/gallery" className="btn-secondary text-white border-white hover:bg-white hover:text-primary-700">
              Browse Examples
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 