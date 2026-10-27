import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Database } from 'lucide-react';
import {
  INITIAL_SALARY,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_SAVINGS_GOALS,
  calculateFinancials
} from './data/financialEngine';
import type { SalaryProfile, Category, Transaction, SavingsGoal, PaymentMethod } from './types';
import {
  Header,
  SummaryCards,
  AlertBanners,
  CategoryGrid,
  SideAdvisor,
  TransactionList,
  SavingsGoalCard,
  AddTransactionModal,
  SalaryModal,
  AnalyticsPage
} from './components';
import type { ActiveTab } from './components';
import { moneyMateApi } from './api/moneyMateApi';

export const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Backend Sync Status
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Financial State
  const [salary, setSalary] = useState<SalaryProfile>(INITIAL_SALARY);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(INITIAL_SAVINGS_GOALS);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  // Modal Visibility
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

  // Sync theme to root DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch from live backend on mount
  const syncWithBackend = useCallback(async () => {
    try {
      const [dashData, txList] = await Promise.all([
        moneyMateApi.getDashboardSummary(),
        moneyMateApi.getTransactions()
      ]);

      if (dashData && txList) {
        setCategories(dashData.categoryStatuses.map((cs) => cs.category));
        setTransactions(txList);
        setIsBackendConnected(true);
      }
    } catch {
      // Offline fallback: keep local initial data
      setIsBackendConnected(false);
    }
  }, []);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Recalculate deterministic financials in real-time
  const { metrics, categoryStatuses, alerts, advisor } = useMemo(() => {
    return calculateFinancials(salary, categories, transactions, savingsGoals);
  }, [salary, categories, transactions, savingsGoals]);

  // Active Alerts
  const activeAlerts = useMemo(() => {
    return alerts.filter((a) => !dismissedAlertIds.includes(a.id));
  }, [alerts, dismissedAlertIds]);

  // Handlers with Live Persistence
  const handleAddTransaction = async (newTxData: {
    amount: number;
    categoryId: string;
    type: 'EXPENSE';
    paymentMethod: PaymentMethod;
    note: string;
    date: string;
  }) => {
    // 1. Optimistic UI update
    const tempId = `tx-${Date.now()}`;
    const optimisticTx: Transaction = {
      id: tempId,
      ...newTxData
    };
    setTransactions((prev) => [optimisticTx, ...prev]);

    // 2. Persist to SQL Server via API
    try {
      const persistedTx = await moneyMateApi.createTransaction(newTxData);
      setTransactions((prev) =>
        prev.map((t) => (t.id === tempId ? persistedTx : t))
      );
      setIsBackendConnected(true);
    } catch {
      // Keep optimistic entry locally
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    // 1. Optimistic removal
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));

    // 2. Persist deletion to SQL Server
    try {
      await moneyMateApi.deleteTransaction(id);
      setIsBackendConnected(true);
    } catch {
      // Kept removed in UI
    }
  };

  const handleUpdateSalary = async (newSalary: SalaryProfile) => {
    const ratio = newSalary.monthlyTakeHome / salary.monthlyTakeHome;
    const scaledCategories = categories.map((cat) => ({
      ...cat,
      allocatedAmount: Math.round(cat.allocatedAmount * ratio)
    }));
    const scaledGoals = savingsGoals.map((g) => ({
      ...g,
      monthlyCommitment: Math.round(g.monthlyCommitment * ratio)
    }));

    setSalary(newSalary);
    setCategories(scaledCategories);
    setSavingsGoals(scaledGoals);

    // Persist to backend
    try {
      await moneyMateApi.updateSalary({
        monthlyTakeHome: newSalary.monthlyTakeHome,
        paydayDayOfMonth: newSalary.paydayDay
      });
      setIsBackendConnected(true);
    } catch {
      // Local state kept
    }
  };

  const handleResetDemo = () => {
    setSalary(INITIAL_SALARY);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setDismissedAlertIds([]);
    syncWithBackend();
  };

  const handleDismissAlert = (id: string) => {
    setDismissedAlertIds((prev) => [...prev, id]);
  };

  return (
    <div className="app-layout">
      {/* 1. Header Navigation & Theme Switcher */}
      <Header
        salary={salary}
        currentTheme={theme}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggleTheme={toggleTheme}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        onOpenSalaryModal={() => setIsSalaryModalOpen(true)}
        onResetDemo={handleResetDemo}
      />

      <main className="main-content">
        {/* Backend Connectivity Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.73rem',
              padding: '3px 10px',
              borderRadius: '20px',
              background: isBackendConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              border: `1px solid ${isBackendConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              color: isBackendConnected ? 'var(--emerald-main)' : 'var(--amber-main)',
              fontWeight: 600
            }}
          >
            <Database size={13} />
            <span>{isBackendConnected ? 'Connected to .NET 9 API & SQL Server' : 'Local Storage Mode'}</span>
          </div>
        </div>

        {/* Persistent Top Executive Metrics */}
        <SummaryCards metrics={metrics} salary={salary} />

        {/* Real-Time Compact Alert Notification Bar */}
        <AlertBanners alerts={activeAlerts} onDismissAlert={handleDismissAlert} />

        {/* TAB 1: MAIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-columns">
            {/* Left Content Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <CategoryGrid
                categoryStatuses={categoryStatuses}
                salary={salary}
                onSelectCategory={() => setIsAddExpenseOpen(true)}
              />

              {savingsGoals.length > 0 && (
                <SavingsGoalCard
                  goal={savingsGoals[0]}
                  salary={salary}
                  metrics={metrics}
                />
              )}

              <TransactionList
                transactions={transactions}
                categories={categories}
                salary={salary}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </div>

            {/* Right Side Advisor Column */}
            <SideAdvisor
              advisor={advisor}
              metrics={metrics}
              categoryStatuses={categoryStatuses}
              salary={salary}
            />
          </div>
        )}

        {/* TAB 2: MONTHLY EXPENSE DIAGRAMS & ANALYTICS */}
        {activeTab === 'analytics' && (
          <AnalyticsPage
            salary={salary}
            metrics={metrics}
            categoryStatuses={categoryStatuses}
            transactions={transactions}
          />
        )}

        {/* TAB 3: FULL TRANSACTIONS LEDGER */}
        {activeTab === 'transactions' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <TransactionList
              transactions={transactions}
              categories={categories}
              salary={salary}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>
        )}
      </main>

      {/* FLOATING ACTION BUTTON (FAB) '+' */}
      <button
        id="fab-add-expense"
        className="fab-add-expense"
        onClick={() => setIsAddExpenseOpen(true)}
        title="Quick Log Expense (+)"
        type="button"
      >
        <div className="fab-pulse-ring" />
        <Plus size={28} strokeWidth={2.8} />
      </button>

      {/* MODALS */}
      <AddTransactionModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        categories={categories}
        salary={salary}
        metrics={metrics}
        categoryStatuses={categoryStatuses}
        onAddTransaction={handleAddTransaction}
      />

      <SalaryModal
        isOpen={isSalaryModalOpen}
        onClose={() => setIsSalaryModalOpen(false)}
        salary={salary}
        onUpdateSalary={handleUpdateSalary}
      />
    </div>
  );
};

export default App;
