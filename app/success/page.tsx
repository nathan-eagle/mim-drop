import React from 'react'
import Link from 'next/link'

interface Props {
  searchParams: {
    order_id?: string
  }
}

export default function SuccessPage({ searchParams }: Props) {
  const orderId = searchParams.order_id

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl text-green-600">✓</span>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Order Confirmed! 🏆
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Your custom team merchandise is on its way to production!
        </p>

        {orderId && (
          <div className="bg-white rounded-lg p-6 mb-8 border-l-4 border-green-500">
            <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
            <p className="text-sm text-gray-600">
              Order ID: <span className="font-mono font-medium">{orderId}</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              You'll receive an email confirmation with tracking information once your order ships.
            </p>
          </div>
        )}

        {/* What Happens Next */}
        <div className="bg-white rounded-lg p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            What Happens Next?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-sm font-bold text-primary-600">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Production Starts</h4>
                <p className="text-sm text-gray-600">
                  Your custom design goes into production within 24 hours.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-sm font-bold text-primary-600">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Quality Check</h4>
                <p className="text-sm text-gray-600">
                  Each item is carefully inspected before shipping.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-sm font-bold text-primary-600">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Fast Shipping</h4>
                <p className="text-sm text-gray-600">
                  Your order ships within 7-10 business days.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">Expected Timeline</h3>
          <div className="text-sm text-blue-800">
            <div className="flex justify-between items-center mb-2">
              <span>Production:</span>
              <span className="font-medium">1-3 business days</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Shipping:</span>
              <span className="font-medium">5-7 business days</span>
            </div>
            <div className="flex justify-between items-center border-t border-blue-200 pt-2">
              <span className="font-medium">Total:</span>
              <span className="font-bold">7-10 business days</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-100 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Questions about your order? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@mimyouthsports.com"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              📧 support@mimyouthsports.com
            </a>
            <a 
              href="slack://app"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              💬 Chat with us on Slack
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="btn-secondary"
          >
            Back to Homepage
          </Link>
          <a 
            href="slack://app"
            className="btn-primary"
          >
            Create Another Design
          </a>
        </div>

        {/* Social Sharing */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Share Your Team Spirit!
          </h3>
          <p className="text-gray-600 mb-4">
            Tag us when your gear arrives: <span className="font-medium">@MiMYouthSports</span>
          </p>
          <div className="flex justify-center space-x-4">
            <span className="text-2xl">📸</span>
            <span className="text-2xl">🏆</span>
            <span className="text-2xl">⚽</span>
            <span className="text-2xl">🏀</span>
            <span className="text-2xl">⚾</span>
          </div>
        </div>
      </div>
    </div>
  )
} 