import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const {
      design_id,
      order_items,
      customer_info,
      shipping_info,
      total_amount
    } = await request.json()

    // Validate required data
    if (!design_id || !order_items || !customer_info || !shipping_info) {
      return NextResponse.json(
        { error: 'Missing required order data' },
        { status: 400 }
      )
    }

    // Get product design from database
    const { data: design, error: designError } = await supabase
      .from('product_designs')
      .select('*')
      .eq('id', design_id)
      .single()

    if (designError || !design) {
      return NextResponse.json(
        { error: 'Product design not found' },
        { status: 404 }
      )
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('customer_orders')
      .insert({
        email: customer_info.email,
        first_name: customer_info.firstName,
        last_name: customer_info.lastName,
        phone: customer_info.phone || null,
        total_amount: total_amount,
        payment_status: 'pending'
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Add order items
    const orderItemPromises = order_items.map((item: any) => 
      supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_design_id: design_id,
          variant_id: null, // Will implement variants later
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.quantity * item.unitPrice
        })
    )

    await Promise.all(orderItemPromises)

    // Add shipping address
    await supabase
      .from('shipping_addresses')
      .insert({
        order_id: order.id,
        first_name: shipping_info.address1 ? customer_info.firstName : '',
        last_name: shipping_info.address1 ? customer_info.lastName : '',
        address1: shipping_info.address1,
        address2: shipping_info.address2 || null,
        city: shipping_info.city,
        state: shipping_info.state,
        zip: shipping_info.zip,
        country: shipping_info.country || 'US'
      })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customer_info.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: design.name,
              description: `Custom ${design.product_type} for ${design.team_info?.name || 'your team'}`,
              images: design.mockup_image_url ? [design.mockup_image_url] : [],
            },
            unit_amount: Math.round(total_amount * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success?order_id=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/design/${design_id}`,
      metadata: {
        order_id: order.id,
        design_id: design_id,
      },
    })

    // Update order with Stripe session ID
    await supabase
      .from('customer_orders')
      .update({ stripe_payment_intent_id: session.id })
      .eq('id', order.id)

    return NextResponse.json({ checkout_url: session.url })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 