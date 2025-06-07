export type OrderType = 'sale' | 'purchase';

export type OrderStatus = 'pending' | 'partial' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'partial' | 'completed';

export type PaymentMode = 'cash' | 'cheque' | 'bank_transfer' | 'upi';

export type ProductTypeCategory = 'sale' | 'purchase' | 'both';

export interface Order {
  id: string;
  type: OrderType;
  date: string;
  customer?: string;
  supplier?: string;
  items: OrderItem[];
  totalQuantity: number;
  remainingQuantity: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  dispatches?: Dispatch[];
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  commission: number;
}

export interface Dispatch {
  id: string;
  orderId: string;
  date: string;
  quantity: number;
  dispatchPrice: number;
  invoiceNumber?: string;
  notes?: string;
  createdAt: string;
  status?: OrderStatus;
  productType?: string;
  gaugeDifference?: number;
  loadingCharge?: number;
  taxRate?: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  order?: Order;
}

// Master data interfaces
export interface Product {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Customer {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface ProductType {
  id: string;
  name: string;
  gaugeDifference: number;
  type: ProductTypeCategory;
  createdAt: string;
  updatedAt: string;
  userId: string;
}