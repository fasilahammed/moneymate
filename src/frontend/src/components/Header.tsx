import React from 'react';
import { Sparkles, PlusCircle, Settings, RotateCcw, Wallet } from 'lucide-react';
import type { SalaryProfile } from '../types';

interface HeaderProps {
  salary: SalaryProfile;
  onOpenAddExpense: () => void;
  onOpenSalaryModal: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  salary,
  onOpenAddExpense,
  onOpenSalaryModal,
  onResetDemo
}) => {
  return (
    <header className="navbar">
      <div className="brand-wrapper">
        <div className="brand-icon-box">
          <Sparkles size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="brand-title">SpendWise AI</span>
            <span className="brand-tag">Copilot v1.0</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Personal Salary Intelligence & Active Advisory
          </div>
        </div>
      </div>

      <div className="nav-actions">
        {/* Salary Status Pill */}
        <div
          id="btn-salary-pill"
          className="salary-pill"
          onClick={onOpenSalaryModal}
          title="Click to edit salary or pay cycle"
        >
          <Wallet size={16} color="var(--emerald-400)" />
          <span style={{ color: 'var(--text-muted)' }}>Salary:</span>
          <span className="salary-amount-highlight">
            {salary.currency}{salary.monthlyTakeHome.toLocaleString()}
          </span>
          <Settings size={13} color="var(--text-dim)" style={{ marginLeft: 4 }} />
        </div>

        {/* Reset Demo State Button */}
        <button
          id="btn-reset-demo"
          className="btn-secondary"
          onClick={onResetDemo}
          title="Reset to initial ₹25,000 blueprint data"
          style={{ padding: '8px 12px', fontSize: '0.8rem' }}
        >
          <RotateCcw size={14} />
          <span>Reset Demo</span>
        </button>

        {/* Add Expense Action Button */}
        <button
          id="btn-quick-add-expense"
          className="btn-primary"
          onClick={onOpenAddExpense}
        >
          <PlusCircle size={18} />
          <span>Log Expense</span>
        </button>
      </div>
    </header>
  );
};
