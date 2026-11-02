import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SavingsGoal } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (g: {
    name: string;
    target_amount: number;
    current_amount: number;
    id?: number;
  }) => Promise<void>;
  initialData?: SavingsGoal | null;
}

export const GoalModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTargetAmount(initialData.target_amount.toString());
      setCurrentAmount(initialData.current_amount.toString());
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a goal name');
      return;
    }
    const target = parseFloat(targetAmount);
    if (!target || target <= 0) {
      setError('Target amount must be greater than zero');
      return;
    }
    const current = parseFloat(currentAmount) || 0;
    if (current < 0) {
      setError('Current saved amount cannot be negative');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave({
        id: initialData?.id,
        name: trimmed,
        target_amount: target,
        current_amount: current,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save savings goal');
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
              Financial Milestones
            </span>
            <h2 className="text-xl font-bold text-white">
              {initialData ? 'Edit Savings Goal' : 'Create Savings Goal'}
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
              Goal Name / Target *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Emergency Fund (6 Months)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Target Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              placeholder="e.g. 100000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-base font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Current Saved Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
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
              {loading ? 'Saving...' : initialData ? 'Update Goal' : 'Save Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
