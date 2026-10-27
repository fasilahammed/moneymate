import React, { useState } from 'react';
import { Search, Filter, Trash2, Receipt } from 'lucide-react';
import type { Transaction, Category, SalaryProfile } from '../../types';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  salary: SalaryProfile;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  salary,
  onDeleteTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const filteredTransactions = transactions
    .filter((tx) => {
      const matchesSearch =
        tx.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = categoryFilter === 'ALL' || tx.categoryId === categoryFilter;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="glass-panel transactions-panel" id="transactions-section">
      <div className="section-title-row">
        <h2 className="section-title">
          <Receipt size={20} color="var(--indigo-main)" />
          <span>Expense & Inflow Ledger</span>
        </h2>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          {filteredTransactions.length} recorded operations
        </span>
      </div>

      {/* Search and Filters */}
      <div className="table-controls">
        <div className="search-input-box">
          <Search size={16} color="var(--text-dim)" />
          <input
            id="input-search-tx"
            type="text"
            placeholder="Search by note, vendor, payment method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="var(--text-dim)" />
          <select
            id="select-category-filter"
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Method</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'center', width: '48px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-dim)' }}>
                  No transactions match your search filter.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                const isExpense = tx.type === 'EXPENSE';

                return (
                  <tr key={tx.id} id={`tx-row-${tx.id}`}>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {tx.date}
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: `${cat?.colorHex || '#64748b'}20`,
                          color: cat?.colorHex || 'var(--text-bright)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600
                        }}
                      >
                        {cat?.name || 'General'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{tx.note}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {tx.paymentMethod}
                    </td>
                    <td className={`tx-amount-col ${isExpense ? 'tx-expense' : 'tx-income'}`}>
                      {isExpense ? '-' : '+'}
                      {salary.currency}{tx.amount.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="delete-action-btn"
                        onClick={() => onDeleteTransaction(tx.id)}
                        title="Delete transaction and restore balance"
                        type="button"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
