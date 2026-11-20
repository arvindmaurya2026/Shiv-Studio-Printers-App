import React, { useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  FileSpreadsheet, 
  Printer, 
  TrendingDown, 
  Layers, 
  BadgeIndianRupee, 
  PieChart as PieIcon, 
  Receipt,
  Download,
  AlertCircle,
  HelpCircle,
  Coins
} from 'lucide-react';
import { Order, Expense, Customer } from '../types';

interface ReportsProps {
  orders: Order[];
  expenses: Expense[];
  customers: Customer[];
}

export default function Reports({ orders, expenses, customers }: ReportsProps) {
  const [reportTab, setReportTab] = useState<'daily' | 'monthly' | 'pl'>('pl');
  
  // Dates
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // "YYYY-MM"

  // 1. Calculations: Daily Report
  const dailyOrders = orders.filter(o => o.orderDate === selectedDay);
  const dailyExpenses = expenses.filter(e => e.date === selectedDay);

  const totalDailySales = dailyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalDailyCollected = dailyOrders.reduce((sum, o) => sum + o.advancePayment, 0);
  const totalDailyOutstanding = dailyOrders.reduce((sum, o) => sum + o.balancePayment, 0);
  const totalDailyExpenses = dailyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 2. Calculations: Monthly Report
  const monthlyOrders = orders.filter(o => o.createdAt.startsWith(selectedMonth));
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));

  const totalMonthlySales = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalMonthlyCollected = monthlyOrders.reduce((sum, o) => sum + o.advancePayment, 0);
  const totalMonthlyOutstanding = monthlyOrders.reduce((sum, o) => sum + o.balancePayment, 0);
  const totalMonthlyExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Profit and Loss calculations
  const grossProfit = totalMonthlySales;
  const netProfit = grossProfit - totalMonthlyExpenses;

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl transition-colors">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-5.5 w-5.5 text-indigo-500" />
            <span>Financial Statements &amp; Audit Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Generate daily sales slips, monthly cashflow audits, and Profit &amp; Loss statements</p>
        </div>
        <button
          id="print-report-btn"
          onClick={handlePrintReport}
          className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Printer className="h-4.5 w-4.5" />
          <span>Print Financial Sheet</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-1.5 rounded-xl">
        <button
          id="report-tab-pl"
          onClick={() => setReportTab('pl')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
            reportTab === 'pl'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          📊 Monthly Profit &amp; Loss Statement
        </button>
        <button
          id="report-tab-daily"
          onClick={() => setReportTab('daily')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
            reportTab === 'daily'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          🌅 Daily Business Ledger
        </button>
        <button
          id="report-tab-monthly"
          onClick={() => setReportTab('monthly')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
            reportTab === 'monthly'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          📅 Monthly Sales Breakdown
        </button>
      </div>

      {/* Report Auditing View Areas */}

      {/* VIEW: PROFIT AND LOSS STATEMENT */}
      {reportTab === 'pl' && (
        <div id="print-area-pl" className="space-y-6">
          
          {/* Select month row */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl text-xs font-bold">
            <span className="text-slate-500">Select Auditing Month:</span>
            <input
              id="pl-month-input"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white"
            />
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Gross Sales Booked</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">₹{totalMonthlySales.toLocaleString('en-IN')}</h3>
                <p className="text-[9px] text-slate-400">Advance Collected: ₹{totalMonthlyCollected.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-xl">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Shop Overheads</p>
                <h3 className="text-2xl font-black text-red-500">₹{totalMonthlyExpenses.toLocaleString('en-IN')}</h3>
                <p className="text-[9px] text-slate-400">Utility bills &amp; salaries</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-xl">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Net Income (P&amp;L)</p>
                <h3 className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  ₹{netProfit.toLocaleString('en-IN')}
                </h3>
                <p className="text-[9px] text-slate-400">{netProfit >= 0 ? 'Surplus Earned' : 'Loss Encountered'}</p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-xl">
                <BadgeIndianRupee className="h-6 w-6" />
              </div>
            </div>

          </div>

          {/* Statement details card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 transition-colors space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Statement of Profit &amp; Loss</h3>
              <p className="text-xs text-slate-400">Shiv Studio &amp; Printers | Khaga, Fatehpur, UP</p>
            </div>

            <div className="space-y-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/60 pb-2">
                <span>Revenue (A): Gross Booked Orders</span>
                <span className="font-bold text-slate-850 dark:text-white">₹{totalMonthlySales.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/60 pb-2 pl-4 text-slate-500 text-[11px]">
                <span>- Of which is cash collected as advances</span>
                <span>₹{totalMonthlyCollected.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/60 pb-2 pl-4 text-slate-500 text-[11px]">
                <span>- Of which is outstanding balance</span>
                <span>₹{totalMonthlyOutstanding.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/60 pb-2 text-red-500">
                <span>Operating Expenses (B): Overheads</span>
                <span className="font-bold">₹{totalMonthlyExpenses.toLocaleString('en-IN')}</span>
              </div>

              {monthlyExpenses.map(exp => (
                <div key={exp.id} className="flex justify-between border-b border-slate-50/20 pl-4 text-[11px] text-slate-400">
                  <span>- {exp.title} ({exp.category})</span>
                  <span>₹{exp.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}

              <div className="flex justify-between border-t-2 border-double border-slate-200 dark:border-slate-800 pt-3 text-sm font-black text-slate-800 dark:text-white">
                <span>Net Estimated Business Profit (A - B)</span>
                <span className={netProfit >= 0 ? "text-emerald-500" : "text-red-500"}>
                  ₹{netProfit.toLocaleString('en-IN')}
                </span>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* VIEW: DAILY BUSINESS LEDGER */}
      {reportTab === 'daily' && (
        <div id="print-area-daily" className="space-y-6">
          
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl text-xs font-bold">
            <span className="text-slate-500">Select Business Day:</span>
            <input
              id="daily-ledger-date-input"
              type="date"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sales ledger list */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs transition-colors">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                Daily Bookings Log (₹{totalDailySales.toLocaleString('en-IN')})
              </h3>
              {dailyOrders.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400 font-semibold">No bookings registered on this day.</p>
              ) : (
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto">
                  {dailyOrders.map(ord => (
                    <div key={ord.id} className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs font-semibold">
                      <div>
                        <p className="font-extrabold text-slate-800 dark:text-white">{ord.orderId} - {ord.customerName}</p>
                        <span className="text-[10px] text-slate-400">{ord.serviceType}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-800 dark:text-white font-extrabold">₹{ord.totalAmount}</p>
                        <span className="text-[10px] text-emerald-500">Adv: ₹{ord.advancePayment}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Overheads ledger list */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs transition-colors">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                Daily Shop Expenses Log (₹{totalDailyExpenses.toLocaleString('en-IN')})
              </h3>
              {dailyExpenses.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400 font-semibold">No expenses recorded on this day.</p>
              ) : (
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto">
                  {dailyExpenses.map(exp => (
                    <div key={exp.id} className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs font-semibold">
                      <div>
                        <p className="font-extrabold text-slate-800 dark:text-white">{exp.title}</p>
                        <span className="text-[10px] text-slate-400">{exp.category}</span>
                      </div>
                      <p className="font-bold text-red-500">₹{exp.amount}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* VIEW: MONTHLY SALES BREAKDOWN */}
      {reportTab === 'monthly' && (
        <div id="print-area-monthly" className="space-y-6">
          
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl text-xs font-bold">
            <span className="text-slate-500">Select Auditing Month:</span>
            <input
              id="breakdown-month-input"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs transition-colors">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              Orders Log Summary - {selectedMonth} (₹{totalMonthlySales.toLocaleString('en-IN')})
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-medium">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
                    <th className="py-2.5 px-4">Order ID</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Service Category</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Collected</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 dark:text-slate-300">
                  {monthlyOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No orders recorded during this month.
                      </td>
                    </tr>
                  ) : (
                    monthlyOrders.map(ord => (
                      <tr key={ord.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-white">{ord.orderId}</td>
                        <td className="py-3 px-4">{ord.orderDate}</td>
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">{ord.customerName}</td>
                        <td className="py-3 px-4">{ord.serviceType}</td>
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">₹{ord.totalAmount}</td>
                        <td className="py-3 px-4 text-emerald-600">₹{ord.advancePayment}</td>
                        <td className="py-3 px-4 uppercase font-extrabold text-[10px]">{ord.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
