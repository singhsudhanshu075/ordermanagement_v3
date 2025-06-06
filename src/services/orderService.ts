import { supabase } from '../lib/supabase';
import { Order, OrderType, Dispatch } from '../types';
import { generateOrderId, calculateOrderStatus, getTodayDate } from '../utils/helpers';

// Get all orders
export const getAllOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      dispatches:dispatches(*),
      payments(
        amount,
        payment_date,
        payment_status,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Calculate total quantity from items if not set
  const ordersWithQuantities = (data || []).map(order => {
    const totalQuantity = order.total_quantity || order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const dispatchedQuantity = order.dispatches?.reduce((sum, dispatch) => sum + (dispatch.quantity || 0), 0) || 0;
    const remainingQuantity = totalQuantity - dispatchedQuantity;

    // Get the latest payment based on created_at timestamp
    const latestPayment = order.payments?.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    return {
      ...order,
      totalQuantity,
      remainingQuantity,
      paymentStatus: latestPayment?.payment_status || order.payment_status || 'pending'
    };
  });

  return ordersWithQuantities;
};

// Get orders by type (sale or purchase)
export const getOrdersByType = async (type: OrderType): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      dispatches:dispatches(*),
      payments(
        amount,
        payment_date,
        payment_status,
        created_at
      )
    `)
    .eq('type', type)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Calculate total quantity from items if not set
  const ordersWithQuantities = (data || []).map(order => {
    const totalQuantity = order.total_quantity || order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const dispatchedQuantity = order.dispatches?.reduce((sum, dispatch) => sum + (dispatch.quantity || 0), 0) || 0;
    const remainingQuantity = totalQuantity - dispatchedQuantity;

    // Get the latest payment based on created_at timestamp
    const latestPayment = order.payments?.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    return {
      ...order,
      totalQuantity,
      remainingQuantity,
      paymentStatus: latestPayment?.payment_status || order.payment_status || 'pending'
    };
  });

  return ordersWithQuantities;
};

// Get order by ID
export const getOrderById = async (id: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      dispatches:dispatches(*),
      payments(
        amount,
        payment_date,
        payment_status,
        created_at
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  if (data) {
    const totalQuantity = data.total_quantity || data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const dispatchedQuantity = data.dispatches?.reduce((sum, dispatch) => sum + (dispatch.quantity || 0), 0) || 0;
    const remainingQuantity = totalQuantity - dispatchedQuantity;

    // Get the latest payment based on created_at timestamp
    const latestPayment = data.payments?.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    return {
      ...data,
      totalQuantity,
      remainingQuantity,
      paymentStatus: latestPayment?.payment_status || data.payment_status || 'pending'
    };
  }

  return null;
};

// Create a new order
export const createOrder = async (orderData: Partial<Order>, type: OrderType): Promise<Order> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session?.user) {
    return Promise.reject(new Error('Please log in to create an order.'));
  }

  const orderId = generateOrderId(type);
  
  // Calculate total quantity from items
  const totalQuantity = orderData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Start a transaction
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      type,
      date: orderData.date || getTodayDate(),
      customer: type === 'sale' ? orderData.customer : null,
      supplier: type === 'purchase' ? orderData.supplier : null,
      total_quantity: totalQuantity,
      remaining_quantity: totalQuantity,
      status: 'pending',
      payment_status: 'pending',
      notes: orderData.notes,
      user_id: session.session.user.id
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Insert order items
  if (orderData.items && orderData.items.length > 0) {
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        orderData.items.map(item => ({
          order_id: orderId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          commission: item.commission
        }))
      );

    if (itemsError) throw itemsError;
  }

  return {
    ...order,
    totalQuantity,
    remainingQuantity: totalQuantity,
    items: orderData.items || [],
    paymentStatus: 'pending'
  };
};

// Update an order
export const updateOrder = async (id: string, orderData: Partial<Order>): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .update({
      ...orderData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete an order
export const deleteOrder = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// Filter orders by date range
export const filterOrdersByDateRange = async (startDate: string, endDate: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      dispatches:dispatches(*),
      payments(
        amount,
        payment_date,
        payment_status,
        created_at
      )
    `)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) throw error;
  
  // Calculate total quantity from items if not set
  const ordersWithQuantities = (data || []).map(order => {
    const totalQuantity = order.total_quantity || order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const dispatchedQuantity = order.dispatches?.reduce((sum, dispatch) => sum + (dispatch.quantity || 0), 0) || 0;
    const remainingQuantity = totalQuantity - dispatchedQuantity;

    // Get the latest payment based on created_at timestamp
    const latestPayment = order.payments?.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    return {
      ...order,
      totalQuantity,
      remainingQuantity,
      paymentStatus: latestPayment?.payment_status || order.payment_status || 'pending'
    };
  });

  return ordersWithQuantities;
};

// Search orders
export const searchOrders = async (query: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      dispatches:dispatches(*),
      payments(
        amount,
        payment_date,
        payment_status,
        created_at
      )
    `)
    .or(`customer.ilike.%${query}%,supplier.ilike.%${query}%,id.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Calculate total quantity from items if not set
  const ordersWithQuantities = (data || []).map(order => {
    const totalQuantity = order.total_quantity || order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const dispatchedQuantity = order.dispatches?.reduce((sum, dispatch) => sum + (dispatch.quantity || 0), 0) || 0;
    const remainingQuantity = totalQuantity - dispatchedQuantity;

    // Get the latest payment based on created_at timestamp
    const latestPayment = order.payments?.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    return {
      ...order,
      totalQuantity,
      remainingQuantity,
      paymentStatus: latestPayment?.payment_status || order.payment_status || 'pending'
    };
  });

  return ordersWithQuantities;
};

// Create a new dispatch
export const createDispatch = async (orderId: string, dispatchData: Partial<Dispatch>): Promise<{ dispatch: Dispatch; order: Order }> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session?.user) {
    return Promise.reject(new Error('Please log in to create a dispatch.'));
  }

  // Create the dispatch
  const { data: dispatch, error: dispatchError } = await supabase
    .from('dispatches')
    .insert({
      order_id: orderId,
      date: dispatchData.date || getTodayDate(),
      quantity: dispatchData.quantity || 0,
      notes: dispatchData.notes,
      user_id: session.session.user.id,
      dispatch_price: dispatchData.dispatchPrice || 0,
      invoice_number: dispatchData.invoiceNumber
    })
    .select()
    .single();

  if (dispatchError) throw dispatchError;

  // Get the current order with all dispatches
  const { data: currentOrder, error: orderError } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      dispatches:dispatches(*),
      payments(
        amount,
        payment_date,
        payment_status,
        created_at
      )
    `)
    .eq('id', orderId)
    .single();

  if (orderError) throw orderError;

  // Calculate total dispatched quantity including the new dispatch
  const totalQuantity = currentOrder.total_quantity;
  const dispatchedQuantity = currentOrder.dispatches.reduce((sum, d) => sum + (d.quantity || 0), 0) + (dispatchData.quantity || 0);
  const remainingQuantity = totalQuantity - dispatchedQuantity;

  // Get the latest payment based on created_at timestamp
  const latestPayment = currentOrder.payments?.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];

  // Update order with new status and remaining quantity
  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update({
      remaining_quantity: remainingQuantity,
      status: dispatchData.status,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single();

  if (updateError) throw updateError;

  return {
    dispatch,
    order: {
      ...updatedOrder,
      totalQuantity,
      remainingQuantity,
      items: currentOrder.items,
      paymentStatus: latestPayment?.payment_status || updatedOrder.payment_status || 'pending'
    }
  };
};

// Get dispatches for an order
export const getDispatchesByOrderId = async (orderId: string): Promise<Dispatch[]> => {
  const { data, error } = await supabase
    .from('dispatches')
    .select('*')
    .eq('order_id', orderId)
    .order('date', { ascending: false });

  if (error) throw error;

  // Map snake_case from DB to camelCase for your UI
  const dispatches = (data || []).map(d => ({
    id: d.id,
    orderId: d.order_id,
    date: d.date,
    quantity: d.quantity,
    dispatchPrice: d.dispatch_price || 0,
    invoiceNumber: d.invoice_number || '',
    notes: d.notes,
    createdAt: d.created_at
  }));

  return dispatches;
};