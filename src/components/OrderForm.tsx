import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Camera, 
  Printer, 
  Coins, 
  Calendar, 
  UserPlus,
  PlusCircle,
  FileText
} from 'lucide-react';
import { Customer, Order, OrderCategory, OrderStatus } from '../types';
import { addOrder, updateOrder } from '../dbService';

interface OrderFormProps {
  customers: Customer[];
  editingOrder: Order | null;
  onClose: () => void;
  onRefresh: () => void;
  onAddCustomerRedirect: () => void;
}

const STUDIO_SERVICES = [
  'Wedding Photography',
  'Pre-Wedding',
  'Birthday Events',
  'Passport Photos',
  'Album Orders',
  'Photo Frame Orders'
];

const PRINTING_SERVICES = [
  'Visiting Cards',
  'Wedding Cards',
  'Pamphlets',
  'Xerox',
  'Lamination',
  'Sublimation Print'
];

export default function OrderForm({ 
  customers, 
  editingOrder, 
  onClose, 
  onRefresh,
  onAddCustomerRedirect
}: OrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [category, setCategory] = useState<OrderCategory>('studio');
  const [serviceType, setServiceType] = useState('');
  const [details, setDetails] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [advancePayment, setAdvancePayment] = useState<number>(0);
  const [status, setStatus] = useState<OrderStatus>('Pending');
  const [notes, setNotes] = useState('');

  // Hydrate fields if editing
  useEffect(() => {
    if (editingOrder) {
      setSelectedCustomerId(editingOrder.customerId);
      setCategory(editingOrder.category);
      setServiceType(editingOrder.serviceType);
      setDetails(editingOrder.details);
      setOrderDate(editingOrder.orderDate);
      setDeliveryDate(editingOrder.deliveryDate);
      setTotalAmount(editingOrder.totalAmount);
      setAdvancePayment(editingOrder.advancePayment);
      setStatus(editingOrder.status);
      setNotes(editingOrder.notes || '');
    } else {
      // Set default service type
      setServiceType(STUDIO_SERVICES[0]);
      // Set default delivery date to today + 5 days
      const defDelivery = new Date();
      defDelivery.setDate(defDelivery.getDate() + 5);
      setDeliveryDate(defDelivery.toISOString().split('T')[0]);
    }
  }, [editingOrder]);

  // Adjust serviceType if category changes
  const handleCategoryChange = (cat: OrderCategory) => {
    setCategory(cat);
    if (cat === 'studio') {
      setServiceType(STUDIO_SERVICES[0]);
    } else {
      setServiceType(PRINTING_SERVICES[0]);
    }
  };

  const balancePayment = Math.max(0, totalAmount - advancePayment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomerId) {
      setError('Please select a customer or add one first.');
      return;
    }

    if (!serviceType) {
      setError('Please select a service type.');
      return;
    }

    if (!deliveryDate) {
      setError('Please specify a delivery date.');
      return;
    }

    setLoading(true);

    const selectedCust = customers.find(c => c.id === selectedCustomerId);
    if (!selectedCust) {
      setError('Selected customer could not be found.');
      setLoading(false);
      return;
    }

    const orderData = {
      customerId: selectedCustomerId,
      customerName: selectedCust.name,
      customerMobile: selectedCust.mobile,
      customerAddress: selectedCust.address,
      category,
      serviceType,
      details,
      orderDate,
      deliveryDate,
      totalAmount,
      advancePayment,
      balancePayment,
      status,
      notes
    };

    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, orderData);
      } else {
        await addOrder(orderData);
      }
      onRefresh();
      onClose();
    } catch (err: any) {
      setError('Error saving order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="order-form-panel" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-colors">
      
      {/* Header */}
      <div className="bg-linear-to-r from-amber-500 via-orange-500 to-indigo-600 px-6 py-4 text-white flex items-center justify-between">
        <div>
          <h2 className="text-base font-black uppercase tracking-wider">
            {editingOrder ? `Edit Booking (${editingOrder.orderId})` : 'New Booking Order'}
          </h2>
          <p className="text-[10px] text-amber-100 tracking-wide font-medium">Shiv Studio &amp; Printers Order Management System</p>
        </div>
        <button 
          id="close-order-form-btn"
          onClick={onClose} 
          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
        
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-600 dark:text-red-400 rounded-xl">
            {error}
          </div>
        )}

        {/* 1. Customer Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
              <User className="h-4.5 w-4.5 text-amber-500" />
              <span>Customer Information *</span>
            </h3>
            <button
              id="inline-add-customer-btn"
              type="button"
              onClick={onAddCustomerRedirect}
              className="text-[10px] font-bold text-amber-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Register New Customer</span>
            </button>
          </div>

          <div className="relative">
            <select
              id="form-customer-select"
              required
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white appearance-none cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="">-- Choose Registered Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.mobile}) {c.address ? `- ${c.address}` : ''}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
              ▼
            </div>
          </div>
        </div>

        {/* 2. Order Classification */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
            <PlusCircle className="h-4.5 w-4.5 text-amber-500" />
            <span>Select Service Classification *</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              id="cat-studio-btn"
              type="button"
              onClick={() => handleCategoryChange('studio')}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all font-extrabold ${
                category === 'studio'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Camera className="h-5.5 w-5.5" />
              <span>Studio Services</span>
            </button>
            <button
              id="cat-printing-btn"
              type="button"
              onClick={() => handleCategoryChange('printing')}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all font-extrabold ${
                category === 'printing'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Printer className="h-5.5 w-5.5" />
              <span>Printing Press</span>
            </button>
          </div>
        </div>

        {/* 3. Service Sub-type */}
        <div className="space-y-3">
          <label className="block text-slate-500 dark:text-slate-400">Service Category Type *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(category === 'studio' ? STUDIO_SERVICES : PRINTING_SERVICES).map((service) => (
              <button
                id={`service-${service.replace(/\s+/g, '-').toLowerCase()}`}
                key={service}
                type="button"
                onClick={() => setServiceType(service)}
                className={`p-2.5 rounded-xl text-xs border font-extrabold text-center truncate ${
                  serviceType === service
                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-slate-850 dark:border-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-850/50 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {service}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Service Details Specification */}
        <div className="space-y-2">
          <label className="block text-slate-500 dark:text-slate-400">
            Order Specifications &amp; Dimensions *
          </label>
          <textarea
            id="form-order-details"
            required
            rows={3}
            placeholder="e.g. Card size: 300 GSM Matte finish, quantity: 500, photo album style: glossy 30 pages..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white resize-none"
          />
        </div>

        {/* 5. Schedule & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Booking Order Date</span>
            </label>
            <input
              id="form-order-date"
              type="date"
              required
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
            />
          </div>
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Expected Delivery Date *</span>
            </label>
            <input
              id="form-delivery-date"
              type="date"
              required
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
            />
          </div>
        </div>

        {/* 6. Pricing and Payments */}
        <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
            <Coins className="h-4.5 w-4.5 text-amber-500" />
            <span>Pricing &amp; Advanced Payments</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Total Amount (INR) *</label>
              <input
                id="form-total-amount"
                type="number"
                min={0}
                required
                value={totalAmount || ''}
                onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                placeholder="₹0"
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl font-bold dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Advance Payment (INR)</label>
              <input
                id="form-advance-payment"
                type="number"
                min={0}
                value={advancePayment || ''}
                onChange={(e) => setAdvancePayment(parseFloat(e.target.value) || 0)}
                placeholder="₹0"
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl font-bold dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Balance Due (Auto-calculated)</label>
              <div className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-amber-600 dark:text-amber-400 text-sm">
                ₹{balancePayment.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* 7. Status & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1">Production Stage Status *</label>
            <select
              id="form-order-status"
              required
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white appearance-none cursor-pointer"
            >
              <option value="Pending">🔴 Pending / Draft</option>
              <option value="Processing">🟡 Processing / Active Production</option>
              <option value="Ready">🔵 Ready for Collection</option>
              <option value="Delivered">🟢 Delivered &amp; Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1">Administrative Notes</label>
            <input
              id="form-order-notes"
              type="text"
              placeholder="e.g. Paid via PhonePe, urgent wedding booklet..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            id="form-cancel-btn"
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
          >
            Cancel
          </button>
          <button
            id="form-submit-btn"
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-linear-to-r from-amber-500 to-orange-500 dark:from-indigo-600 dark:to-indigo-500 hover:opacity-95 text-white font-extrabold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
          >
            <FileText className="h-4.5 w-4.5" />
            <span>{loading ? 'Processing...' : editingOrder ? 'Update Booking' : 'Save & Book Order'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
