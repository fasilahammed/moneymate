import React, { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
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

export const App: React.FC = () => {
  // Theme State (Dark & Light Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

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

  // Recalculate deterministic financials in real-time
  const { metrics, categoryStatuses, alerts, advisor } = useMemo(() => {
    return calculateFinancials(salary, categories, transactions, savingsGoals);
  }, [salary, categories, transactions, savingsGoals]);

  // Active Alerts
  const activeAlerts = useMemo(() => {
    return alerts.filter((a) => !dismissedAlertIds.includes(a.id));
  }, [alerts, dismissedAlertIds]);

  // Handlers
  const handleAddTransaction = (newTxData: {
    amount: number;
    categoryId: string;
    type: 'EXPENSE';
    paymentMethod: PaymentMethod;
    note: string;
    date: string;
  }) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      ...newTxData
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const handleUpdateSalary = (newSalary: SalaryProfile) => {
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
  };

  const handleResetDemo = () => {
    setSalary(INITIAL_SALARY);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setDismissedAlertIds([]);
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

      {/* FLOATING ACTION BUTTON (FAB) '+' TO QUICK ADD NEW EXPENSE */}
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
