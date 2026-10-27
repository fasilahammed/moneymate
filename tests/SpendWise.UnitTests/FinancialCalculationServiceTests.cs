using SpendWise.Domain.Services;
using Xunit;

namespace SpendWise.UnitTests;

public class FinancialCalculationServiceTests
{
    private readonly FinancialCalculationService _sut = new();

    [Fact]
    public void CalculatePeriodSummary_With25kSalary_ComputesCorrectSafeBalance()
    {
        // Arrange: Salary ₹25,000, Total Expenses ₹14,150, Locked Savings ₹5,000
        decimal salary = 25000m;
        decimal expenses = 14150m;
        decimal savings = 5000m;
        int currentDay = 16;
        int totalDays = 31;

        // Act
        var result = _sut.CalculatePeriodSummary(salary, expenses, savings, currentDay, totalDays);

        // Assert
        Assert.Equal(25000m, result.TotalSalaryIncome);
        Assert.Equal(14150m, result.TotalExpensesPaid);
        Assert.Equal(10850m, result.CurrentCashBalance); // 25,000 - 14,150 = 10,850
        Assert.Equal(5850m, result.SafeAvailableBalance);  // 10,850 - 5,000 = 5,850
        Assert.Equal(15, result.DaysRemaining);            // 31 - 16 = 15
        Assert.Equal(390m, Math.Round(result.SafeDailyBurnPace, 0)); // 5,850 / 15 = 390
    }

    [Fact]
    public void CheckOverspending_WhenProposedExpenseExceedsLimit_ReturnsTrueWithExcess()
    {
        // Arrange: Budget limit ₹4,000, Spent ₹3,350, Proposed ₹1,200
        decimal spent = 3350m;
        decimal proposed = 1200m;
        decimal limit = 4000m;

        // Act
        bool isOverspent = _sut.CheckOverspending(spent, proposed, limit, out decimal excess);

        // Assert
        Assert.True(isOverspent);
        Assert.Equal(550m, excess); // (3350 + 1200) - 4000 = 4550 - 4000 = 550
    }
}
