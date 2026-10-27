using Microsoft.EntityFrameworkCore;
using MoneyMate.Domain.Entities;
using MoneyMate.Domain.Interfaces;
using MoneyMate.Infrastructure.Persistence;

namespace MoneyMate.Infrastructure.Repositories;

public class SavingsGoalRepository : Repository<SavingsGoal>, ISavingsGoalRepository
{
    public SavingsGoalRepository(MoneyMateDbContext context) : base(context)
    {
    }

    public async Task<List<SavingsGoal>> GetGoalsByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Where(g => g.UserId == userId)
            .OrderBy(g => g.TargetDate)
            .ToListAsync();
    }
}
