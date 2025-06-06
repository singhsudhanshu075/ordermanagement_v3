import React, { useState } from 'react';
import { Calendar, CreditCard, FileText, BanknoteIcon, AlertCircle } from 'lucide-react';
import { createPayment } from '../services/paymentService';
import { PaymentStatus } from '../types';

interface PaymentFormProps {
  orderId: string;
  paymentStatus?: PaymentStatus;
  onSuccess?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ orderId, paymentStatus = 'pending', onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_mode: 'cash',
    payment_status: paymentStatus,
    reference_number: '',
    notes: ''
  });

  // If the order is already marked as completed, show a message instead of the form
  if (paymentStatus === 'completed') {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Payment for this order has been completed. No further payments can be recorded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createPayment({
        order_id: orderId,
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form but preserve the payment status
      setFormData({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_mode: 'cash',
        payment_status: formData.payment_status,
        reference_number: '',
        notes: ''
      });
    } catch (err) {
      console.error('Error creating payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to create payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-2">
              <BanknoteIcon className="w-4 h-4" />
              Amount
            </div>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
            <input
              type="number"
              name="amount"
              step="0.01"
              required
              value={formData.amount}
              onChange={handleChange}
              className="pl-7 w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Payment Date
            </div>
          </label>
          <input
            type="date"
            name="payment_date"
            required
            value={formData.payment_date}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Mode
            </div>
          </label>
          <select
            name="payment_mode"
            required
            value={formData.payment_mode}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="upi">UPI</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Status
            </div>
          </label>
          <select
            name="payment_status"
            required
            value={formData.payment_status}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Reference Number
          </div>
        </label>
        <input
          type="text"
          name="reference_number"
          value={formData.reference_number}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter reference number (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Notes
          </div>
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add any notes (optional)"
          rows={2}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
      >
        {isSubmitting ? 'Processing...' : 'Record Payment'}
      </button>
    </form>
  );
};

export default PaymentForm;