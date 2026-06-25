import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  User, 
  Calendar, 
  IndianRupee, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  HelpCircle,
  FileDown,
  Building,
  ArrowRight,
  Info
} from 'lucide-react';
import { Invoice, Customer, Order, BusinessSettings } from '../types';
import { addInvoice, deleteInvoice } from '../dbService';
import InvoicePrintView from './InvoicePrintView';

interface InvoiceListProps {
  invoices: Invoice[];
  customers: Customer[];
  orders: Order[];
  settings: BusinessSettings;
  onRefresh: () => void;
}

export default function InvoiceList({ invoices, customers, orders, settings, onRefresh }: InvoiceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [customAdvance, setCustomAdvance] = useState<number>(0);
  const [customBalance, setCustomBalance] = useState<number>(0);
  const [customStatus, setCustomStatus] = useState<'Paid' | 'Unpaid' | 'Partially Paid'>('Unpaid');

  // Preview overlay state
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Filter orders by selected customer
  const customerOrders = orders.filter(o => o.customerId === selectedCustomerId);

  // Auto-populate when Customer is selected
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setSelectedOrderId('');
    setCustomAmount(0);
    setCustomAdvance(0);
    setCustomBalance(0);
    setCustomStatus('Unpaid');
  };

  // Auto-populate when Order is selected
  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    const orderObj = orders.find(o => o.orderId === orderId);
    if (orderObj) {
      setCustomAmount(orderObj.totalAmount);
      setCustomAdvance(orderObj.advancePayment);
      const balance = orderObj.balancePayment;
      setCustomBalance(balance);
      setDueDate(orderObj.deliveryDate);
      
      // Auto status setting
      if (balance === 0) {
        setCustomStatus('Paid');
      } else if (orderObj.advancePayment > 0) {
        setCustomStatus('Partially Paid');
      } else {
        setCustomStatus('Unpaid');
      }
    }
  };

  // Safe manual adjustments of amounts
  const handleAmountChange = (val: number) => {
    setCustomAmount(val);
    const balance = val - customAdvance;
    setCustomBalance(balance >= 0 ? balance : 0);
  };

  const handleAdvanceChange = (val: number) => {
    setCustomAdvance(val);
    const balance = customAmount - val;
    setCustomBalance(balance >= 0 ? balance : 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }
    if (!selectedOrderId) {
      setError('Please select an order reference.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const customerObj = customers.find(c => c.id === selectedCustomerId);
    
    try {
      const invoiceData = {
        customerId: selectedCustomerId,
        orderId: selectedOrderId,
        customerName: customerObj?.name || 'Unknown Customer',
        mobile: customerObj?.mobile || '',
        totalAmount: customAmount,
        advanceAmount: customAdvance,
        balanceAmount: customBalance,
        invoiceDate,
        dueDate: dueDate || invoiceDate,
        status: customStatus
      };

      await addInvoice(invoiceData);
      setSuccess('Invoice compiled and registered in database!');
      setShowCreateForm(false);
      
      // Reset form
      setSelectedCustomerId('');
      setSelectedOrderId('');
      setCustomAmount(0);
      setCustomAdvance(0);
      setCustomBalance(0);

      onRefresh();
    } catch (err: any) {
      setError('Failed to create invoice: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, invoiceNo: string) => {
    if (window.confirm(`Are you sure you want to delete Invoice ${invoiceNo}? This is non-reversible.`)) {
      try {
        await deleteInvoice(id);
        setSuccess(`Invoice ${invoiceNo} deleted successfully.`);
        onRefresh();
      } catch (err: any) {
        setError('Failed to delete invoice: ' + err.message);
      }
    }
  };

  // Stats Computations
  const totalInvoicesCount = invoices.length;
  const totalInvoicesAmount = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

  const pendingPaymentsAmount = invoices.reduce((acc, inv) => acc + inv.balanceAmount, 0);
  const pendingInvoicesCount = invoices.filter(inv => inv.balanceAmount > 0).length;

  const paidInvoicesCount = invoices.filter(inv => inv.status === 'Paid').length;
  const paidInvoicesAmount = invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + inv.totalAmount, 0);

  // Search and status filter algorithm
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.mobile?.includes(searchTerm) ||
      inv.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && inv.status === statusFilter;
  });

  return (
    <div className="space-y-6">

      {/* 1. Header Block with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl transition-colors">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-5.5 w-5.5 text-amber-500" />
            <span>Invoice &amp; Billing Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Generate compliant tax invoices, track settlements, and manage customer receipts</p>
        </div>
        <button
          id="toggle-create-invoice-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          {showCreateForm ? <X className="h-4.5 w-4.5" /> : <Plus className="h-4.5 w-4.5" />}
          <span>{showCreateForm ? 'Cancel Form' : 'Compile New Invoice'}</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-emerald-500 hover:text-emerald-700 font-bold text-sm">×</button>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold text-sm">×</button>
        </div>
      )}

      {/* 2. KPI Summary Panels */}
      {!showCreateForm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Total Invoices */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl transition-all shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Total Invoices</span>
              <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                ₹{totalInvoicesAmount.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-indigo-500 font-bold block">{totalInvoicesCount} invoices generated</span>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2: Pending Outstanding Balance */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl transition-all shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Pending Payments (Due)</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 leading-none">
                ₹{pendingPaymentsAmount.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-amber-500 font-bold block">{pendingInvoicesCount} outstanding collections</span>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3: Fully Paid Settled */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl transition-all shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Fully Settled Invoices</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                ₹{paidInvoicesAmount.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-emerald-500 font-bold block">{paidInvoicesCount} fully paid receipts</span>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>

        </div>
      )}

      {/* 3. Invoice Creation Form Modal */}
      {showCreateForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 transition-all space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
              <Plus className="h-5 w-5 text-amber-500 animate-pulse" />
              <span>Compile Customer Invoice</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">INV-YEAR-XXX generated on submit</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
            
            {/* Customer & Order selection left column */}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">1. Select Billing Customer *</label>
                <select
                  id="inv-customer-select"
                  required
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl dark:text-white"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">2. Select Order Reference *</label>
                <select
                  id="inv-order-select"
                  required
                  disabled={!selectedCustomerId}
                  value={selectedOrderId}
                  onChange={(e) => handleOrderChange(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl dark:text-white disabled:opacity-40"
                >
                  <option value="">{selectedCustomerId ? '-- Select Linked Order Job --' : 'Choose customer first'}</option>
                  {customerOrders.map(o => (
                    <option key={o.id} value={o.orderId}>{o.orderId} - {o.serviceType} (Total: ₹{o.totalAmount})</option>
                  ))}
                </select>
                {selectedCustomerId && customerOrders.length === 0 && (
                  <p className="text-[10px] text-amber-500 font-bold mt-1 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    <span>No orders exist for this customer yet. Please book an order first.</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Invoice Date *</label>
                  <input
                    id="inv-date-input"
                    type="date"
                    required
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Due Date *</label>
                  <input
                    id="inv-duedate-input"
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Payment Status *</label>
                <select
                  id="inv-status-select"
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl dark:text-white font-extrabold"
                >
                  <option value="Unpaid">🔴 Unpaid</option>
                  <option value="Partially Paid">🟡 Partially Paid</option>
                  <option value="Paid">🟢 Paid</option>
                </select>
              </div>
            </div>

            {/* Financial summaries & verification right column */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Order Value Adjustments</span>
                
                <div className="space-y-1">
                  <label className="text-slate-500 text-[11px]">Gross Work Cost (₹)</label>
                  <input
                    id="inv-form-total"
                    type="number"
                    value={customAmount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white text-sm font-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 text-[11px]">Advance Received (₹)</label>
                  <input
                    id="inv-form-advance"
                    type="number"
                    value={customAdvance}
                    onChange={(e) => handleAdvanceChange(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white text-sm font-black"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-black text-slate-500">Balance Outstanding:</span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    ₹{customBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Informational Hint block */}
              <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 p-3 rounded-xl text-[10.5px] leading-relaxed text-amber-700 dark:text-amber-400 font-medium">
                Creating an invoice registers a formal tax invoice record. You can print the receipt immediately or retrieve it at any time in the future from the invoices panel or reports.
              </div>

              {/* Submit triggers */}
              <div className="flex gap-2.5 pt-4">
                <button
                  id="inv-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  {loading ? 'Creating...' : 'Confirm & Save Invoice'}
                </button>
                <button
                  id="inv-form-cancel"
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl cursor-pointer text-xs"
                >
                  Cancel
                </button>
              </div>

            </div>

          </div>
        </form>
      )}

      {/* 4. Filter and Search Bar controls */}
      {!showCreateForm && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left search */}
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
            <input
              id="invoice-search-input"
              type="text"
              placeholder="Search Invoice #, Customer, Mobile or Job..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
            />
          </div>

          {/* Right status filter */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto shrink-0 pb-1 md:pb-0">
            {['All', 'Paid', 'Partially Paid', 'Unpaid'].map((status) => (
              <button
                id={`status-filter-${status}`}
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  statusFilter === status
                    ? 'bg-amber-500 text-white shadow-xs dark:bg-indigo-600'
                    : 'bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/60'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* 5. Invoices List Table */}
      {!showCreateForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  <th className="px-6 py-4">Invoice No</th>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Job Reference</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4">Work Value</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv) => {
                    const outstandingBalance = inv.balanceAmount;
                    
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                        {/* Invoice Number */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-black text-slate-850 dark:text-white block">
                            {inv.invoiceNo}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            Due: {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 block">
                            {inv.customerName}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            📞 {inv.mobile}
                          </span>
                        </td>

                        {/* Linked Order ID */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono font-bold text-[10px]">
                            {inv.orderId}
                          </span>
                        </td>

                        {/* Created At */}
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                          {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>

                        {/* Pricing */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-black text-slate-850 dark:text-white block">
                            ₹{inv.totalAmount.toLocaleString('en-IN')}
                          </span>
                          {outstandingBalance > 0 && (
                            <span className="text-[10px] text-amber-500 font-bold block">
                              Due: ₹{outstandingBalance.toLocaleString('en-IN')}
                            </span>
                          )}
                        </td>

                        {/* Status badge */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : inv.status === 'Partially Paid'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                              : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                          }`}>
                            {inv.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              id={`view-invoice-${inv.invoiceNo}`}
                              onClick={() => setViewingInvoice(inv)}
                              className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg transition-colors cursor-pointer"
                              title="Print / View Invoice"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </button>
                            <button
                              id={`delete-invoice-${inv.invoiceNo}`}
                              onClick={() => handleDelete(inv.id, inv.invoiceNo)}
                              className="p-1.5 bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                              title="Delete Invoice"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 dark:text-slate-500">
                      <FileText className="h-10 w-10 mx-auto opacity-30 mb-2" />
                      <p className="font-extrabold uppercase text-[10px] tracking-wider">No Invoices Located</p>
                      <p className="text-[11px] font-medium opacity-70">Create a customer invoice or modify your filter constraints.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Invoice Printable Overlay Modal */}
      {viewingInvoice && (
        <InvoicePrintView 
          invoice={viewingInvoice}
          orders={orders}
          settings={settings}
          onClose={() => setViewingInvoice(null)}
        />
      )}

    </div>
  );
}
