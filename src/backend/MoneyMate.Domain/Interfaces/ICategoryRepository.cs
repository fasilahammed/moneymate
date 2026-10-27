using MoneyMate.Domain.Entities;

namespace MoneyMate.Domain.Interfaces;

public interface ICategoryRepository : IRepository<Category>
{
    Task<List<Category>> GetCategoriesByUserIdAsync(Guid userId);
}
