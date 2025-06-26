import React from 'react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ProductOrderForm from '@/components/ProductOrderForm'
import { supabase, ProductDesign } from '@/lib/supabase'

interface Props {
  params: {
    id: string
  }
}

async function getProductDesign(id: string): Promise<ProductDesign | null> {
  try {
    const { data, error } = await supabase
      .from('product_designs')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Error fetching product design:', error)
      return null
    }

    return data as ProductDesign
  } catch (error) {
    console.error('Exception fetching product design:', error)
    return null
  }
}

export default async function ProductDesignPage({ params }: Props) {
  const design = await getProductDesign(params.id)

  if (!design) {
    notFound()
  }

  // Calculate selling price with markup
  const sellingPrice = design.base_price * (1 + design.markup_percentage / 100)
  const teamName = design.team_info?.name || 'Your Team'
  const sport = design.team_info?.sport || ''

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {design.name}
          </h1>
          {sport && (
            <p className="text-lg text-gray-600">
              Custom {sport} team merchandise for {teamName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Product Preview */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Product Preview</h2>
              
              {design.mockup_image_url ? (
                <div className="relative aspect-square mb-6">
                  <Image
                    src={design.mockup_image_url}
                    alt={`${design.name} mockup`}
                    fill
                    className="object-contain rounded-lg"
                    priority
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-6">
                  <p className="text-gray-500">Preview coming soon...</p>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">{design.name}</h3>
                <p className="text-gray-600">{design.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-2xl font-bold text-primary-600">
                      ${sellingPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">per item</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Base Price: ${design.base_price.toFixed(2)}</div>
                    <div className="text-xs text-green-600">+{design.markup_percentage}% team value</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Info */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Team Information</h3>
              <div className="space-y-2 text-sm">
                {teamName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Team Name:</span>
                    <span className="font-medium">{teamName}</span>
                  </div>
                )}
                {sport && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sport:</span>
                    <span className="font-medium">{sport}</span>
                  </div>
                )}
                {design.team_info?.coach && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coach:</span>
                    <span className="font-medium">{design.team_info.coach}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Type:</span>
                  <span className="font-medium capitalize">{design.product_type}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4">What You Get</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  High-quality materials & professional printing
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Your custom logo applied perfectly
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Youth-focused sizing and fit
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Fast production and shipping
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Team bulk pricing available
                </li>
              </ul>
            </div>
          </div>

          {/* Order Form */}
          <div className="space-y-6">
            <ProductOrderForm 
              design={design}
              sellingPrice={sellingPrice}
            />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-green-600 text-xl">🔒</span>
            </div>
            <h4 className="font-semibold mb-1">Secure Payments</h4>
            <p className="text-sm text-gray-600">SSL encryption & Stripe security</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-blue-600 text-xl">⚡</span>
            </div>
            <h4 className="font-semibold mb-1">Fast Delivery</h4>
            <p className="text-sm text-gray-600">7-10 business days to your door</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-purple-600 text-xl">💯</span>
            </div>
            <h4 className="font-semibold mb-1">Quality Guarantee</h4>
            <p className="text-sm text-gray-600">Love it or we'll make it right</p>
          </div>
        </div>
      </div>
    </div>
  )
} 