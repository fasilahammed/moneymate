namespace SpendWise.Domain.Services;

/// <summary>
/// Pure, deterministic financial mathematics domain engine.
/// Completely isolated from HTTP, databases, and AI hallucination.
/// </summary>
public class FinancialCalculationService
{
    public record PeriodFinancialSummary(
        decimal TotalSalaryIncome,
        decimal TotalExpensesPaid,
        decimal CommittedSavings,
        decimal CurrentCashBalance,
        decimal SafeAvailableBalance,
        decimal SafeDailyBurnPace,
        int DaysRemaining
    );

    /// <summary>
    /// Computes authoritative financial metrics for a user's monthly salary cycle.
    /// </summary>
    public PeriodFinancialSummary CalculatePeriodSummary(
        decimal monthlyTakeHome,
        decimal totalExpensesPaid,
        decimal committedSavings,
        int currentDayOfMonth,
        int totalDaysInMonth)
    {
        if (monthlyTakeHome <= 0)
            throw new ArgumentException("Monthly take-home must be strictly positive.", nameof(monthlyTakeHome));

        int daysRemaining = Math.Max(1, totalDaysInMonth - currentDayOfMonth);

        // Core Balance Formula:
        // Current Cash = Total Income Received - Total Expenses Paid
        decimal currentCashBalance = monthlyTakeHome - totalExpensesPaid;

        // Safe Available Balance = Current Cash - Committed Savings
        decimal safeAvailableBalance = currentCashBalance - committedSavings;

        // Safe Daily Pace = Safe Available Balance / Days Remaining
        decimal dailyPace = daysRemaining > 0 
            ? Math.Max(0, safeAvailableBalance / daysRemaining) 
            : 0;

        return new PeriodFinancialSummary(
            TotalSalaryIncome: monthlyTakeHome,
            TotalExpensesPaid: totalExpensesPaid,
            CommittedSavings: committedSavings,
            CurrentCashBalance: currentCashBalance,
            SafeAvailableBalance: safeAvailableBalance,
            SafeDailyBurnPace: Math.Round(dailyPace, 2),
            DaysRemaining: daysRemaining
        );
    }

    /// <summary>
    /// Determines whether a proposed expense causes overspending in a category or creates a deficit.
    /// </summary>
    public bool CheckOverspending(decimal currentSpent, decimal proposedAmount, decimal allocatedLimit, out decimal excess)
    {
        decimal projected = currentSpent + proposedAmount;
        if (projected > allocatedLimit)
        {
            excess = projected - allocatedLimit;
            return true;
        }

        excess = 0;
        return false;
    }
}
