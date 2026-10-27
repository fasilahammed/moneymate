import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import {
  INITIAL_SALARY,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_SAVINGS_GOALS,
  calculateFinancials
} from './data/financialEngine';
import type {
  SalaryProfile,
  Category,
  Transaction,
  SavingsGoal,
  PaymentMethod,
  DashboardMetrics,
  CategoryStatus,
  AlertItem as FinancialAlert,
  AdvisorRecommendation
} from './types';
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

  // Backend-Computed Deterministic States (Calculations handled strictly by .NET Backend)
  const initialCalculations = useMemo(
    () => calculateFinancials(INITIAL_SALARY, INITIAL_CATEGORIES, INITIAL_TRANSACTIONS, INITIAL_SAVINGS_GOALS),
    []
  );
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialCalculations.metrics);
  const [categoryStatuses, setCategoryStatuses] = useState<CategoryStatus[]>(initialCalculations.categoryStatuses);
  const [backendAlerts, setBackendAlerts] = useState<FinancialAlert[]>(initialCalculations.alerts);
  const [advisor, setAdvisor] = useState<AdvisorRecommendation>(initialCalculations.advisor);

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

  // Sync all calculations, categories, salary profile, and ledger from backend
  const syncWithBackend = useCallback(async () => {
    try {
      const [dashData, txList, salProfile] = await Promise.all([
        moneyMateApi.getDashboardSummary(),
        moneyMateApi.getTransactions(),
        moneyMateApi.getSalaryProfile()
      ]);

      if (dashData) {
        // Backend handles all business math and deterministic allocations
        setMetrics(dashData.metrics);
        setCategoryStatuses(dashData.categoryStatuses);
        setBackendAlerts(dashData.alerts);
        setAdvisor(dashData.advisor);
        setCategories(dashData.categoryStatuses.map((cs) => cs.category));
      }

      if (txList) {
        setTransactions(txList);
      }

      if (salProfile) {
        setSalary((prev) => ({
          ...prev,
          monthlyTakeHome: salProfile.monthlyTakeHome,
          paydayDay: salProfile.paydayDayOfMonth
        }));
      }

      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend sync error, running in offline fallback mode:', err);
      setIsBackendConnected(false);
    }
  }, []);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Active Alerts filtered by user dismissals
  const activeAlerts = useMemo(() => {
    return backendAlerts.filter((a) => !dismissedAlertIds.includes(a.id));
  }, [backendAlerts, dismissedAlertIds]);

  // Handlers with Live Backend Recalculation
  const handleAddTransaction = async (newTxData: {
    amount: number;
    categoryId: string;
    type: 'EXPENSE';
    paymentMethod: PaymentMethod;
    note: string;
    date: string;
  }) => {
    try {
      await moneyMateApi.createTransaction(newTxData);
      // Immediately refresh calculations and state from backend
      await syncWithBackend();
      setIsBackendConnected(true);
    } catch (err) {
      console.error('Failed to persist transaction to backend:', err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await moneyMateApi.deleteTransaction(id);
      // Immediately refresh calculations and state from backend
      await syncWithBackend();
      setIsBackendConnected(true);
    } catch (err) {
      console.error('Failed to delete transaction from backend:', err);
    }
  };

  const handleUpdateSalary = async (newSalary: SalaryProfile) => {
    try {
      // 1. Send new salary to backend
      await moneyMateApi.updateSalary({
        monthlyTakeHome: newSalary.monthlyTakeHome,
        paydayDayOfMonth: newSalary.paydayDay
      });

      // 2. Fetch fresh backend calculations (which scaled all categories, safe balances, daily pace)
      await syncWithBackend();
      setIsBackendConnected(true);
    } catch (err) {
      console.error('Failed to update salary in backend:', err);
    }
  };

  const handleResetDemo = async () => {
    try {
      await moneyMateApi.updateSalary({
        monthlyTakeHome: 25000,
        paydayDayOfMonth: 1
      });
      setDismissedAlertIds([]);
      await syncWithBackend();
    } catch {
      setSalary(INITIAL_SALARY);
      setCategories(INITIAL_CATEGORIES);
      setTransactions(INITIAL_TRANSACTIONS);
      setSavingsGoals(INITIAL_SAVINGS_GOALS);
      setDismissedAlertIds([]);
    }
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
        isBackendConnected={isBackendConnected}
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
