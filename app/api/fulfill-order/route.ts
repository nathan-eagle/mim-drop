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

    // Real Printify API integration (custom storefront - no shop ID needed)
    const printifyApiToken = process.env.PRINTIFY_API_TOKEN
    
    if (!printifyApiToken) {
      console.error('PRINTIFY_API_TOKEN not set')
      return NextResponse.json(
        { error: 'Printify API not configured - missing token' },
        { status: 500 }
      )
    }

    console.log(`Creating real Printify order for ${order_id}`)
    console.log(`Customer: ${order.first_name} ${order.last_name}`)
    console.log(`Address: ${shippingAddresses[0]?.address1}, ${shippingAddresses[0]?.city}, ${shippingAddresses[0]?.state}`)

    // Get product design details from your database first
    const { data: productDesign, error: designError } = await supabase
      .from('product_designs')
      .select('*')
      .eq('id', orderItems[0].product_design_id)
      .single()

    if (designError || !productDesign) {
      console.error('Product design not found:', designError)
      return NextResponse.json(
        { error: 'Product design not found in database' },
        { status: 404 }
      )
    }

    console.log(`Found product design: ${productDesign.name}`)
    console.log(`Blueprint ID: ${productDesign.blueprint_id}, Provider: ${productDesign.print_provider_id}`)

    // Get valid variants for this blueprint/provider combination FIRST
    console.log('🔍 Getting valid variants for blueprint/provider...')
    const variantsResponse = await fetch(`https://api.printify.com/v1/catalog/blueprints/${productDesign.blueprint_id}/print_providers/${productDesign.print_provider_id}/variants.json`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${printifyApiToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!variantsResponse.ok) {
      console.error('Failed to get variants:', await variantsResponse.text())
      const variantErrorId = `variant_error_${Date.now()}_${productDesign.blueprint_id}`
      await supabase
        .from('customer_orders')
        .update({
          printify_order_id: variantErrorId,
          fulfillment_status: 'error'
        })
        .eq('id', order_id)

      return NextResponse.json({
        success: false,
        printify_order_id: variantErrorId,
        status: 'error',
        message: '❌ Could not get valid variants',
        error: 'Variant lookup failed'
      })
    }

    const variantsData = await variantsResponse.json()
    const validVariants = variantsData.variants || []
    
    if (validVariants.length === 0) {
      console.error('No valid variants found')
      const noVariantsId = `no_variants_${Date.now()}_${productDesign.blueprint_id}`
      await supabase
        .from('customer_orders')
        .update({
          printify_order_id: noVariantsId,
          fulfillment_status: 'error'
        })
        .eq('id', order_id)

      return NextResponse.json({
        success: false,
        printify_order_id: noVariantsId,
        status: 'error',
        message: '❌ No variants available',
        error: 'Blueprint/provider has no variants'
      })
    }

    // Use all valid variants (Printify often requires ALL variants in print_areas)
    const allVariantIds = validVariants.map((v: any) => v.id)
    const firstVariant = validVariants[0]
    console.log(`✅ Found variants: ${allVariantIds.join(', ')}`)
    console.log(`✅ Using first variant: ${firstVariant.id} (${firstVariant.title})`)

    // Build Printify order payload using blueprint data with CORRECT variant
    const printifyOrderData = {
      external_id: order_id,
      label: `MiM Order ${order_id}`,
      line_items: orderItems.map((item: any) => ({
        blueprint_id: productDesign.blueprint_id, // 1446 for Snapback Trucker Cap
        print_provider_id: productDesign.print_provider_id, // 217
        variant_id: firstVariant.id, // First variant from API
        quantity: item.quantity,
        print_areas: {
          front: productDesign.team_logo_image_id // Your team logo
        }
      })),
      shipping_method: 1, // Standard shipping
      send_shipping_notification: false,
      address_to: {
        first_name: shippingAddresses[0].first_name,
        last_name: shippingAddresses[0].last_name,
        email: order.email,
        phone: order.phone || '',
        country: shippingAddresses[0].country,
        region: shippingAddresses[0].state,
        address1: shippingAddresses[0].address1,
        address2: shippingAddresses[0].address2 || '',
        city: shippingAddresses[0].city,
        zip: shippingAddresses[0].zip
      }
    }

    // 🚀 REAL PRINTIFY PRODUCTION - Creating actual hat order!
    console.log('🎩 Creating REAL Printify order for production:')
    console.log(`   Product: ${productDesign.name}`)
    console.log(`   Blueprint: ${productDesign.blueprint_id}`)
    console.log(`   Provider: ${productDesign.print_provider_id}`)
    console.log(`   Logo: ${productDesign.team_logo_image_id}`)
    console.log(`   Customer: ${order.first_name} ${order.last_name}`)
    console.log(`   Shipping: ${shippingAddresses[0]?.city}, ${shippingAddresses[0]?.state}`)

    // Create product payload with valid variant
    const createProductPayload = {
      title: `${productDesign.name} - Order ${order_id}`,
      description: `Custom ${productDesign.name} for ${order.first_name} ${order.last_name}`,
      blueprint_id: productDesign.blueprint_id,
      print_provider_id: productDesign.print_provider_id,
      variants: [
        {
          id: firstVariant.id,
          price: Math.round(productDesign.base_price * 100), // Price in cents
          is_enabled: true
        }
      ],
      print_areas: [
        {
          variant_ids: allVariantIds, // ALL variants, not just one
          placeholders: [
            {
              position: "front",
              images: [
                {
                  id: productDesign.team_logo_image_id,
                  x: 0.5,
                  y: 0.5,
                  scale: 0.6, // Use 60% scale like working Slack app
                  angle: 0
                }
              ]
            }
          ]
        }
      ]
    }

    // Use your known shop ID from our earlier check
    const shopId = '9564969'
    console.log(`✅ Using Printify shop: ${shopId}`)

    console.log('📦 Step 1: Creating product in Printify...')
    const createProductResponse = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printifyApiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createProductPayload)
    })

    if (!createProductResponse.ok) {
      const errorText = await createProductResponse.text()
      console.error('Failed to create product:', errorText)
      
      const productErrorId = `product_error_${Date.now()}_${shopId}`
      await supabase
        .from('customer_orders')
        .update({
          printify_order_id: productErrorId,
          fulfillment_status: 'error'
        })
        .eq('id', order_id)

      return NextResponse.json({
        success: false,
        printify_order_id: productErrorId,
        status: 'error',
        message: '❌ Product creation failed',
        error: errorText
      })
    }

    const createdProduct = await createProductResponse.json()
    const printifyProductId = createdProduct.id
    console.log(`✅ Product created: ${printifyProductId}`)

    // Step 2: Create the actual order in Printify
    console.log('🚀 Step 2: Creating order in Printify...')
    const orderPayload = {
      external_id: order_id,
      label: `MiM Order ${order_id} - ${order.first_name} ${order.last_name}`,
      line_items: [
        {
          product_id: printifyProductId,
          variant_id: firstVariant.id,
          quantity: orderItems[0].quantity
        }
      ],
      shipping_method: 1,
      send_shipping_notification: false,
      address_to: {
        first_name: shippingAddresses[0].first_name,
        last_name: shippingAddresses[0].last_name,
        email: order.email,
        phone: order.phone || '',
        country: shippingAddresses[0].country,
        region: shippingAddresses[0].state,
        address1: shippingAddresses[0].address1,
        address2: shippingAddresses[0].address2 || '',
        city: shippingAddresses[0].city,
        zip: shippingAddresses[0].zip
      }
    }

    const orderResponse = await fetch(`https://api.printify.com/v1/shops/${shopId}/orders.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printifyApiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    })

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text()
      console.error('Order creation failed:', errorText)
      
      const orderErrorId = `order_error_${Date.now()}_${printifyProductId}`
      await supabase
        .from('customer_orders')
        .update({
          printify_order_id: orderErrorId,
          fulfillment_status: 'processing'
        })
        .eq('id', order_id)

      return NextResponse.json({
        success: true,
        printify_order_id: orderErrorId,
        status: 'processing',
        message: '🎩 Order creation attempted',
        product_id: printifyProductId,
        error: errorText
      })
    }

    const orderData = await orderResponse.json()
    const realPrintifyOrderId = orderData.id
    console.log(`🎉 REAL PRINTIFY ORDER CREATED: ${realPrintifyOrderId}`)

    // Update with real Printify order ID
    await supabase
      .from('customer_orders')
      .update({
        printify_order_id: realPrintifyOrderId,
        fulfillment_status: 'processing'
      })
      .eq('id', order_id)

    console.log(`🎯 SUCCESS! Hat order ${order_id} sent to Printify production!`)
    
    return NextResponse.json({
      success: true,
      printify_order_id: realPrintifyOrderId,
      printify_product_id: printifyProductId,
      status: 'processing',
      message: '🎉 HAT SENT TO REAL PRODUCTION!',
      shop_id: shopId,
      production_details: {
        printify_order: realPrintifyOrderId,
        printify_product: printifyProductId,
        customer: `${order.first_name} ${order.last_name}`,
        address: `${shippingAddresses[0].city}, ${shippingAddresses[0].state}`,
        cost_charged: 'From your $50 Printify balance'
      },
      next_steps: [
        '🎉 YOUR HAT IS IN REAL PRODUCTION!',
        '💳 Production cost charged to your $50 balance',
        '⏱️ Production time: 2-7 business days', 
        '📦 Shipping time: 3-5 business days to Boston',
        '📋 Check Printify dashboard for tracking updates'
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