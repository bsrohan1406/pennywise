import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Tags,
  BarChart3,
  Target,
  Settings,
  Sparkles,
  Coins,
  X,
} from 'lucide-react';
import { AppSettings } from '../types';

export type NavView =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'categories'
  | 'analytics'
  | 'goals'
  | 'settings';

interface Props {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  settings: AppSettings;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({
  currentView,
  onNavigate,
  settings,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard' as NavView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as NavView, label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budgets' as NavView, label: 'Budgets', icon: PieChart },
    { id: 'categories' as NavView, label: 'Categories', icon: Tags },
    { id: 'analytics' as NavView, label: 'Analytics & Insights', icon: BarChart3 },
    { id: 'goals' as NavView, label: 'Savings Goals', icon: Target },
  ];

  const handleSelect = (view: NavView) => {
    onNavigate(view);
    onCloseMobile();
  };

  const getInitials = (name: string) => {
    if (!name) return 'VR';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-slate-900">
            <button
              onClick={() => handleSelect('dashboard')}
              className="flex items-center gap-3 text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
                <Coins className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white block">
                  PennyWise
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">
                  Finance & Analytics
                </span>
              </div>
            </button>
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="px-4 py-6">
            <span className="px-3 text-[11px] font-bold tracking-wider text-slate-500 uppercase block mb-2">
              Workspace
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar bottom */}
        <div className="p-4 border-t border-slate-900 space-y-4">
          <button
            onClick={() => handleSelect('settings')}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              currentView === 'settings'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Settings className="w-5 h-5 text-slate-500" />
            <span>Settings</span>
          </button>

          {/* Smart Tip Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Budgeting Tip</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Target at least 20% monthly savings into your Emergency Fund for high financial resilience.
            </p>
          </div>

          {/* User profile mini badge */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800/60">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center">
              {getInitials(settings.profileName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {settings.profileName}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {settings.currency} · Personal Account
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
