'use client';

import React from 'react';
import { useCartStore } from '@/store/cartStore';

const OrderSummary = () => {
  const { items, getTotalPrice } = useCartStore();

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{item.product.name}</p>
              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
            </div>
            <p>RM{(item.product.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-300 mt-4 pt-4">
        <div className="flex justify-between font-semibold">
          <p>Total</p>
          <p>RM{getTotalPrice().toFixed(2)}</p>
        </div>
      </div>
      <button className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700 transition-colors">
        Proceed to Payment
      </button>
    </div>
  );
};

export default OrderSummary;
