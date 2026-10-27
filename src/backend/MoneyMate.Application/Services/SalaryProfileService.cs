using MoneyMate.Application.DTOs;
using MoneyMate.Application.Interfaces;
using MoneyMate.Domain.Entities;
using MoneyMate.Domain.Interfaces;

namespace MoneyMate.Application.Services;

public class SalaryProfileService : ISalaryProfileService
{
    private readonly ISalaryProfileRepository _salaryRepo;
    private readonly ICategoryRepository _categoryRepo;
    private readonly ISavingsGoalRepository _savingsGoalRepo;

    public SalaryProfileService(
        ISalaryProfileRepository salaryRepo,
        ICategoryRepository categoryRepo,
        ISavingsGoalRepository savingsGoalRepo)
    {
        _salaryRepo = salaryRepo;
        _categoryRepo = categoryRepo;
        _savingsGoalRepo = savingsGoalRepo;
    }

    public async Task<SalaryProfile?> GetActiveSalaryProfileAsync(Guid userId)
    {
        return await _salaryRepo.GetActiveProfileByUserIdAsync(userId);
    }

    public async Task<bool> UpdateSalaryProfileAsync(Guid userId, UpdateSalaryDto dto)
    {
        if (dto.MonthlyTakeHome <= 0)
            throw new ArgumentException("Monthly take-home must be strictly positive.", nameof(dto.MonthlyTakeHome));

        var profile = await _salaryRepo.GetActiveProfileByUserIdAsync(userId);
        decimal previousSalary = profile?.MonthlyTakeHome ?? 25000m;

        if (profile != null)
        {
            profile.MonthlyTakeHome = dto.MonthlyTakeHome;
            profile.PaydayDayOfMonth = dto.PaydayDayOfMonth;
            _salaryRepo.Update(profile);
        }
        else
        {
            profile = new SalaryProfile
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                MonthlyTakeHome = dto.MonthlyTakeHome,
                PaydayDayOfMonth = dto.PaydayDayOfMonth,
                EffectiveFrom = DateOnly.FromDateTime(DateTime.UtcNow),
                IsActive = true
            };
            await _salaryRepo.AddAsync(profile);
        }

        // Scale category allocations and savings goals proportionally in the database
        if (previousSalary > 0 && previousSalary != dto.MonthlyTakeHome)
        {
            decimal ratio = dto.MonthlyTakeHome / previousSalary;

            var categories = await _categoryRepo.GetCategoriesByUserIdAsync(userId);
            foreach (var cat in categories)
            {
                cat.AllocatedAmount = Math.Round(cat.AllocatedAmount * ratio, 2);
                _categoryRepo.Update(cat);
            }

            var goals = await _savingsGoalRepo.GetGoalsByUserIdAsync(userId);
            foreach (var goal in goals)
            {
                goal.MonthlyCommitment = Math.Round(goal.MonthlyCommitment * ratio, 2);
                _savingsGoalRepo.Update(goal);
            }
        }

        await _salaryRepo.SaveChangesAsync();
        return true;
    }
}
