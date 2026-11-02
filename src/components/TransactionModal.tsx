import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category, Transaction } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: {
    type: 'Income' | 'Expense';
    amount: number;
    transaction_date: string;
    category_id: number;
    description: string;
    id?: number;
  }) => Promise<void>;
  categories: Category[];
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialData,
}) => {
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setDate(initialData.transaction_date);
      setCategoryId(initialData.category_id);
      setDescription(initialData.description || '');
    } else {
      setType('Expense');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      const defaultCat = categories.find((c) => c.type === 'Expense');
      setCategoryId(defaultCat ? defaultCat.id : '');
      setDescription('');
    }
    setError(null);
  }, [initialData, isOpen, categories]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  // If currently selected category isn't in the filtered list, pick the first one
  const handleTypeChange = (newType: 'Income' | 'Expense') => {
    setType(newType);
    const valid = categories.filter((c) => c.type === newType);
    if (valid.length > 0) {
      setCategoryId(valid[0].id);
    } else {
      setCategoryId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount greater than zero');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    if (!date) {
      setError('Please choose a valid transaction date');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave({
        id: initialData?.id,
        type,
        amount: numAmount,
        transaction_date: date,
        category_id: Number(categoryId),
        description: description.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div>
            <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              {initialData ? 'Update Record' : 'New Transaction'}
            </span>
            <h2 className="text-xl font-bold text-white">
              {initialData ? 'Edit Transaction' : 'Record Transaction'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Transaction Flow
            </label>
            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleTypeChange('Expense')}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  type === 'Expense'
                    ? 'bg-rose-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Expense (Outflow)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('Income')}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  type === 'Income'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Income (Inflow)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Amount *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-base font-semibold"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm"
            >
              {filteredCategories.length === 0 && (
                <option value="">No {type.toLowerCase()} categories found</option>
              )}
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Description / Merchant (Optional)
            </label>
            <input
              type="text"
              maxLength={120}
              placeholder="e.g. Organic Market weekly groceries"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
            />
          </div>

          {/* Actions */}
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
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
