'use client';

import React from 'react';
import { Order, OrderItem } from '@/types';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderDetailsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { delay: 0.05 } },
  exit: { opacity: 0, scale: 0.95 },
};

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/0 backdrop-blur-md flex items-center justify-center z-50 p-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={backdropVariants}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={24} />
        </button>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Order Details #{order.id.toUpperCase()}</h2>
          
          <div className="mb-4">
            <p className="text-gray-600"><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-gray-600"><strong>Status:</strong> <span className={`font-medium ${
              order.payment_status === 'paid' ? 'text-green-600' :
              order.payment_status === 'pending' ? 'text-yellow-600' :
              'text-gray-600'
            }`}>{order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}</span></p>
            <p className="text-gray-600"><strong>Total Amount:</strong> {order.currency} {order.total_amount.toFixed(2)}</p>
          </div>

          <h3 className="text-xl font-semibold mb-3">Items:</h3>
          <div className="space-y-4 mb-4">
            {order.items.map((item: OrderItem) => (
              <div key={item.id} className="flex items-center border-b pb-4 last:border-b-0 last:pb-0">
                <img 
                  src={item.snapshot_media_url || '/placeholder-product.png'}
                  alt={item.snapshot_name || 'Product Image'}
                  className="w-20 h-20 object-cover rounded-md mr-4"
                />
                <div>
                  <p className="font-semibold">{item.snapshot_name || 'Product'}</p>
                  <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                  <p className="font-bold">{order.currency} {item.line_total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-semibold mb-3">Summary:</h3>
          <div className="space-y-1 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{order.currency} {order.subtotal_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>- {order.currency} {order.discount_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{order.currency} {order.shipping_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total:</span>
              <span>{order.currency} {order.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {order.shipping_address && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3">Shipping Address:</h3>
              <p>{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
              <p>{order.shipping_address.address1}</p>
              {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
              <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postcode}</p>
              <p>{order.shipping_address.country}</p>
              <p>Phone: {order.shipping_address.phone}</p>
            </div>
          )}

          {order.billing_address && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3">Billing Address:</h3>
              <p>{order.billing_address.first_name} {order.billing_address.last_name}</p>
              <p>{order.billing_address.address1}</p>
              {order.billing_address.address2 && <p>{order.billing_address.address2}</p>}
              <p>{order.billing_address.city}, {order.billing_address.state} {order.billing_address.postcode}</p>
              <p>{order.billing_address.country}</p>
            </div>
          )}

          {order.remark && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3">Remark:</h3>
              <p>{order.remark}</p>
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrderDetailsModal;
