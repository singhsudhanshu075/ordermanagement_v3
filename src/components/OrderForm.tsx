import React, { useState } from 'react';
import { Plus, Minus, PackageCheck, Package, Truck } from 'lucide-react';
import { OrderType, OrderItem } from '../types';
import { createOrder } from '../services/orderService';
import { getTodayDate } from '../utils/helpers';
import { supabase } from '../lib/supabase';

interface OrderFormProps {
  type: OrderType;
  onOrderCreated: (orderId: string) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ type, onOrderCreated }) => {
  const [date, setDate] = useState(getTodayDate());
  const [contactName, setContactName] = useState('');
  const [items, setItems] = useState<OrderItem[]>([
    { id: `item-${Date.now()}`, name: '', quantity: null, unit: 'kg', price: null, commission: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = () => {
    setItems([...items, { 
      id: `item-${Date.now()}`, 
      name: '', 
      quantity: null, 
      unit: 'kg',
      price: null,
      commission: 0
    }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(
      items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateTotalQuantity = (): number => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        setError('Please log in to create an order.');
        return;
      }

      const totalQuantity = calculateTotalQuantity();
      
      const newOrder = await createOrder({
        date,
        customer: type === 'sale' ? contactName : undefined,
        supplier: type === 'purchase' ? contactName : undefined,
        items,
        totalQuantity,
        remainingQuantity: totalQuantity,
        notes
      }, type);
      
      onOrderCreated(newOrder.id);
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error instanceof Error ? error.message : 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          {type === 'sale' ? (
            <><Truck className="mr-2 text-blue-600\" size={20} /> Record Sale</>
          ) : (
            <><PackageCheck className="mr-2 text-emerald-600" size={20} /> Record Purchase</>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
              required
            />
          </div>
          
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'sale' ? 'Customer Name' : 'Supplier Name'}
            </label>
            <input
              type="text"
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
              required
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-medium text-gray-700">Items</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 touch-manipulation"
            >
              <Plus size={16} className="mr-1" /> Add Item
            </button>
          </div>
          
          {items.map((item, index) => (
            <div key={item.id} className="p-4 rounded-md bg-gray-50 space-y-4">
              {/* Item Name - Full width on mobile */}
              <div>
                <label htmlFor={`item-name-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  id={`item-name-${index}`}
                  value={item.name}
                  onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
                  required
                />
              </div>

              {/* Quantity and Unit - Side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={`item-quantity-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id={`item-quantity-${index}`}
                    value={item.quantity || ''}
                    min="0.01"
                    step="0.01"
                    onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || null)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor={`item-unit-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    id={`item-unit-${index}`}
                    value={item.unit}
                    onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
                  >
                    <option value="kg">Kg</option>
                    <option value="tonn">Tonn</option>
                    <option value="pieces">Pieces</option>
                  </select>
                </div>
              </div>

              {/* Price and Commission - Side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={`item-price-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    id={`item-price-${index}`}
                    value={item.price || ''}
                    min="0"
                    step="0.01"
                    onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || null)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
                    required
                  />
                </div>

                <div>
                  <label htmlFor={`item-commission-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Commission (₹)
                  </label>
                  <input
                    type="number"
                    id={`item-commission-${index}`}
                    value={item.commission || 0}
                    min="0"
                    step="0.01"
                    onChange={(e) => handleItemChange(item.id, 'commission', parseFloat(e.target.value) || 0)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm h-12 sm:h-10"
                  />
                </div>
              </div>
              
              {/* Remove button - Full width on mobile */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={items.length === 1}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white text-sm font-medium touch-manipulation ${
                    items.length === 1
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  }`}
                >
                  <Minus size={16} className="mr-1" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm"
          />
        </div>
        
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white touch-manipulation ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;