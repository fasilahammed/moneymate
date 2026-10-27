import React, { useState } from 'react';
import { X, PlusCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Category, PaymentMethod, SalaryProfile, DashboardMetrics, CategoryStatus } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  salary: SalaryProfile;
  metrics: DashboardMetrics;
  categoryStatuses: CategoryStatus[];
  onAddTransaction: (tx: {
    amount: number;
    categoryId: string;
    type: 'EXPENSE';
    paymentMethod: PaymentMethod;
    note: string;
    date: string;
  }) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  salary,
  metrics,
  categoryStatuses,
  onAddTransaction
}) => {
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const enteredAmount = parseFloat(amountStr) || 0;
  const targetCategoryStatus = categoryStatuses.find((cs) => cs.category.id === categoryId);

  // Simulation calculations
  const projectedCatSpent = (targetCategoryStatus?.spent || 0) + enteredAmount;
  const catLimit = targetCategoryStatus?.category.allocatedAmount || 1;
  const projectedPct = (projectedCatSpent / catLimit) * 100;
  const projectedSafeBalance = metrics.safeAvailableBalance - enteredAmount;

  const isCategoryOverspent = projectedPct > 100;
  const isPaceWarning = projectedPct >= 80 && projectedPct <= 100;
  const isDeficitRisk = projectedSafeBalance < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredAmount <= 0) return;

    onAddTransaction({
      amount: enteredAmount,
      categoryId,
      type: 'EXPENSE',
      paymentMethod,
      note: note.trim() || targetCategoryStatus?.category.name || 'Expense',
      date
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <PlusCircle size={22} color="var(--emerald-400)" />
            <span>Log New Expense</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="input-tx-amount">
              Expense Amount ({salary.currency}) *
            </label>
            <input
              id="input-tx-amount"
              type="number"
              className="form-input"
              placeholder="e.g. 750"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              min="1"
              step="any"
              required
              autoFocus
            />
          </div>

          {/* Category Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="select-tx-category">
              Expense Category *
            </label>
            <select
              id="select-tx-category"
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Budget: ₹{c.allocatedAmount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Real-Time Impact & Overspending Simulation Banner */}
          {enteredAmount > 0 && targetCategoryStatus && (
            <div
              className={`preview-impact-box ${
                isCategoryOverspent || isDeficitRisk ? 'danger' : ''
              }`}
            >
              {isCategoryOverspent || isDeficitRisk ? (
                <AlertTriangle size={18} color="var(--rose-400)" style={{ flexShrink: 0 }} />
              ) : (
                <CheckCircle size={18} color="var(--emerald-400)" style={{ flexShrink: 0 }} />
              )}
              <div style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                {isDeficitRisk ? (
                  <strong>
                    ⚠️ Deficit Alert: This ₹{enteredAmount.toLocaleString()} expense pushes your safe balance into negative (-₹{Math.abs(projectedSafeBalance).toLocaleString()})!
                  </strong>
                ) : isCategoryOverspent ? (
                  <strong>
                    ⚠️ Over-Budget Warning: {targetCategoryStatus.category.name} will reach {projectedPct.toFixed(0)}% (₹{(projectedCatSpent - catLimit).toLocaleString()} over limit)!
                  </strong>
                ) : isPaceWarning ? (
                  <span>
                    ⚠️ High Pace Warning: {targetCategoryStatus.category.name} will reach {projectedPct.toFixed(0)}% of monthly allocation.
                  </span>
                ) : (
                  <span>
                    Safe: {targetCategoryStatus.category.name} will be at {projectedPct.toFixed(0)}%. Safe remaining balance: ₹{projectedSafeBalance.toLocaleString()}.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="form-group">
            <label className="form-label" htmlFor="select-tx-method">
              Payment Mode
            </label>
            <select
              id="select-tx-method"
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
              <option value="Cash">Cash In Hand</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Net Banking">Net Banking</option>
            </select>
          </div>

          {/* Description / Note */}
          <div className="form-group">
            <label className="form-label" htmlFor="input-tx-note">
              Description / Note
            </label>
            <input
              id="input-tx-note"
              type="text"
              className="form-input"
              placeholder="e.g. Dinner with friends, Bus ticket, Grocery..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="input-tx-date">
              Transaction Date
            </label>
            <input
              id="input-tx-date"
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Cancel
            </button>
            <button
              id="btn-submit-expense"
              type="submit"
              className="btn-primary"
              style={{ flex: 2, justifyContent: 'center' }}
            >
              Save & Recalculate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
