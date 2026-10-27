using MoneyMate.Domain.Entities;

namespace MoneyMate.Domain.Interfaces;

public interface ISavingsGoalRepository : IRepository<SavingsGoal>
{
    Task<List<SavingsGoal>> GetGoalsByUserIdAsync(Guid userId);
}
