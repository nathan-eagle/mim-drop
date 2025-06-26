# MiM Youth Sports Drop

React/Next.js drop page for custom youth sports team merchandise. Integrates with Slack bot for design creation and Supabase + Stripe for orders.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- Stripe account
- Vercel account (for deployment)

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema in `supabase-setup.sql`
3. Get your project URL and API keys from Settings > API

### 2. Stripe Setup

1. Create Stripe account at [stripe.com](https://stripe.com)
2. Get your publishable and secret keys from Dashboard > Developers > API keys
3. Set up webhooks pointing to `https://your-domain.com/api/webhooks/stripe`

### 3. Environment Setup

1. Copy `env.example` to `.env.local`
2. Fill in your Supabase and Stripe credentials:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_DOMAIN=https://your-storefront.vercel.app
```

### 4. Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the drop page.

## 📁 Project Structure

```
drop/
├── app/                    # Next.js 13+ app directory
│   ├── design/[id]/       # Product design pages (/design/123)
│   ├── api/               # API routes (checkout, webhooks)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   └── ProductOrderForm.tsx
├── lib/                   # Utilities
│   ├── supabase.ts       # Database client & types
│   └── stripe.ts         # Payment client
└── public/               # Static assets
```

## 🔗 Integration with Slack Bot

The Slack bot creates product designs in Supabase which this drop page displays:

1. **Bot creates design** → Saves to `product_designs` table
2. **Bot shares link** → `https://store.com/design/{id}`  
3. **Customer orders** → Creates record in `customer_orders` table
4. **Payment success** → Triggers Printify fulfillment

## 🛒 User Flow

1. Parent receives drop link from Slack bot
2. Views custom product with team logo mockup
3. Selects sizes and quantities (bulk discounts apply)
4. Fills shipping and customer info
5. Pays with Stripe checkout
6. Order automatically sent to Printify for fulfillment

## 🚢 Deployment

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Connect to your project: `vercel link`
3. Add environment variables: `vercel env add`
4. Deploy: `vercel --prod`

### Environment Variables on Vercel

Add these in your Vercel dashboard under Settings > Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_DOMAIN`

### Database Migration

When updating the database schema:

1. Make changes to `supabase-setup.sql`
2. Run in Supabase SQL Editor
3. Update TypeScript types in `lib/supabase.ts`

## 🔧 API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/checkout` | Create Stripe checkout session |
| `POST /api/webhooks/stripe` | Handle payment confirmations |
| `GET /api/designs/[id]` | Get product design data |

## 💳 Payment Flow

1. Customer completes order form
2. `POST /api/checkout` creates Stripe session
3. Customer redirected to Stripe checkout
4. On success, webhook confirms payment
5. Order marked as paid in database
6. Printify fulfillment triggered

## 🏆 Youth Sports Features

- **Team Discounts**: 10% off 10+ items, 15% off 20+ items
- **Youth Sizing**: Age-appropriate size ranges
- **Sports Context**: Team names, coach info, sport types
- **Bulk Ordering**: Multiple sizes in single order
- **Parent-Friendly**: Simple 3-step checkout process

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Stripe webhooks verify payment integrity
- Environment variables for sensitive data
- HTTPS enforced via Vercel

## 📊 Analytics

Connect Google Analytics or similar to track:
- Design view rates
- Conversion rates by sport/team size
- Average order values
- Popular product types

## 🛠 Development

### Adding New Product Types

1. Update `product_type` enum in database
2. Add sizing logic in `ProductOrderForm.tsx`
3. Update mockup handling in Slack bot

### Testing Payments

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## 📞 Support

For issues with:
- **Orders**: Check Supabase `customer_orders` table
- **Payments**: Check Stripe dashboard
- **Fulfillment**: Check Printify orders
- **Bot Integration**: Check Flask API logs

## 🚀 Next Features

- Order tracking page
- Customer account system  
- Advanced team management
- Reorder functionality
- Mobile app version 