'use client';

import { formatVoucherCode } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

interface OrderSummaryProps {
  orderSummaryData: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    applied_voucher_code: string | null;
  } | null;
}

const OrderSummary = ({ orderSummaryData }: OrderSummaryProps) => {
  const { items, isLoading } = useCartStore();

  const subtotal = orderSummaryData?.subtotal ?? 0;
  const discount = orderSummaryData?.discount ?? 0;
  const shipping = orderSummaryData?.shipping ?? 0;
  const total = orderSummaryData?.total ?? 0;
  const appliedVoucherCode = orderSummaryData?.applied_voucher_code ?? null;

  if (!orderSummaryData) {
    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <p>Loading order summary...</p>
        </div>
    );
  }

  if (items.length === 0) {
    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <p>Your cart is empty.</p>
        </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={item.product.media?.[0]?.url || `https://picsum.photos/seed/${item.product.id}/100`}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded-md mr-4"
              />
              <div>
                <p className="font-semibold">{item.product.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
            <p className="font-semibold">RM{(item.product.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="border-t my-4"></div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>RM{subtotal.toFixed(2)}</p>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-red-600">
            <p>Discount {appliedVoucherCode && `(${formatVoucherCode(appliedVoucherCode)})`}</p>
            <p>-RM{discount.toFixed(2)}</p>
          </div>
        )}
        <div className="flex justify-between">
          <p>Shipping</p>
          <p>RM{shipping.toFixed(2)}</p>
        </div>
      </div>
      <div className="border-t my-4"></div>
      <div className="flex justify-between font-bold text-xl">
        <p>Total</p>
        <p>RM{total.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default OrderSummary;
