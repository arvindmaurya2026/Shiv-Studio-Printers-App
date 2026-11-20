import React from 'react';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  ReceiptIndianRupee, 
  Camera, 
  Printer, 
  UserPlus, 
  PlusCircle, 
  Coins, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart, Pie } from 'recharts';
import { Customer, Order, Expense, Invoice } from '../types';

interface DashboardProps {
  customers: Customer[];
  orders: Order[];
  expenses: Expense[];
  invoices?: Invoice[]; // Optional fallback for safety
  setActiveTab: (tab: string) => void;
  onNewOrder: () => void;
  onNewCustomer: () => void;
  onNewExpense: () => void;
}

export default function Dashboard({
  customers,
  orders,
  expenses,
  invoices = [],
  setActiveTab,
  onNewOrder,
  onNewCustomer,
  onNewExpense
}: DashboardProps) {

  // Current date strings
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = new Date().toISOString().substring(0, 7); // "YYYY-MM"

  // 1. Core Metrics Calculations
  const totalOrders = orders.length;
  
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  const completedOrders = orders.filter(o => o.status === 'Ready' || o.status === 'Delivered').length;

  // Monthly Revenue (all orders created in this month)
  const monthlyRevenue = orders
    .filter(o => o.createdAt.startsWith(currentMonthStr))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Daily Revenue (all orders created today)
  const dailyRevenue = orders
    .filter(o => o.orderDate === todayStr)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Monthly Expense (expenses logged in this month)
  const monthlyExpense = expenses
    .filter(e => e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  // Today's Expense
  const dailyExpense = expenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  // Profit/Loss
  const netMonthlyProfit = monthlyRevenue - monthlyExpense;

  // 1.1 Invoice Metrics Calculations
  const totalInvoicesAmount = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const pendingInvoicesAmount = invoices.reduce((acc, inv) => acc + inv.balanceAmount, 0);
  const paidInvoicesAmount = invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + inv.totalAmount, 0);

  // 2. Prepare Chart Data
  // Last 7 days sales and expenses
  const getLast7DaysData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      const daySales = orders
        .filter(o => o.orderDate === dateStr)
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const dayExpenses = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);

      data.push({
        name: displayDate,
        Sales: daySales,
        Expenses: dayExpenses,
        Profit: daySales - dayExpenses
      });
    }
    return data;
  };

  const chartData = getLast7DaysData();

  // Category Distribution (Studio vs Printing)
  const getCategoryData = () => {
    const studioSales = orders
      .filter(o => o.category === 'studio')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const printingSales = orders
      .filter(o => o.category === 'printing')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return [
      { name: 'Studio Services', value: studioSales, color: '#f59e0b' },
      { name: 'Printing Press', value: printingSales, color: '#4f46e5' }
    ];
  };

  const categoryData = getCategoryData();

  // Upcoming deliveries sorted by delivery date
  const urgentOrders = orders
    .filter(o => o.status !== 'Delivered')
    .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase">Control Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time overview of Shiv Studio &amp; Printing Press</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            id="dash-quick-order"
            onClick={onNewOrder}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Book Studio/Print Order</span>
          </button>
          <button 
            id="dash-quick-customer"
            onClick={onNewCustomer}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
          <button 
            id="dash-quick-expense"
            onClick={onNewExpense}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors border border-slate-700"
          >
            <Coins className="h-4 w-4" />
            <span>Log Shop Expense</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div id="metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sales Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-colors">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Revenue</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800 dark:text-white">₹{monthlyRevenue.toLocaleString('en-IN')}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" />
                Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Today's: ₹{dailyRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Pending Deliveries Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-colors">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Orders</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800 dark:text-white">{pendingOrders}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                In Queue
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Total Bookings: {totalOrders}</p>
          </div>
          <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Expenses Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-colors">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Expenses</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800 dark:text-white">₹{monthlyExpense.toLocaleString('en-IN')}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center gap-0.5">
                <ArrowDownRight className="h-3 w-3" />
                Logged
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Today's: ₹{dailyExpense.toLocaleString('en-IN')}</p>
          </div>
          <div className="h-12 w-12 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400">
            <ReceiptIndianRupee className="h-6 w-6" />
          </div>
        </div>

        {/* Monthly Net Profit Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-colors">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estimated Profit</p>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black ${netMonthlyProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                ₹{netMonthlyProfit.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                P&amp;L Net
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Completed Orders: {completedOrders}</p>
          </div>
          <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Invoice & Billing Quick Stats Grid */}
      <div id="invoice-billing-quick-stats" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Invoice &amp; Billing Insights</span>
          </h3>
          <p className="text-[11px] text-slate-400">Overview of official invoices, outstanding payments, and collections</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Total Invoice Value</span>
            <p className="text-xl font-black text-slate-800 dark:text-white">₹{totalInvoicesAmount.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-indigo-500 font-semibold">{invoices.length} invoices issued</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Pending Payments (Due)</span>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400">₹{pendingInvoicesAmount.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-amber-500 font-semibold">{invoices.filter(inv => inv.balanceAmount > 0).length} outstanding</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Paid Settled Invoices</span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">₹{paidInvoicesAmount.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-emerald-500 font-semibold">{invoices.filter(inv => inv.status === 'Paid').length} paid receipts</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Cashflow Line/Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs transition-colors flex flex-col h-96">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Weekly Cashflow Tracker</h3>
              <p className="text-xs text-slate-400">Daily Sales vs Expenses over last 7 days</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300">Sales</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="text-slate-600 dark:text-slate-300">Expenses</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
                <Area type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Division Sales Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs transition-colors flex flex-col h-96">
          <div className="mb-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Department Sales</h3>
            <p className="text-xs text-slate-400">Revenue split between Studio &amp; Printing</p>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center relative">
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `₹${value.toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+24px)] text-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Gross</span>
                <p className="text-base font-black text-slate-800 dark:text-white">₹{(categoryData[0].value + categoryData[1].value).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Department legends with metrics */}
            <div className="w-full space-y-2 mt-4 text-xs font-semibold">
              {categoryData.map((dept, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                    <span className="text-slate-600 dark:text-slate-300">{dept.name}</span>
                  </div>
                  <span className="text-slate-800 dark:text-white">₹{dept.value.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Actionable Urgent deliveries list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500 animate-pulse" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Urgent Deliveries Queue</h3>
              <p className="text-xs text-slate-400">Pending &amp; processing orders sorted by earliest delivery date</p>
            </div>
          </div>
          <button 
            id="dash-view-orders"
            onClick={() => setActiveTab('orders')}
            className="text-xs font-bold text-amber-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            Manage Queue
          </button>
        </div>

        {urgentOrders.length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-400 font-medium">
            No pending or processing orders in the queue! Excellent job. 🎉
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Service Type</th>
                  <th className="py-2.5 px-3">Delivery Target</th>
                  <th className="py-2.5 px-3">Amount Due</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {urgentOrders.map((ord) => {
                  const isOverdue = new Date(ord.deliveryDate) < new Date();
                  return (
                    <tr key={ord.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-white">{ord.orderId}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800 dark:text-white">{ord.customerName}</p>
                        <span className="text-[10px] text-slate-400">{ord.customerMobile}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ord.category === 'studio' 
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' 
                            : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                        }`}>
                          {ord.category === 'studio' ? <Camera className="h-3 w-3" /> : <Printer className="h-3 w-3" />}
                          {ord.serviceType}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <p className={isOverdue ? "text-red-500 font-bold" : "text-slate-700 dark:text-slate-200"}>
                          {new Date(ord.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        {isOverdue && <span className="text-[9px] text-red-500 font-bold uppercase animate-pulse">OVERDUE</span>}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-white">
                        ₹{ord.balancePayment.toLocaleString('en-IN')}
                        {ord.balancePayment > 0 ? (
                          <span className="block text-[9px] text-amber-600 font-bold uppercase">Pending Pay</span>
                        ) : (
                          <span className="block text-[9px] text-emerald-600 font-bold uppercase">Paid Full</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                          ord.status === 'Pending' 
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/30' 
                            : ord.status === 'Processing'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/30'
                            : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/30'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
