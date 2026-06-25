import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { Customer, Order, Expense, BusinessSettings, Invoice } from './types';
import { 
  getCustomers, 
  getOrders, 
  getExpenses, 
  getBusinessSettings, 
  getInvoices,
  checkAndSeedDatabase,
  DEFAULT_SETTINGS
} from './dbService';

// Import Components
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import OrderList from './components/OrderList';
import OrderForm from './components/OrderForm';
import InvoiceList from './components/InvoiceList';
import ExpenseTracker from './components/ExpenseTracker';
import Reports from './components/Reports';
import SettingsPage from './components/SettingsPage';
import InvoicePrint from './components/InvoicePrint';

import { Camera, Printer, Sparkles, Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Database States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);

  // App Navigation States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Form Panel Toggles
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Order | null>(null);

  // 1. Firebase Authentication Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  // 2. Fetch Data from Firestore once user is authenticated
  const fetchAllData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Run automatic seed check (adds sample business if collections are empty)
      await checkAndSeedDatabase();

      // Parallel data fetching
      const [fetchedCustomers, fetchedOrders, fetchedExpenses, fetchedSettings, fetchedInvoices] = await Promise.all([
        getCustomers(),
        getOrders(),
        getExpenses(),
        getBusinessSettings(),
        getInvoices()
      ]);

      setCustomers(fetchedCustomers);
      setOrders(fetchedOrders);
      setExpenses(fetchedExpenses);
      setSettings(fetchedSettings);
      setInvoices(fetchedInvoices);
    } catch (e) {
      console.error('Error fetching data: ', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  // 3. Dark Mode Handler
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-semibold">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-amber-500 animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-slate-400">Verifying Admin Credentials...</p>
        </div>
      </div>
    );
  }

  // If not logged in, render Secure Login Component
  if (!user) {
    return <Login onLoginSuccess={() => {}} />;
  }

  // Render Loading spinner during initial data fetch
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="text-center space-y-3 font-semibold">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-amber-500 text-white rounded-lg animate-bounce">
              <Camera className="h-6 w-6" />
            </div>
            <div className="p-2 bg-indigo-600 text-white rounded-lg -ml-1.5 animate-bounce [animation-delay:0.2s]">
              <Printer className="h-6 w-6" />
            </div>
          </div>
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Shiv Studio &amp; Printers</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
            <span>Syncing Cloud Storage...</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(tab) => {
        setActiveTab(tab);
        setShowOrderForm(false);
        setEditingOrder(null);
        setViewingInvoice(null);
      }} 
      darkMode={darkMode} 
      setDarkMode={setDarkMode}
      settings={settings}
    >
      
      {/* Dynamic Tabs Renderer */}
      
      {/* 1. DASHBOARD VIEW */}
      {activeTab === 'dashboard' && (
        <Dashboard 
          customers={customers}
          orders={orders}
          expenses={expenses}
          invoices={invoices}
          setActiveTab={setActiveTab}
          onNewOrder={() => {
            setActiveTab('orders');
            setShowOrderForm(true);
            setEditingOrder(null);
          }}
          onNewCustomer={() => {
            setActiveTab('customers');
          }}
          onNewExpense={() => {
            setActiveTab('expenses');
          }}
        />
      )}

      {/* 2. CUSTOMERS VIEW */}
      {activeTab === 'customers' && (
        <CustomerList 
          customers={customers}
          orders={orders}
          onRefresh={fetchAllData}
          onSelectOrder={(order) => {
            setViewingInvoice(order);
          }}
          setActiveTab={setActiveTab}
        />
      )}

      {/* 3. ORDERS VIEW */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          
          {/* Booking Order Modal/Form Overlay */}
          {showOrderForm && (
            <OrderForm 
              customers={customers}
              editingOrder={editingOrder}
              onClose={() => {
                setShowOrderForm(false);
                setEditingOrder(null);
              }}
              onRefresh={fetchAllData}
              onAddCustomerRedirect={() => {
                setActiveTab('customers');
              }}
            />
          )}

          {/* Printable Invoice Overlay */}
          {viewingInvoice && (
            <InvoicePrint 
              order={viewingInvoice}
              settings={settings}
              onClose={() => setViewingInvoice(null)}
            />
          )}

          {/* Display general list when form is closed */}
          {!showOrderForm && !viewingInvoice && (
            <OrderList 
              orders={orders}
              onNewOrder={() => {
                setEditingOrder(null);
                setShowOrderForm(true);
              }}
              onEditOrder={(order) => {
                setEditingOrder(order);
                setShowOrderForm(true);
              }}
              onSelectInvoice={(order) => {
                setViewingInvoice(order);
              }}
              onRefresh={fetchAllData}
            />
          )}

        </div>
      )}

      {/* 4. INVOICES VIEW */}
      {activeTab === 'invoices' && (
        <InvoiceList 
          invoices={invoices}
          customers={customers}
          orders={orders}
          settings={settings}
          onRefresh={fetchAllData}
        />
      )}

      {/* 5. EXPENSE TRACKER VIEW */}
      {activeTab === 'expenses' && (
        <ExpenseTracker 
          expenses={expenses}
          onRefresh={fetchAllData}
        />
      )}

      {/* 5. AUDITING REPORTS VIEW */}
      {activeTab === 'reports' && (
        <Reports 
          orders={orders}
          expenses={expenses}
          customers={customers}
        />
      )}

      {/* 6. BUSINESS SETTINGS VIEW */}
      {activeTab === 'settings' && (
        <SettingsPage 
          settings={settings}
          onRefresh={fetchAllData}
        />
      )}

    </Layout>
  );
}
