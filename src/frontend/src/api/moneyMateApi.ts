import type {
  DashboardMetrics,
  CategoryStatus,
  AlertItem,
  AdvisorRecommendation,
  Transaction,
  PaymentMethod
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export interface DashboardResponse {
  metrics: DashboardMetrics;
  categoryStatuses: CategoryStatus[];
  alerts: AlertItem[];
  advisor: AdvisorRecommendation;
}

export const moneyMateApi = {
  async getDashboardSummary(): Promise<DashboardResponse> {
    const res = await fetch(`${API_BASE_URL}/dashboard/summary`);
    if (!res.ok) {
      throw new Error(`Failed to fetch dashboard: ${res.statusText}`);
    }
    const data = await res.json();
    return {
      metrics: {
        totalIncome: data.metrics.totalIncome,
        totalSpent: data.metrics.totalSpent,
        committedSavings: data.metrics.committedSavings,
        currentCashBalance: data.metrics.currentCashBalance,
        safeAvailableBalance: data.metrics.safeAvailableBalance,
        dailyBurnRate: data.metrics.dailyBurnRate,
        daysRemaining: data.metrics.daysRemaining,
        healthScore: data.metrics.healthScore
      },
      categoryStatuses: data.categoryStatuses.map((cs: any) => ({
        category: {
          id: cs.categoryId,
          name: cs.name,
          icon: cs.icon,
          allocatedAmount: cs.allocated,
          colorHex: cs.colorHex,
          isEssential: true
        },
        spent: cs.spent,
        remaining: cs.remaining,
        percentageUsed: cs.percentageUsed,
        status: cs.status,
        dailySafePace: cs.dailySafePace
      })),
      alerts: data.alerts.map((a: any) => ({
        id: a.id,
        severity: a.severity,
        title: a.title,
        message: a.message,
        categoryId: a.categoryId,
        date: a.date
      })),
      advisor: data.advisor
    };
  },

  async getTransactions(): Promise<Transaction[]> {
    const res = await fetch(`${API_BASE_URL}/transactions`);
    if (!res.ok) {
      throw new Error(`Failed to fetch transactions: ${res.statusText}`);
    }
    const data = await res.json();
    return data.map((t: any) => ({
      id: t.id,
      amount: t.amount,
      categoryId: t.categoryId,
      type: t.transactionType,
      date: t.transactionDate,
      paymentMethod: t.paymentMethod,
      note: t.note
    }));
  },

  async createTransaction(tx: {
    amount: number;
    categoryId: string;
    type: 'EXPENSE';
    paymentMethod: PaymentMethod;
    note: string;
    date: string;
  }): Promise<Transaction> {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: tx.amount,
        categoryId: tx.categoryId,
        transactionType: tx.type,
        paymentMethod: tx.paymentMethod,
        note: tx.note,
        date: tx.date
      })
    });
    if (!res.ok) {
      throw new Error(`Failed to save transaction: ${res.statusText}`);
    }
    const data = await res.json();
    return {
      id: data.id,
      amount: data.amount,
      categoryId: data.categoryId,
      type: data.transactionType,
      date: data.transactionDate,
      paymentMethod: data.paymentMethod,
      note: data.note
    };
  },

  async deleteTransaction(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      throw new Error(`Failed to delete transaction: ${res.statusText}`);
    }
  },

  async getSalaryProfile(): Promise<{ monthlyTakeHome: number; paydayDayOfMonth: number }> {
    const res = await fetch(`${API_BASE_URL}/salary-profile`);
    if (!res.ok) {
      throw new Error(`Failed to fetch salary: ${res.statusText}`);
    }
    const data = await res.json();
    return {
      monthlyTakeHome: Number(data.monthlyTakeHome),
      paydayDayOfMonth: Number(data.paydayDayOfMonth)
    };
  },

  async updateSalary(salary: { monthlyTakeHome: number; paydayDayOfMonth: number }): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/salary-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(salary)
    });
    if (!res.ok) {
      throw new Error(`Failed to update salary: ${res.statusText}`);
    }
  },

  async askAdvisor(message: string): Promise<{ reply: string; isAffordable: boolean; safeAvailableBalance: number }> {
    const res = await fetch(`${API_BASE_URL}/advisor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (!res.ok) {
      throw new Error(`Failed to get advisor response: ${res.statusText}`);
    }
    return res.json();
  }
};

// Backward-compatible alias
export const spendwiseApi = moneyMateApi;
