export type TransactionType = 'EXPENSE' | 'INCOME';

export type PaymentMethod = 'UPI' | 'Cash' | 'Debit Card' | 'Credit Card' | 'Net Banking';

export interface Transaction {
  id: string;
  amount: number;
  categoryId: string;
  type: TransactionType;
  date: string;
  paymentMethod: PaymentMethod;
  note: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  allocatedAmount: number;
  colorHex: string;
  isEssential: boolean;
}

export interface SalaryProfile {
  monthlyTakeHome: number;
  paydayDay: number; // e.g. 1 (1st of month)
  currency: string;  // e.g. '₹'
  monthName: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  monthlyCommitment: number;
  targetDate: string;
  icon: string;
}

export interface CategoryStatus {
  category: Category;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: 'HEALTHY' | 'WARNING' | 'EXCEEDED';
  dailySafePace: number;
}

export interface AlertItem {
  id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  categoryId?: string;
  date: string;
}

export interface AdvisorRecommendation {
  status: 'OPTIMAL' | 'CAUTION' | 'ALERT';
  headline: string;
  adviceParagraph: string;
  suggestedAllocations: {
    categoryName: string;
    amount: number;
    pct: number;
    icon: string;
  }[];
}

export interface DashboardMetrics {
  totalIncome: number;
  totalSpent: number;
  committedSavings: number;
  currentCashBalance: number;
  safeAvailableBalance: number;
  dailyBurnRate: number;
  daysRemaining: number;
  healthScore: number;
}
