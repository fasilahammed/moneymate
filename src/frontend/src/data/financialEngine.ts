import type {
  SalaryProfile,
  Category,
  Transaction,
  SavingsGoal,
  CategoryStatus,
  DashboardMetrics,
  AlertItem,
  AdvisorRecommendation
} from '../types';

export const INITIAL_SALARY: SalaryProfile = {
  monthlyTakeHome: 25000,
  paydayDay: 1,
  currency: '₹',
  monthName: 'October 2026'
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-housing',
    name: 'Housing & Rent',
    icon: 'Home',
    allocatedAmount: 6000,
    colorHex: '#3b82f6',
    isEssential: true
  },
  {
    id: 'cat-family',
    name: 'Family Support',
    icon: 'HeartHandshake',
    allocatedAmount: 5000,
    colorHex: '#ec4899',
    isEssential: true
  },
  {
    id: 'cat-food',
    name: 'Food & Groceries',
    icon: 'UtensilsCrossed',
    allocatedAmount: 4000,
    colorHex: '#f59e0b',
    isEssential: true
  },
  {
    id: 'cat-travel',
    name: 'Travel & Commute',
    icon: 'Car',
    allocatedAmount: 2500,
    colorHex: '#06b6d4',
    isEssential: false
  },
  {
    id: 'cat-savings',
    name: 'Savings Reserve',
    icon: 'ShieldCheck',
    allocatedAmount: 5000,
    colorHex: '#10b981',
    isEssential: true
  },
  {
    id: 'cat-buffer',
    name: 'Personal & Buffer',
    icon: 'ShoppingBag',
    allocatedAmount: 2500,
    colorHex: '#8b5cf6',
    isEssential: false
  }
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-emergency',
    title: 'Emergency Safety Net',
    targetAmount: 50000,
    currentAmount: 15000,
    monthlyCommitment: 5000,
    targetDate: '2027-05-01',
    icon: 'Shield'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    amount: 6000,
    categoryId: 'cat-housing',
    type: 'EXPENSE',
    date: '2026-10-02',
    paymentMethod: 'Net Banking',
    note: 'House rent & maintenance'
  },
  {
    id: 'tx-2',
    amount: 4200,
    categoryId: 'cat-family',
    type: 'EXPENSE',
    date: '2026-10-05',
    paymentMethod: 'UPI',
    note: 'Parents monthly medical & household'
  },
  {
    id: 'tx-3',
    amount: 1800,
    categoryId: 'cat-food',
    type: 'EXPENSE',
    date: '2026-10-07',
    paymentMethod: 'UPI',
    note: 'Monthly staples & supermarket'
  },
  {
    id: 'tx-4',
    amount: 600,
    categoryId: 'cat-travel',
    type: 'EXPENSE',
    date: '2026-10-09',
    paymentMethod: 'UPI',
    note: 'Metro smartcard recharge'
  },
  {
    id: 'tx-5',
    amount: 1550,
    categoryId: 'cat-food',
    type: 'EXPENSE',
    date: '2026-10-14',
    paymentMethod: 'Debit Card',
    note: 'Weekend dining & groceries'
  }
];

/**
 * Pure Mathematical Domain Engine
 * Computes balances, category utilizations, alert flags, and advisory summaries
 */
export function calculateFinancials(
  salary: SalaryProfile,
  categories: Category[],
  transactions: Transaction[],
  savingsGoals: SavingsGoal[],
  currentDayOfMonth: number = 16,
  totalDaysInMonth: number = 31
): {
  metrics: DashboardMetrics;
  categoryStatuses: CategoryStatus[];
  alerts: AlertItem[];
  advisor: AdvisorRecommendation;
} {
  const daysRemaining = Math.max(1, totalDaysInMonth - currentDayOfMonth);

  // 1. Calculate Inflows & Outflows
  const totalIncome = salary.monthlyTakeHome;
  const totalSpent = transactions
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // 2. Committed Savings (Locked portion)
  const committedSavings = savingsGoals.reduce((sum, g) => sum + g.monthlyCommitment, 0);

  // 3. Cash Position & True Safe Available Balance
  const currentCashBalance = totalIncome - totalSpent;
  const safeAvailableBalance = currentCashBalance - committedSavings;

  // 4. Burn Rate & Safe Daily Pace
  const dailyBurnRate = daysRemaining > 0 ? Math.max(0, safeAvailableBalance / daysRemaining) : 0;

  // 5. Category Utilizations
  const categoryStatuses: CategoryStatus[] = categories.map((cat) => {
    const spent = transactions
      .filter((tx) => tx.categoryId === cat.id && tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const remaining = Math.max(0, cat.allocatedAmount - spent);
    const percentageUsed = cat.allocatedAmount > 0 ? (spent / cat.allocatedAmount) * 100 : 0;

    let status: 'HEALTHY' | 'WARNING' | 'EXCEEDED' = 'HEALTHY';
    if (spent > cat.allocatedAmount) {
      status = 'EXCEEDED';
    } else if (percentageUsed >= 80) {
      status = 'WARNING';
    }

    const dailySafePace = daysRemaining > 0 ? remaining / daysRemaining : 0;

    return {
      category: cat,
      spent,
      remaining,
      percentageUsed,
      status,
      dailySafePace
    };
  });

  // 6. Generate Contextual Overspending Alerts
  const alerts: AlertItem[] = [];

  categoryStatuses.forEach((cs) => {
    if (cs.status === 'EXCEEDED') {
      alerts.push({
        id: `alert-${cs.category.id}`,
        severity: 'CRITICAL',
        title: `${cs.category.name} Budget Exceeded!`,
        message: `You have spent ₹${cs.spent.toLocaleString()} which exceeds your ₹${cs.category.allocatedAmount.toLocaleString()} limit by ₹${(cs.spent - cs.category.allocatedAmount).toLocaleString()}. Immediate freeze recommended.`,
        categoryId: cs.category.id,
        date: 'Today'
      });
    } else if (cs.status === 'WARNING') {
      alerts.push({
        id: `alert-${cs.category.id}`,
        severity: 'WARNING',
        title: `${cs.category.name} High Pace Warning`,
        message: `You've used ${cs.percentageUsed.toFixed(1)}% (₹${cs.spent.toLocaleString()} of ₹${cs.category.allocatedAmount.toLocaleString()}) with ${daysRemaining} days left. Safe allowance is only ₹${Math.round(cs.dailySafePace)}/day.`,
        categoryId: cs.category.id,
        date: 'Today'
      });
    }
  });

  if (safeAvailableBalance < 0) {
    alerts.unshift({
      id: 'alert-deficit',
      severity: 'CRITICAL',
      title: 'Deficit Alert: Savings Goal Compromised!',
      message: `Your current spending puts you in a ₹${Math.abs(safeAvailableBalance).toLocaleString()} deficit against your planned ₹${committedSavings.toLocaleString()} savings target.`,
      date: 'Today'
    });
  }

  // 7. Calculate Health Score (0 - 100)
  let healthScore = 100;
  if (safeAvailableBalance < 0) healthScore -= 40;
  else if (safeAvailableBalance < 3000) healthScore -= 15;

  categoryStatuses.forEach((cs) => {
    if (cs.status === 'EXCEEDED') healthScore -= 18;
    else if (cs.status === 'WARNING') healthScore -= 8;
  });
  healthScore = Math.max(10, Math.min(100, healthScore));

  // 8. Dynamic Side-Panel Advisory Logic (Based on current ₹25,000 situation)
  const highPaceCats = categoryStatuses.filter((cs) => cs.status !== 'HEALTHY');
  let advisorHeadline = 'Spending is Balanced & On Track';
  let advisorParagraph = `You have ₹${safeAvailableBalance.toLocaleString()} safe to spend across the next ${daysRemaining} days (₹${Math.round(dailyBurnRate)}/day), preserving your ₹${committedSavings.toLocaleString()} savings.`;
  let advisorStatus: 'OPTIMAL' | 'CAUTION' | 'ALERT' = 'OPTIMAL';

  if (safeAvailableBalance < 0) {
    advisorStatus = 'ALERT';
    advisorHeadline = 'Overspending Threatens Your Savings!';
    advisorParagraph = `You have overspent by ₹${Math.abs(safeAvailableBalance).toLocaleString()}. To avoid dipping into your ₹${committedSavings.toLocaleString()} savings commitment, immediately halt all non-essential food and buffer expenses for the rest of this cycle.`;
  } else if (highPaceCats.length > 0) {
    advisorStatus = 'CAUTION';
    const names = highPaceCats.map((c) => c.category.name).join(' & ');
    advisorHeadline = `Attention: Pace Alert on ${names}`;
    advisorParagraph = `You have spent ${Math.round((totalSpent / totalIncome) * 100)}% of your salary by Day ${currentDayOfMonth}. Specifically, ${names} are nearing exhaustion. Your daily safe burn rate is capped at ₹${Math.round(dailyBurnRate)}/day to protect your ₹${committedSavings.toLocaleString()} emergency fund.`;
  }

  const suggestedAllocations = categories.map((c) => ({
    categoryName: c.name,
    amount: c.allocatedAmount,
    pct: Math.round((c.allocatedAmount / salary.monthlyTakeHome) * 100),
    icon: c.icon
  }));

  const advisor: AdvisorRecommendation = {
    status: advisorStatus,
    headline: advisorHeadline,
    adviceParagraph: advisorParagraph,
    suggestedAllocations
  };

  return {
    metrics: {
      totalIncome,
      totalSpent,
      committedSavings,
      currentCashBalance,
      safeAvailableBalance,
      dailyBurnRate,
      daysRemaining,
      healthScore
    },
    categoryStatuses,
    alerts,
    advisor
  };
}

/**
 * Intelligent Grounded Copilot Simulator
 * Evaluates queries against authoritative numbers without hallucinations
 */
export function answerAdvisorQuery(
  question: string,
  metrics: DashboardMetrics,
  categoryStatuses: CategoryStatus[]
): string {
  const q = question.toLowerCase();

  // 1. Can I afford X?
  const priceMatch = q.match(/(?:afford|spend|buy|cost|take|pay)\s*(?:a|an)?\s*(?:of)?\s*[₹$]?\s*(\d+[\d,]*)/i);
  if (priceMatch) {
    const amount = parseFloat(priceMatch[1].replace(/,/g, ''));
    if (amount > metrics.safeAvailableBalance) {
      const shortage = amount - metrics.safeAvailableBalance;
      return `⚠️ Overspending Warning: Spending ₹${amount.toLocaleString()} will put you ₹${shortage.toLocaleString()} into deficit! You only have ₹${metrics.safeAvailableBalance.toLocaleString()} safe to spend without compromising your ₹${metrics.committedSavings.toLocaleString()} savings goal. Recommendation: Postpone this purchase.`;
    } else {
      const remainingAfter = metrics.safeAvailableBalance - amount;
      const newDailyRate = Math.round(remainingAfter / metrics.daysRemaining);
      return `✅ Feasible: You currently have ₹${metrics.safeAvailableBalance.toLocaleString()} in safe balance. Spending ₹${amount.toLocaleString()} leaves you with ₹${remainingAfter.toLocaleString()} for the remaining ${metrics.daysRemaining} days (₹${newDailyRate}/day). This purchase will not hurt your savings goal.`;
    }
  }

  // 2. Food query
  if (q.includes('food') || q.includes('grocery') || q.includes('dinner')) {
    const foodCat = categoryStatuses.find((c) => c.category.id === 'cat-food');
    if (foodCat) {
      return `🍔 Food Status: You have spent ₹${foodCat.spent.toLocaleString()} out of your ₹${foodCat.category.allocatedAmount.toLocaleString()} budget (${foodCat.percentageUsed.toFixed(1)}%). Remaining: ₹${foodCat.remaining.toLocaleString()} (₹${Math.round(foodCat.dailySafePace)}/day). ${foodCat.status !== 'HEALTHY' ? 'Advice: Cook at home this week to stay under limit.' : 'You are well on track.'}`;
    }
  }

  // 3. Family query
  if (q.includes('family') || q.includes('parents')) {
    const famCat = categoryStatuses.find((c) => c.category.id === 'cat-family');
    if (famCat) {
      return `👨‍👩‍👧 Family Support: You have spent ₹${famCat.spent.toLocaleString()} out of ₹${famCat.category.allocatedAmount.toLocaleString()} (${famCat.percentageUsed.toFixed(1)}%). Remaining: ₹${famCat.remaining.toLocaleString()}. Any further family expenses should be reallocated from your Personal Buffer.`;
    }
  }

  // 4. Savings query
  if (q.includes('save') || q.includes('saving') || q.includes('emergency')) {
    return `💎 Savings Health: Your plan automatically locks ₹${metrics.committedSavings.toLocaleString()}/month into your Emergency Fund. Your current safe balance of ₹${metrics.safeAvailableBalance.toLocaleString()} ensures your savings remain completely untouched!`;
  }

  // Default fallback
  return `📊 Financial Overview: With your ₹${metrics.totalIncome.toLocaleString()} salary, you have spent ₹${metrics.totalSpent.toLocaleString()} so far. Your current safe spending capacity is ₹${metrics.safeAvailableBalance.toLocaleString()} for the next ${metrics.daysRemaining} days (₹${Math.round(metrics.dailyBurnRate)}/day).`;
}
