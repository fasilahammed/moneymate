using MoneyMate.Application.DTOs;
using MoneyMate.Application.Interfaces;
using MoneyMate.Domain.Entities;
using MoneyMate.Domain.Interfaces;

namespace MoneyMate.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly ISalaryProfileRepository _salaryRepo;
    private readonly ICategoryRepository _categoryRepo;
    private readonly ITransactionRepository _transactionRepo;
    private readonly ISavingsGoalRepository _savingsGoalRepo;
    private readonly IFinancialCalculationService _calcService;

    public DashboardService(
        ISalaryProfileRepository salaryRepo,
        ICategoryRepository categoryRepo,
        ITransactionRepository transactionRepo,
        ISavingsGoalRepository savingsGoalRepo,
        IFinancialCalculationService calcService)
    {
        _salaryRepo = salaryRepo;
        _categoryRepo = categoryRepo;
        _transactionRepo = transactionRepo;
        _savingsGoalRepo = savingsGoalRepo;
        _calcService = calcService;
    }

    public async Task<DashboardResponseDto> GetDashboardSummaryAsync(Guid userId)
    {
        var salary = await _salaryRepo.GetActiveProfileByUserIdAsync(userId)
            ?? new SalaryProfile { MonthlyTakeHome = 25000m, PaydayDayOfMonth = 1 };

        var categories = await _categoryRepo.GetCategoriesByUserIdAsync(userId);
        var transactions = await _transactionRepo.GetByUserIdAsync(userId);
        var savingsGoals = await _savingsGoalRepo.GetGoalsByUserIdAsync(userId);

        var totalSpent = transactions
            .Where(t => t.TransactionType == "EXPENSE")
            .Sum(t => t.Amount);

        var committedSavings = savingsGoals.Sum(g => g.MonthlyCommitment);

        int currentDay = DateTime.UtcNow.Day;
        int daysInMonth = DateTime.DaysInMonth(DateTime.UtcNow.Year, DateTime.UtcNow.Month);

        var summary = _calcService.CalculatePeriodSummary(
            salary.MonthlyTakeHome,
            totalSpent,
            committedSavings,
            currentDay,
            daysInMonth
        );

        var categoryStatuses = categories.Select(cat =>
        {
            var spent = transactions
                .Where(t => t.CategoryId == cat.Id && t.TransactionType == "EXPENSE")
                .Sum(t => t.Amount);

            var remaining = Math.Max(0, cat.AllocatedAmount - spent);
            var pct = cat.AllocatedAmount > 0 ? (spent / cat.AllocatedAmount) * 100 : 0;

            string status = "HEALTHY";
            if (spent > cat.AllocatedAmount) status = "EXCEEDED";
            else if (pct >= 80) status = "WARNING";

            var dailySafePace = summary.DaysRemaining > 0 ? remaining / summary.DaysRemaining : 0;

            return new CategoryStatusDto(
                CategoryId: cat.Id,
                Name: cat.Name,
                Icon: cat.Icon,
                ColorHex: cat.ColorHex,
                Allocated: cat.AllocatedAmount,
                Spent: spent,
                Remaining: remaining,
                PercentageUsed: Math.Round(pct, 1),
                Status: status,
                DailySafePace: Math.Round(dailySafePace, 2)
            );
        }).ToList();

        var alerts = new List<AlertItemDto>();
        foreach (var cs in categoryStatuses)
        {
            if (cs.Status == "EXCEEDED")
            {
                alerts.Add(new AlertItemDto(
                    Id: Guid.NewGuid(),
                    Severity: "CRITICAL",
                    Title: $"{cs.Name} Budget Exceeded!",
                    Message: $"Spent ₹{cs.Spent:N0} which exceeds ₹{cs.Allocated:N0} limit by ₹{(cs.Spent - cs.Allocated):N0}.",
                    CategoryId: cs.CategoryId,
                    Date: "Today"
                ));
            }
            else if (cs.Status == "WARNING")
            {
                alerts.Add(new AlertItemDto(
                    Id: Guid.NewGuid(),
                    Severity: "WARNING",
                    Title: $"{cs.Name} High Pace Warning",
                    Message: $"Used {cs.PercentageUsed}% with {summary.DaysRemaining} days remaining. Daily allowance: ₹{cs.DailySafePace:N0}/day.",
                    CategoryId: cs.CategoryId,
                    Date: "Today"
                ));
            }
        }

        int healthScore = 100;
        if (summary.SafeAvailableBalance < 0) healthScore -= 40;
        else if (summary.SafeAvailableBalance < 3000) healthScore -= 15;

        foreach (var cs in categoryStatuses)
        {
            if (cs.Status == "EXCEEDED") healthScore -= 18;
            else if (cs.Status == "WARNING") healthScore -= 8;
        }
        healthScore = Math.Clamp(healthScore, 10, 100);

        var highPace = categoryStatuses.Where(c => c.Status != "HEALTHY").ToList();
        string advisorStatus = highPace.Any() ? "CAUTION" : "OPTIMAL";
        string advisorHeadline = highPace.Any()
            ? $"Attention: Pace Alert on {string.Join(" & ", highPace.Select(c => c.Name))}"
            : "Spending is Balanced & On Track";

        string advisorParagraph = $"You have ₹{summary.SafeAvailableBalance:N0} safe to spend over the remaining {summary.DaysRemaining} days (₹{summary.SafeDailyBurnPace:N0}/day), fully protecting your ₹{committedSavings:N0} savings target.";

        var suggestedAllocations = categories.Select(c => new SuggestedAllocationDto(
            CategoryName: c.Name,
            Amount: c.AllocatedAmount,
            Pct: (int)Math.Round((c.AllocatedAmount / salary.MonthlyTakeHome) * 100),
            Icon: c.Icon
        )).ToList();

        var metricsDto = new DashboardMetricsDto(
            TotalIncome: summary.TotalSalaryIncome,
            TotalSpent: summary.TotalExpensesPaid,
            CommittedSavings: summary.CommittedSavings,
            CurrentCashBalance: summary.CurrentCashBalance,
            SafeAvailableBalance: summary.SafeAvailableBalance,
            DailyBurnRate: summary.SafeDailyBurnPace,
            DaysRemaining: summary.DaysRemaining,
            HealthScore: healthScore
        );

        return new DashboardResponseDto(
            Metrics: metricsDto,
            CategoryStatuses: categoryStatuses,
            Alerts: alerts,
            Advisor: new AdvisorRecommendationDto(advisorStatus, advisorHeadline, advisorParagraph, suggestedAllocations)
        );
    }
}
