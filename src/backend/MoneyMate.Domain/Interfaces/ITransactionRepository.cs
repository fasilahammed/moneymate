using MoneyMate.Domain.Entities;

namespace MoneyMate.Domain.Interfaces;

public interface ITransactionRepository : IRepository<Transaction>
{
    Task<List<Transaction>> GetByUserIdAsync(Guid userId);
    Task<decimal> GetTotalSpentForPeriodAsync(Guid userId, DateOnly startDate, DateOnly endDate);
}
