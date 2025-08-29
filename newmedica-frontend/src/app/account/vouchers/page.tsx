'use client';
import React, { useEffect, useState } from 'react';
import { getVouchers } from '@/lib/api/vouchers';
import { Voucher } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Ticket } from 'lucide-react';
import Link from 'next/link';

import VoucherCard from '@/components/VoucherCard';

const VouchersPage = () => {
  const { user, token, loading: loadingAuth, checkAuth } = useAuthStore();
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'active' | 'past'>('active');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push('/login');
      return;
    }

    const fetchVouchers = async () => {
      if (!user || !token) return;
      try {
        const fetchedVouchers = await getVouchers();
        // Sort by creation date, newest first
        fetchedVouchers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setVouchers(fetchedVouchers);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loadingAuth && user && token) {
      fetchVouchers();
    }
  }, [user, token, loadingAuth, router]);

  const activeVouchers = vouchers.filter(v => v.is_active);
  const pastVouchers = vouchers.filter(v => !v.is_active);

  const filteredVouchers = selectedTab === 'active' ? activeVouchers : pastVouchers;

  if (loadingAuth || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Vouchers</h1>
        <p>Loading vouchers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Vouchers</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!user) {
    return null; // Fallback
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-800 mr-4">
          <ArrowLeft size={20} className="mr-1" />
          <span className="text-lg">Back</span>
        </button>
      </div>
      <h1 className="text-3xl font-bold mb-3">My Vouchers</h1>
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 text-lg font-medium ${selectedTab === 'active' ? 'border-b-2 border-black text-black' : 'text-gray-600'}`}
          onClick={() => setSelectedTab('active')}
        >
          Active Vouchers
        </button>
        <button
          className={`py-2 px-4 text-lg font-medium ${selectedTab === 'past' ? 'border-b-2 border-black text-black' : 'text-gray-600'}`}
          onClick={() => setSelectedTab('past')}
        >
          Past Vouchers
        </button>
      </div>

      {
        filteredVouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-6 mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <Ticket size={64} className="text-gray-500" />
            </div>
            <p className="text-gray-500 text-lg mb-4">Oops, no vouchers found for this status.</p>
            <Link href="/products" className="bg-black text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVouchers.map((voucher) => (
              <VoucherCard key={voucher.id} voucher={voucher} />
            ))}
          </div>
        )
      }
    </div>
  );
};

export default VouchersPage;
