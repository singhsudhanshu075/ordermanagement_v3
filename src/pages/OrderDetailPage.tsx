import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, getDispatchesByOrderId } from '../services/orderService';
import { Order, Dispatch } from '../types';
import DispatchForm from '../components/DispatchForm';
import DispatchList from '../components/DispatchList';
import { formatDateForDisplay, formatCurrency } from '../utils/helpers';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const orderId = id ? decodeURIComponent(id) : '';
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        if (!orderId) throw new Error('Missing order ID');
        const data = await getOrderById(orderId);
        if (!data) throw new Error('Order not found');
        setOrder(data);

        const dispatchData = await getDispatchesByOrderId(orderId);
        setDispatches(dispatchData);
      } catch (err: any) {
        console.error('Error loading order:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const handleDispatchCreated = async () => {
    const updatedOrder = await getOrderById(orderId);
    const updatedDispatches = await getDispatchesByOrderId(orderId);
    if (updatedOrder) setOrder(updatedOrder);
    setDispatches(updatedDispatches);
  };

  if (loading) return <div className="p-6">Loading order...</div>;
  if (error || !order) {
    return (
      <div className="p-6 text-red-600">
        {error || 'Order not found'}
        <button className="block mt-4 text-blue-600 underline" onClick={() => navigate('/orders')}>
          Go back
        </button>
      </div>
    );
  }

  // Calculate total dispatch amount including commission
  const totalDispatchAmount = dispatches.reduce((sum, dispatch) => {
    // Find the corresponding item's commission
    const itemCommission = order.items.reduce((total, item) => total + item.commission, 0) / order.items.length;
    return sum + ((dispatch.dispatchPrice + itemCommission) * dispatch.quantity);
  }, 0);

  // Calculate total order amount including commission
  const totalOrderAmount = order.items.reduce((sum, item) => 
    sum + ((item.price + item.commission) * item.quantity), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Order {order.id}</h1>
        <p className="text-sm text-gray-500">
          {order.type === 'sale' ? 'Sales' : 'Purchase'} order • {formatDateForDisplay(order.date)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="font-medium capitalize">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Quantity</span>
                <span className="font-medium">{order.totalQuantity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining Quantity</span>
                <span className={`font-medium ${
                  order.remainingQuantity > 0 ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {order.remainingQuantity.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium">{formatCurrency(totalOrderAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Dispatch Amount</span>
                <span className="font-medium">{formatCurrency(totalDispatchAmount)}</span>
              </div>
              {order.notes && (
                <div className="pt-3 border-t">
                  <p className="text-gray-600">Notes:</p>
                  <p className="mt-1">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Items</h2>
            <div className="divide-y">
              {order.items?.map((item) => {
                const itemTotal = (item.price + item.commission) * item.quantity;
                return (
                  <div key={item.id} className="py-3">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{item.name}</span>
                      <span>{formatCurrency(itemTotal)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.quantity} {item.unit} • ₹{item.price}/unit + ₹{item.commission} commission
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Record Dispatch</h2>
            <DispatchForm order={order} onDispatchCreated={handleDispatchCreated} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Dispatch History</h2>
            <DispatchList dispatches={dispatches} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;