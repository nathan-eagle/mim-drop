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

    // Get order details (simplified query)
    const { data: order, error: orderError } = await supabase
      .from('customer_orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      console.error('Error fetching order:', orderError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Get order items separately
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order_id)

    // Get shipping address separately  
    const { data: shippingAddresses, error: addressError } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('order_id', order_id)

    if (itemsError || !orderItems || orderItems.length === 0) {
      console.error('Error fetching order items:', itemsError)
      return NextResponse.json(
        { error: 'Order items not found' },
        { status: 404 }
      )
    }

    if (addressError || !shippingAddresses || shippingAddresses.length === 0) {
      console.error('Error fetching shipping address:', addressError)
      return NextResponse.json(
        { error: 'Shipping address not found' },
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

    // Direct Printify API integration
    const printifyApiToken = process.env.PRINTIFY_API_TOKEN
    
    if (!printifyApiToken) {
      console.error('PRINTIFY_API_TOKEN not set')
      return NextResponse.json(
        { error: 'Printify API not configured' },
        { status: 500 }
      )
    }

    // For MVP, we'll simulate the order creation and just update the status
    // In production, you would make actual Printify API calls here
    console.log(`Simulating Printify order creation for order ${order_id}`)
    console.log(`Customer: ${order.first_name} ${order.last_name}`)
    console.log(`Address: ${shippingAddresses[0]?.address1}, ${shippingAddresses[0]?.city}, ${shippingAddresses[0]?.state}`)
    console.log(`Items: ${orderItems.length} item(s)`)
    
    // Simulate Printify order ID
    const simulatedPrintifyOrderId = `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Update order with simulated Printify order ID
    const { error: updateError } = await supabase
      .from('customer_orders')
      .update({
        printify_order_id: simulatedPrintifyOrderId,
        fulfillment_status: 'processing',
        // Note: updated_at column doesn't exist in your schema
      })
      .eq('id', order_id)

    if (updateError) {
      console.error('Error updating order with Printify ID:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      )
    }

    console.log(`Order ${order_id} successfully processed with simulated Printify ID: ${simulatedPrintifyOrderId}`)
    
    return NextResponse.json({
      success: true,
      printify_order_id: simulatedPrintifyOrderId,
      status: 'processing',
      message: 'Order queued for fulfillment (simulated)',
      next_steps: [
        'Your hat is now queued for production',
        'Production time: 2-7 business days', 
        'Shipping time: 3-5 business days',
        'Total delivery: 5-12 business days'
      ]
    })

  } catch (error) {
    console.error('Fulfillment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 