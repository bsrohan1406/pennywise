import React, { useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { SavingsGoal } from '../types';
import { formatCurrency } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  onContribute: (goalId: number, amount: number) => Promise<void>;
  currency: string;
}

export const ContributeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  goal,
  onContribute,
  currency,
}) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.target_amount - goal.current_amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      setError('Please enter a valid deposit amount greater than zero');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onContribute(goal.id, num);
      setAmount('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Contribution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div>
            <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Boost Savings
            </span>
            <h2 className="text-xl font-bold text-white truncate max-w-[280px]">
              {goal.name}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Current Progress</span>
              <span className="font-semibold text-emerald-400">
                {formatCurrency(goal.current_amount, currency)} / {formatCurrency(goal.target_amount, currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Remaining Needed</span>
              <span className="font-medium text-slate-300">
                {formatCurrency(remaining, currency)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Deposit Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              autoFocus
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-base font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            {[1000, 2500, 5000, 10000].map((quick) => (
              <button
                type="button"
                key={quick}
                onClick={() => setAmount(quick.toString())}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                +{quick}
              </button>
            ))}
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
              {loading ? 'Processing...' : 'Deposit to Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
