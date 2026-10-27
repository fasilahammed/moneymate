import React, { useState, useRef, useEffect } from 'react';
import {
  PlusCircle,
  Settings,
  RotateCcw,
  Sun,
  Moon,
  LayoutDashboard,
  PieChart,
  Receipt,
  ChevronDown,
  Check
} from 'lucide-react';
import type { SalaryProfile } from '../../types';

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
  isBackendConnected?: boolean;
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <header className="navbar">
      {/* 1. Brand Logo & Title */}
      <div className="brand-wrapper" onClick={() => onTabChange('dashboard')}>
        <div className="brand-icon-box">
          <img
            src="/favicon-mark.png"
            alt="MoneyMate Logo Mark"
            style={{ width: 28, height: 28, objectFit: 'contain' }}
          />
        </div>
        <div className="brand-text-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="brand-title" style={{ letterSpacing: '-0.03em', fontWeight: 800 }}>
              Money<span style={{ color: '#D4A237' }}>Mate</span>
            </span>
          </div>
          <div className="brand-tagline">
            Smart Salary, Real-Time Advisory & Expense Ledger
          </div>
        </div>
      </div>

      {/* 2. Dynamic Center Navigation Tabs */}
      <div className="nav-page-tabs">
        <button
          id="tab-dashboard"
          className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
          type="button"
          title="Dashboard"
        >
          <LayoutDashboard size={16} />
          <span className="nav-tab-label">Dashboard</span>
        </button>

        <button
          id="tab-analytics"
          className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => onTabChange('analytics')}
          type="button"
          title="Monthly Diagrams"
        >
          <PieChart size={16} />
          <span className="nav-tab-label">Monthly Diagrams</span>
        </button>

        <button
          id="tab-transactions"
          className={`nav-tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => onTabChange('transactions')}
          type="button"
          title="Ledger"
        >
          <Receipt size={16} />
          <span className="nav-tab-label">Ledger</span>
        </button>
      </div>

      {/* 3. Simplified & Responsive Right Controls */}
      <div className="nav-actions" ref={dropdownRef}>
        {/* Quick Log Expense CTA */}
        <button
          id="btn-quick-add-expense"
          className="btn-primary"
          onClick={onOpenAddExpense}
          type="button"
        >
          <PlusCircle size={16} />
          <span className="btn-label">Log Expense</span>
        </button>

        {/* Profile Dropdown Trigger */}
        <button
          id="btn-profile-dropdown"
          className={`profile-avatar-trigger ${isProfileOpen ? 'active' : ''}`}
          onClick={() => setIsProfileOpen((prev) => !prev)}
          type="button"
          aria-expanded={isProfileOpen}
          aria-label="User profile and settings menu"
        >
          <div className="profile-avatar-circle">
            FA
            <span className="profile-status-dot" />
          </div>

          <div className="profile-trigger-info">
            <span className="profile-user-name">Fasil Ahammed</span>
            <span className="profile-user-salary">
              {salary.currency}{salary.monthlyTakeHome.toLocaleString()}
            </span>
          </div>

          <ChevronDown
            size={14}
            className={`profile-chevron ${isProfileOpen ? 'rotated' : ''}`}
          />
        </button>

        {/* 4. Elegant Profile Dropdown Menu (Normal & Solid Opaque) */}
        {isProfileOpen && (
          <div className="profile-dropdown-menu" id="profile-dropdown-menu">
            {/* User Account Info Header */}
            <div className="dropdown-user-header">
              <div className="dropdown-avatar">FA</div>
              <div className="dropdown-user-details">
                <div className="dropdown-user-name">Fasil Ahammed</div>
                <div className="dropdown-user-email">fasil@moneymate.local</div>
                <div className="dropdown-user-status">
                  <span className="status-dot-active" />
                  <span>Personal Account • Live Synced</span>
                </div>
              </div>
            </div>

            {/* Salary Card Inside Dropdown */}
            <div className="dropdown-salary-section">
              <div className="dropdown-salary-card">
                <div>
                  <div className="dropdown-salary-label">Monthly Salary</div>
                  <div className="dropdown-salary-amount">
                    {salary.currency}{salary.monthlyTakeHome.toLocaleString()}
                  </div>
                  <div className="dropdown-salary-sub">Payday: Day {salary.paydayDay} of month</div>
                </div>

                <button
                  id="btn-edit-salary-dropdown"
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenSalaryModal();
                  }}
                  className="dropdown-change-btn"
                >
                  <Settings size={13} />
                  <span>Change</span>
                </button>
              </div>
            </div>

            {/* Actions Inside Dropdown */}
            <div className="dropdown-actions-section">
              {/* Appearance Toggle */}
              <div className="dropdown-menu-row">
                <div className="dropdown-row-label">
                  {currentTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                  <span>Appearance</span>
                </div>
                <button
                  id="btn-theme-toggle-dropdown"
                  type="button"
                  onClick={onToggleTheme}
                  className="dropdown-theme-pill"
                >
                  <span>{currentTheme === 'dark' ? 'Dark Obsidian' : 'Light Crystal'}</span>
                  <Check size={12} color="var(--emerald-main)" />
                </button>
              </div>

              {/* Reset to ₹25,000 Demo Data */}
              <button
                id="btn-reset-demo-dropdown"
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  onResetDemo();
                }}
                className="dropdown-reset-btn"
              >
                <RotateCcw size={15} />
                <span>Reset to Default ₹25,000</span>
              </button>
            </div>

            {/* Dropdown Footer */}
            <div className="dropdown-footer">
              <span>MoneyMate v1.0</span>
              <span>All Calculations Synced</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
