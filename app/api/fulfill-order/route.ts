import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { order_id } = await request.json()

    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get order details with all related data
    const { data: order, error: orderError } = await supabase
      .from('customer_orders')
      .select(`
        *,
        order_items(*),
        shipping_addresses(*),
        order_items(
          product_designs(*)
        )
      `)
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      console.error('Error fetching order:', orderError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if already fulfilled
    if (order.printify_order_id) {
      return NextResponse.json({
        success: true,
        message: 'Order already fulfilled',
        printify_order_id: order.printify_order_id
      })
    }

    // Call Python backend to fulfill with Printify
    const fulfillmentResponse = await fetch(`${process.env.PYTHON_BACKEND_URL || 'http://localhost:5000'}/api/fulfill-printify-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: order_id,
        customer_info: {
          first_name: order.first_name,
          last_name: order.last_name,
          email: order.email,
          phone: order.phone,
          address1: order.shipping_addresses[0]?.address1,
          address2: order.shipping_addresses[0]?.address2,
          city: order.shipping_addresses[0]?.city,
          state: order.shipping_addresses[0]?.state,
          zip: order.shipping_addresses[0]?.zip,
          country: order.shipping_addresses[0]?.country || 'US'
        },
        order_items: order.order_items.map((item: any) => ({
          design_id: item.product_design_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      })
    })

    if (!fulfillmentResponse.ok) {
      const errorText = await fulfillmentResponse.text()
      console.error('Printify fulfillment failed:', errorText)
      return NextResponse.json(
        { error: 'Fulfillment failed', details: errorText },
        { status: 500 }
      )
    }

    const fulfillmentResult = await fulfillmentResponse.json()

    if (fulfillmentResult.success) {
      // Update order with Printify order ID
      const { error: updateError } = await supabase
        .from('customer_orders')
        .update({
          printify_order_id: fulfillmentResult.printify_order_id,
          fulfillment_status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', order_id)

      if (updateError) {
        console.error('Error updating order with Printify ID:', updateError)
      }

      console.log(`Order ${order_id} successfully sent to Printify with ID: ${fulfillmentResult.printify_order_id}`)
      
      return NextResponse.json({
        success: true,
        printify_order_id: fulfillmentResult.printify_order_id,
        status: fulfillmentResult.status
      })
    } else {
      return NextResponse.json(
        { error: 'Printify order creation failed', details: fulfillmentResult.error },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Fulfillment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 