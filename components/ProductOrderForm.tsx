'use client'

import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { ProductDesign } from '@/lib/supabase'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Props {
  design: ProductDesign
  sellingPrice: number
}

interface OrderItem {
  size: string
  quantity: number
  unitPrice: number
}

interface CustomerInfo {
  email: string
  firstName: string
  lastName: string
  phone: string
}

interface ShippingInfo {
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
}

export default function ProductOrderForm({ design, sellingPrice }: Props) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { size: 'M', quantity: 1, unitPrice: sellingPrice }
  ])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  })
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'items' | 'customer' | 'shipping'>('items')

  // Available sizes based on product type
  const getSizes = () => {
    if (design.product_type === 'hat') {
      return ['One Size', 'Youth', 'Adult']
    }
    return ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  }

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0)
  
  // Apply bulk discounts
  const bulkDiscount = totalQuantity >= 20 ? 0.15 : totalQuantity >= 10 ? 0.10 : 0
  const discountAmount = subtotal * bulkDiscount
  const total = subtotal - discountAmount

  const addOrderItem = () => {
    setOrderItems([...orderItems, { size: 'M', quantity: 1, unitPrice: sellingPrice }])
  }

  const updateOrderItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updated = [...orderItems]
    updated[index] = { ...updated[index], [field]: value }
    setOrderItems(updated)
  }

  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index))
    }
  }

  const handleCheckout = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          design_id: design.id,
          order_items: orderItems,
          customer_info: customerInfo,
          shipping_info: shippingInfo,
          total_amount: total
        }),
      })

      const { checkout_url } = await response.json()
      
      if (checkout_url) {
        window.location.href = checkout_url
      } else {
        alert('Error creating checkout session. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Error processing order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isValidStep = () => {
    switch (currentStep) {
      case 'items':
        return orderItems.every(item => item.quantity > 0)
      case 'customer':
        return customerInfo.email && customerInfo.firstName && customerInfo.lastName
      case 'shipping':
        return shippingInfo.address1 && shippingInfo.city && shippingInfo.state && shippingInfo.zip
      default:
        return false
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold mb-6">Place Your Order</h2>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className={`flex items-center ${currentStep === 'items' ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'items' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'}`}>
            1
          </div>
          <span className="ml-2 font-medium">Items</span>
        </div>
        <div className={`flex items-center ${currentStep === 'customer' ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'customer' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'}`}>
            2
          </div>
          <span className="ml-2 font-medium">Customer</span>
        </div>
        <div className={`flex items-center ${currentStep === 'shipping' ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'shipping' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'}`}>
            3
          </div>
          <span className="ml-2 font-medium">Shipping</span>
        </div>
      </div>

      {/* Step 1: Items */}
      {currentStep === 'items' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-4">Select Sizes & Quantities</h3>
            
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4 mb-3 p-3 border rounded-lg">
                <select
                  value={item.size}
                  onChange={(e) => updateOrderItem(index, 'size', e.target.value)}
                  className="input-field flex-1"
                >
                  {getSizes().map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="input-field w-20"
                />
                
                <span className="font-medium text-gray-900 w-20">
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </span>
                
                {orderItems.length > 1 && (
                  <button
                    onClick={() => removeOrderItem(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            
            <button
              onClick={addOrderItem}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              + Add another size
            </button>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal ({totalQuantity} items):</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {bulkDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Bulk Discount ({(bulkDiscount * 100).toFixed(0)}%):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep('customer')}
            disabled={!isValidStep()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Customer Info
          </button>
        </div>
      )}

      {/* Step 2: Customer Info */}
      {currentStep === 'customer' && (
        <div className="space-y-4">
          <h3 className="font-medium mb-4">Customer Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={customerInfo.firstName}
              onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={customerInfo.lastName}
              onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
              className="input-field"
              required
            />
          </div>
          
          <input
            type="email"
            placeholder="Email Address"
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
            className="input-field"
            required
          />
          
          <input
            type="tel"
            placeholder="Phone Number (optional)"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
            className="input-field"
          />

          <div className="flex gap-4">
            <button
              onClick={() => setCurrentStep('items')}
              className="btn-secondary flex-1"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep('shipping')}
              disabled={!isValidStep()}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Shipping
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Shipping */}
      {currentStep === 'shipping' && (
        <div className="space-y-4">
          <h3 className="font-medium mb-4">Shipping Address</h3>
          
          <input
            type="text"
            placeholder="Street Address"
            value={shippingInfo.address1}
            onChange={(e) => setShippingInfo({...shippingInfo, address1: e.target.value})}
            className="input-field"
            required
          />
          
          <input
            type="text"
            placeholder="Apartment, suite, etc. (optional)"
            value={shippingInfo.address2}
            onChange={(e) => setShippingInfo({...shippingInfo, address2: e.target.value})}
            className="input-field"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="City"
              value={shippingInfo.city}
              onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="State"
              value={shippingInfo.state}
              onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="ZIP Code"
              value={shippingInfo.zip}
              onChange={(e) => setShippingInfo({...shippingInfo, zip: e.target.value})}
              className="input-field"
              required
            />
          </div>

          {/* Final Order Summary */}
          <div className="border-t pt-4 space-y-2 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium">Order Summary</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>{totalQuantity} items:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {bulkDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Team Discount:</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setCurrentStep('customer')}
              className="btn-secondary flex-1"
            >
              Back
            </button>
            <button
              onClick={handleCheckout}
              disabled={!isValidStep() || isLoading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 