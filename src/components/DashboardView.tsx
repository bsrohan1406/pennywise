import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Calendar,
  AlertCircle,
  ArrowRight,
  Plus,
} from 'lucide-react';
import {
  FinancialSummary,
  CategoryMetric,
  MonthlyMetric,
  Budget,
  Transaction,
  Category,
} from '../types';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters';

interface Props {
  summary: FinancialSummary | null;
  categoryMetrics: CategoryMetric[];
  monthlyMetrics: MonthlyMetric[];
  budgets: Budget[];
  recentTransactions: Transaction[];
  categories: Category[];
  currency: string;
  selectedMonth: string;
  onMonthChange: (m: string) => void;
  onOpenAddTransaction: () => void;
  onViewAllTransactions: () => void;
  onViewBudgets: () => void;
}

export const DashboardView: React.FC<Props> = ({
  summary,
  categoryMetrics,
  monthlyMetrics,
  budgets,
  recentTransactions,
  categories,
  currency,
  selectedMonth,
  onMonthChange,
  onOpenAddTransaction,
  onViewAllTransactions,
  onViewBudgets,
}) => {
  const catMap = new Map<number, Category>();
  categories.forEach((c) => catMap.set(c.id, c));

  // Expense Donut calculations
  const totalExpense = categoryMetrics.reduce((sum, c) => sum + c.total, 0);
  let currentAngle = 0;
  const donutSlices = categoryMetrics.slice(0, 6).map((cat) => {
    const angle = totalExpense > 0 ? (cat.total / totalExpense) * 360 : 0;
    const slice = { ...cat, startAngle: currentAngle, angle };
    currentAngle += angle;
    return slice;
  });

  // Monthly Bar Chart max value
  const recentMonthly = monthlyMetrics.slice(-6);
  const maxMonthVal = Math.max(
    1000,
    ...recentMonthly.map((m) => Math.max(m.income, m.expense))
  );

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Analysis Period
          </span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Active Currency:</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-emerald-400 font-bold">
            {currency}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Inflow
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(summary?.income || 0, currency)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">Income</span>
            <span>recorded in {selectedMonth}</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Outflow
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(summary?.expenses || 0, currency)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-rose-400 font-bold">Expenses</span>
            <span>spent across categories</span>
          </div>
        </div>

        {/* Net Savings */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Net Savings
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              (summary?.savings || 0) >= 0 ? 'text-teal-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(summary?.savings || 0, currency)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span>Monthly Cashflow Surplus</span>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Savings Rate
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatPercentage(summary?.savings_rate || 0)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span
              className={`font-semibold ${
                (summary?.savings_rate || 0) >= 20 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {(summary?.savings_rate || 0) >= 20 ? 'Healthy (≥20%)' : 'Below 20% Target'}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Distribution Donut */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Expense Distribution</h3>
              <p className="text-xs text-slate-400">Top spending categories in {selectedMonth}</p>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
              {categoryMetrics.length} Categories
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6 pt-2">
            {/* SVG Donut */}
            <div className="flex justify-center relative">
              <svg viewBox="0 0 200 200" className="w-48 h-48 transform -rotate-90">
                {totalExpense === 0 ? (
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="transparent"
                    stroke="#1e293b"
                    strokeWidth="28"
                  />
                ) : (
                  donutSlices.map((s, idx) => {
                    const radius = 70;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDasharray = `${(s.angle / 360) * circumference} ${circumference}`;
                    const strokeDashoffset = -((s.startAngle / 360) * circumference);

                    return (
                      <circle
                        key={idx}
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="transparent"
                        stroke={s.category_color}
                        strokeWidth="28"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all hover:opacity-80"
                      />
                    );
                  })
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Spent
                </span>
                <span className="text-sm font-extrabold text-white">
                  {formatCurrency(totalExpense, currency)}
                </span>
              </div>
            </div>

            {/* Category Legend */}
            <div className="space-y-2.5">
              {categoryMetrics.slice(0, 5).map((cat) => (
                <div key={cat.category_id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.category_color }}
                    />
                    <span className="text-slate-300 font-medium truncate">
                      {cat.category_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-white font-semibold">
                      {formatCurrency(cat.total, currency)}
                    </span>
                    <span className="text-slate-500 text-[11px] w-10 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
              {categoryMetrics.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  No expense records logged for this month.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Income vs Expense Comparison */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Cashflow Comparison</h3>
              <p className="text-xs text-slate-400">Monthly Inflow vs Outflow history</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Expense
              </span>
            </div>
          </div>

          <div className="pt-4 h-48 flex items-end justify-between gap-3 px-2 border-b border-slate-800">
            {recentMonthly.map((m) => {
              const incH = (m.income / maxMonthVal) * 100;
              const expH = (m.expense / maxMonthVal) * 100;

              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center gap-1.5 h-36">
                    {/* Income bar */}
                    <div
                      title={`Income: ${formatCurrency(m.income, currency)}`}
                      className="w-1/2 max-w-[18px] bg-emerald-500 rounded-t-md hover:bg-emerald-400 transition-all cursor-pointer"
                      style={{ height: `${Math.max(4, incH)}%` }}
                    />
                    {/* Expense bar */}
                    <div
                      title={`Expense: ${formatCurrency(m.expense, currency)}`}
                      className="w-1/2 max-w-[18px] bg-rose-500 rounded-t-md hover:bg-rose-400 transition-all cursor-pointer"
                      style={{ height: `${Math.max(4, expH)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 mt-2">
                    {m.month.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>6-Month Trend Overview</span>
            <span>Max scale: {formatCurrency(maxMonthVal, currency)}</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Budget Utilization & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Progress (1 col) */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Budget Health</h3>
            <button
              onClick={onViewBudgets}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {budgets.slice(0, 4).map((b) => {
              const util = b.utilization_rate || 0;
              const isOver = b.is_overrun;
              return (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: b.category_color }}
                      />
                      <span>{b.category_name}</span>
                    </div>
                    <span className="text-slate-400">
                      {formatCurrency(b.actual_spending || 0, currency)} /{' '}
                      {formatCurrency(b.budget_amount || b.amount, currency)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOver ? 'bg-rose-500' : util >= 80 ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, util)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold ${
                        isOver
                          ? 'text-rose-400 flex items-center gap-1'
                          : util >= 80
                          ? 'text-amber-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {isOver && <AlertCircle className="w-3 h-3" />}
                      {isOver ? `Overrun by ${formatCurrency(b.overrun_amount || 0, currency)}` : `${util.toFixed(0)}% utilized`}
                    </span>
                    <span className="text-slate-500">
                      {isOver ? 'Exceeded' : `${formatCurrency(b.remaining_budget || 0, currency)} left`}
                    </span>
                  </div>
                </div>
              );
            })}

            {budgets.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500 space-y-2">
                <p>No budgets configured for {selectedMonth}.</p>
                <button
                  onClick={onViewBudgets}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Configure Budget Limits
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Recent Transactions</h3>
              <p className="text-xs text-slate-400">Latest recorded cashflow activities</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddTransaction}
                className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                title="Add transaction"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={onViewAllTransactions}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentTransactions.slice(0, 6).map((tx) => {
                  const cat = catMap.get(tx.category_id);
                  const isIncome = tx.type.toLowerCase() === 'income';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isIncome
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-white max-w-[180px] truncate">
                        {tx.description || 'No description'}
                      </td>
                      <td className="py-3 text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat?.color || '#94a3b8' }}
                          />
                          {cat?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">{formatDate(tx.transaction_date)}</td>
                      <td
                        className={`py-3 text-right font-bold ${
                          isIncome ? 'text-emerald-400' : 'text-slate-200'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount, currency)}
                      </td>
                    </tr>
                  );
                })}

                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
