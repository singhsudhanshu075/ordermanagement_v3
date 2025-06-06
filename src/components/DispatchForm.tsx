import React, { useState, useEffect } from 'react';
import { TruckIcon, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { createDispatch } from '../services/orderService';
import { getTodayDate } from '../utils/helpers';

interface DispatchFormProps {
  order: Order;
  onDispatchCreated: () => void;
}

// Product type mapping with gauge differences
const PRODUCT_TYPES = {
  '40x3': 7800,
  '30x3': 7800,
  '32x3': 7500,
  '35x5': 7200,
  '35x4': 7500,
  '40x5': 7000,
  '40x6': 7000,
  '50x5': 6400,
  '65x5': 6400,
  '75x5': 6400,
  '50x6': 6100,
  '65x6': 6100,
  '75x6': 6100,
  '65x8': 6400,
  '75x8': 6400,
  '65x10': 6700,
  '75x10': 6700,
  '50x4': 7500,
  '40x4': 7500,
  '45x4': 7800,
  '45x5': 7200
};

const TAX_RATES = [7, 12, 18];

const DispatchForm: React.FC<DispatchFormProps> = ({ order, onDispatchCreated }) => {
  const [date, setDate] = useState(getTodayDate());
  const [quantity, setQuantity] = useState<number | null>(null);
  const [dispatchPrice, setDispatchPrice] = useState<number | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [productType, setProductType] = useState<string>('');
  const [gaugeDifference, setGaugeDifference] = useState<number | null>(null);
  const [loadingCharge, setLoadingCharge] = useState<number | null>(null);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill gauge difference when product type changes
  useEffect(() => {
    if (productType && PRODUCT_TYPES[productType as keyof typeof PRODUCT_TYPES]) {
      setGaugeDifference(PRODUCT_TYPES[productType as keyof typeof PRODUCT_TYPES]);
    } else {
      setGaugeDifference(null);
    }
  }, [productType]);

  // Auto-populate dispatch price based on order type and items
  useEffect(() => {
    if (order.items && order.items.length > 0) {
      // Calculate average price from order items
      const totalPrice = order.items.reduce((sum, item) => sum + item.price, 0);
      const averagePrice = totalPrice / order.items.length;
      setDispatchPrice(averagePrice);
    }
  }, [order.items]);

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

    if (loadingCharge && loadingCharge < 0) {
      setError('Loading charge cannot be negative');
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
        status,
        productType,
        gaugeDifference,
        loadingCharge,
        taxRate
      });
      
      onDispatchCreated();
      
      setDate(getTodayDate());
      setQuantity(null);
      // Reset dispatch price to order's average price
      if (order.items && order.items.length > 0) {
        const totalPrice = order.items.reduce((sum, item) => sum + item.price, 0);
        const averagePrice = totalPrice / order.items.length;
        setDispatchPrice(averagePrice);
      }
      setInvoiceNumber('');
      setNotes('');
      setStatus(order.status);
      setProductType('');
      setGaugeDifference(null);
      setLoadingCharge(null);
      setTaxRate(18);
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
          <label htmlFor="product-type" className="block text-sm font-medium text-gray-700">
            Product Type
          </label>
          <select
            id="product-type"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select Product Type</option>
            {Object.keys(PRODUCT_TYPES).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="gauge-difference" className="block text-sm font-medium text-gray-700">
            Gauge Difference
          </label>
          <input
            type="number"
            id="gauge-difference"
            value={gaugeDifference || ''}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Auto-filled based on product type"
          />
        </div>

        <div>
          <label htmlFor="loading-charge" className="block text-sm font-medium text-gray-700">
            Loading Charge (₹)
          </label>
          <input
            type="number"
            id="loading-charge"
            value={loadingCharge || ''}
            onChange={(e) => setLoadingCharge(parseFloat(e.target.value) || null)}
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter loading charge"
          />
        </div>

        <div>
          <label htmlFor="tax-rate" className="block text-sm font-medium text-gray-700">
            Tax Rate (%)
          </label>
          <select
            id="tax-rate"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            {TAX_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate}%
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dispatch-price" className="block text-sm font-medium text-gray-700">
            Dispatch Price (₹)
            <span className="text-xs text-gray-500 ml-1">
              (Auto-filled from {order.type === 'sale' ? 'sales' : 'purchase'} price)
            </span>
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