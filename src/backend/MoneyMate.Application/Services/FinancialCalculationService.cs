using MoneyMate.Application.Interfaces;

namespace MoneyMate.Application.Services;

public class FinancialCalculationService : IFinancialCalculationService
{
    public PeriodCalculationResult CalculatePeriodSummary(
        decimal monthlyTakeHome,
        decimal totalExpensesPaid,
        decimal committedSavings,
        int currentDayOfMonth,
        int totalDaysInMonth)
    {
        if (monthlyTakeHome <= 0)
            throw new ArgumentException("Monthly take-home must be strictly positive.", nameof(monthlyTakeHome));

        int daysRemaining = Math.Max(1, totalDaysInMonth - currentDayOfMonth);

        decimal currentCashBalance = monthlyTakeHome - totalExpensesPaid;
        decimal safeAvailableBalance = currentCashBalance - committedSavings;

        decimal dailyPace = daysRemaining > 0 
            ? Math.Max(0, safeAvailableBalance / daysRemaining) 
            : 0;

        return new PeriodCalculationResult(
            TotalSalaryIncome: monthlyTakeHome,
            TotalExpensesPaid: totalExpensesPaid,
            CommittedSavings: committedSavings,
            CurrentCashBalance: currentCashBalance,
            SafeAvailableBalance: safeAvailableBalance,
            SafeDailyBurnPace: Math.Round(dailyPace, 2),
            DaysRemaining: daysRemaining
        );
    }

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
