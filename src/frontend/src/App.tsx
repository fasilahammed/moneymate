import React, { useState, useMemo } from 'react';
import {
  INITIAL_SALARY,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_SAVINGS_GOALS,
  calculateFinancials
} from './data/financialEngine';
import type { SalaryProfile, Category, Transaction, SavingsGoal, PaymentMethod } from './types';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { AlertBanners } from './components/AlertBanners';
import { CategoryGrid } from './components/CategoryGrid';
import { SideAdvisor } from './components/SideAdvisor';
import { TransactionList } from './components/TransactionList';
import { SavingsGoalCard } from './components/SavingsGoalCard';
import { AddTransactionModal } from './components/AddTransactionModal';
import { SalaryModal } from './components/SalaryModal';

export const App: React.FC = () => {
  // App State
  const [salary, setSalary] = useState<SalaryProfile>(INITIAL_SALARY);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(INITIAL_SAVINGS_GOALS);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  // Modals
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

  // Recalculate deterministic financials in real-time
  const { metrics, categoryStatuses, alerts, advisor } = useMemo(() => {
    return calculateFinancials(salary, categories, transactions, savingsGoals);
  }, [salary, categories, transactions, savingsGoals]);

  // Filter out dismissed alerts
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
    // If salary changed, scale recommended category allocations proportionally
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
      {/* 1. Header Navigation */}
      <Header
        salary={salary}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        onOpenSalaryModal={() => setIsSalaryModalOpen(true)}
        onResetDemo={handleResetDemo}
      />

      <main className="main-content">
        {/* 2. Top Executive Summary Metric Cards */}
        <SummaryCards metrics={metrics} salary={salary} />

        {/* 3. Real-Time Overspending & Pace Alert Banners */}
        <AlertBanners alerts={activeAlerts} onDismissAlert={handleDismissAlert} />

        {/* 4. Two-Column Dashboard Layout: Left Content + Right Side Advisor */}
        <div className="dashboard-columns">
          {/* LEFT MAIN COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Category Budgets & Consumption Progress */}
            <CategoryGrid
              categoryStatuses={categoryStatuses}
              salary={salary}
              onSelectCategory={() => setIsAddExpenseOpen(true)}
            />

            {/* Savings Goal Progress */}
            {savingsGoals.length > 0 && (
              <SavingsGoalCard
                goal={savingsGoals[0]}
                salary={salary}
                metrics={metrics}
              />
            )}

            {/* Expense & Inflow Ledger */}
            <TransactionList
              transactions={transactions}
              categories={categories}
              salary={salary}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>

          {/* RIGHT SIDE ADVISOR COLUMN (User's Core Requirement) */}
          <SideAdvisor
            advisor={advisor}
            metrics={metrics}
            categoryStatuses={categoryStatuses}
            salary={salary}
          />
        </div>
      </main>

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
