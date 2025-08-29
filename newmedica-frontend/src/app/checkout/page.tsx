'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shippingAddressSchema, ShippingAddressFormData } from '@/lib/validations/checkout';
import OrderSummary from './_components/OrderSummary';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { getAddresses, getPrimaryAddress, type AddressDto } from '@/lib/api/address';
import { getAuthToken } from '@/lib/utils';

import { ArrowLeft } from 'lucide-react'; // Import ArrowLeft

// Make sure to put your publishable key in .env.local
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
let stripePromise: Promise<Stripe | null> | undefined;
if (stripePublishableKey) {
  stripePromise = loadStripe(stripePublishableKey);
} else {
  console.error("Stripe publishable key is not set. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env.local file.");
}

const CheckoutPage = () => {
  const router = useRouter(); // Initialize useRouter
  const { user } = useAuthStore();
  const { items: cartItems, subtotal, discount, shipping, total, applied_voucher_code } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [useDifferentBilling, setUseDifferentBilling] = useState(false);
  const [addresses, setAddresses] = useState<AddressDto[] | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [orderSummaryData, setOrderSummaryData] = useState<{
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    applied_voucher_code: string | null;
  } | null>(null);

  useEffect(() => {
    setOrderSummaryData({
      subtotal: subtotal,
      discount: discount,
      shipping: shipping,
      total: total,
      applied_voucher_code: applied_voucher_code,
    });
  }, [subtotal, discount, shipping, total, applied_voucher_code]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ShippingAddressFormData>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
        country: 'Malaysia',
        state: 'Kuala Lumpur',
    }
  });

  const applyAddressToForm = useCallback((addr: AddressDto) => {
    reset({
      phone: addr.phone || '',
      firstName: addr.first_name || '',
      lastName: addr.last_name || '',
      address1: addr.address1 || '',
      address2: addr.address2 || '',
      city: addr.city || '',
      state: addr.state || 'Kuala Lumpur',
      postcode: addr.postcode || '',
      country: addr.country || 'Malaysia',
      remark: '',
    });
  }, [reset]);
  const clearAddressForm = () => {
    reset({
      phone: '',
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      state: 'Kuala Lumpur',
      postcode: '',
      country: 'Malaysia',
      remark: '',
    });
  };

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const list = await getAddresses();
        setAddresses(list);
        const primary = list.find(a => a.is_primary) || (await getPrimaryAddress());
        if (primary) {
          setSelectedAddressId(primary.id);
          applyAddressToForm(primary);
        }
      } catch {
        // ignore if unauthenticated or no addresses
      }
    };
    loadAddresses();
  }, [reset, applyAddressToForm]);

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'bank_transfer' | 'duitnow_qr' | 'fpx' | 'visa_master'>('stripe');

  const onSubmit: SubmitHandler<ShippingAddressFormData> = async (data) => {
    if (!stripePromise) {
        console.warn('Stripe publishable key not set. Non-Stripe methods can proceed as dummy.');
    }

    setIsLoading(true);
    try {
      if (paymentMethod === 'stripe') {
        // Create a pending order first with full payload
        const token = getAuthToken();
        const orderPayload = {
          contact_email: user?.email ?? undefined,
          payment_method: 'stripe',
          remark: data.remark || undefined,
          shipping_address: {
            first_name: data.firstName,
            last_name: data.lastName,
            address1: data.address1,
            address2: data.address2 || undefined,
            city: data.city,
            state: data.state,
            postcode: data.postcode,
            country: data.country,
            phone: data.phone,
          },
          billing_address: useDifferentBilling ? {
            first_name: data.billingFirstName,
            last_name: data.billingLastName,
            address1: data.billingAddress1,
            address2: data.billingAddress2 || undefined,
            city: data.billingCity,
            state: data.billingState,
            postcode: data.billingPostcode,
            country: data.billingCountry,
          } : {
            first_name: data.firstName,
            last_name: data.lastName,
            address1: data.address1,
            address2: data.address2 || undefined,
            city: data.city,
            state: data.state,
            postcode: data.postcode,
            country: data.country,
          },
          clear_cart: false,
        };

        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const createRes = await fetch(`${apiBase}/api/v1/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(orderPayload),
        });

        if (!createRes.ok) {
          throw new Error('Failed to create order');
        }
        const createdOrder = await createRes.json();
        setOrderSummaryData({
          subtotal: createdOrder.subtotal_amount,
          discount: createdOrder.discount_amount,
          shipping: createdOrder.shipping_amount,
          total: createdOrder.total_amount,
          applied_voucher_code: createdOrder.applied_voucher_code,
        });

        const response = await fetch('/api/checkout_sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ items: cartItems, orderId: createdOrder.id }),
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
      } else {
        // Non-stripe flow: create order directly in backend with provided addresses/method
        const token = getAuthToken();
        const payload = {
          contact_email: user?.email ?? undefined,
          payment_method: paymentMethod,
          remark: data.remark || undefined,
          shipping_address: {
            first_name: data.firstName,
            last_name: data.lastName,
            address1: data.address1,
            address2: data.address2 || undefined,
            city: data.city,
            state: data.state,
            postcode: data.postcode,
            country: data.country,
            phone: data.phone,
          },
          billing_address: useDifferentBilling ? {
            first_name: data.billingFirstName,
            last_name: data.billingLastName,
            address1: data.billingAddress1,
            address2: data.billingAddress2 || undefined,
            city: data.billingCity,
            state: data.billingState,
            postcode: data.billingPostcode,
            country: data.billingCountry,
          } : {
            first_name: data.firstName,
            last_name: data.lastName,
            address1: data.address1,
            address2: data.address2 || undefined,
            city: data.city,
            state: data.state,
            postcode: data.postcode,
            country: data.country,
          },
        };

        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiBase}/api/v1/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error('Failed to create order');
        }
        const created = await res.json();
        setOrderSummaryData({
          subtotal: created.subtotal_amount,
          discount: created.discount_amount,
          shipping: created.shipping_amount,
          total: created.total_amount,
          applied_voucher_code: created.applied_voucher_code,
        });
        window.location.href = `/orders/success?order_id=${created.id}`;
      }

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
                <div className="mb-2">
                  <button
                      type="button"
                      onClick={() => router.back()}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-4"
                  >
                      <ArrowLeft size={16} /> Back
                  </button>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Contact information</h2>
                        <p className="text-gray-700">{user?.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Add your phone number</label>
                        <input type="tel" placeholder="Phone" {...register('phone')} className={`${inputClasses(!!errors.phone)} mt-1`} />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <h2 className="text-xl font-semibold">Shipping address</h2>
                      {addresses && addresses.length > 0 && (
                        <div className="flex items-center gap-2">
                          <label htmlFor="addressSelect" className="text-sm text-gray-600">Use saved address:</label>
                          <select
                            id="addressSelect"
                            className="border rounded-md h-10 px-2 w-75"
                            value={selectedAddressId ?? 'new'}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === 'new') {
                                setSelectedAddressId(null);
                                clearAddressForm();
                                return;
                              }
                              const id = value;
                              setSelectedAddressId(id);
                              const chosen = addresses.find(a => a.id === id);
                              if (chosen) applyAddressToForm(chosen);
                            }}
                          >
                            <option value="new">New address</option>
                            {addresses.map(a => (
                              <option key={a.id} value={a.id}>
                                {a.first_name} {a.last_name} — {a.address1}, {a.city}
                                {a.is_primary ? ' (Primary)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    
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
                        <input type="text" placeholder="Address line 2 (optional)" {...register('address2')} className={inputClasses(false)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <input type="text" placeholder="City" {...register('city')} className={inputClasses(false)} />
                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                        </div>
                        <div>
                            <input type="text" placeholder="State" {...register('state')} className={inputClasses(false)} />
                            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                        </div>
                        <div>
                            <input type="text" placeholder="Postcode" {...register('postcode')} className={inputClasses(false)} />
                            {errors.postcode && <p className="text-red-500 text-xs mt-1">{errors.postcode.message}</p>}
                        </div>
                    </div>
                    <div>
                        <input type="text" placeholder="Country" {...register('country')} className={inputClasses(false)} />
                        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                    </div>

                    <div className="pt-6">
                        <h3 className="text-lg font-semibold">Remark</h3>
                        <textarea placeholder="Add a remark..." {...register('remark')} className={`${inputClasses(!!errors.remark)} h-24 mt-1`}></textarea>
                    </div>

                    <div className="pt-6">
                      <h3 className="text-lg font-semibold">Billing address</h3>
                      <div className="mt-2 space-y-2 border rounded-md">
                        <label className="p-4 border-b flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="billing_address"
                            checked={!useDifferentBilling}
                            onChange={() => setUseDifferentBilling(false)}
                          />
                          <span>Same with shipping address</span>
                        </label>
                        <label className="p-4 flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="billing_address"
                            checked={useDifferentBilling}
                            onChange={() => setUseDifferentBilling(true)}
                          />
                          <span>Use a different billing address</span>
                        </label>
                      </div>
                      {useDifferentBilling && (
                        <div className="mt-4 grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <input type="text" placeholder="First name" {...register('billingFirstName')} className={inputClasses(false)} />
                            </div>
                            <div>
                              <input type="text" placeholder="Last name" {...register('billingLastName')} className={inputClasses(false)} />
                            </div>
                          </div>
                          <div>
                            <input type="text" placeholder="Address line 1" {...register('billingAddress1')} className={inputClasses(false)} />
                          </div>
                          <div>
                            <input type="text" placeholder="Address line 2 (optional)" {...register('billingAddress2')} className={inputClasses(false)} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <input type="text" placeholder="City" {...register('billingCity')} className={inputClasses(false)} />
                            </div>
                            <div>
                              <input type="text" placeholder="State" {...register('billingState')} className={inputClasses(false)} />
                            </div>
                            <div>
                              <input type="text" placeholder="Postcode" {...register('billingPostcode')} className={inputClasses(false)} />
                            </div>
                          </div>
                          <div>
                            <input type="text" placeholder="Country" {...register('billingCountry')} className={inputClasses(false)} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-6">
                      <h3 className="text-lg font-semibold">Payment method</h3>
                      <div className="mt-2 space-y-2 border rounded-md">
                        <label className="p-4 border-b flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="payment_method" checked={paymentMethod==='stripe'} onChange={() => setPaymentMethod('stripe')} />
                          <span>Stripe (VISA/Master/FPX)</span>
                        </label>
                        <label className="p-4 border-b flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="payment_method" checked={paymentMethod==='fpx'} onChange={() => setPaymentMethod('fpx')} />
                          <span>Internet Banking (FPX Malaysia)</span>
                        </label>
                        <label className="p-4 border-b flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="payment_method" checked={paymentMethod==='duitnow_qr'} onChange={() => setPaymentMethod('duitnow_qr')} />
                          <span>DuitNow QR</span>
                        </label>
                        <label className="p-4 flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="payment_method" checked={paymentMethod==='bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} />
                          <span>Bank transfer</span>
                        </label>
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
                <OrderSummary orderSummaryData={orderSummaryData} />
                </div>
            </div>
        </form>
    </div>
  );
};

export default CheckoutPage;
