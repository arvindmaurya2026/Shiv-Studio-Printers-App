import React, { useState } from 'react';
import { 
  ReceiptIndianRupee, 
  Plus, 
  Trash2, 
  Calendar, 
  Coins, 
  Tag, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Expense } from '../types';
import { addExpense, deleteExpense } from '../dbService';

interface ExpenseTrackerProps {
  expenses: Expense[];
  onRefresh: () => void;
}

const EXPENSE_CATEGORIES = [
  'Rent',
  'Electricity',
  'Paper & Ink',
  'Equipment',
  'Salaries',
  'Marketing',
  'Tea & Snacks',
  'Other'
] as const;

export default function ExpenseTracker({ expenses, onRefresh }: ExpenseTrackerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7) // "YYYY-MM"
  );

  // New Expense State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<typeof EXPENSE_CATEGORIES[number]>('Paper & Ink');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Calculations
  const filteredExpenses = expenses.filter(e => {
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    const matchesMonth = !selectedMonth || e.date.startsWith(selectedMonth);
    return matchesCategory && matchesMonth;
  });

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0 || !date) {
      setError('Please provide a title, valid positive amount, and date.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await addExpense({ title, amount, category, date, notes });
      setTitle('');
      setAmount(0);
      setCategory('Paper & Ink');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      onRefresh();
    } catch (err: any) {
      setError('Failed to log expense: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the expense: "${name}"?`)) {
      try {
        await deleteExpense(id);
        onRefresh();
      } catch (err: any) {
        alert('Failed to delete expense: ' + err.message);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Log New Expense (1/3 width) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs transition-colors h-fit">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Coins className="h-4.5 w-4.5 text-red-500" />
            <span>Log Shop Expense</span>
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Record immediate overheads, utility payments, or raw materials</p>
        </div>

        {error && (
          <div className="p-2.5 mb-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1">Expense Description *</label>
            <input
              id="exp-title-input"
              type="text"
              required
              placeholder="e.g. Glossy paper bundle pack, electricity bill..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Amount (INR) *</label>
              <input
                id="exp-amount-input"
                type="number"
                min={0}
                required
                placeholder="₹0"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl font-bold dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Category Type *</label>
              <select
                id="exp-category-select"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white appearance-none cursor-pointer"
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Expense Date *</label>
              <input
                id="exp-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Notes (Optional)</label>
              <input
                id="exp-notes-input"
                type="text"
                placeholder="Paid via PhonePe"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
              />
            </div>
          </div>

          <button
            id="exp-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>{loading ? 'Logging Overhead...' : 'Log Expense Amount'}</span>
          </button>
        </form>
      </div>

      {/* Expense Listing & Reporting (2/3 width) */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* Statistics Banner */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl flex items-center justify-between transition-colors">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Selected Month Overheads</p>
              <h3 className="text-xl font-black text-red-500">₹{totalExpense.toLocaleString('en-IN')}</h3>
              <p className="text-[9px] text-slate-400">Month: {selectedMonth || 'All Time'}</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-xl">
              <ReceiptIndianRupee className="h-5.5 w-5.5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl flex items-center justify-between transition-colors">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Logged Items Count</p>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">{filteredExpenses.length}</h3>
              <p className="text-[9px] text-slate-400">Items matching current filters</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl">
              <FileSpreadsheet className="h-5.5 w-5.5" />
            </div>
          </div>
        </div>

        {/* Filters bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 transition-colors text-xs font-semibold">
          
          <div className="flex-1">
            <label className="block text-slate-400 mb-1">Filter by Month</label>
            <input
              id="exp-month-filter"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white"
            />
          </div>

          <div className="flex-1">
            <label className="block text-slate-400 mb-1">Filter by Category</label>
            <select
              id="exp-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white cursor-pointer"
            >
              <option value="all">All Category Overheads</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Expenses Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-400">
                      No expense logs found matching selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-extrabold text-slate-800 dark:text-white leading-tight">{exp.title}</p>
                        {exp.notes && <span className="text-[10px] text-slate-400">{exp.notes}</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/20 px-2 py-0.5 rounded-full">
                          <Tag className="h-2.5 w-2.5" />
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-red-500">
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          id={`delete-exp-${exp.id}`}
                          onClick={() => handleDelete(exp.id, exp.title)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg border border-transparent hover:border-red-200/20 inline-flex items-center"
                          title="Delete expense"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
