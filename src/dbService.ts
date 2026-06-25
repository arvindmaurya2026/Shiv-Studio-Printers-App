import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './firebase';
import { Customer, Order, Expense, BusinessSettings, Invoice } from './types';

// Default settings for Shiv Studio & Printers
export const DEFAULT_SETTINGS: BusinessSettings = {
  id: "shiv_settings",
  businessName: "Shiv Studio & Printers",
  address: "Kishanpur Road, Over Bridge Ke Niche, Khaga, Fatehpur, Uttar Pradesh - 212655",
  mobile: "7905256355",
  email: "arvindeducation28@gmail.com",
  gstNo: "09ABCDE1234F1Z5",
  upiId: "7905256355@upi",
  termsAndConditions: "1. 50% advance payment is required for booking events and bulk printing.\n2. All photo albums and print files must be reviewed and approved before printing.\n3. The balance payment must be cleared at the time of order delivery.\n4. Standard delivery timelines: Cards (7-10 days), Mug/Sublimation (2-3 days).\n5. Thank you for choosing Shiv Studio & Printers!",
  logoUrl: "", // Optional base64 or empty
  qrCodeUrl: "" // UPI QR Code string (e.g. upi://pay?pa=7905256355@upi&pn=Shiv%20Studio)
};

// Seed Data
const SEED_CUSTOMERS: Omit<Customer, 'id'>[] = [
  { name: "Aditya Pratap Singh", mobile: "9876543210", email: "aditya.singh@gmail.com", address: "GTP Nagar, Khaga, Fatehpur", createdAt: "2026-06-10T10:00:00Z" },
  { name: "Ramesh Kumar Sahu", mobile: "8877665544", email: "ramesh.sahu@yahoo.com", address: "Kishanpur Road, Khaga", createdAt: "2026-06-12T11:30:00Z" },
  { name: "Sita Devi", mobile: "7766554433", email: "sita.devi@outlook.com", address: "Near Over Bridge, Khaga", createdAt: "2026-06-15T09:15:00Z" },
  { name: "Vijay Gupta", mobile: "9415256300", email: "guptavijay@gmail.com", address: "Main Market, Khaga, Fatehpur", createdAt: "2026-06-20T14:20:00Z" }
];

const SEED_ORDERS = (customerIds: string[]): Omit<Order, 'id'>[] => [
  {
    orderId: "SHIV-1001",
    customerId: customerIds[0] || "cust_1",
    customerName: "Aditya Pratap Singh",
    customerMobile: "9876543210",
    customerAddress: "GTP Nagar, Khaga, Fatehpur",
    category: "studio",
    serviceType: "Wedding Photography",
    details: "Premium Wedding Shoot & Full HD Digital Album (30 pages). Delivery includes 1 Hardcover Album and soft copy on USB.",
    orderDate: "2026-06-10",
    deliveryDate: "2026-07-15",
    totalAmount: 35000,
    advancePayment: 15000,
    balancePayment: 20000,
    status: "Processing",
    notes: "Requires drone camera on wedding day (July 2). Half payment advance done.",
    createdAt: "2026-06-10T10:15:00Z"
  },
  {
    orderId: "SHIV-1002",
    customerId: customerIds[1] || "cust_2",
    customerName: "Ramesh Kumar Sahu",
    customerMobile: "8877665544",
    customerAddress: "Kishanpur Road, Khaga",
    category: "printing",
    serviceType: "Wedding Cards",
    details: "400 Premium Wedding Cards with Golden Foil Embossing. Heavy cardstock 300 GSM.",
    orderDate: "2026-06-12",
    deliveryDate: "2026-06-28",
    totalAmount: 14000,
    advancePayment: 7000,
    balancePayment: 7000,
    status: "Ready",
    notes: "Design approved by customer. Ready for printing/collection.",
    createdAt: "2026-06-12T12:00:00Z"
  },
  {
    orderId: "SHIV-1003",
    customerId: customerIds[1] || "cust_2",
    customerName: "Ramesh Kumar Sahu",
    customerMobile: "8877665544",
    customerAddress: "Kishanpur Road, Khaga",
    category: "printing",
    serviceType: "Sublimation Print",
    details: "5 Customized Coffee Mugs with family photo prints for anniversary gifting.",
    orderDate: "2026-06-14",
    deliveryDate: "2026-06-17",
    totalAmount: 1250,
    advancePayment: 1250,
    balancePayment: 0,
    status: "Delivered",
    notes: "Delivered on time. Full payment received on UPI.",
    createdAt: "2026-06-14T09:40:00Z"
  },
  {
    orderId: "SHIV-1004",
    customerId: customerIds[2] || "cust_3",
    customerName: "Sita Devi",
    customerMobile: "7766554433",
    customerAddress: "Near Over Bridge, Khaga",
    category: "studio",
    serviceType: "Passport Photos",
    details: "32 Copies of Passport Size Photos, Matte finish with white background.",
    orderDate: "2026-06-15",
    deliveryDate: "2026-06-15",
    totalAmount: 120,
    advancePayment: 120,
    balancePayment: 0,
    status: "Delivered",
    notes: "Delivered instantly.",
    createdAt: "2026-06-15T09:30:00Z"
  },
  {
    orderId: "SHIV-1005",
    customerId: customerIds[3] || "cust_4",
    customerName: "Vijay Gupta",
    customerMobile: "9415256300",
    customerAddress: "Main Market, Khaga, Fatehpur",
    category: "printing",
    serviceType: "Visiting Cards",
    details: "1000 Matte Laminated Visiting Cards, Dual-sided printing.",
    orderDate: "2026-06-20",
    deliveryDate: "2026-06-25",
    totalAmount: 950,
    advancePayment: 500,
    balancePayment: 450,
    status: "Pending",
    notes: "Logo files emailed. Draft layout review pending.",
    createdAt: "2026-06-20T14:35:00Z"
  }
];

const SEED_EXPENSES: Omit<Expense, 'id'>[] = [
  { title: "Monthly Office Rent", amount: 6500, category: "Rent", date: "2026-06-01", notes: "Paid to landlord.", createdAt: "2026-06-01T08:00:00Z" },
  { title: "HP Photo Ink Cartridges", amount: 4800, category: "Paper & Ink", date: "2026-06-05", notes: "Bought from distributor in Fatehpur.", createdAt: "2026-06-05T12:00:00Z" },
  { title: "Electricity Bill", amount: 2450, category: "Electricity", date: "2026-06-10", notes: "June bill.", createdAt: "2026-06-10T10:00:00Z" },
  { title: "Staff Salary - Studio Assistant", amount: 10000, category: "Salaries", date: "2026-06-15", notes: "Part-time operator.", createdAt: "2026-06-15T18:00:00Z" },
  { title: "Premium Glossy Paper Packs", amount: 3200, category: "Paper & Ink", date: "2026-06-18", notes: "5 Packs of A4 Photo paper.", createdAt: "2026-06-18T11:00:00Z" },
  { title: "Tea & Snacks", amount: 750, category: "Tea & Snacks", date: "2026-06-22", notes: "Monthly staff & customer refreshments.", createdAt: "2026-06-22T17:00:00Z" }
];

/**
 * Check and Seed Database if Empty
 */
export async function checkAndSeedDatabase() {
  try {
    // 1. Business Settings
    const settingsDocRef = doc(db, 'settings', 'shiv_settings');
    const settingsSnap = await getDoc(settingsDocRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsDocRef, DEFAULT_SETTINGS);
      console.log('Seeded Settings');
    }

    // 2. Customers
    const customersCol = collection(db, 'customers');
    const customersSnap = await getDocs(query(customersCol, limit(1)));
    let currentCustomerIds: string[] = [];

    if (customersSnap.empty) {
      console.log('No customers found. Seeding database...');
      // Add customers and capture IDs
      for (const cust of SEED_CUSTOMERS) {
        const docRef = await addDoc(customersCol, cust);
        currentCustomerIds.push(docRef.id);
      }

      // Add seed orders using these captured IDs
      const ordersCol = collection(db, 'orders');
      const seedOrdersList = SEED_ORDERS(currentCustomerIds);
      const createdOrders: any[] = [];
      for (const ord of seedOrdersList) {
        const docRef = await addDoc(ordersCol, ord);
        createdOrders.push({ id: docRef.id, ...ord });
      }

      // Add seed expenses
      const expensesCol = collection(db, 'expenses');
      for (const exp of SEED_EXPENSES) {
        await addDoc(expensesCol, exp);
      }

      // Add seed invoices linked to the created orders
      const invoicesCol = collection(db, 'invoices');
      const currentYear = new Date().getFullYear();
      
      const seedInvoices = [
        {
          invoiceNo: `INV-${currentYear}-001`,
          customerId: currentCustomerIds[0] || 'cust_1',
          orderId: createdOrders[0]?.orderId || 'SHIV-1001',
          customerName: "Aditya Pratap Singh",
          mobile: "9876543210",
          totalAmount: 35000,
          advanceAmount: 15000,
          balanceAmount: 20000,
          invoiceDate: "2026-06-10",
          dueDate: "2026-07-10",
          status: "Partially Paid" as const,
          createdAt: "2026-06-10T10:20:00Z"
        },
        {
          invoiceNo: `INV-${currentYear}-002`,
          customerId: currentCustomerIds[1] || 'cust_2',
          orderId: createdOrders[1]?.orderId || 'SHIV-1002',
          customerName: "Ramesh Kumar Sahu",
          mobile: "8877665544",
          totalAmount: 14000,
          advanceAmount: 7000,
          balanceAmount: 7000,
          invoiceDate: "2026-06-12",
          dueDate: "2026-06-25",
          status: "Partially Paid" as const,
          createdAt: "2026-06-12T12:05:00Z"
        },
        {
          invoiceNo: `INV-${currentYear}-003`,
          customerId: currentCustomerIds[1] || 'cust_2',
          orderId: createdOrders[2]?.orderId || 'SHIV-1003',
          customerName: "Ramesh Kumar Sahu",
          mobile: "8877665544",
          totalAmount: 1250,
          advanceAmount: 1250,
          balanceAmount: 0,
          invoiceDate: "2026-06-14",
          dueDate: "2026-06-14",
          status: "Paid" as const,
          createdAt: "2026-06-14T09:45:00Z"
        },
        {
          invoiceNo: `INV-${currentYear}-004`,
          customerId: currentCustomerIds[3] || 'cust_4',
          orderId: createdOrders[4]?.orderId || 'SHIV-1005',
          customerName: "Vijay Gupta",
          mobile: "9415256300",
          totalAmount: 950,
          advanceAmount: 500,
          balanceAmount: 450,
          invoiceDate: "2026-06-20",
          dueDate: "2026-06-30",
          status: "Partially Paid" as const,
          createdAt: "2026-06-20T14:40:00Z"
        }
      ];

      for (const inv of seedInvoices) {
        await addDoc(invoicesCol, inv);
      }

      console.log('Database seeded successfully with invoices!');
    }
  } catch (error) {
    console.error('Error seeding database: ', error);
  }
}

/**
 * Settings Functions
 */
export async function getBusinessSettings(): Promise<BusinessSettings> {
  try {
    const settingsDocRef = doc(db, 'settings', 'shiv_settings');
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as BusinessSettings;
    }
    return DEFAULT_SETTINGS;
  } catch (e) {
    console.error(e);
    return DEFAULT_SETTINGS;
  }
}

export async function updateBusinessSettings(settings: Omit<BusinessSettings, 'id'>): Promise<void> {
  const settingsDocRef = doc(db, 'settings', 'shiv_settings');
  await setDoc(settingsDocRef, settings);
}

/**
 * Customers Functions
 */
export async function getCustomers(): Promise<Customer[]> {
  const colRef = collection(db, 'customers');
  const snap = await getDocs(query(colRef, orderBy('createdAt', 'desc')));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
}

export async function addCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
  const colRef = collection(db, 'customers');
  const newCust = {
    ...customer,
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(colRef, newCust);
  return { id: docRef.id, ...newCust } as Customer;
}

export async function updateCustomer(id: string, customer: Partial<Customer>): Promise<void> {
  const docRef = doc(db, 'customers', id);
  await updateDoc(docRef, customer);
}

export async function deleteCustomer(id: string): Promise<void> {
  const docRef = doc(db, 'customers', id);
  await deleteDoc(docRef);
}

/**
 * Orders Functions
 */
export async function getOrders(): Promise<Order[]> {
  const colRef = collection(db, 'orders');
  const snap = await getDocs(query(colRef, orderBy('createdAt', 'desc')));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

export async function addOrder(order: Omit<Order, 'id' | 'orderId' | 'createdAt'>): Promise<Order> {
  const colRef = collection(db, 'orders');
  
  // Generate human-readable order ID: SHIV-{Next Number}
  const allOrders = await getOrders();
  let nextNum = 1001;
  if (allOrders.length > 0) {
    const ids = allOrders
      .map(o => parseInt(o.orderId.replace('SHIV-', ''), 10))
      .filter(num => !isNaN(num));
    if (ids.length > 0) {
      nextNum = Math.max(...ids) + 1;
    }
  }
  const orderId = `SHIV-${nextNum}`;

  const newOrder = {
    ...order,
    orderId,
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(colRef, newOrder);
  return { id: docRef.id, ...newOrder } as Order;
}

export async function updateOrder(id: string, order: Partial<Order>): Promise<void> {
  const docRef = doc(db, 'orders', id);
  await updateDoc(docRef, order);
}

export async function deleteOrder(id: string): Promise<void> {
  const docRef = doc(db, 'orders', id);
  await deleteDoc(docRef);
}

/**
 * Expenses Functions
 */
export async function getExpenses(): Promise<Expense[]> {
  const colRef = collection(db, 'expenses');
  const snap = await getDocs(query(colRef, orderBy('date', 'desc')));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
}

export async function addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
  const colRef = collection(db, 'expenses');
  const newExp = {
    ...expense,
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(colRef, newExp);
  return { id: docRef.id, ...newExp } as Expense;
}

export async function deleteExpense(id: string): Promise<void> {
  const docRef = doc(db, 'expenses', id);
  await deleteDoc(docRef);
}

/**
 * Invoices Functions
 */
export async function getInvoices(): Promise<Invoice[]> {
  const colRef = collection(db, 'invoices');
  const snap = await getDocs(query(colRef, orderBy('createdAt', 'desc')));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
}

export async function addInvoice(invoice: Omit<Invoice, 'id' | 'invoiceNo' | 'createdAt'>): Promise<Invoice> {
  const colRef = collection(db, 'invoices');
  
  // Generate invoice number: INV-YYYY-001
  const currentYear = new Date().getFullYear();
  const allInvoices = await getInvoices();
  const prefix = `INV-${currentYear}-`;
  const yearInvoices = allInvoices.filter(inv => inv.invoiceNo && inv.invoiceNo.startsWith(prefix));
  
  let nextNum = 1;
  if (yearInvoices.length > 0) {
    const nums = yearInvoices.map(inv => {
      const parts = inv.invoiceNo.split('-');
      const numPart = parts[parts.length - 1];
      return parseInt(numPart, 10);
    }).filter(n => !isNaN(n));
    if (nums.length > 0) {
      nextNum = Math.max(...nums) + 1;
    }
  }
  const invoiceNo = `${prefix}${String(nextNum).padStart(3, '0')}`;

  const newInvoice = {
    ...invoice,
    invoiceNo,
    createdAt: new Date().toISOString()
  };
  
  const docRef = await addDoc(colRef, newInvoice);
  return { id: docRef.id, ...newInvoice } as Invoice;
}

export async function deleteInvoice(id: string): Promise<void> {
  const docRef = doc(db, 'invoices', id);
  await deleteDoc(docRef);
}
