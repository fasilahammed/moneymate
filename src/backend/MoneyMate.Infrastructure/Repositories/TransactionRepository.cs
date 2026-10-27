using Microsoft.EntityFrameworkCore;
using MoneyMate.Domain.Entities;
using MoneyMate.Domain.Interfaces;
using MoneyMate.Infrastructure.Persistence;

namespace MoneyMate.Infrastructure.Repositories;

public class TransactionRepository : Repository<Transaction>, ITransactionRepository
{
    public TransactionRepository(MoneyMateDbContext context) : base(context)
    {
    }

    public async Task<List<Transaction>> GetByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.TransactionDate)
            .ThenByDescending(t => t.CreatedAtUtc)
            .ToListAsync();
    }

    public async Task<decimal> GetTotalSpentForPeriodAsync(Guid userId, DateOnly startDate, DateOnly endDate)
    {
        return await _dbSet
            .Where(t => t.UserId == userId &&
                        t.TransactionType == "EXPENSE" &&
                        t.TransactionDate >= startDate &&
                        t.TransactionDate <= endDate)
            .SumAsync(t => t.Amount);
    }
}
