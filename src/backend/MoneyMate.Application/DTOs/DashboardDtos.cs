namespace MoneyMate.Application.DTOs;

public record DashboardMetricsDto(
    decimal TotalIncome,
    decimal TotalSpent,
    decimal CommittedSavings,
    decimal CurrentCashBalance,
    decimal SafeAvailableBalance,
    decimal DailyBurnRate,
    int DaysRemaining,
    int HealthScore
);

public record CategoryStatusDto(
    Guid CategoryId,
    string Name,
    string Icon,
    string ColorHex,
    decimal Allocated,
    decimal Spent,
    decimal Remaining,
    decimal PercentageUsed,
    string Status,
    decimal DailySafePace
);

public record AlertItemDto(
    Guid Id,
    string Severity,
    string Title,
    string Message,
    Guid? CategoryId,
    string Date
);

public record SuggestedAllocationDto(
    string CategoryName,
    decimal Amount,
    int Pct,
    string Icon
);

public record AdvisorRecommendationDto(
    string Status,
    string Headline,
    string AdviceParagraph,
    List<SuggestedAllocationDto> SuggestedAllocations
);

public record DashboardResponseDto(
    DashboardMetricsDto Metrics,
    List<CategoryStatusDto> CategoryStatuses,
    List<AlertItemDto> Alerts,
    AdvisorRecommendationDto Advisor
);
