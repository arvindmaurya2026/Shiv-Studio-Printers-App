import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Receipt, 
  Camera, 
  Printer, 
  Calendar,
  IndianRupee,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus, OrderCategory } from '../types';
import { deleteOrder, updateOrder } from '../dbService';

interface OrderListProps {
  orders: Order[];
  onNewOrder: () => void;
  onEditOrder: (order: Order) => void;
  onSelectInvoice: (order: Order) => void;
  onRefresh: () => void;
}

export default function OrderList({ 
  orders, 
  onNewOrder, 
  onEditOrder, 
  onSelectInvoice,
  onRefresh 
}: OrderListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter calculations
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerMobile.includes(searchQuery) ||
      o.serviceType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || o.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDelete = async (id: string, orderId: string) => {
    if (window.confirm(`Are you sure you want to delete order ${orderId}? This cannot be undone.`)) {
      try {
        await deleteOrder(id);
        onRefresh();
      } catch (err: any) {
        alert('Failed to delete order: ' + err.message);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      await updateOrder(id, { status: newStatus });
      onRefresh();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const getStatusBadgeStyles = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200/40 dark:border-red-900/40';
      case 'Processing':
        return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/40 dark:border-amber-900/40';
      case 'Ready':
        return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-900/40';
      case 'Delivered':
        return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/40';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Title & Action Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl transition-colors">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <ShoppingCart className="h-5.5 w-5.5 text-amber-500" />
            <span>Studio &amp; Printing Orders</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage live bookings, workflow schedules, payments, and generated invoices</p>
        </div>
        <button
          id="list-add-order-btn"
          onClick={onNewOrder}
          className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Book New Service</span>
        </button>
      </div>

      {/* Filters Area */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl transition-colors text-xs font-semibold">
        
        {/* Search */}
        <div className="sm:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            id="order-search-input"
            type="text"
            placeholder="Search by ID, customer name, service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-800 dark:text-white transition-all"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <select
            id="filter-category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white appearance-none cursor-pointer"
          >
            <option value="all">All Service Sectors</option>
            <option value="studio">Studio Services</option>
            <option value="printing">Printing Press</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            ▼
          </div>
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            id="filter-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white appearance-none cursor-pointer"
          >
            <option value="all">All Work Statuses</option>
            <option value="Pending">🔴 Pending</option>
            <option value="Processing">🟡 Processing</option>
            <option value="Ready">🔵 Ready for Delivery</option>
            <option value="Delivered">🟢 Delivered</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            ▼
          </div>
        </div>

      </div>

      {/* Orders List Layout */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3 px-4">Order ID &amp; Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Service Details</th>
                <th className="py-3 px-4">Target Delivery</th>
                <th className="py-3 px-4">Financial Summary</th>
                <th className="py-3 px-4">Production Stage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No studio or printing orders matching your search queries.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const balance = ord.balancePayment;
                  return (
                    <tr key={ord.id} className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/40 dark:hover:bg-slate-800/25 transition-colors">
                      
                      {/* 1. Order ID & date */}
                      <td className="py-3.5 px-4">
                        <p className="font-extrabold text-slate-800 dark:text-white font-mono text-sm">{ord.orderId}</p>
                        <span className="text-[10px] text-slate-400">Booked {new Date(ord.createdAt).toLocaleDateString('en-IN')}</span>
                      </td>

                      {/* 2. Customer contact */}
                      <td className="py-3.5 px-4">
                        <p className="font-extrabold text-slate-800 dark:text-white leading-tight">{ord.customerName}</p>
                        <span className="text-[10px] text-slate-400">{ord.customerMobile}</span>
                      </td>

                      {/* 3. Service classified */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full ${
                            ord.category === 'studio' 
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' 
                              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                          }`}>
                            {ord.category === 'studio' ? <Camera className="h-3 w-3" /> : <Printer className="h-3 w-3" />}
                            {ord.category.toUpperCase()}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-white truncate">{ord.serviceType}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-snug">{ord.details}</p>
                      </td>

                      {/* 4. Target dates */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-bold">{new Date(ord.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>

                      {/* 5. Payments breakdown */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-500 dark:text-slate-400 text-[10px]">Total: ₹{ord.totalAmount.toLocaleString('en-IN')}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {balance > 0 ? (
                            <>
                              <span className="text-amber-600 dark:text-amber-400 font-extrabold text-xs">Bal: ₹{balance.toLocaleString('en-IN')}</span>
                              <span className="text-[9px] bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/20 px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wide">Due</span>
                            </>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase flex items-center gap-0.5">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Paid
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 6. Live status select */}
                      <td className="py-3.5 px-4">
                        <div className="relative">
                          <select
                            id={`status-dropdown-${ord.id}`}
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                            className={`p-1.5 pr-6 rounded-lg text-[10px] font-extrabold uppercase tracking-wide cursor-pointer focus:outline-hidden ${getStatusBadgeStyles(ord.status)}`}
                          >
                            <option value="Pending">🔴 Pending</option>
                            <option value="Processing">🟡 Process</option>
                            <option value="Ready">🔵 Ready</option>
                            <option value="Delivered">🟢 Done</option>
                          </select>
                        </div>
                      </td>

                      {/* 7. Action items */}
                      <td className="py-3.5 px-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          id={`invoice-btn-${ord.id}`}
                          onClick={() => onSelectInvoice(ord)}
                          className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors border border-amber-400/20 inline-flex items-center"
                          title="Generate Invoice / Receipt"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                        </button>
                        <button
                          id={`edit-order-btn-${ord.id}`}
                          onClick={() => onEditOrder(ord)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-800 dark:text-slate-300 rounded-lg transition-colors border border-slate-200/50 dark:border-slate-750 inline-flex items-center"
                          title="Edit booking"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          id={`delete-order-btn-${ord.id}`}
                          onClick={() => handleDelete(ord.id, ord.orderId)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-500 rounded-lg transition-colors border border-red-200/20 inline-flex items-center"
                          title="Delete booking"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
