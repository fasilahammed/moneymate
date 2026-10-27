using MoneyMate.Application.DTOs;
using MoneyMate.Application.Interfaces;
using MoneyMate.Domain.Entities;
using MoneyMate.Domain.Interfaces;

namespace MoneyMate.Application.Services;

public class SalaryProfileService : ISalaryProfileService
{
    private readonly ISalaryProfileRepository _salaryRepo;

    public SalaryProfileService(ISalaryProfileRepository salaryRepo)
    {
        _salaryRepo = salaryRepo;
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
        if (profile != null)
        {
            profile.MonthlyTakeHome = dto.MonthlyTakeHome;
            profile.PaydayDayOfMonth = dto.PaydayDayOfMonth;
            _salaryRepo.Update(profile);
        }
        else
        {
            await _salaryRepo.AddAsync(new SalaryProfile
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                MonthlyTakeHome = dto.MonthlyTakeHome,
                PaydayDayOfMonth = dto.PaydayDayOfMonth,
                EffectiveFrom = DateOnly.FromDateTime(DateTime.UtcNow),
                IsActive = true
            });
        }

        await _salaryRepo.SaveChangesAsync();
        return true;
    }
}
