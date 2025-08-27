import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { CartItem } from '@/types';

export async function POST(request: Request) {
  try {
    const { items, orderId } = await request.json() as { items: CartItem[]; orderId?: string };

    if (!items || items.length === 0) {
      return new NextResponse('No items in cart', { status: 400 });
    }

    const origin = request.headers.get('origin') || '';
    const line_items = items.map(item => {
      const rawImages = item.product.media?.map(m => m.url) || [];
      const validImages = rawImages.filter((u) => /^https?:\/\//i.test(u));
      const product_data: any = { name: item.product.name };
      if (validImages.length > 0) {
        product_data.images = validImages.slice(0, 8);
      }
      return {
        price_data: {
          currency: 'myr',
          product_data,
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'fpx'],
      line_items,
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/orders/success?session_id={CHECKOUT_SESSION_ID}${orderId ? `&order_id=${orderId}` : ''}`,
      cancel_url: `${request.headers.get('origin')}/orders/cancel`,
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (error) {
    console.error('[STRIPE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
