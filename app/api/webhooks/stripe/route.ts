import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('Received Stripe webhook:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const orderId = session.metadata?.order_id
    const designId = session.metadata?.design_id

    if (!orderId) {
      console.error('No order_id found in session metadata')
      return
    }

    // Update order payment status
    const { error: updateError } = await supabase
      .from('customer_orders')
      .update({
        payment_status: 'paid',
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order payment status:', updateError)
      return
    }

    console.log(`Order ${orderId} marked as paid`)

    // Send to Printify for fulfillment
    await sendToPrintifyForFulfillment(orderId)

  } catch (error) {
    console.error('Error handling checkout completed:', error)
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update any orders with this payment intent
    const { error } = await supabase
      .from('customer_orders')
      .update({
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (error) {
      console.error('Error updating payment status:', error)
    } else {
      console.log(`Payment ${paymentIntent.id} marked as succeeded`)
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update any orders with this payment intent
    const { error } = await supabase
      .from('customer_orders')
      .update({
        payment_status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (error) {
      console.error('Error updating payment status:', error)
    } else {
      console.log(`Payment ${paymentIntent.id} marked as failed`)
    }
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function sendToPrintifyForFulfillment(orderId: string) {
  try {
    console.log(`Starting Printify fulfillment for order ${orderId}`)
    
    // Call our fulfillment API endpoint
    const fulfillmentResponse = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/fulfill-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order_id: orderId })
    })

    if (!fulfillmentResponse.ok) {
      const errorText = await fulfillmentResponse.text()
      console.error('Fulfillment API failed:', errorText)
      return
    }

    const result = await fulfillmentResponse.json()
    
    if (result.success) {
      console.log(`Order ${orderId} successfully sent to Printify with ID: ${result.printify_order_id}`)
    } else {
      console.error(`Fulfillment failed for order ${orderId}:`, result.error)
    }

  } catch (error) {
    console.error('Error sending to Printify:', error)
  }
} 