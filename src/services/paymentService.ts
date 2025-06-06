import { supabase } from '../lib/supabase';
import { Payment, PaymentStatus } from '../types';

interface CreatePaymentData {
  order_id: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  payment_status: PaymentStatus;
  reference_number?: string;
  notes?: string;
}

export const createPayment = async (paymentData: CreatePaymentData): Promise<Payment> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session?.user) {
    throw new Error('User must be logged in to create a payment');
  }

  // Start a transaction
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      order_id: paymentData.order_id,
      amount: paymentData.amount,
      payment_date: paymentData.payment_date,
      payment_mode: paymentData.payment_mode,
      payment_status: paymentData.payment_status,
      reference_number: paymentData.reference_number,
      notes: paymentData.notes,
      user_id: session.session.user.id
    })
    .select()
    .single();

  if (paymentError) {
    throw paymentError;
  }

  // Update order payment status
  const { error: orderError } = await supabase
    .from('orders')
    .update({ 
      payment_status: paymentData.payment_status,
      updated_at: new Date().toISOString()
    })
    .eq('id', paymentData.order_id);

  if (orderError) {
    throw orderError;
  }

  // Get updated order data
  const { data: orderData } = await supabase
    .from('orders')
    .select(`
      id,
      type,
      date,
      customer,
      supplier,
      total_quantity,
      payment_status,
      items:order_items(*)
    `)
    .eq('id', paymentData.order_id)
    .single();

  return {
    id: payment.id,
    orderId: payment.order_id,
    amount: payment.amount,
    paymentDate: payment.payment_date,
    paymentMode: payment.payment_mode,
    paymentStatus: payment.payment_status,
    referenceNumber: payment.reference_number,
    notes: payment.notes,
    createdAt: payment.created_at,
    order: orderData
  };
};

export const getPaymentsByOrderId = async (orderId: string): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      order:orders (
        id,
        type,
        date,
        customer,
        supplier,
        total_quantity,
        payment_status,
        items:order_items(*)
      )
    `)
    .eq('order_id', orderId)
    .order('payment_date', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(payment => ({
    id: payment.id,
    orderId: payment.order_id,
    amount: payment.amount,
    paymentDate: payment.payment_date,
    paymentMode: payment.payment_mode,
    paymentStatus: payment.payment_status,
    referenceNumber: payment.reference_number,
    notes: payment.notes,
    createdAt: payment.created_at,
    order: payment.order
  }));
};