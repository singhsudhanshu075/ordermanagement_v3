import { supabase } from '../lib/supabase';

export const getDashboardStats = async (filters: {
  startDate?: string;
  endDate?: string;
  supplier?: string;
  customer?: string;
  orderId?: string;
}) => {
  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      dispatches:dispatches(*)
    `);

  // Apply filters
  if (filters.startDate) {
    query = query.gte('date', filters.startDate);
  }
  
  if (filters.endDate) {
    query = query.lte('date', filters.endDate);
  }
  
  if (filters.supplier) {
    query = query.ilike('supplier', `%${filters.supplier}%`);
  }
  
  if (filters.customer) {
    query = query.ilike('customer', `%${filters.customer}%`);
  }
  
  if (filters.orderId) {
    query = query.ilike('id', `%${filters.orderId}%`);
  }

  const { data: orders, error } = await query;

  if (error) throw error;

  const salesOrders = orders?.filter(order => order.type === 'sale') || [];
  const purchaseOrders = orders?.filter(order => order.type === 'purchase') || [];

  // Calculate total receivable from dispatches
  const totalReceivable = orders?.reduce((sum, order) => {
    return sum + (order.dispatches?.reduce((dispatchSum, dispatch) => {
      const dispatchPrice = dispatch.dispatch_price || 0;
      const gaugeDifference = dispatch.gauge_difference || 0;
      const loadingCharge = dispatch.loading_charge || 0;
      const quantity = dispatch.quantity || 0;
      const taxRate = dispatch.tax_rate || 0;
      
      const baseAmount = (dispatchPrice + gaugeDifference + loadingCharge) * quantity;
      const taxAmount = baseAmount * (taxRate / 100);
      return dispatchSum + baseAmount + taxAmount;
    }, 0) || 0);
  }, 0) || 0;

  const stats = {
    totalSalesAmount: salesOrders
      .reduce((sum, order) => {
        const orderTotal = order.items.reduce((itemSum, item) => 
          itemSum + ((item.price + item.commission) * item.quantity), 0);
        return sum + orderTotal;
      }, 0) || 0,
    totalPurchaseAmount: purchaseOrders
      .reduce((sum, order) => {
        const orderTotal = order.items.reduce((itemSum, item) => 
          itemSum + ((item.price + item.commission) * item.quantity), 0);
        return sum + orderTotal;
      }, 0) || 0,
    salesQuantity: salesOrders.reduce((sum, order) => sum + order.total_quantity, 0) || 0,
    purchaseQuantity: purchaseOrders.reduce((sum, order) => sum + order.total_quantity, 0) || 0,
    salesDispatched: salesOrders.reduce((sum, order) => 
      sum + (order.dispatches?.reduce((dSum, dispatch) => dSum + (dispatch.quantity || 0), 0) || 0), 0) || 0,
    purchaseDispatched: purchaseOrders.reduce((sum, order) => 
      sum + (order.dispatches?.reduce((dSum, dispatch) => dSum + (dispatch.quantity || 0), 0) || 0), 0) || 0,
    salesRemaining: salesOrders.reduce((sum, order) => {
      const dispatched = order.dispatches?.reduce((dSum, dispatch) => dSum + (dispatch.quantity || 0), 0) || 0;
      return sum + (order.total_quantity - dispatched);
    }, 0) || 0,
    purchaseRemaining: purchaseOrders.reduce((sum, order) => {
      const dispatched = order.dispatches?.reduce((dSum, dispatch) => dSum + (dispatch.quantity || 0), 0) || 0;
      return sum + (order.total_quantity - dispatched);
    }, 0) || 0,
    totalReceivable
  };

  return stats;
};

export const getTotalReceivable = async (filters: {
  startDate?: string;
  endDate?: string;
  supplier?: string;
  customer?: string;
  orderId?: string;
}) => {
  let query = supabase
    .from('dispatches')
    .select(`
      dispatch_price,
      gauge_difference,
      loading_charge,
      quantity,
      tax_rate,
      order:orders!inner(
        id,
        date,
        customer,
        supplier,
        type
      )
    `);

  // Apply filters through the order relationship
  if (filters.startDate) {
    query = query.gte('order.date', filters.startDate);
  }
  
  if (filters.endDate) {
    query = query.lte('order.date', filters.endDate);
  }
  
  if (filters.supplier) {
    query = query.ilike('order.supplier', `%${filters.supplier}%`);
  }
  
  if (filters.customer) {
    query = query.ilike('order.customer', `%${filters.customer}%`);
  }
  
  if (filters.orderId) {
    query = query.ilike('order.id', `%${filters.orderId}%`);
  }

  const { data: dispatches, error } = await query;

  if (error) throw error;

  const totalReceivable = dispatches?.reduce((sum, dispatch) => {
    const dispatchPrice = dispatch.dispatch_price || 0;
    const gaugeDifference = dispatch.gauge_difference || 0;
    const loadingCharge = dispatch.loading_charge || 0;
    const quantity = dispatch.quantity || 0;
    const taxRate = dispatch.tax_rate || 0;
    
    const baseAmount = (dispatchPrice + gaugeDifference + loadingCharge) * quantity;
    const taxAmount = baseAmount * (taxRate / 100);
    return sum + baseAmount + taxAmount;
  }, 0) || 0;

  return totalReceivable;
};