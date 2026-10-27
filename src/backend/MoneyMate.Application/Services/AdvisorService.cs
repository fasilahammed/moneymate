using System.Text.RegularExpressions;
using MoneyMate.Application.DTOs;
using MoneyMate.Application.Interfaces;
using MoneyMate.Domain.Entities;
using MoneyMate.Domain.Interfaces;

namespace MoneyMate.Application.Services;

public class AdvisorService : IAdvisorService
{
    private readonly ISalaryProfileRepository _salaryRepo;
    private readonly ITransactionRepository _transactionRepo;
    private readonly ISavingsGoalRepository _savingsGoalRepo;
    private readonly ICategoryRepository _categoryRepo;
    private readonly IFinancialCalculationService _calcService;

    public AdvisorService(
        ISalaryProfileRepository salaryRepo,
        ITransactionRepository transactionRepo,
        ISavingsGoalRepository savingsGoalRepo,
        ICategoryRepository categoryRepo,
        IFinancialCalculationService calcService)
    {
        _salaryRepo = salaryRepo;
        _transactionRepo = transactionRepo;
        _savingsGoalRepo = savingsGoalRepo;
        _categoryRepo = categoryRepo;
        _calcService = calcService;
    }

    public async Task<AdvisorQueryResponseDto> AskAdvisorAsync(Guid userId, string message)
    {
        var salary = await _salaryRepo.GetActiveProfileByUserIdAsync(userId)
            ?? new SalaryProfile { MonthlyTakeHome = 25000m };

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

        string q = message.ToLowerInvariant();
        string reply;
        bool isAffordable = true;

        var match = Regex.Match(q, @"(?:afford|spend|buy|cost|take|pay)\s*(?:a|an)?\s*(?:of)?\s*[₹$]?\s*(\d+[\d,]*)");
        if (match.Success && decimal.TryParse(match.Groups[1].Value.Replace(",", ""), out decimal amount))
        {
            if (amount > summary.SafeAvailableBalance)
            {
                isAffordable = false;
                decimal shortage = amount - summary.SafeAvailableBalance;
                reply = $"⚠️ Overspending Risk: Spending ₹{amount:N0} will create a ₹{shortage:N0} deficit! You only have ₹{summary.SafeAvailableBalance:N0} safe to spend without compromising your ₹{summary.CommittedSavings:N0} emergency savings goal.";
            }
            else
            {
                decimal remainingAfter = summary.SafeAvailableBalance - amount;
                decimal newPace = summary.DaysRemaining > 0 ? remainingAfter / summary.DaysRemaining : 0;
                reply = $"✅ Feasible: You currently have ₹{summary.SafeAvailableBalance:N0} safe balance. Spending ₹{amount:N0} leaves ₹{remainingAfter:N0} for the next {summary.DaysRemaining} days (₹{newPace:N0}/day). Your savings goal remains 100% protected.";
            }
        }
        else if (q.Contains("food") || q.Contains("grocery") || q.Contains("dinner"))
        {
            var categories = await _categoryRepo.GetCategoriesByUserIdAsync(userId);
            var foodCat = categories.FirstOrDefault(c => c.Name.Contains("Food"));
            var foodSpent = transactions.Where(t => t.CategoryId == foodCat?.Id && t.TransactionType == "EXPENSE").Sum(t => t.Amount);
            var foodAllocated = foodCat?.AllocatedAmount ?? 4000m;
            reply = $"🍔 Food Budget Status: You have spent ₹{foodSpent:N0} of your ₹{foodAllocated:N0} monthly allocation. Remaining safe food allowance is ₹{(foodAllocated - foodSpent):N0}.";
        }
        else if (q.Contains("save") || q.Contains("saving") || q.Contains("emergency"))
        {
            reply = $"💎 Savings Health: Your plan allocates ₹{summary.CommittedSavings:N0}/month into your Emergency Fund. Your safe balance of ₹{summary.SafeAvailableBalance:N0} ensures your savings are completely untouched!";
        }
        else
        {
            reply = $"📊 Current Financial Snapshot: With your ₹{summary.TotalSalaryIncome:N0} salary, you have spent ₹{summary.TotalExpensesPaid:N0}. Your safe spending power is ₹{summary.SafeAvailableBalance:N0} for the next {summary.DaysRemaining} days (₹{summary.SafeDailyBurnPace:N0}/day).";
        }

        return new AdvisorQueryResponseDto(reply, isAffordable, summary.SafeAvailableBalance);
    }
}
