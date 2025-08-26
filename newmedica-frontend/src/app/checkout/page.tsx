'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shippingAddressSchema, ShippingAddressFormData } from '@/lib/validations/checkout';
import OrderSummary from './_components/OrderSummary';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { loadStripe } from '@stripe/stripe-js';

// Make sure to put your publishable key in .env.local
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
let stripePromise;
if (stripePublishableKey) {
  stripePromise = loadStripe(stripePublishableKey);
} else {
  console.error("Stripe publishable key is not set. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env.local file.");
}

const CheckoutPage = () => {
  const { user } = useAuthStore();
  const { items: cartItems } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddressFormData>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
        country: 'Malaysia',
        state: 'Kuala Lumpur',
    }
  });

  const onSubmit: SubmitHandler<ShippingAddressFormData> = async (data) => {
    if (!stripePromise) {
        alert('Stripe is not configured correctly. Please check the console for errors.');
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartItems, shippingInfo: data }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Stripe session');
      }

      const { sessionId } = await response.json();

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe.js has not loaded yet.');
      }

      await stripe.redirectToCheckout({ sessionId });

    } catch (error) {
      console.error(error);
      // Here you would show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = (hasError: boolean) => 
    `w-full p-3 h-12 border rounded-md ${hasError ? 'border-red-500' : 'border-gray-300'}`;

  return (
    <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Shipping Details */}
                <div className="font-sans">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Contact information</h2>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-700">{user?.email}</p>
                        <a href="/login" className="text-sm text-blue-600 hover:underline">Log out</a>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Add your phone number</label>
                        <input type="tel" placeholder="Phone" {...register('phone')} className={`${inputClasses(!!errors.phone)} mt-1`} />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>

                    <h2 className="text-xl font-semibold pt-4">Shipping address</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <input type="text" placeholder="First name" {...register('firstName')} className={inputClasses(!!errors.firstName)} />
                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                        </div>
                        <div>
                            <input type="text" placeholder="Last name" {...register('lastName')} className={inputClasses(!!errors.lastName)} />
                            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                        </div>
                    </div>
                    
                    <div>
                        <input type="text" placeholder="Address line 1" {...register('address1')} className={inputClasses(!!errors.address1)} />
                        {errors.address1 && <p className="text-red-500 text-xs mt-1">{errors.address1.message}</p>}
                    </div>
                    <div>
                        <input type="text" placeholder="Address line 2 (optional)" {...register('address2')} className={inputClasses(!!errors.address2)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <input type="text" placeholder="City" {...register('city')} className={inputClasses(!!errors.city)} />
                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                        </div>
                        <div>
                            <select {...register('state')} className={inputClasses(!!errors.state)}>
                                <option>Kuala Lumpur</option>
                                <option>Selangor</option>
                                <option>Johor</option>
                                {/* Add other states */}
                            </select>
                            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                        </div>
                        <div>
                            <input type="text" placeholder="Postcode" {...register('postcode')} className={inputClasses(!!errors.postcode)} />
                            {errors.postcode && <p className="text-red-500 text-xs mt-1">{errors.postcode.message}</p>}
                        </div>
                    </div>
                    <div>
                        <select {...register('country')} className={inputClasses(!!errors.country)}>
                            <option>Malaysia</option>
                        </select>
                        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                    </div>

                    <div className="pt-6">
                        <h3 className="text-lg font-semibold">Remark</h3>
                        <textarea placeholder="Add a remark..." {...register('remark')} className={`${inputClasses(!!errors.remark)} h-24 mt-1`}></textarea>
                    </div>

                    <div className="pt-6">
                        <h3 className="text-lg font-semibold">Billing address</h3>
                        <div className="mt-2 space-y-2 border rounded-md">
                            <div className="p-4 border-b">
                                <input type="radio" id="same_billing" name="billing_address" value="same" defaultChecked/>
                                <label htmlFor="same_billing" className="ml-2">Same with shipping address</label>
                            </div>
                            <div className="p-4">
                                <input type="radio" id="different_billing" name="billing_address" value="different" />
                                <label htmlFor="different_billing" className="ml-2">Use a different billing address</label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-md font-semibold hover:bg-green-700 disabled:opacity-50" disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Place Order Now'}
                        </button>
                    </div>
                </div>
                </div>

                {/* Right Column: Order Summary */}
                <div>
                <OrderSummary />
                </div>
            </div>
        </form>
    </div>
  );
};

export default CheckoutPage;
