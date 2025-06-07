import React from 'react';
import { Package, Truck, CreditCard, DollarSign } from 'lucide-react';
import { Order } from '../types';
import { formatDateForDisplay, formatCurrency } from '../utils/helpers';

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
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'partial':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  const getTypeColor = (type: string): string => {
    return type === 'sale' 
      ? 'bg-indigo-50 text-indigo-700' 
      : 'bg-teal-50 text-teal-700';
  };

  const getPriceColor = (amount: number): string => {
    if (amount > 500000) return 'text-emerald-700 font-bold';
    if (amount > 100000) return 'text-blue-700 font-semibold';
    if (amount > 50000) return 'text-indigo-700 font-medium';
    return 'text-slate-600 font-medium';
  };

  const calculateOrderPrice = (order: Order): number => {
    // Calculate total price (without commission) from order items
    return order.items?.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0) || 0;
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[120px] bg-blue-50">
                Order ID
              </th>
              <th scope="col" className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[80px] bg-purple-50">
                Type
              </th>
              <th scope="col" className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[100px] bg-cyan-50">
                Date
              </th>
              <th scope="col" className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[120px] bg-emerald-50">
                Customer/Supplier
              </th>
              <th scope="col" className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[100px] bg-amber-50">
                Total Qty
              </th>
              <th scope="col" className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[120px] bg-green-50">
                Price
              </th>
              <th scope="col" className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[100px] bg-orange-50">
                Status
              </th>
              <th scope="col" className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[120px] bg-rose-50">
                Payment Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {orders.map((order, index) => {
              const orderPrice = calculateOrderPrice(order);
              
              return (
                <tr
                  key={order.id}
                  onClick={() => onOrderSelect(order.id)}
                  className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 touch-manipulation border-b border-gray-100 ${
                    index % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'
                  }`}
                >
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 bg-blue-50/30">
                    <div className="flex items-center">
                      {order.type === 'sale' ? (
                        <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 flex-shrink-0" />
                      ) : (
                        <Package className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 mr-2 flex-shrink-0" />
                      )}
                      <span className="hidden md:inline font-mono text-blue-700">{order.id}</span>
                      <span className="md:hidden font-mono text-blue-700">{order.id.slice(-8)}</span>
                    </div>
                  </td>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium capitalize ${getTypeColor(order.type)} bg-purple-50/30`}>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold">
                      {order.type}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-slate-600 bg-cyan-50/30 font-medium">
                    <span className="hidden sm:inline">{formatDateForDisplay(order.date)}</span>
                    <span className="sm:hidden">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-slate-700 bg-emerald-50/30 font-medium">
                    <div className="max-w-[100px] sm:max-w-none truncate">
                      {order.type === 'sale' ? order.customer : order.supplier}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-slate-600 bg-amber-50/30 font-semibold">
                    <span className="text-amber-700">{order.totalQuantity?.toFixed(1)}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm bg-green-50/30">
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1 flex-shrink-0" />
                      <span className={`font-mono ${getPriceColor(orderPrice)}`}>
                        <span className="hidden sm:inline">{formatCurrency(orderPrice)}</span>
                        <span className="sm:hidden">₹{(orderPrice / 1000).toFixed(0)}k</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap bg-orange-50/30">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(order.status)}`}>
                      <span className="hidden sm:inline">{order.status}</span>
                      <span className="sm:hidden">{order.status.charAt(0).toUpperCase()}</span>
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap bg-rose-50/30">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getPaymentStatusColor(order.paymentStatus)}`}>
                      <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                      <span className="hidden sm:inline">{order.paymentStatus}</span>
                      <span className="sm:hidden">{order.paymentStatus.charAt(0).toUpperCase()}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Mobile scroll hint */}
      <div className="sm:hidden bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 text-center border-t border-blue-100">
        <p className="text-xs text-blue-600 font-medium">← Scroll horizontally to see more details →</p>
      </div>
    </div>
  );
};

export default OrderList;