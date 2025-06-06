import { Order, OrderStatus } from '../types';

// Generate a sequential order ID with JIPL prefix
export const generateOrderId = (type: 'sale' | 'purchase'): string => {
  const prefix = 'JIPL';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${type === 'sale' ? 'S' : 'P'}${year}${month}${day}${random}`;
};

// Format date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  return formatDate(new Date());
};

// Calculate order status based on remaining quantity
export const calculateOrderStatus = (order: Order): OrderStatus => {
  if (order.remainingQuantity === order.totalQuantity) {
    return 'pending';
  } else if (order.remainingQuantity === 0) {
    return 'completed';
  } else {
    return 'partial';
  }
};

// Format date to readable format (e.g., Jan 1, 2025)
export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format currency in lakhs
export const formatCurrency = (amount: number, format: 'lakhs' | 'regular' = 'regular'): string => {
  if (format === 'lakhs' && amount >= 100000) {
    const lakhs = (amount / 100000).toFixed(1);
    return `₹${lakhs} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

// Calculate dispatch amount for an order
export const calculateDispatchAmount = (order: Order): number => {
  return order.dispatches?.reduce((total, dispatch) => {
    // Get total commission from order items
    const totalCommission = order.items.reduce((sum, item) => sum + item.commission, 0);
    // Add dispatch price and commission, then multiply by dispatch quantity
    return total + ((dispatch.dispatchPrice + totalCommission) * dispatch.quantity);
  }, 0) || 0;
};