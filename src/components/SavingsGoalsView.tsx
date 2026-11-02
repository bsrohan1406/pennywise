import React, { useState } from 'react';
import {
  Target,
  Plus,
  Coins,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { SavingsGoal } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface Props {
  goals: SavingsGoal[];
  currency: string;
  onOpenAddModal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: number) => Promise<void>;
  onOpenContributeModal: (goal: SavingsGoal) => void;
}

export const SavingsGoalsView: React.FC<Props> = ({
  goals,
  currency,
  onOpenAddModal,
  onEditGoal,
  onDeleteGoal,
  onOpenContributeModal,
}) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      setDeletingId(id);
      try {
        await onDeleteGoal(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-white">Savings Milestones</h2>
            <p className="text-xs text-slate-400">
              Set dedicated targets and project completion dates
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Savings Goal</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Target
          </span>
          <div className="text-2xl font-black text-white">
            {formatCurrency(totalTarget, currency)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Across {goals.length} target goals
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Current Capital Saved
          </span>
          <div className="text-2xl font-black text-emerald-400">
            {formatCurrency(totalSaved, currency)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {formatPercentage(overallProgress)} overall progress
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Remaining To Reach
          </span>
          <div className="text-2xl font-black text-teal-400">
            {formatCurrency(totalRemaining, currency)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Total funding needed
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Completed Goals
          </span>
          <div className="text-2xl font-black text-indigo-400">
            {goals.filter((g) => g.current_amount >= g.target_amount).length}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Milestones fully achieved
          </span>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((g) => {
          const progress = g.progress_percentage || (g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0);
          const isDone = g.is_completed || g.current_amount >= g.target_amount;
          const remaining = g.remaining_amount !== undefined ? g.remaining_amount : Math.max(0, g.target_amount - g.current_amount);

          return (
            <div
              key={g.id}
              className={`p-6 rounded-2xl bg-slate-900/90 border transition-all shadow-sm flex flex-col justify-between space-y-4 ${
                isDone ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-teal-500/10 text-teal-400'
                      }`}
                    >
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white max-w-[180px] truncate">
                        {g.name}
                      </h3>
                      <span className="text-xs text-slate-400">
                        Target: {formatCurrency(g.target_amount, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditGoal(g)}
                      aria-label={`Edit ${g.name}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      disabled={deletingId === g.id}
                      aria-label={`Delete ${g.name}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Details */}
                <div className="space-y-2 mt-4">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-400 font-medium">Accumulated Savings</span>
                    <span className="text-base font-extrabold text-white">
                      {formatCurrency(g.current_amount, currency)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-emerald-400 font-bold">
                      {progress.toFixed(1)}% Achieved
                    </span>
                    <span className="text-slate-400">
                      {isDone ? 'Goal Complete!' : `${formatCurrency(remaining, currency)} remaining`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Projection & Action */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {isDone
                      ? 'Target Achieved'
                      : g.estimated_months
                      ? `~${g.estimated_months} mo. to goal`
                      : 'Calculating trajectory...'}
                  </span>
                </div>

                <button
                  onClick={() => onOpenContributeModal(g)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 text-xs font-bold border border-teal-500/30 transition-all"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Deposit</span>
                </button>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <Target className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Savings Goals Defined</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create dedicated milestone funds (e.g. Vacation, Emergency Fund, Tech Upgrade) to track your progress.
            </p>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
            >
              Create First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
