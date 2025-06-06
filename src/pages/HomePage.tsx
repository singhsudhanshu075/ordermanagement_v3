import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, PackageCheck, ClipboardList, Package, TrendingUp, TrendingDown, Box, Boxes } from 'lucide-react';
import { getDashboardStats } from '../services/statsService';
import { formatCurrency } from '../utils/helpers';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSalesAmount: 0,
    totalPurchaseAmount: 0,
    salesQuantity: 0,
    purchaseQuantity: 0,
    salesDispatched: 0,
    purchaseDispatched: 0,
    salesRemaining: 0,
    purchaseRemaining: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: new Date().toISOString().split('T')[0],
    supplier: '',
    customer: '',
    orderId: ''
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats(filters);
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Order Management System
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Track sales, purchases, and dispatches with ease
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              From Date
            </label>
            <input
              type="date"
              id="startDate"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              To Date
            </label>
            <input
              type="date"
              id="endDate"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
              Supplier
            </label>
            <input
              type="text"
              id="supplier"
              value={filters.supplier}
              onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
              placeholder="Search supplier..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
              Customer
            </label>
            <input
              type="text"
              id="customer"
              value={filters.customer}
              onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
              placeholder="Search customer..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">
              Order ID
            </label>
            <input
              type="text"
              id="orderId"
              value={filters.orderId}
              onChange={(e) => setFilters({ ...filters, orderId: e.target.value })}
              placeholder="Search order ID..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(stats.totalSalesAmount, 'lakhs')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-emerald-100 rounded-md p-3">
              <TrendingDown className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Purchases</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(stats.totalPurchaseAmount, 'lakhs')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <Box className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Sales Quantity</p>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">
                  Total: {stats.salesQuantity.toFixed(2)}
                </p>
                <p className="text-sm text-amber-600">
                  Dispatched: {stats.salesDispatched.toFixed(2)}
                </p>
                <p className="text-sm text-red-600">
                  Remaining: {stats.salesRemaining.toFixed(2)}
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
                  Total: {stats.purchaseQuantity.toFixed(2)}
                </p>
                <p className="text-sm text-amber-600">
                  Dispatched: {stats.purchaseDispatched.toFixed(2)}
                </p>
                <p className="text-sm text-red-600">
                  Remaining: {stats.purchaseRemaining.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div 
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 cursor-pointer"
          onClick={() => navigate('/sales')}
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">Record Sales</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create new sale orders with automatic ID generation
                </p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate('/sales')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
        
        <div 
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 cursor-pointer"
          onClick={() => navigate('/purchases')}
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-emerald-100 rounded-md p-3">
                <PackageCheck className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">Record Purchases</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create new purchase orders with automatic ID generation
                </p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate('/purchases')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                New Purchase
              </button>
            </div>
          </div>
        </div>
        
        <div 
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 cursor-pointer"
          onClick={() => navigate('/orders')}
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
                <ClipboardList className="h-8 w-8 text-amber-600" />
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">Manage Orders</h3>
                <p className="mt-2 text-sm text-gray-500">
                  View, search, and update all orders in one place
                </p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate('/orders')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;