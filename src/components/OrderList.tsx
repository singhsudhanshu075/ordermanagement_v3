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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Order ID
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                Type
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                Date
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Customer/Supplier
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                Total Qty
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                Status
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Payment Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => onOrderSelect(order.id)}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150 touch-manipulation"
              >
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                  <div className="flex items-center">
                    {order.type === 'sale' ? (
                      <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 flex-shrink-0" />
                    ) : (
                      <Package className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 mr-2 flex-shrink-0" />
                    )}
                    <span className="hidden md:inline">{order.id}</span>
                    <span className="md:hidden">{order.id.slice(-8)}</span>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 capitalize">
                  {order.type}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                  <span className="hidden sm:inline">{formatDateForDisplay(order.date)}</span>
                  <span className="sm:hidden">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </td>
                <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-500">
                  <div className="max-w-[100px] sm:max-w-none truncate">
                    {order.type === 'sale' ? order.customer : order.supplier}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                  {order.totalQuantity?.toFixed(1)}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    <span className="hidden sm:inline">{order.status}</span>
                    <span className="sm:hidden">{order.status.charAt(0).toUpperCase()}</span>
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.paymentStatus)}`}>
                    <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    <span className="hidden sm:inline">{order.paymentStatus}</span>
                    <span className="sm:hidden">{order.paymentStatus.charAt(0).toUpperCase()}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile scroll hint */}
      <div className="sm:hidden bg-gray-50 px-4 py-2 text-center">
        <p className="text-xs text-gray-500">← Scroll horizontally to see more details →</p>
      </div>
    </div>
  );
};

export default OrderList;