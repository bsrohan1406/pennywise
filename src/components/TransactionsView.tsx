import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Transaction, Category } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: number) => Promise<void>;
  globalSearchQuery?: string;
}

export const TransactionsView: React.FC<Props> = ({
  transactions,
  categories,
  currency,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  globalSearchQuery = '',
}) => {
  const [search, setSearch] = useState(globalSearchQuery);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const catMap = useMemo(() => {
    const map = new Map<number, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Months available
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((t) => {
      if (t.transaction_date) months.add(t.transaction_date.slice(0, 7));
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      // Type
      if (selectedType !== 'All' && t.type.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }
      // Category
      if (selectedCategory !== 'All' && t.category_id !== parseInt(selectedCategory, 10)) {
        return false;
      }
      // Month
      if (selectedMonth && !t.transaction_date.startsWith(selectedMonth)) {
        return false;
      }
      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const descMatch = (t.description || '').toLowerCase().includes(q);
        const catName = (catMap.get(t.category_id)?.name || '').toLowerCase();
        const catMatch = catName.includes(q);
        const amtMatch = t.amount.toString().includes(q);
        return descMatch || catMatch || amtMatch;
      }
      return true;
    });
  }, [transactions, selectedType, selectedCategory, selectedMonth, search, catMap]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Description'];
    const rows = filtered.map((t) => [
      t.id,
      t.transaction_date,
      t.type,
      `"${(catMap.get(t.category_id)?.name || 'Uncategorized').replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pennywise_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction record?')) {
      setDeletingId(id);
      try {
        await onDeleteTransaction(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header & Filters Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        {/* Top row: search + action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by description, merchant, or amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              title="Download CSV report"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Record Transaction</span>
            </button>
          </div>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Type Filter */}
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            {['All', 'Expense', 'Income'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  selectedType === t
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Month Dropdown */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Months</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {(search || selectedType !== 'All' || selectedCategory !== 'All' || selectedMonth) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedType('All');
                setSelectedCategory('All');
                setSelectedMonth('');
              }}
              className="text-emerald-400 hover:underline text-[11px] ml-auto font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{filtered.length}</strong> of{' '}
            <strong className="text-white">{transactions.length}</strong> transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Description / Merchant</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((tx) => {
                const cat = catMap.get(tx.category_id);
                const isIncome = tx.type.toLowerCase() === 'income';

                return (
                  <tr key={tx.id} className="hover:bg-slate-850/40 transition-colors group">
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {formatDate(tx.transaction_date)}
                    </td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4 text-slate-200">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat?.color || '#94a3b8' }}
                        />
                        {cat?.name || `Category #${tx.category_id}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                      {tx.description || <span className="text-slate-600 italic">No notes</span>}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold text-sm ${
                        isIncome ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(tx.amount, currency)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          aria-label={`Edit transaction ${tx.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          disabled={deletingId === tx.id}
                          aria-label={`Delete transaction ${tx.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 space-y-2">
                    <p className="font-semibold text-slate-400">No matching transactions found</p>
                    <p className="text-xs">Adjust your search query or filter selections above.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
