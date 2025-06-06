import React, { useState } from 'react';
import { TruckIcon, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { createDispatch } from '../services/orderService';
import { getTodayDate } from '../utils/helpers';

interface DispatchFormProps {
  order: Order;
  onDispatchCreated: () => void;
}

const DispatchForm: React.FC<DispatchFormProps> = ({ order, onDispatchCreated }) => {
  const [date, setDate] = useState(getTodayDate());
  const [quantity, setQuantity] = useState<number | null>(null);
  const [dispatchPrice, setDispatchPrice] = useState<number | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (order.status === 'completed') {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              This order has been marked as completed. No further dispatches can be recorded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!quantity || quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (dispatchPrice && dispatchPrice < 0) {
      setError('Price cannot be negative');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createDispatch(order.id, {
        date,
        quantity,
        dispatchPrice,
        invoiceNumber,
        notes,
        status
      });
      
      onDispatchCreated();
      
      setDate(getTodayDate());
      setQuantity(null);
      setDispatchPrice(null);
      setInvoiceNumber('');
      setNotes('');
      setStatus(order.status);
    } catch (error) {
      console.error('Error creating dispatch:', error);
      setError('Failed to create dispatch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center text-lg font-semibold text-gray-800 mb-2">
        <TruckIcon className="mr-2 text-blue-600" size={20} /> Record Dispatch
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dispatch-date" className="block text-sm font-medium text-gray-700">
            Dispatch Date
          </label>
          <input
            type="date"
            id="dispatch-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="dispatch-quantity" className="block text-sm font-medium text-gray-700">
            Quantity (Remaining: {order.remainingQuantity?.toFixed(2)})
          </label>
          <input
            type="number"
            id="dispatch-quantity"
            value={quantity || ''}
            onChange={(e) => setQuantity(parseFloat(e.target.value) || null)}
            min="0.01"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="dispatch-price" className="block text-sm font-medium text-gray-700">
            Dispatch Price (₹)
          </label>
          <input
            type="number"
            id="dispatch-price"
            value={dispatchPrice || ''}
            min="0"
            step="0.01"
            onChange={(e) => setDispatchPrice(parseFloat(e.target.value) || null)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="invoice-number" className="block text-sm font-medium text-gray-700">
            Invoice Number
          </label>
          <input
            type="text"
            id="invoice-number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="order-status" className="block text-sm font-medium text-gray-700">
            Order Status
          </label>
          <select
            id="order-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="dispatch-notes" className="block text-sm font-medium text-gray-700">
          Notes (Optional)
        </label>
        <textarea
          id="dispatch-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Record Dispatch'}
        </button>
      </div>
    </form>
  );
};

export default DispatchForm;