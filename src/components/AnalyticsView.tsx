import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calculator,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  StatisticalAnalysis,
  CategoryMetric,
  MonthlyMetric,
  FinancialSummary,
} from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface Props {
  summary: FinancialSummary | null;
  statistics: StatisticalAnalysis | null;
  categoryMetrics: CategoryMetric[];
  monthlyMetrics: MonthlyMetric[];
  currency: string;
  selectedMonth: string;
  onMonthChange: (m: string) => void;
}

export const AnalyticsView: React.FC<Props> = ({
  summary,
  statistics,
  categoryMetrics,
  monthlyMetrics,
  currency,
  selectedMonth,
  onMonthChange,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'statistics'>('overview');

  const recentMonthly = monthlyMetrics.slice(-8);
  const maxSavings = Math.max(
    1000,
    ...recentMonthly.map((m) => Math.abs(m.savings))
  );

  return (
    <div className="space-y-6">
      {/* Top Header & View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
            {(['overview', 'charts', 'statistics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Statistical Analysis Cards (Data Analysis module core metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mean Expense */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Mean Outflow
            </span>
            <Calculator className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {formatCurrency(statistics?.expense_mean || 0, currency)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Average per expense transaction
          </span>
        </div>

        {/* Median Expense */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Median Outflow
            </span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-400">
            {formatCurrency(statistics?.expense_median || 0, currency)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Middle value (outlier-resistant)
          </span>
        </div>

        {/* Expense Volatility / Standard Deviation */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Standard Deviation
            </span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400">
            {formatCurrency(statistics?.expense_std_dev || 0, currency)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Spending variance measure (σ)
          </span>
        </div>

        {/* Max Single Expense */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Max Expense
            </span>
            <ShoppingBag className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            {formatCurrency(statistics?.max_expense || 0, currency)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Peak individual transaction
          </span>
        </div>
      </div>

      {/* Essential vs Discretionary Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Essential vs. Discretionary Spending Split
            </h3>
            <p className="text-xs text-slate-400">
              Needs (Groceries, Housing, Utilities, Healthcare, Transit) vs Wants (Shopping, Entertainment)
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-400">
            Total Analyzed: {formatCurrency(statistics?.expense_total || 0, currency)}
          </div>
        </div>

        {/* Split Meter */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
            <div
              title={`Essential: ${statistics?.essential_ratio}%`}
              className="bg-emerald-500 hover:bg-emerald-400 transition-all cursor-pointer"
              style={{ width: `${statistics?.essential_ratio || 0}%` }}
            />
            <div
              title={`Discretionary: ${statistics?.discretionary_ratio}%`}
              className="bg-rose-500 hover:bg-rose-400 transition-all cursor-pointer"
              style={{ width: `${statistics?.discretionary_ratio || 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>
                Essential Needs: {formatCurrency(statistics?.essential_total || 0, currency)} (
                {statistics?.essential_ratio}%)
              </span>
            </div>
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>
                Discretionary Wants: {formatCurrency(statistics?.discretionary_total || 0, currency)} (
                {statistics?.discretionary_ratio}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Net Savings Velocity Trend */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Monthly Net Savings Trend</h3>
            <p className="text-xs text-slate-400">Track net capital accumulation trajectory</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
            Average Rate: {formatPercentage(summary?.savings_rate || 0)}
          </span>
        </div>

        <div className="pt-6 h-56 flex items-end justify-between gap-4 px-2 border-b border-slate-800">
          {recentMonthly.map((m) => {
            const isPositive = m.savings >= 0;
            const heightPct = (Math.abs(m.savings) / maxSavings) * 100;

            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center h-44 relative">
                  <div
                    title={`Net Savings for ${m.month}: ${formatCurrency(m.savings, currency)}`}
                    className={`w-full max-w-[32px] rounded-t-md transition-all cursor-pointer ${
                      isPositive
                        ? 'bg-teal-500 hover:bg-teal-400'
                        : 'bg-rose-500 hover:bg-rose-400'
                    }`}
                    style={{ height: `${Math.max(6, heightPct)}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 mt-2">
                  {m.month}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    isPositive ? 'text-teal-400' : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(m.savings, currency)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Server Matplotlib Generated Image Preview Card */}
      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white">Generated Expense Donut Chart</h4>
            <p className="text-xs text-slate-400">Vector chart rendered via backend analytics engine</p>
            <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
              <img
                src={`/api/analytics/charts/expense-distribution?month=${selectedMonth}`}
                alt="Expense Distribution Chart"
                className="w-full h-auto max-h-72 object-contain rounded-lg"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white">Generated Income vs. Expense Comparison</h4>
            <p className="text-xs text-slate-400">Vector grouped chart rendered via backend analytics engine</p>
            <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
              <img
                src="/api/analytics/charts/monthly-comparison"
                alt="Monthly Comparison Chart"
                className="w-full h-auto max-h-72 object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
