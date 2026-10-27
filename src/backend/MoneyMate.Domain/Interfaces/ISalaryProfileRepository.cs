using MoneyMate.Domain.Entities;

namespace MoneyMate.Domain.Interfaces;

public interface ISalaryProfileRepository : IRepository<SalaryProfile>
{
    Task<SalaryProfile?> GetActiveProfileByUserIdAsync(Guid userId);
}
