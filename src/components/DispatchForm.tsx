import React, { useState, useEffect } from 'react';
import { TruckIcon, AlertCircle, Loader2, Plus, X, Package } from 'lucide-react';
import { Order, OrderStatus, ProductType, ProductTypeCategory, Dispatch } from '../types';
import { createDispatch, createBatchDispatches } from '../services/orderService';
import { getProductTypes, createProductType } from '../services/masterDataService';
import { getTodayDate } from '../utils/helpers';

interface DispatchFormProps {
  order: Order;
  onDispatchCreated: () => void;
}

const TAX_RATES = [7, 11, 12, 13, 18];
const LOADING_CHARGES = [0, 165, 265];

interface PendingDispatch {
  id: string;
  date: string;
  quantity: number;
  dispatchPrice: number | null;
  invoiceNumber: string;
  notes: string;
  status: OrderStatus;
  productType: string;
  gaugeDifference: number | null;
  loadingCharge: number | null;
  taxRate: number;
}

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
  
  // Batch dispatch state
  const [pendingDispatches, setPendingDispatches] = useState<PendingDispatch[]>([]);
  
  // Product types state
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loadingProductTypes, setLoadingProductTypes] = useState(true);
  const [productTypesError, setProductTypesError] = useState<string | null>(null);

  // New product type form state
  const [showNewProductTypeForm, setShowNewProductTypeForm] = useState(false);
  const [newProductTypeName, setNewProductTypeName] = useState('');
  const [newProductTypeGaugeDifference, setNewProductTypeGaugeDifference] = useState<number | null>(null);
  const [newProductTypeCategory, setNewProductTypeCategory] = useState<ProductTypeCategory>('both');
  const [isCreatingProductType, setIsCreatingProductType] = useState(false);

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

  // Auto-fill fields from first dispatch in batch
  useEffect(() => {
    if (pendingDispatches.length > 0) {
      const firstDispatch = pendingDispatches[0];
      // Auto-fill loading charge, tax rate, and invoice number from first dispatch
      setLoadingCharge(firstDispatch.loadingCharge);
      setTaxRate(firstDispatch.taxRate);
      setInvoiceNumber(firstDispatch.invoiceNumber);
    }
  }, [pendingDispatches.length]); // Only trigger when batch size changes

  const handleProductTypeSelect = (value: string) => {
    if (value === 'ADD_NEW_PRODUCT_TYPE') {
      setShowNewProductTypeForm(true);
      setProductType('');
    } else {
      setShowNewProductTypeForm(false);
      setProductType(value);
    }
  };

  const handleCreateNewProductType = async () => {
    if (!newProductTypeName.trim()) {
      setError('Product type name is required');
      return;
    }

    // Updated validation to explicitly allow 0
    if (newProductTypeGaugeDifference === null || newProductTypeGaugeDifference < 0) {
      setError('Gauge difference must be 0 or a positive number');
      return;
    }

    setIsCreatingProductType(true);
    setError(null);

    try {
      const newProductType = await createProductType({
        name: newProductTypeName.trim(),
        gaugeDifference: newProductTypeGaugeDifference,
        type: newProductTypeCategory
      });

      // Add the new product type to the list
      setProductTypes(prev => [...prev, newProductType]);
      
      // Select the newly created product type
      setProductType(newProductType.name);
      
      // Reset form
      setNewProductTypeName('');
      setNewProductTypeGaugeDifference(null);
      setNewProductTypeCategory('both');
      setShowNewProductTypeForm(false);
    } catch (error) {
      console.error('Error creating product type:', error);
      setError(error instanceof Error ? error.message : 'Failed to create product type');
    } finally {
      setIsCreatingProductType(false);
    }
  };

  const handleCancelNewProductType = () => {
    setNewProductTypeName('');
    setNewProductTypeGaugeDifference(null);
    setNewProductTypeCategory('both');
    setShowNewProductTypeForm(false);
    setError(null);
  };

  const validateCurrentForm = (): boolean => {
    if (showNewProductTypeForm) {
      setError('Please complete adding the new product type or cancel before proceeding');
      return false;
    }
    
    if (!quantity || quantity <= 0) {
      setError('Quantity must be greater than 0');
      return false;
    }

    if (dispatchPrice && dispatchPrice < 0) {
      setError('Price cannot be negative');
      return false;
    }

    if (loadingCharge && loadingCharge < 0) {
      setError('Loading charge cannot be negative');
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setDate(getTodayDate());
    setQuantity(null);
    // Reset dispatch price to order's average price
    if (order.items && order.items.length > 0) {
      const totalPrice = order.items.reduce((sum, item) => sum + item.price, 0);
      const averagePrice = totalPrice / order.items.length;
      setDispatchPrice(averagePrice);
    }
    // Don't reset invoice number, loading charge, and tax rate if there are pending dispatches
    if (pendingDispatches.length === 0) {
      setInvoiceNumber('');
      setLoadingCharge(null);
      setTaxRate(18);
    }
    setNotes('');
    setStatus(order.status);
    setProductType('');
    setGaugeDifference(null);
  };

  const getTotalBatchQuantity = (): number => {
    return pendingDispatches.reduce((sum, dispatch) => sum + dispatch.quantity, 0);
  };

  const handleAddToBatch = () => {
    setError(null);
    
    if (!validateCurrentForm()) {
      return;
    }

    const newPendingDispatch: PendingDispatch = {
      id: `pending-${Date.now()}`,
      date,
      quantity: quantity!,
      dispatchPrice,
      invoiceNumber,
      notes,
      status,
      productType,
      gaugeDifference,
      loadingCharge,
      taxRate
    };

    setPendingDispatches(prev => [...prev, newPendingDispatch]);
    resetForm();
  };

  const handleRemoveFromBatch = (id: string) => {
    setPendingDispatches(prev => prev.filter(dispatch => dispatch.id !== id));
    
    // If removing the last item, reset auto-filled fields
    if (pendingDispatches.length === 1) {
      setInvoiceNumber('');
      setLoadingCharge(null);
      setTaxRate(18);
    }
  };

  const handleClearBatch = () => {
    setPendingDispatches([]);
    // Reset auto-filled fields when clearing batch
    setInvoiceNumber('');
    setLoadingCharge(null);
    setTaxRate(18);
  };

  const handleRecordBatch = async () => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      const dispatchesToSubmit = pendingDispatches.map(pd => ({
        date: pd.date,
        quantity: pd.quantity,
        dispatchPrice: pd.dispatchPrice,
        invoiceNumber: pd.invoiceNumber,
        notes: pd.notes,
        status: pd.status,
        productType: pd.productType,
        gaugeDifference: pd.gaugeDifference,
        loadingCharge: pd.loadingCharge,
        taxRate: pd.taxRate
      }));

      await createBatchDispatches(order.id, dispatchesToSubmit);
      
      onDispatchCreated();
      // Clear the batch after successful submission
      setPendingDispatches([]);
      // Reset auto-filled fields after successful submission
      setInvoiceNumber('');
      setLoadingCharge(null);
      setTaxRate(18);
    } catch (error) {
      console.error('Error creating batch dispatches:', error);
      setError('Failed to create batch dispatches. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateCurrentForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createDispatch(order.id, {
        date,
        quantity: quantity!,
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
      resetForm();
      // Don't reset auto-filled fields if there are still pending dispatches
      if (pendingDispatches.length === 0) {
        setInvoiceNumber('');
        setLoadingCharge(null);
        setTaxRate(18);
      }
    } catch (error) {
      console.error('Error creating dispatch:', error);
      setError('Failed to create dispatch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Pending Dispatches Section */}
      {pendingDispatches.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-blue-800 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Pending Dispatches ({pendingDispatches.length})
            </h3>
            <button
              type="button"
              onClick={handleClearBatch}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </button>
          </div>
          
          <div className="space-y-2 mb-3">
            {pendingDispatches.map((dispatch, index) => (
              <div key={dispatch.id} className="bg-white rounded p-3 text-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span><strong>#{index + 1} Date:</strong> {dispatch.date}</span>
                      <span><strong>Quantity:</strong> {dispatch.quantity.toFixed(4)}</span>
                      <span><strong>Product:</strong> {dispatch.productType || 'N/A'}</span>
                      <span><strong>Loading:</strong> ₹{dispatch.loadingCharge || 0}</span>
                      <span><strong>Tax:</strong> {dispatch.taxRate}%</span>
                      <span><strong>Invoice:</strong> {dispatch.invoiceNumber || 'N/A'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFromBatch(dispatch.id)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-100 rounded p-3 text-sm text-blue-800">
            <div className="flex justify-between items-center">
              <strong>Total Batch Quantity: {getTotalBatchQuantity().toFixed(4)}</strong>
              <span className="text-xs">
                {pendingDispatches.length > 0 && (
                  <span className="bg-blue-200 px-2 py-1 rounded">
                    Auto-filling from first dispatch: Loading ₹{pendingDispatches[0].loadingCharge || 0}, Tax {pendingDispatches[0].taxRate}%
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center text-base sm:text-lg font-semibold text-gray-800 mb-2">
          <TruckIcon className="mr-2 text-blue-600" size={20} /> Record Dispatch
          {pendingDispatches.length > 0 && (
            <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-100 px-2 py-1 rounded">
              Adding to batch ({pendingDispatches.length} items)
            </span>
          )}
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
                <span className="text-xs text-gray-500 block">
                  Remaining: {order.remainingQuantity?.toFixed(4)}
                  {pendingDispatches.length > 0 && (
                    <span className="text-blue-600 ml-2">
                      | Batch Total: {getTotalBatchQuantity().toFixed(4)}
                    </span>
                  )}
                </span>
              </label>
              <input
                type="number"
                id="dispatch-quantity"
                value={quantity || ''}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || null)}
                min="0.0001"
                step="0.0001"
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
                  Showing products for {order.type} orders
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
                  onChange={(e) => handleProductTypeSelect(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
                  required
                  disabled={productTypes.length === 0 || showNewProductTypeForm}
                >
                  <option value="">Select Product Type</option>
                  {productTypes.map((type) => (
                    <option key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                  <option value="ADD_NEW_PRODUCT_TYPE">+ Add New Product Type</option>
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
                value={gaugeDifference !== null ? gaugeDifference : ''}
                readOnly
                className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
                placeholder="Auto-filled"
              />
            </div>
          </div>

          {/* New Product Type Form */}
          {showNewProductTypeForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-3">Add New Product Type</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-blue-700 mb-1">
                      Product Type Name *
                    </label>
                    <input
                      type="text"
                      value={newProductTypeName}
                      onChange={(e) => setNewProductTypeName(e.target.value)}
                      placeholder="e.g., 40x3"
                      className="block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-blue-700 mb-1">
                      Gauge Difference *
                      <span className="text-xs text-blue-600 block font-normal">Can be 0 or any positive number</span>
                    </label>
                    <input
                      type="number"
                      value={newProductTypeGaugeDifference !== null ? newProductTypeGaugeDifference : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setNewProductTypeGaugeDifference(null);
                        } else {
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue) && numValue >= 0) {
                            setNewProductTypeGaugeDifference(numValue);
                          }
                        }
                      }}
                      placeholder="e.g., 7800 or 0"
                      min="0"
                      step="1"
                      className="block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">
                    Available For
                  </label>
                  <select
                    value={newProductTypeCategory}
                    onChange={(e) => setNewProductTypeCategory(e.target.value as ProductTypeCategory)}
                    className="block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-10"
                  >
                    <option value="both">Both</option>
                    <option value="sale">Sale</option>
                    <option value="purchase">Purchase</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCreateNewProductType}
                  disabled={isCreatingProductType || !newProductTypeName.trim() || newProductTypeGaugeDifference === null || newProductTypeGaugeDifference < 0}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-blue-400 touch-manipulation flex items-center"
                >
                  {isCreatingProductType && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                  {isCreatingProductType ? 'Adding...' : 'Add Product Type'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelNewProductType}
                  className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 touch-manipulation"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Loading Charge and Tax Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="loading-charge" className="block text-sm font-medium text-gray-700 mb-1">
                Loading Charge (₹)
                {pendingDispatches.length > 0 && (
                  <span className="text-xs text-blue-600 block">Auto-filled from first dispatch</span>
                )}
              </label>
              <select
                id="loading-charge"
                value={loadingCharge || ''}
                onChange={(e) => setLoadingCharge(e.target.value ? parseFloat(e.target.value) : null)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
              >
                <option value="">Select loading charge</option>
                {LOADING_CHARGES.map((charge) => (
                  <option key={charge} value={charge}>
                    ₹{charge}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tax-rate" className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
                {pendingDispatches.length > 0 && (
                  <span className="text-xs text-blue-600 block">Auto-filled from first dispatch</span>
                )}
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
                {pendingDispatches.length > 0 && (
                  <span className="text-xs text-blue-600 block">Auto-filled from first dispatch</span>
                )}
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
        
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {pendingDispatches.length > 0 ? (
            // When there are pending dispatches, show batch recording button
            <>
              <button
                type="button"
                onClick={handleAddToBatch}
                disabled={loadingProductTypes || showNewProductTypeForm}
                className={`flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 touch-manipulation ${
                  loadingProductTypes || showNewProductTypeForm
                    ? 'opacity-50 cursor-not-allowed'
                    : 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Batch
              </button>
              
              <button
                type="button"
                onClick={handleRecordBatch}
                disabled={isSubmitting || loadingProductTypes || showNewProductTypeForm}
                className={`flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white touch-manipulation ${
                  isSubmitting || loadingProductTypes || showNewProductTypeForm
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isSubmitting ? 'Recording...' : `Record Batch (${pendingDispatches.length})`}
              </button>
            </>
          ) : (
            // When no pending dispatches, show normal buttons
            <>
              <button
                type="button"
                onClick={handleAddToBatch}
                disabled={loadingProductTypes || showNewProductTypeForm}
                className={`flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 touch-manipulation ${
                  loadingProductTypes || showNewProductTypeForm
                    ? 'opacity-50 cursor-not-allowed'
                    : 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Batch
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || loadingProductTypes || showNewProductTypeForm}
                className={`flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white touch-manipulation ${
                  isSubmitting || loadingProductTypes || showNewProductTypeForm
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isSubmitting ? 'Recording...' : 'Record Dispatch'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default DispatchForm;