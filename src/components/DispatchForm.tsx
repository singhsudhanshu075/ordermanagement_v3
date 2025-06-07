import React, { useState, useEffect } from 'react';
import { TruckIcon, AlertCircle, Loader2 } from 'lucide-react';
import { Order, OrderStatus, ProductType } from '../types';
import { createDispatch } from '../services/orderService';
import { getProductTypes } from '../services/masterDataService';
import { getTodayDate } from '../utils/helpers';

interface DispatchFormProps {
  order: Order;
  onDispatchCreated: () => void;
}

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
  
  // Product types state
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loadingProductTypes, setLoadingProductTypes] = useState(true);
  const [productTypesError, setProductTypesError] = useState<string | null>(null);

  // Load product types based on order type
  useEffect(() => {
    const loadProductTypes = async () => {
      try {
        setLoadingProductTypes(true);
        setProductTypesError(null);
        const types = await getProductTypes(order.type);
        setProductTypes(types);
      } catch (error) {
        console.error('Error loading product types:', error);
        setProductTypesError('Failed to load product types. Please refresh the page.');
      } finally {
        setLoadingProductTypes(false);
      }
    };

    loadProductTypes();
  }, [order.type]);

  // Auto-fill gauge difference when product type changes
  useEffect(() => {
    if (productType) {
      const selectedProductType = productTypes.find(pt => pt.name === productType);
      if (selectedProductType) {
        setGaugeDifference(selectedProductType.gaugeDifference);
      } else {
        setGaugeDifference(null);
      }
    } else {
      setGaugeDifference(null);
    }
  }, [productType, productTypes]);

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
      <div className="flex items-center text-base sm:text-lg font-semibold text-gray-800 mb-2">
        <TruckIcon className="mr-2 text-blue-600" size={20} /> Record Dispatch
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {productTypesError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{productTypesError}</span>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Date and Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dispatch-date" className="block text-sm font-medium text-gray-700 mb-1">
              Dispatch Date
            </label>
            <input
              type="date"
              id="dispatch-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
              required
            />
          </div>
          
          <div>
            <label htmlFor="dispatch-quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
              <span className="text-xs text-gray-500 block">Remaining: {order.remainingQuantity?.toFixed(2)}</span>
            </label>
            <input
              type="number"
              id="dispatch-quantity"
              value={quantity || ''}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || null)}
              min="0.01"
              step="0.01"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
              required
            />
          </div>
        </div>

        {/* Product Type and Gauge Difference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="product-type" className="block text-sm font-medium text-gray-700 mb-1">
              Product Type
              <span className="text-xs text-gray-500 block">
                Showing {order.type === 'sale' ? 'sales' : 'purchase'} products
              </span>
            </label>
            {loadingProductTypes ? (
              <div className="flex items-center justify-center h-12 sm:h-10 border border-gray-300 rounded-md bg-gray-50">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading...</span>
              </div>
            ) : (
              <select
                id="product-type"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
                required
                disabled={productTypes.length === 0}
              >
                <option value="">Select Product Type</option>
                {productTypes.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            )}
            {!loadingProductTypes && productTypes.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">
                No product types available for {order.type} orders
              </p>
            )}
          </div>

          <div>
            <label htmlFor="gauge-difference" className="block text-sm font-medium text-gray-700 mb-1">
              Gauge Difference
            </label>
            <input
              type="number"
              id="gauge-difference"
              value={gaugeDifference || ''}
              readOnly
              className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
              placeholder="Auto-filled"
            />
          </div>
        </div>

        {/* Loading Charge and Tax Rate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="loading-charge" className="block text-sm font-medium text-gray-700 mb-1">
              Loading Charge (₹)
            </label>
            <input
              type="number"
              id="loading-charge"
              value={loadingCharge || ''}
              onChange={(e) => setLoadingCharge(parseFloat(e.target.value) || null)}
              min="0"
              step="0.01"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
              placeholder="Enter loading charge"
            />
          </div>

          <div>
            <label htmlFor="tax-rate" className="block text-sm font-medium text-gray-700 mb-1">
              Tax Rate (%)
            </label>
            <select
              id="tax-rate"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
              required
            >
              {TAX_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}%
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dispatch Price and Invoice Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dispatch-price" className="block text-sm font-medium text-gray-700 mb-1">
              Dispatch Price (₹)
              <span className="text-xs text-gray-500 block">
                Auto-filled from {order.type === 'sale' ? 'sales' : 'purchase'} price
              </span>
            </label>
            <input
              type="number"
              id="dispatch-price"
              value={dispatchPrice || ''}
              min="0"
              step="0.01"
              onChange={(e) => setDispatchPrice(parseFloat(e.target.value) || null)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
            />
          </div>

          <div>
            <label htmlFor="invoice-number" className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              id="invoice-number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
            />
          </div>
        </div>

        {/* Order Status */}
        <div>
          <label htmlFor="order-status" className="block text-sm font-medium text-gray-700 mb-1">
            Order Status
          </label>
          <select
            id="order-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
            required
          >
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        {/* Notes */}
        <div>
          <label htmlFor="dispatch-notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="dispatch-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm"
          />
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting || loadingProductTypes}
          className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white touch-manipulation ${
            isSubmitting || loadingProductTypes
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isSubmitting ? 'Recording...' : 'Record Dispatch'}
        </button>
      </div>
    </form>
  );
};

export default DispatchForm;