import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOrders } from '../services/orderService';
import { Order } from '../types';
import { formatDateForDisplay, formatCurrency } from '../utils/helpers';
import { Package, Truck, Search, Filter, X, ChevronDown, Box, TrendingUp, TrendingDown } from 'lucide-react';
import OrderList from '../components/OrderList';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'purchase'>('all');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerFilter, setCustomerFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const allOrders = await getAllOrders();
        allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(allOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadOrders();
  }, []);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setTypeFilter('all');
    setStatusFilters([]);
    setStartDate('');
    setEndDate(new Date().toISOString().split('T')[0]);
    setCustomerFilter('');
    setSupplierFilter('');
  };

  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      order.id.toLowerCase().includes(query) ||
      (order.customer?.toLowerCase().includes(query) || false) ||
      (order.supplier?.toLowerCase().includes(query) || false);
    
    if (!matchesSearch) return false;
    if (typeFilter !== 'all' && order.type !== typeFilter) return false;
    if (statusFilters.length > 0 && !statusFilters.includes(order.status)) return false;
    if (startDate && order.date < startDate) return false;
    if (endDate && order.date > endDate) return false;
    if (customerFilter && (!order.customer || !order.customer.toLowerCase().includes(customerFilter.toLowerCase()))) return false;
    if (supplierFilter && (!order.supplier || !order.supplier.toLowerCase().includes(supplierFilter.toLowerCase()))) return false;
    
    return true;
  });

  const handleRowClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  // Calculate KPI metrics
  const salesOrders = filteredOrders.filter(order => order.type === 'sale');
  const purchaseOrders = filteredOrders.filter(order => order.type === 'purchase');

  const totalSalesQuantity = salesOrders.reduce((sum, order) => sum + order.totalQuantity, 0);
  const totalSalesDispatched = salesOrders.reduce((sum, order) => sum + (order.totalQuantity - order.remainingQuantity), 0);
  const totalSalesRemaining = salesOrders.reduce((sum, order) => sum + order.remainingQuantity, 0);

  const totalPurchaseQuantity = purchaseOrders.reduce((sum, order) => sum + order.totalQuantity, 0);
  const totalPurchaseDispatched = purchaseOrders.reduce((sum, order) => sum + (order.totalQuantity - order.remainingQuantity), 0);
  const totalPurchaseRemaining = purchaseOrders.reduce((sum, order) => sum + order.remainingQuantity, 0);

  const totalSalesAmount = salesOrders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => 
      itemSum + ((item.price + item.commission) * item.quantity), 0), 0);

  const totalSalesCommission = salesOrders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => 
      itemSum + (item.commission * item.quantity), 0), 0);

  const totalPurchaseAmount = purchaseOrders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => 
      itemSum + ((item.price + item.commission) * item.quantity), 0), 0);

  const totalPurchaseCommission = purchaseOrders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => 
      itemSum + (item.commission * item.quantity), 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Manage Orders</h1>
      
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search orders..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-700">Filters</h3>
            <button 
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Order Type</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'sale' | 'purchase')}
              >
                <option value="all">All Types</option>
                <option value="sale">Sales</option>
                <option value="purchase">Purchases</option>
              </select>
            </div>
            
            <div className="relative" ref={statusDropdownRef}>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <button
                type="button"
                className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm mt-1"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              >
                <span className="block truncate">
                  {statusFilters.length === 0 
                    ? 'All Statuses' 
                    : statusFilters.length === 1 
                    ? statusFilters[0].charAt(0).toUpperCase() + statusFilters[0].slice(1)
                    : `${statusFilters.length} statuses selected`}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </span>
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {['pending', 'partial', 'completed', 'cancelled'].map((status) => (
                    <div
                      key={status}
                      className="relative py-2 pl-3 pr-9 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleStatusFilterChange(status)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={statusFilters.includes(status)}
                          onChange={() => {}}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-3 block font-normal capitalize">
                          {status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                placeholder="Filter by customer..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                placeholder="Filter by supplier..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">From Date</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">To Date</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <Box className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Sales Quantity</p>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">
                  Total: {totalSalesQuantity.toFixed(2)}
                </p>
                <p className="text-sm text-amber-600">
                  Dispatched: {totalSalesDispatched.toFixed(2)}
                </p>
                <p className="text-sm text-red-600">
                  Remaining: {totalSalesRemaining.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-emerald-100 rounded-md p-3">
              <Box className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Purchase Quantity</p>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">
                  Total: {totalPurchaseQuantity.toFixed(2)}
                </p>
                <p className="text-sm text-amber-600">
                  Dispatched: {totalPurchaseDispatched.toFixed(2)}
                </p>
                <p className="text-sm text-red-600">
                  Remaining: {totalPurchaseRemaining.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Sales Amount</p>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(totalSalesAmount)}
                </p>
                <p className="text-sm text-gray-600">
                  Commission: {formatCurrency(totalSalesCommission)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-emerald-100 rounded-md p-3">
              <TrendingDown className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Purchase Amount</p>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(totalPurchaseAmount)}
                </p>
                <p className="text-sm text-gray-600">
                  Commission: {formatCurrency(totalPurchaseCommission)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or create a new order
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/sales')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Sale
            </button>
            <button
              onClick={() => navigate('/purchases')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Create Purchase
            </button>
          </div>
        </div>
      ) : (
        <OrderList orders={filteredOrders} onOrderSelect={handleRowClick} />
      )}
    </div>
  );
};

export default OrdersPage;