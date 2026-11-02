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
} from '../types';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data.data !== undefined ? data.data : data;
  }

  // System
  async getHealth(): Promise<HealthInfo> {
    const res = await fetch('/api/health');
    return res.json();
  }

  async resetDatabase(): Promise<any> {
    return this.request('/api/reset', { method: 'POST' });
  }

  // Categories
  async getCategories(type?: 'Income' | 'Expense'): Promise<Category[]> {
    const query = type ? `?type=${type}` : '';
    return this.request<Category[]>(`/api/categories${query}`);
  }

  async createCategory(cat: { name: string; type: 'Income' | 'Expense'; color: string }): Promise<Category> {
    return this.request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(cat),
    });
  }

  async updateCategory(id: number, cat: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cat),
    });
  }

  async deleteCategory(id: number): Promise<{ id: number }> {
    return this.request<{ id: number }>(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Transactions
  async getTransactions(params?: {
    month?: string;
    year?: string;
    type?: string;
    category_id?: number;
    search?: string;
  }): Promise<Transaction[]> {
    const query = new URLSearchParams();
    if (params?.month) query.set('month', params.month);
    if (params?.year) query.set('year', params.year);
    if (params?.type && params.type !== 'All') query.set('type', params.type);
    if (params?.category_id) query.set('category_id', params.category_id.toString());
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<Transaction[]>(`/api/transactions${queryString}`);
  }

  async createTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    return this.request<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    });
  }

  async updateTransaction(id: number, tx: Partial<Transaction>): Promise<Transaction> {
    return this.request<Transaction>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tx),
    });
  }

  async deleteTransaction(id: number): Promise<{ id: number }> {
    return this.request<{ id: number }>(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Budgets
  async getBudgets(month?: string): Promise<Budget[]> {
    const query = month ? `?month=${month}` : '';
    return this.request<Budget[]>(`/api/budgets${query}`);
  }

  async createBudget(b: { category_id: number; month: string; amount: number }): Promise<Budget> {
    return this.request<Budget>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(b),
    });
  }

  async updateBudget(id: number, b: Partial<Budget>): Promise<Budget> {
    return this.request<Budget>(`/api/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(b),
    });
  }

  async deleteBudget(id: number): Promise<{ id: number }> {
    return this.request<{ id: number }>(`/api/budgets/${id}`, {
      method: 'DELETE',
    });
  }

  // Goals
  async getGoals(): Promise<SavingsGoal[]> {
    return this.request<SavingsGoal[]>('/api/goals');
  }

  async createGoal(g: { name: string; target_amount: number; current_amount?: number }): Promise<SavingsGoal> {
    return this.request<SavingsGoal>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(g),
    });
  }

  async updateGoal(id: number, g: Partial<SavingsGoal>): Promise<SavingsGoal> {
    return this.request<SavingsGoal>(`/api/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(g),
    });
  }

  async contributeGoal(id: number, amount: number): Promise<SavingsGoal> {
    return this.request<SavingsGoal>(`/api/goals/${id}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async deleteGoal(id: number): Promise<{ id: number }> {
    return this.request<{ id: number }>(`/api/goals/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getSummary(month?: string): Promise<FinancialSummary> {
    const query = month ? `?month=${month}` : '';
    return this.request<FinancialSummary>(`/api/analytics/summary${query}`);
  }

  async getMonthly(): Promise<MonthlyMetric[]> {
    return this.request<MonthlyMetric[]>('/api/analytics/monthly');
  }

  async getCategoryMetrics(type: 'Income' | 'Expense' = 'Expense', month?: string): Promise<CategoryMetric[]> {
    const params = new URLSearchParams({ type });
    if (month) params.set('month', month);
    return this.request<CategoryMetric[]>(`/api/analytics/categories?${params.toString()}`);
  }

  async getStatisticalAnalysis(month?: string): Promise<StatisticalAnalysis> {
    const query = month ? `?month=${month}` : '';
    return this.request<StatisticalAnalysis>(`/api/analytics/statistical${query}`);
  }

  // Settings
  async getSettings(): Promise<AppSettings> {
    return this.request<AppSettings>('/api/settings');
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    return this.request<AppSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export const api = new ApiService();
