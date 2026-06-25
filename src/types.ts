export type OrderStatus = 'Pending' | 'Processing' | 'Ready' | 'Delivered';
export type OrderCategory = 'studio' | 'printing';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface Order {
  id: string; // Firestore doc ID
  orderId: string; // Auto-generated human-readable ID e.g., "SHIV-1002"
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  category: OrderCategory;
  serviceType: string; // e.g. Wedding Photography, Pre-Wedding, Visiting Cards, Sublimation Print, etc.
  details: string; // Dimensions, custom notes, paper quality, print count, etc.
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  advancePayment: number;
  balancePayment: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'Rent' | 'Electricity' | 'Paper & Ink' | 'Equipment' | 'Salaries' | 'Marketing' | 'Tea & Snacks' | 'Other';
  date: string;
  notes?: string;
  createdAt: string;
}

export interface BusinessSettings {
  id: string;
  businessName: string;
  address: string;
  mobile: string;
  email: string;
  gstNo?: string;
  upiId: string; // For UPI payments
  qrCodeUrl?: string; // Text string/URI for payment QR
  logoUrl?: string; // Standard base64 logo or default icon
  termsAndConditions: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  customerId: string;
  orderId: string;
  customerName: string;
  mobile: string;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  invoiceDate: string;
  dueDate: string;
  createdAt: string;
  status: 'Paid' | 'Unpaid' | 'Partially Paid';
}
