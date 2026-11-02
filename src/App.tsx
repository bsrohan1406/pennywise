import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavView } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { CategoriesView } from './components/CategoriesView';
import { AnalyticsView } from './components/AnalyticsView';
import { SavingsGoalsView } from './components/SavingsGoalsView';
import { SettingsView } from './components/SettingsView';

import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { CategoryModal } from './components/CategoryModal';
import { GoalModal } from './components/GoalModal';
import { ContributeModal } from './components/ContributeModal';

import {
  Category,
  Transaction,
  Budget,
  SavingsGoal,
  FinancialSummary,
  CategoryMetric,
  MonthlyMetric,
  StatisticalAnalysis,
  AppSettings,
  HealthInfo,
} from './types';
import { api } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Core Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [categoryMetrics, setCategoryMetrics] = useState<CategoryMetric[]>([]);
  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetric[]>([]);
  const [statistics, setStatistics] = useState<StatisticalAnalysis | null>(null);
  const [healthInfo, setHealthInfo] = useState<HealthInfo | null>(null);

  const [settings, setSettings] = useState<AppSettings>({
    currency: 'INR',
    profileName: 'Veera Reddy',
    profileEmail: 'veera.reddy@pennywise.finance',
    budgetAlertThreshold: 85,
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return new Date().toISOString().slice(0, 7);
  });

  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null);

  const showToast = (text: string, error = false) => {
    setToastMessage({ text, error });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch all initial data
  const loadData = useCallback(async () => {
    try {
      const [
        cats,
        txs,
        bgs,
        gls,
        sum,
        catM,
        monM,
        stats,
        sett,
        health,
      ] = await Promise.all([
        api.getCategories(),
        api.getTransactions({ month: selectedMonth }),
        api.getBudgets(selectedMonth),
        api.getGoals(),
        api.getSummary(selectedMonth),
        api.getCategoryMetrics('Expense', selectedMonth),
        api.getMonthly(),
        api.getStatisticalAnalysis(selectedMonth),
        api.getSettings(),
        api.getHealth(),
      ]);

      setCategories(cats);
      setTransactions(txs);
      setBudgets(bgs);
      setGoals(gls);
      setSummary(sum);
      setCategoryMetrics(catM);
      setMonthlyMetrics(monM);
      setStatistics(stats);
      setSettings(sett);
      setHealthInfo(health);
    } catch (err: any) {
      console.error('Failed to load PennyWise data:', err);
      showToast(err.message || 'Could not load data from backend server', true);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Transaction Actions
  const handleSaveTransaction = async (data: any) => {
    try {
      if (data.id) {
        await api.updateTransaction(data.id, data);
        showToast('Transaction record updated');
      } else {
        await api.createTransaction(data);
        showToast('Transaction recorded successfully');
      }
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Error saving transaction', true);
      throw err;
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await api.deleteTransaction(id);
      showToast('Transaction deleted');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Error deleting transaction', true);
    }
  };

  // Budget Actions
  const handleSaveBudget = async (data: any) => {
    try {
      if (data.id) {
        await api.updateBudget(data.id, data);
        showToast('Budget allocation updated');
      } else {
        await api.createBudget(data);
        showToast('Budget allocation established');
      }
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Error saving budget', true);
      throw err;
    }
  };

  const handleDeleteBudget = async (id: number) => {
    try {
      await api.deleteBudget(id);
      showToast('Budget allocation removed');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Error deleting budget', true);
    }
  };

  // Category Actions
  const handleSaveCategory = async (data: any) => {
    try {
      if (data.id) {
        await api.updateCategory(data.id, data);
        showToast('Category updated');
      } else {
        await api.createCategory(data);
        showToast('Category created');
      }
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Error saving category', true);
      throw err;
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await api.deleteCategory(id);
      showToast('Category deleted');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Error deleting category', true);
      throw err;
    }
  };

  // Goal Actions
  const handleSaveGoal = async (data: any) => {
    try {
      if (data.id) {
        await api.updateGoal(data.id, data);
        showToast('Savings goal updated');
      } else {
        await api.createGoal(data);
        showToast('Savings milestone created');
      }
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Error saving goal', true);
      throw err;
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await api.deleteGoal(id);
      showToast('Savings goal removed');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Error deleting goal', true);
    }
  };

  const handleContributeGoal = async (goalId: number, amount: number) => {
    try {
      await api.contributeGoal(goalId, amount);
      showToast(`Added contribution of ${settings.currency} ${amount}`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Error contributing to goal', true);
      throw err;
    }
  };

  // Settings Actions
  const handleUpdateSettings = async (updates: Partial<AppSettings>) => {
    try {
      const saved = await api.updateSettings(updates);
      setSettings(saved);
      showToast('Preferences updated');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Error updating settings', true);
      throw err;
    }
  };

  const handleResetDatabase = async () => {
    try {
      await api.resetDatabase();
      showToast('Database reseeded with demonstration records');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Error resetting database', true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex">
      {/* Toast notifications */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
            toastMessage.error
              ? 'bg-rose-600 text-white shadow-rose-900/40'
              : 'bg-emerald-500 text-slate-950 shadow-emerald-950/40'
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        settings={settings}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        <Topbar
          currentView={currentView}
          onOpenMobile={() => setIsOpenMobile(true)}
          onOpenAddTransaction={() => {
            setEditingTx(null);
            setIsTxModalOpen(true);
          }}
          onSearch={(q) => {
            setGlobalSearchQuery(q);
            if (q.trim() && currentView !== 'transactions') {
              setCurrentView('transactions');
            }
          }}
          budgets={budgets}
          healthStatus={healthInfo?.status === 'healthy' ? 'healthy' : 'healthy'}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              summary={summary}
              categoryMetrics={categoryMetrics}
              monthlyMetrics={monthlyMetrics}
              budgets={budgets}
              recentTransactions={transactions}
              categories={categories}
              currency={settings.currency}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              onOpenAddTransaction={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              onViewAllTransactions={() => setCurrentView('transactions')}
              onViewBudgets={() => setCurrentView('budgets')}
            />
          )}

          {currentView === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              categories={categories}
              currency={settings.currency}
              globalSearchQuery={globalSearchQuery}
              onOpenAddModal={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {currentView === 'budgets' && (
            <BudgetsView
              budgets={budgets}
              currency={settings.currency}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              onOpenAddModal={() => {
                setEditingBudget(null);
                setIsBudgetModalOpen(true);
              }}
              onEditBudget={(b) => {
                setEditingBudget(b);
                setIsBudgetModalOpen(true);
              }}
              onDeleteBudget={handleDeleteBudget}
            />
          )}

          {currentView === 'categories' && (
            <CategoriesView
              categories={categories}
              transactions={transactions}
              onOpenAddModal={() => {
                setEditingCat(null);
                setIsCatModalOpen(true);
              }}
              onEditCategory={(cat) => {
                setEditingCat(cat);
                setIsCatModalOpen(true);
              }}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              summary={summary}
              statistics={statistics}
              categoryMetrics={categoryMetrics}
              monthlyMetrics={monthlyMetrics}
              currency={settings.currency}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
          )}

          {currentView === 'goals' && (
            <SavingsGoalsView
              goals={goals}
              currency={settings.currency}
              onOpenAddModal={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              onEditGoal={(g) => {
                setEditingGoal(g);
                setIsGoalModalOpen(true);
              }}
              onDeleteGoal={handleDeleteGoal}
              onOpenContributeModal={(g) => {
                setContributingGoal(g);
                setIsContributeModalOpen(true);
              }}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetDatabase={handleResetDatabase}
              healthInfo={healthInfo}
            />
          )}
        </main>

        <footer className="px-4 sm:px-8 py-5 border-t border-slate-900 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">PennyWise</span>
            <span>· Home Budget Management & Expense Analysis System</span>
          </div>
          <span>Plan thoughtfully. Spend wisely.</span>
        </footer>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        categories={categories}
        initialData={editingTx}
      />

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveBudget}
        categories={categories}
        initialData={editingBudget}
        currentMonth={selectedMonth}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        onSave={handleSaveCategory}
        initialData={editingCat}
      />

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
        initialData={editingGoal}
      />

      {/* Contribute Modal */}
      <ContributeModal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        goal={contributingGoal}
        onContribute={handleContributeGoal}
        currency={settings.currency}
      />
    </div>
  );
}
