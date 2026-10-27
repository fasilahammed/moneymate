using Microsoft.EntityFrameworkCore;
using MoneyMate.Domain.Entities;
using MoneyMate.Domain.Interfaces;
using MoneyMate.Infrastructure.Persistence;

namespace MoneyMate.Infrastructure.Repositories;

public class SalaryProfileRepository : Repository<SalaryProfile>, ISalaryProfileRepository
{
    public SalaryProfileRepository(MoneyMateDbContext context) : base(context)
    {
    }

    public async Task<SalaryProfile?> GetActiveProfileByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Where(s => s.UserId == userId && s.IsActive)
            .OrderByDescending(s => s.EffectiveFrom)
            .FirstOrDefaultAsync();
    }
}
