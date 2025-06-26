import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase connection...')
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
    console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')

    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('customer_orders')
      .select('id, created_at')
      .limit(1)

    if (testError) {
      console.error('Supabase connection test failed:', testError)
      return NextResponse.json({
        success: false,
        error: 'Supabase connection failed',
        details: testError.message,
        env_check: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
          key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
        }
      }, { status: 500 })
    }

    // Test specific order
    const { data: orderData, error: orderError } = await supabase
      .from('customer_orders')
      .select('*')
      .eq('id', 'c184bceb-859c-42a4-9818-d29eb85f3807')
      .single()

    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      test_query_result: testData,
      your_order: {
        found: !orderError,
        data: orderData,
        error: orderError?.message
      },
      env_check: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      }
    })

  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, order_id } = body

    console.log('Test POST endpoint called with:', { action, order_id })

    if (action === 'reset_order' && order_id) {
      // Reset order for retesting
      const { data, error } = await supabase
        .from('customer_orders')
        .update({
          printify_order_id: null,
          fulfillment_status: 'pending'
        })
        .eq('id', order_id)
        .select()

      if (error) {
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to reset order',
          details: error.message 
        })
      }

      return NextResponse.json({ 
        success: true, 
        message: '🔄 Order reset for retesting',
        data: data
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action',
      available_actions: ['reset_order']
    })

  } catch (error) {
    console.error('Test POST API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test POST failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}