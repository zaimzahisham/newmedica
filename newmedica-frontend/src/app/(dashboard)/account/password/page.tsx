'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { changePassword } from '@/lib/api/user';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const passwordFormSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function ChangePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    setError(null);
    setSuccess(null);
    try {
      await changePassword({
        old_password: values.oldPassword,
        new_password: values.newPassword,
      });
      setSuccess('Password updated successfully!');
      reset();
    } catch (error: unknown) {
        if (error instanceof Error) {
            setError(error.message);
        } else {
            setError('An unexpected error occurred.');
        }
    }
  };

  const baseInputClasses = "w-full p-3 h-12 border rounded-md";
  const errorInputClasses = "border-red-500";

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Change Password</h1>
          <p className="text-gray-600">Update your password here.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="password"
              {...register('oldPassword')}
              placeholder="Old Password"
              className={`${baseInputClasses} ${errors.oldPassword ? errorInputClasses : 'border-gray-300'}`}
            />
            {errors.oldPassword && <p className="text-xs text-red-600 mt-1">{errors.oldPassword.message}</p>}
          </div>
          <div>
            <input
              type="password"
              {...register('newPassword')}
              placeholder="New Password"
              className={`${baseInputClasses} ${errors.newPassword ? errorInputClasses : 'border-gray-300'}`}
            />
            {errors.newPassword && <p className="text-xs text-red-600 mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <input
              type="password"
              {...register('confirmPassword')}
              placeholder="Confirm New Password"
              className={`${baseInputClasses} ${errors.confirmPassword ? errorInputClasses : 'border-gray-300'}`}
            />
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
          </div>
          {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
          {success && <p className="text-sm font-medium text-primary text-center">{success}</p>}
          <div className="flex space-x-4">
            <button type="button" onClick={() => router.back()} className="w-full bg-gray-200 text-black py-3 rounded-md">
              Back
            </button>
            <button type="submit" className="w-full bg-black text-white py-3 rounded-md disabled:opacity-50">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}