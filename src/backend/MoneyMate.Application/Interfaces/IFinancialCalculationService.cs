namespace MoneyMate.Application.Interfaces;

public record PeriodCalculationResult(
    decimal TotalSalaryIncome,
    decimal TotalExpensesPaid,
    decimal CommittedSavings,
    decimal CurrentCashBalance,
    decimal SafeAvailableBalance,
    decimal SafeDailyBurnPace,
    int DaysRemaining
);

public interface IFinancialCalculationService
{
    PeriodCalculationResult CalculatePeriodSummary(
        decimal monthlyTakeHome,
        decimal totalExpensesPaid,
        decimal committedSavings,
        int currentDayOfMonth,
        int totalDaysInMonth
    );

    bool CheckOverspending(decimal currentSpent, decimal proposedAmount, decimal allocatedLimit, out decimal excess);
}
