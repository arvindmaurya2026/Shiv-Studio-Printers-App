import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  History, 
  Camera, 
  Printer, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Customer, Order } from '../types';
import { addCustomer, updateCustomer, deleteCustomer } from '../dbService';

interface CustomerListProps {
  customers: Customer[];
  orders: Order[];
  onRefresh: () => void;
  onSelectOrder: (order: Order) => void;
  setActiveTab: (tab: string) => void;
}

export default function CustomerList({ 
  customers, 
  orders, 
  onRefresh,
  onSelectOrder,
  setActiveTab
}: CustomerListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // New Customer State
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtered Customers
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mobile.includes(searchQuery) ||
    (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) {
      setError('Name and Mobile number are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await addCustomer({ name, mobile, email, address });
      setName('');
      setMobile('');
      setEmail('');
      setAddress('');
      setIsAdding(false);
      onRefresh();
    } catch (err: any) {
      setError('Failed to add customer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editingCustomer.name || !editingCustomer.mobile) {
      setError('Name and Mobile number are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateCustomer(editingCustomer.id, {
        name: editingCustomer.name,
        mobile: editingCustomer.mobile,
        email: editingCustomer.email,
        address: editingCustomer.address
      });
      setEditingCustomer(null);
      onRefresh();
    } catch (err: any) {
      setError('Failed to update customer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will remove them from the system.`)) {
      try {
        await deleteCustomer(id);
        if (selectedCustomer?.id === id) {
          setSelectedCustomer(null);
        }
        onRefresh();
      } catch (err: any) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  const getCustomerOrders = (customerId: string) => {
    return orders.filter(o => o.customerId === customerId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Customers Table List (2/3 width) */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* Title and Add Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl">
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              <span>Customer Registry (CRM)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Total Customers: {customers.length}</p>
          </div>
          <button
            id="add-customer-btn"
            onClick={() => {
              setIsAdding(true);
              setEditingCustomer(null);
              setSelectedCustomer(null);
            }}
            className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Customer</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            id="customer-search-input"
            type="text"
            placeholder="Search by name, mobile, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 dark:focus:ring-indigo-500 text-slate-800 dark:text-white transition-all"
          />
        </div>

        {/* Customer Table Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      No customer records found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => {
                    const custOrders = getCustomerOrders(cust.id);
                    return (
                      <tr 
                        key={cust.id} 
                        className={`border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer transition-colors ${
                          selectedCustomer?.id === cust.id ? 'bg-amber-50/30 dark:bg-indigo-950/20' : ''
                        }`}
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setIsAdding(false);
                          setEditingCustomer(null);
                        }}
                      >
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-slate-800 dark:text-white">{cust.name}</p>
                          <span className="text-[10px] text-slate-400">Registered {new Date(cust.createdAt).toLocaleDateString('en-IN')}</span>
                        </td>
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                            <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="font-bold">{cust.mobile}</span>
                          </div>
                          {cust.email && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Mail className="h-2.5 w-2.5 shrink-0" />
                              <span className="truncate max-w-[130px]">{cust.email}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-start gap-1 text-slate-500 dark:text-slate-400 max-w-[180px]">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-tight">{cust.address || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2.5 py-1 rounded-full w-fit">
                            <History className="h-3.5 w-3.5 text-slate-400" />
                            <span>{custOrders.length}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            id={`edit-cust-${cust.id}`}
                            onClick={() => {
                              setEditingCustomer(cust);
                              setIsAdding(false);
                              setSelectedCustomer(null);
                            }}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors border border-slate-200/40 dark:border-slate-700/40 inline-flex items-center"
                            title="Edit details"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`delete-cust-${cust.id}`}
                            onClick={() => handleDelete(cust.id, cust.name)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-500 rounded-lg transition-colors border border-red-200/20 inline-flex items-center"
                            title="Delete customer"
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

      {/* Adding, Editing, or History Drawer Panel (1/3 width) */}
      <div className="space-y-4">
        
        {/* ADD CUSTOMER PANEL */}
        {isAdding && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Add Customer Details</h3>
              <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {error && <div className="p-2.5 mb-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">{error}</div>}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Full Name *</label>
                <input
                  id="add-cust-name-input"
                  type="text"
                  required
                  placeholder="Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Mobile Number *</label>
                <input
                  id="add-cust-mobile-input"
                  type="tel"
                  required
                  placeholder="7905256355"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Email (Optional)</label>
                <input
                  id="add-cust-email-input"
                  type="email"
                  placeholder="ramesh@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Residential Address</label>
                <textarea
                  id="add-cust-address-input"
                  placeholder="Khaga, Fatehpur, Uttar Pradesh"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white resize-none"
                />
              </div>

              <button
                id="add-cust-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating Record...' : 'Save Customer Record'}
              </button>
            </form>
          </div>
        )}

        {/* EDIT CUSTOMER PANEL */}
        {editingCustomer && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Modify Customer</h3>
              <button onClick={() => setEditingCustomer(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {error && <div className="p-2.5 mb-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">{error}</div>}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Full Name *</label>
                <input
                  id="edit-cust-name-input"
                  type="text"
                  required
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Mobile Number *</label>
                <input
                  id="edit-cust-mobile-input"
                  type="tel"
                  required
                  value={editingCustomer.mobile}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, mobile: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Email (Optional)</label>
                <input
                  id="edit-cust-email-input"
                  type="email"
                  value={editingCustomer.email || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Residential Address</label>
                <textarea
                  id="edit-cust-address-input"
                  value={editingCustomer.address || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  id="edit-cust-cancel"
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  id="edit-cust-save"
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CUSTOMER HISTORY & PROFILE VIEW PANEL */}
        {selectedCustomer && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs transition-colors">
            
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-4.5 w-4.5 text-amber-500" />
                <span>Customer Profile</span>
              </h3>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Profile fields */}
            <div className="space-y-3.5 mb-6 text-xs font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Customer Name</p>
                <p className="text-base font-black text-slate-800 dark:text-white leading-tight">{selectedCustomer.name}</p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 uppercase">Mobile Number</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1 mt-0.5">
                    <Phone className="h-3.5 w-3.5 text-amber-500" />
                    {selectedCustomer.mobile}
                  </p>
                </div>
                {selectedCustomer.email && (
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 uppercase">Email</p>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-300 truncate mt-0.5">
                      {selectedCustomer.email}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase">Address</p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {selectedCustomer.address || 'No address logged.'}
                </p>
              </div>
            </div>

            {/* Customer Booked Orders List */}
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-3">Order History</p>
              
              {getCustomerOrders(selectedCustomer.id).length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 text-xs font-semibold">
                  <p>No orders booked yet.</p>
                  <button
                    id="profile-book-order-btn"
                    onClick={() => setActiveTab('orders')}
                    className="mt-2 text-xs text-amber-500 hover:underline font-extrabold"
                  >
                    Create First Booking
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {getCustomerOrders(selectedCustomer.id).map((ord) => {
                    return (
                      <div 
                        key={ord.id}
                        onClick={() => {
                          onSelectOrder(ord);
                          setActiveTab('orders'); // Jump to orders view
                        }}
                        className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-amber-500/5 dark:hover:bg-indigo-500/10 hover:border-amber-500/30 dark:hover:border-indigo-500/30 transition-all flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-md font-mono">{ord.orderId}</span>
                            <span className="truncate max-w-[120px]">{ord.serviceType}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Target: {new Date(ord.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          </p>
                        </div>

                        <div className="text-right space-y-1 shrink-0 font-semibold">
                          <p className="font-extrabold text-slate-800 dark:text-white">₹{ord.totalAmount.toLocaleString('en-IN')}</p>
                          <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                            ord.status === 'Pending' 
                              ? 'bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400' 
                              : ord.status === 'Processing'
                              ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
          </div>
        )}

        {/* DEFAULT HELP INFORMATION */}
        {!isAdding && !editingCustomer && !selectedCustomer && (
          <div className="bg-slate-100 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500 font-semibold transition-colors">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 dark:text-slate-300 font-black uppercase mb-1">CRM Interactive Panel</p>
            <p>Click on any customer in the list to view their comprehensive profile details, mobile phone numbers, and full photography/printing order history logs.</p>
          </div>
        )}

      </div>

    </div>
  );
}
