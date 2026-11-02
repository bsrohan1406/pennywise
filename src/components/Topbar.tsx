import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { NavView } from './Sidebar';
import { Budget } from '../types';

interface Props {
  currentView: NavView;
  onOpenMobile: () => void;
  onOpenAddTransaction: () => void;
  onSearch: (query: string) => void;
  budgets: Budget[];
  healthStatus: 'healthy' | 'checking' | 'error';
}

export const Topbar: React.FC<Props> = ({
  currentView,
  onOpenMobile,
  onOpenAddTransaction,
  onSearch,
  budgets,
  healthStatus,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const viewTitles: Record<NavView, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Financial Dashboard',
      subtitle: 'Overview of cashflow, monthly trends, and budget health',
    },
    transactions: {
      title: 'Transactions Log',
      subtitle: 'Track and filter individual income and expense records',
    },
    budgets: {
      title: 'Monthly Budgets',
      subtitle: 'Set spending limits and prevent category overruns',
    },
    categories: {
      title: 'Categories Manager',
      subtitle: 'Organize expenses and income with custom tags',
    },
    analytics: {
      title: 'Analytics & Data Science',
      subtitle: 'Advanced statistical metrics, distributions, and variance',
    },
    goals: {
      title: 'Savings Milestones',
      subtitle: 'Track progress toward financial targets and projections',
    },
    settings: {
      title: 'Preferences & System',
      subtitle: 'Configure currency, account profile, and database seed',
    },
  };

  const currentInfo = viewTitles[currentView] || {
    title: 'PennyWise',
    subtitle: 'Home Budget Management System',
  };

  const overrunBudgets = budgets.filter((b) => b.is_overrun);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobile}
            className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 lg:hidden"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {currentInfo.title}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Global Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden md:block w-48 lg:w-64"
          >
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search transactions..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                onSearch(e.target.value);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </form>

          {/* Database Health Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>DB Online</span>
          </div>

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 relative transition-colors"
              aria-label="Toggle notifications"
            >
              <Bell className="w-4 h-4" />
              {overrunBudgets.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {overrunBudgets.length}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Notifications & Alerts
                  </span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {overrunBudgets.length > 0 ? (
                  <div className="space-y-2">
                    {overrunBudgets.map((b) => (
                      <div
                        key={b.id}
                        className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex items-center gap-1.5 font-bold text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Budget Exceeded: {b.category_name}</span>
                        </div>
                        <p className="text-slate-300">
                          Spent exceeds limit by ₹{b.overrun_amount?.toFixed(2)} for {b.month}.
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs space-y-1">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto" />
                    <p className="font-medium text-slate-300">All Budgets on Track</p>
                    <p className="text-[11px] text-slate-500">
                      No spending overruns detected in active categories.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Primary CTA: Add Transaction */}
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
