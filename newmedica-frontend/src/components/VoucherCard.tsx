'use client';

import { formatVoucherCode } from '@/lib/utils';
import { Voucher } from '@/types';
import { Ticket } from 'lucide-react';

interface VoucherCardProps {
  voucher: Voucher;
}

const VoucherCard = ({ voucher }: VoucherCardProps) => {
  const isExpired = voucher.valid_to ? new Date(voucher.valid_to) < new Date() : false;
  const cardClass = voucher.is_active && !isExpired ? 'bg-white' : 'bg-gray-100 opacity-70';
  const textColor = voucher.is_active && !isExpired ? 'text-gray-800' : 'text-gray-500';

  return (
    <div className={`border rounded-lg p-4 flex items-start space-x-4 ${cardClass} shadow-sm`}>
      <div className="flex-shrink-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${voucher.is_active && !isExpired ? 'bg-green-100' : 'bg-gray-200'}`}>
          <Ticket className={`${voucher.is_active && !isExpired ? 'text-green-600' : 'text-gray-500'}`} />
        </div>
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <h3 className={`font-bold text-lg ${textColor}`}>{formatVoucherCode(voucher.code)}</h3>
          {(!voucher.is_active || isExpired) && (
            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">Expired</span>
          )}
        </div>
        <p className={`text-sm mt-1 ${textColor}`}>{voucher.description || 'No description available.'}</p>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className={`text-sm font-semibold ${textColor}`}>
            Discount: {voucher.amount} {voucher.discount_type === 'fixed' ? 'MYR' : '%'}
          </p>
          {voucher.valid_to && (
             <p className={`text-xs mt-1 ${textColor}`}>
                Valid until: {new Date(voucher.valid_to).toLocaleDateString()}
             </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoucherCard;
