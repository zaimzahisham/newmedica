import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { CartItem } from '@/types';

export async function POST(request: Request) {
  try {
    const { items } = await request.json() as { items: CartItem[] };

    if (!items || items.length === 0) {
      return new NextResponse('No items in cart', { status: 400 });
    }

    const line_items = items.map(item => ({
      price_data: {
        currency: 'myr', // Malaysian Ringgit
        product_data: {
          name: item.product.name,
          images: item.product.media?.map(m => m.url),
        },
        unit_amount: Math.round(item.product.price * 100), // Price in cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'fpx'],
      line_items,
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/cart`,
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (error) {
    console.error('[STRIPE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
