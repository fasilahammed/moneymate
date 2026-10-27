using MoneyMate.Application.Services;
using Xunit;

namespace MoneyMate.UnitTests;

public class FinancialCalculationServiceTests
{
    private readonly FinancialCalculationService _service = new();

    [Fact]
    public void CalculatePeriodSummary_With25kSalary_CalculatesAccurateSafeBalance()
    {
        // Arrange
        decimal salary = 25000m;
        decimal spent = 10270m;
        decimal savings = 5000m;
        int currentDay = 12;
        int daysInMonth = 31;

        // Act
        var result = _service.CalculatePeriodSummary(salary, spent, savings, currentDay, daysInMonth);

        // Assert
        Assert.Equal(25000m, result.TotalSalaryIncome);
        Assert.Equal(10270m, result.TotalExpensesPaid);
        Assert.Equal(5000m, result.CommittedSavings);
        Assert.Equal(14730m, result.CurrentCashBalance); // 25000 - 10270
        Assert.Equal(9730m, result.SafeAvailableBalance); // 14730 - 5000
        Assert.Equal(19, result.DaysRemaining); // 31 - 12
        Assert.Equal(512.11m, result.SafeDailyBurnPace); // 9730 / 19 = 512.105... -> 512.11
    }

    [Fact]
    public void CheckOverspending_WhenProjectedExceedsLimit_ReturnsTrueAndExcess()
    {
        // Arrange
        decimal currentSpent = 4800m;
        decimal proposed = 800m;
        decimal limit = 5000m;

        // Act
        bool isOver = _service.CheckOverspending(currentSpent, proposed, limit, out decimal excess);

        // Assert
        Assert.True(isOver);
        Assert.Equal(600m, excess); // 4800 + 800 = 5600 -> excess = 600
    }

    [Fact]
    public void CheckOverspending_WhenWithinLimit_ReturnsFalseAndZeroExcess()
    {
        // Arrange
        decimal currentSpent = 2000m;
        decimal proposed = 1500m;
        decimal limit = 5000m;

        // Act
        bool isOver = _service.CheckOverspending(currentSpent, proposed, limit, out decimal excess);

        // Assert
        Assert.False(isOver);
        Assert.Equal(0m, excess);
    }
}
