import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Edit2,
  Trash2,
  TrendingDown,
} from 'lucide-react';
import { Budget } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface Props {
  budgets: Budget[];
  currency: string;
  selectedMonth: string;
  onMonthChange: (m: string) => void;
  onOpenAddModal: () => void;
  onEditBudget: (b: Budget) => void;
  onDeleteBudget: (id: number) => Promise<void>;
}

export const BudgetsView: React.FC<Props> = ({
  budgets,
  currency,
  selectedMonth,
  onMonthChange,
  onOpenAddModal,
  onEditBudget,
  onDeleteBudget,
}) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const totalAllocated = budgets.reduce(
    (sum, b) => sum + (b.budget_amount || b.amount || 0),
    0
  );
  const totalSpent = budgets.reduce(
    (sum, b) => sum + (b.actual_spending || 0),
    0
  );
  const remainingTotal = totalAllocated - totalSpent;
  const overallUtil = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
  const overrunCount = budgets.filter((b) => b.is_overrun).length;

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this budget allocation?')) {
      setDeletingId(id);
      try {
        await onDeleteBudget(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Month Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Budgeting Period
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Allocated
          </span>
          <div className="text-2xl font-black text-white">
            {formatCurrency(totalAllocated, currency)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Across {budgets.length} expense categories
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Spent So Far
          </span>
          <div className="text-2xl font-black text-slate-200">
            {formatCurrency(totalSpent, currency)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {formatPercentage(overallUtil)} aggregate utilization
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Available Remaining
          </span>
          <div
            className={`text-2xl font-black ${
              remainingTotal >= 0 ? 'text-teal-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(remainingTotal, currency)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {remainingTotal >= 0 ? 'Within budget limit' : 'Deficit detected'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Overrun Categories
          </span>
          <div
            className={`text-2xl font-black ${
              overrunCount > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {overrunCount}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {overrunCount > 0 ? 'Attention required' : 'All limits respected'}
          </span>
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.map((b) => {
          const budgetAmt = b.budget_amount || b.amount || 0;
          const spent = b.actual_spending || 0;
          const util = b.utilization_rate || (budgetAmt > 0 ? (spent / budgetAmt) * 100 : 0);
          const isOver = b.is_overrun;
          const overrunAmt = b.overrun_amount || (isOver ? spent - budgetAmt : 0);
          const remaining = b.remaining_budget !== undefined ? b.remaining_budget : budgetAmt - spent;

          return (
            <div
              key={b.id}
              className={`p-5 rounded-2xl bg-slate-900/90 border transition-all shadow-sm ${
                isOver ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: b.category_color || '#10b981' }}
                  />
                  <h3 className="text-sm font-bold text-white">{b.category_name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditBudget(b)}
                    aria-label={`Edit ${b.category_name} budget`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    disabled={deletingId === b.id}
                    aria-label={`Delete ${b.category_name} budget`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress & Numbers */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">Spending Progress</span>
                  <span className="font-bold text-white">
                    {formatCurrency(spent, currency)}{' '}
                    <span className="text-slate-500 font-normal">
                      / {formatCurrency(budgetAmt, currency)}
                    </span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isOver ? 'bg-rose-500' : util >= 80 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, util)}%` }}
                  />
                </div>

                {/* Overrun or Remaining info */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      isOver
                        ? 'text-rose-400'
                        : util >= 80
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {isOver ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Overrun by {formatCurrency(overrunAmt, currency)}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{util.toFixed(1)}% utilized</span>
                      </>
                    )}
                  </span>
                  <span className="text-slate-400 font-medium text-[11px]">
                    {isOver ? 'Limit Exceeded' : `${formatCurrency(remaining, currency)} left`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {budgets.length === 0 && (
          <div className="col-span-full py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <PieChart className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No budgets configured for {selectedMonth}</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Allocate monthly spending limits per category to automatically detect and prevent expense overruns.
            </p>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
            >
              Set First Budget Limit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
