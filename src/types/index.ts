export type TransactionType = 'Income' | 'Expense';

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  color: string;
}

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  transaction_date: string;
  category_id: number;
  description: string;
}

export interface Budget {
  id: number;
  category_id: number;
  category_name?: string;
  category_color?: string;
  month: string;
  budget_amount?: number;
  amount: number;
  actual_spending?: number;
  remaining_budget?: number;
  utilization_rate?: number;
  is_overrun?: boolean;
  overrun_amount?: number;
}

export interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  remaining_amount?: number;
  progress_percentage?: number;
  is_completed?: boolean;
  estimated_months?: number | null;
}

export interface FinancialSummary {
  income: number;
  expenses: number;
  savings: number;
  savings_rate: number;
  transaction_count: number;
  average_transaction: number;
}

export interface CategoryMetric {
  category_id: number;
  category_name: string;
  category_color: string;
  type: TransactionType;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyMetric {
  month: string;
  income: number;
  expense: number;
  savings: number;
  savings_rate: number;
}

export interface StatisticalAnalysis {
  expense_count: number;
  expense_total: number;
  expense_mean: number;
  expense_median: number;
  expense_std_dev: number;
  max_expense: number;
  essential_total: number;
  discretionary_total: number;
  essential_ratio: number;
  discretionary_ratio: number;
}

export interface AppSettings {
  currency: string;
  profileName: string;
  profileEmail: string;
  budgetAlertThreshold: number;
}

export interface HealthInfo {
  service: string;
  status: string;
  timestamp: string;
  database: {
    type: string;
    connected: boolean;
    message: string;
  };
  modules: Record<string, string>;
}
