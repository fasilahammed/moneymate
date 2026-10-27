import React from 'react';
import {
  Sparkles,
  PlusCircle,
  Settings,
  RotateCcw,
  Wallet,
  Sun,
  Moon,
  LayoutDashboard,
  PieChart,
  Receipt
} from 'lucide-react';
import type { SalaryProfile } from '../types';

export type ActiveTab = 'dashboard' | 'analytics' | 'transactions';

interface HeaderProps {
  salary: SalaryProfile;
  currentTheme: 'dark' | 'light';
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onToggleTheme: () => void;
  onOpenAddExpense: () => void;
  onOpenSalaryModal: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  salary,
  currentTheme,
  activeTab,
  onTabChange,
  onToggleTheme,
  onOpenAddExpense,
  onOpenSalaryModal,
  onResetDemo
}) => {
  return (
    <header className="navbar">
      {/* Brand */}
      <div className="brand-wrapper" onClick={() => onTabChange('dashboard')}>
        <div className="brand-icon-box">
          <Sparkles size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="brand-title">SpendWise AI</span>
            <span className="brand-tag">Copilot v1.0</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Smart Salary & Real-Time Financial Advisory
          </div>
        </div>
      </div>

      {/* Center Navigation Tabs (Dashboard, Monthly Diagrams, Transactions) */}
      <div className="nav-page-tabs">
        <button
          id="tab-dashboard"
          className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
          type="button"
        >
          <LayoutDashboard size={15} />
          <span>Dashboard</span>
        </button>

        <button
          id="tab-analytics"
          className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => onTabChange('analytics')}
          type="button"
        >
          <PieChart size={15} />
          <span>Monthly Diagrams</span>
        </button>

        <button
          id="tab-transactions"
          className={`nav-tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => onTabChange('transactions')}
          type="button"
        >
          <Receipt size={15} />
          <span>Ledger</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="nav-actions">
        {/* Dark / Light Mode Toggle Button */}
        <button
          id="btn-toggle-theme"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          type="button"
        >
          {currentTheme === 'dark' ? (
            <Sun size={19} color="var(--amber-light)" />
          ) : (
            <Moon size={19} color="var(--indigo-main)" />
          )}
        </button>

        {/* Salary Status Pill */}
        <div
          id="btn-salary-pill"
          className="salary-pill"
          onClick={onOpenSalaryModal}
          title="Click to edit salary or pay cycle"
        >
          <Wallet size={16} color="var(--emerald-main)" />
          <span style={{ color: 'var(--text-muted)' }}>Salary:</span>
          <span className="salary-amount-highlight">
            {salary.currency}{salary.monthlyTakeHome.toLocaleString()}
          </span>
          <Settings size={13} color="var(--text-dim)" style={{ marginLeft: 2 }} />
        </div>

        {/* Reset Demo State Button */}
        <button
          id="btn-reset-demo"
          className="btn-secondary"
          onClick={onResetDemo}
          title="Reset to default ₹25,000 blueprint data"
          style={{ padding: '8px 12px', fontSize: '0.8rem' }}
          type="button"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>

        {/* Add Expense Action Button */}
        <button
          id="btn-quick-add-expense"
          className="btn-primary"
          onClick={onOpenAddExpense}
          type="button"
        >
          <PlusCircle size={18} />
          <span>Log Expense</span>
        </button>
      </div>
    </header>
  );
};
