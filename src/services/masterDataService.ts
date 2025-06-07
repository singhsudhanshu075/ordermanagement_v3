import { supabase } from '../lib/supabase';
import { Product, Customer, Supplier } from '../types';

// Product functions
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;

  return (data || []).map(product => ({
    id: product.id,
    name: product.name,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    userId: product.user_id
  }));
};

export const createProduct = async (name: string): Promise<Product> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session?.user) {
    throw new Error('User must be logged in to create a product');
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: name.trim(),
      user_id: session.session.user.id
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    userId: data.user_id
  };
};

// Customer functions
export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;

  return (data || []).map(customer => ({
    id: customer.id,
    name: customer.name,
    contactPerson: customer.contact_person,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    createdAt: customer.created_at,
    updatedAt: customer.updated_at,
    userId: customer.user_id
  }));
};

export const createCustomer = async (customerData: Partial<Customer>): Promise<Customer> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session?.user) {
    throw new Error('User must be logged in to create a customer');
  }

  const { data, error } = await supabase
    .from('customers')
    .insert({
      name: customerData.name?.trim(),
      contact_person: customerData.contactPerson?.trim(),
      phone: customerData.phone?.trim(),
      email: customerData.email?.trim(),
      address: customerData.address?.trim(),
      user_id: session.session.user.id
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    contactPerson: data.contact_person,
    phone: data.phone,
    email: data.email,
    address: data.address,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    userId: data.user_id
  };
};

// Supplier functions
export const getSuppliers = async (): Promise<Supplier[]> => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;

  return (data || []).map(supplier => ({
    id: supplier.id,
    name: supplier.name,
    contactPerson: supplier.contact_person,
    phone: supplier.phone,
    email: supplier.email,
    address: supplier.address,
    createdAt: supplier.created_at,
    updatedAt: supplier.updated_at,
    userId: supplier.user_id
  }));
};

export const createSupplier = async (supplierData: Partial<Supplier>): Promise<Supplier> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session?.user) {
    throw new Error('User must be logged in to create a supplier');
  }

  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      name: supplierData.name?.trim(),
      contact_person: supplierData.contactPerson?.trim(),
      phone: supplierData.phone?.trim(),
      email: supplierData.email?.trim(),
      address: supplierData.address?.trim(),
      user_id: session.session.user.id
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    contactPerson: data.contact_person,
    phone: data.phone,
    email: data.email,
    address: data.address,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    userId: data.user_id
  };
};