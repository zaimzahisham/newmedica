'use client';

import { useForm, UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product, User } from '@/types';
import { sendQuotationRequest } from '@/lib/api/quotation';
import { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const quotationSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  department: z.string().min(1, 'Department is required'),
  companyName: z.string().min(1, 'Company name is required'),
  coRegNo: z.string().optional(),
  tinNo: z.string().optional(),
  email: z.string().email('Invalid email address'),
  telNo: z.string().min(1, 'Telephone number is required'),
  address: z.string().min(1, 'Address is required'),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

interface RequestQuotationModalProps {
  product: Product;
  user: User;
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

const InputField = ({ label, name, register, errors, ...props }: InputFieldProps) => (
  <div>
    <label htmlFor={name} className="block text-xs font-serif text-gray-600">{label}</label>
    <input {...register(name)} id={name} className="mt-1 block w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black sm:text-sm py-2" {...props} />
    {errors[name] && (
      <p className="mt-1 text-xs text-red-600">{errors[name]?.message as string}</p>
    )}
  </div>
);

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
}

const TextareaField = ({ label, name, register, errors, ...props }: TextareaFieldProps) => (
  <div>
    <label htmlFor={name} className="block text-xs font-serif text-gray-600">{label}</label>
    <textarea {...register(name)} id={name} rows={4} className="mt-1 block w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black sm:text-sm py-2" {...props} />
    {errors[name] && (
      <p className="mt-1 text-xs text-red-600">{errors[name]?.message as string}</p>
    )}
  </div>
);

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
}

export default function RequestQuotationModal({ product, user, onClose }: RequestQuotationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      fullName: `${user.firstName} ${user.lastName || ''}`.trim(),
      department: user.department || '',
      companyName: user.companyName || '',
      coRegNo: user.coRegNo || '',
      tinNo: user.tinNo || '',
      email: user.email || '',
      telNo: user.hpNo || '',
      address: user.companyAddress || '',
    }
  });

  const onSubmit = async (data: QuotationFormData) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      await sendQuotationRequest({
        ...data,
        productName: product.name,
        productId: product.id,
      });
      setSubmissionSuccess(true);
    } catch {
      setSubmissionError('Failed to send request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <motion.div 
        className="fixed inset-0 bg-black/0 backdrop-blur-md flex justify-center items-center z-50 p-4"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={backdropVariants}
      >
        <motion.div 
          className="bg-white p-8 rounded-lg max-w-md w-full text-center shadow-2xl"
          variants={modalVariants}
        >
          <h2 className="text-2xl font-serif mb-4">Request Sent!</h2>
          <p className="text-gray-600">Your quotation request has been sent successfully. We will get back to you shortly.</p>
          <button onClick={onClose} className="mt-6 bg-black text-white px-8 py-2 rounded-full font-semibold hover:bg-gray-800 transition-colors">Close</button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="fixed inset-0 bg-black/0 backdrop-blur-md flex justify-center items-center z-50 p-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={backdropVariants}
      onClick={onClose}
    >
      <motion.div 
        className="bg-white p-8 sm:p-12 rounded-lg max-w-2xl w-full shadow-2xl relative"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <h2 className="text-3xl font-serif mb-6 text-center">Request Quotation for {product.name}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <InputField label="Full Name" name="fullName" register={register} errors={errors} />
            <InputField label="Department" name="department" register={register} errors={errors} />
            <InputField label="Hospital/Company Name" name="companyName" register={register} errors={errors} />
            <InputField label="Co Reg No" name="coRegNo" register={register} errors={errors} />
            <InputField label="TIN No" name="tinNo" register={register} errors={errors} />
            <InputField label="Email" name="email" type="email" register={register} errors={errors} />
            <InputField label="Tel No" name="telNo" register={register} errors={errors} />
          </div>
          <TextareaField label="Address" name="address" register={register} errors={errors} />
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-8 py-2 rounded-full border border-gray-300 font-semibold hover:bg-gray-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-2 rounded-full bg-black text-white font-semibold disabled:opacity-50 hover:bg-gray-800 transition-colors">
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          {submissionError && <p className="text-red-500 text-sm mt-4 text-center">{submissionError}</p>}
        </form>
      </motion.div>
    </motion.div>
  );
}
