import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  DollarSign,
  Database,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Shield,
  Server,
} from 'lucide-react';
import { AppSettings, HealthInfo } from '../types';
import { api } from '../services/api';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  onResetDatabase: () => Promise<void>;
  healthInfo: HealthInfo | null;
}

const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (INR)' },
  { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen (JPY)' },
];

export const SettingsView: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onResetDatabase,
  healthInfo,
}) => {
  const [profileName, setProfileName] = useState(settings.profileName);
  const [profileEmail, setProfileEmail] = useState(settings.profileEmail);
  const [currency, setCurrency] = useState(settings.currency);
  const [alertThreshold, setAlertThreshold] = useState(settings.budgetAlertThreshold);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setProfileName(settings.profileName);
    setProfileEmail(settings.profileEmail);
    setCurrency(settings.currency);
    setAlertThreshold(settings.budgetAlertThreshold);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await onUpdateSettings({
        profileName: profileName.trim(),
        profileEmail: profileEmail.trim(),
        currency,
        budgetAlertThreshold: Number(alertThreshold),
      });
      setFeedback('Settings successfully saved.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      window.confirm(
        'Warning: This will reload all original demonstration seed records (categories, budgets, transactions, and goals). Continue?'
      )
    ) {
      setResetting(true);
      try {
        await onResetDatabase();
        setFeedback('Database successfully reseeded to original demonstration state.');
        setTimeout(() => setFeedback(null), 4000);
      } catch (err: any) {
        setFeedback(err.message || 'Failed to reset database');
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-white">System & Profile Preferences</h2>
            <p className="text-xs text-slate-400">
              Customize currency display, user details, and database seed
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
          Preferences & Localization
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Profile Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Account Holder Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Profile Email */}
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Notification Email
            </label>
            <input
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Currency Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Primary Currency
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} - {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget Alert Threshold */}
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Budget Warning Alert (% Spent)
            </label>
            <select
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value={75}>75% of limit</option>
              <option value={80}>80% of limit</option>
              <option value={85}>85% of limit (Recommended)</option>
              <option value={90}>90% of limit</option>
              <option value={100}>100% (Strict limit reached only)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>

      {/* Database Diagnostic & Seed Management */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Database & Subsystem Health
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{healthInfo?.status === 'healthy' ? 'All Systems Operational' : 'Online'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 font-medium">Service Architecture</span>
            <p className="font-semibold text-slate-200">
              PennyWise REST API & Data Analysis Engine
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 font-medium">Data Storage Engine</span>
            <p className="font-semibold text-slate-200">
              Embedded Persistent JSON Store with ACID-Compliant Seed Harness
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-white">Reset Demonstration Data</h4>
            <p className="text-xs text-slate-400">
              Reload the full baseline seed data from the project specification (income, groceries, rent, utilities, savings).
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-bold border border-rose-500/30 transition-all shrink-0 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetting ? 'Resetting...' : 'Reset Demo Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
