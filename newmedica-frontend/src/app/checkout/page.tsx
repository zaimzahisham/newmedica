import React from 'react';
import OrderSummary from './_components/OrderSummary';

const CheckoutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
          {/* Shipping form will go here */}
        </div>
        <div>
          <OrderSummary />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
