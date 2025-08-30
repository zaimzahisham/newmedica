"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, type AddressFormValues } from '@/lib/validations/address';

type Props = {
  initialValues?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
};

export default function AddressForm({ initialValues, onSubmit, onCancel, submitLabel = 'Save Address' }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postcode: '',
      country: '',
      is_primary: false,
      ...initialValues,
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        first_name: initialValues.first_name ?? '',
        last_name: initialValues.last_name ?? '',
        phone: initialValues.phone ?? '',
        address1: initialValues.address1 ?? '',
        address2: initialValues.address2 ?? '',
        city: initialValues.city ?? '',
        state: initialValues.state ?? '',
        postcode: initialValues.postcode ?? '',
        country: initialValues.country ?? '',
        is_primary: initialValues.is_primary ?? false,
      });
    }
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">First Name</label>
          <input className="mt-1 w-full border rounded-md p-2" {...register('first_name')} />
          {errors.first_name && <p className="text-xs text-red-600">{errors.first_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Last Name</label>
          <input className="mt-1 w-full border rounded-md p-2" {...register('last_name')} />
          {errors.last_name && <p className="text-xs text-red-600">{errors.last_name.message}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input className="mt-1 w-full border rounded-md p-2" {...register('phone')} />
        {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Address line 1</label>
        <input className="mt-1 w-full border rounded-md p-2" {...register('address1')} />
        {errors.address1 && <p className="text-xs text-red-600">{errors.address1.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Address line 2</label>
        <input className="mt-1 w-full border rounded-md p-2" {...register('address2')} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Postcode</label>
          <input className="mt-1 w-full border rounded-md p-2" {...register('postcode')} />
          {errors.postcode && <p className="text-xs text-red-600">{errors.postcode.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">City</label>
          <input className="mt-1 w-full border rounded-md p-2" {...register('city')} />
          {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">State</label>
          <input className="mt-1 w-full border rounded-md p-2" {...register('state')} />
          {errors.state && <p className="text-xs text-red-600">{errors.state.message}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Country</label>
        <input className="mt-1 w-full border rounded-md p-2" {...register('country')} />
        {errors.country && <p className="text-xs text-red-600">{errors.country.message}</p>}
      </div>
      <div className="flex items-center gap-2">
        <input id="is_primary" type="checkbox" {...register('is_primary')} />
        <label htmlFor="is_primary" className="text-sm">Set as primary</label>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting} className="bg-black text-white px-6 py-2 rounded-full disabled:opacity-50">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-full border">Cancel</button>
      </div>
    </form>
  );
}


