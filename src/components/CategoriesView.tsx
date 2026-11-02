import React, { useState } from 'react';
import { Plus, Tags, Edit2, Trash2, Layers } from 'lucide-react';
import { Category, Transaction } from '../types';

interface Props {
  categories: Category[];
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (id: number) => Promise<void>;
}

export const CategoriesView: React.FC<Props> = ({
  categories,
  transactions,
  onOpenAddModal,
  onEditCategory,
  onDeleteCategory,
}) => {
  const [filterType, setFilterType] = useState<'All' | 'Expense' | 'Income'>('All');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredCategories = categories.filter((c) => {
    if (filterType === 'All') return true;
    return c.type.toLowerCase() === filterType.toLowerCase();
  });

  const getTransactionCount = (catId: number) => {
    return transactions.filter((t) => t.category_id === catId).length;
  };

  const handleDelete = async (id: number) => {
    const count = getTransactionCount(id);
    if (count > 0) {
      setErrorMessage(
        `Cannot delete this category because it is linked to ${count} existing transaction(s). Reassign or delete those transactions first.`
      );
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      setDeletingId(id);
      setErrorMessage(null);
      try {
        await onDeleteCategory(id);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to delete category');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-3">
          <Tags className="w-5 h-5 text-emerald-400" />
          <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
            {(['All', 'Expense', 'Income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === t
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t} Categories
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Category</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map((c) => {
          const count = getTransactionCount(c.id);
          const isIncome = c.type.toLowerCase() === 'income';

          return (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: c.color }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white truncate max-w-[140px]">
                      {c.name}
                    </h3>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        isIncome
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {c.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditCategory(c)}
                    aria-label={`Edit ${c.name}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
                    aria-label={`Delete ${c.name}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>Transactions Linked</span>
                <span className="font-bold text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded-md text-[11px]">
                  {count}
                </span>
              </div>
            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="col-span-full py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-400">No categories found</p>
            <p className="text-xs text-slate-500">Create custom categories to organize your expenses.</p>
          </div>
        )}
      </div>
    </div>
  );
};
