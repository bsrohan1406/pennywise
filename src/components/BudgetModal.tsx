import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category, Budget } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (b: {
    category_id: number;
    month: string;
    amount: number;
    id?: number;
  }) => Promise<void>;
  categories: Category[];
  initialData?: Budget | null;
  currentMonth: string;
}

export const BudgetModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialData,
  currentMonth,
}) => {
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [month, setMonth] = useState(currentMonth);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expenseCategories = categories.filter((c) => c.type === 'Expense');

  useEffect(() => {
    if (initialData) {
      setCategoryId(initialData.category_id);
      setMonth(initialData.month);
      setAmount((initialData.budget_amount || initialData.amount || '').toString());
    } else {
      if (expenseCategories.length > 0) {
        setCategoryId(expenseCategories[0].id);
      } else {
        setCategoryId('');
      }
      setMonth(currentMonth);
      setAmount('');
    }
    setError(null);
  }, [initialData, isOpen, currentMonth]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Budget allocation amount must be greater than zero');
      return;
    }
    if (!categoryId) {
      setError('Please select an expense category');
      return;
    }
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      setError('Please select a valid month in YYYY-MM format');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave({
        id: initialData?.id,
        category_id: Number(categoryId),
        month,
        amount: numAmount,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget allocation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div>
            <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              Budget Planning
            </span>
            <h2 className="text-xl font-bold text-white">
              {initialData ? 'Edit Budget Allocation' : 'Set Category Budget'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Expense Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Budget Month *
            </label>
            <input
              type="month"
              required
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Spending Limit / Target *
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-base font-semibold"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Update Budget' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
