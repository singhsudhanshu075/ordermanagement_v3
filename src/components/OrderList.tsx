import React from 'react';
import { Package, Truck, CreditCard } from 'lucide-react';
import { Order } from '../types';
import { formatDateForDisplay } from '../utils/helpers';

interface OrderListProps {
  orders: Order[];
  onOrderSelect: (id: string) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onOrderSelect }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No orders found</p>
      </div>
    );
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Mobile Card View */}
      <div className="block sm:hidden">
        <div className="divide-y divide-gray-200">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => onOrderSelect(order.id)}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 touch-manipulation"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {order.type === 'sale' ? (
                    <Truck className="h-5 w-5 text-blue-600 mr-2" />
                  ) : (
                    <Package className="h-5 w-5 text-emerald-600 mr-2" />
                  )}
                  <span className="font-medium text-gray-900 text-sm">
                    {order.id.slice(-8)}...
                  </span>
                </div>
                <div className="flex gap-1">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="capitalize">{order.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span>{formatDateForDisplay(order.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact:</span>
                  <span className="truncate max-w-32">
                    {order.type === 'sale' ? order.customer : order.supplier}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantity:</span>
                  <span>{order.totalQuantity?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Payment:</span>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.paymentStatus)}`}>
                    <CreditCard className="h-3 w-3 mr-1" />
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer/Supplier
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Qty
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => onOrderSelect(order.id)}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center">
                    {order.type === 'sale' ? (
                      <Truck className="h-5 w-5 text-blue-600 mr-2" />
                    ) : (
                      <Package className="h-5 w-5 text-emerald-600 mr-2" />
                    )}
                    <span className="hidden lg:inline">{order.id}</span>
                    <span className="lg:hidden">{order.id.slice(-8)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {order.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateForDisplay(order.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.type === 'sale' ? order.customer : order.supplier}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.totalQuantity?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.paymentStatus)}`}>
                    <CreditCard className="h-4 w-4 mr-1" />
                    {order.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;