using Microsoft.EntityFrameworkCore;
using MoneyMate.Domain.Entities;
using MoneyMate.Domain.Interfaces;
using MoneyMate.Infrastructure.Persistence;

namespace MoneyMate.Infrastructure.Repositories;

public class CategoryRepository : Repository<Category>, ICategoryRepository
{
    public CategoryRepository(MoneyMateDbContext context) : base(context)
    {
    }

    public async Task<List<Category>> GetCategoriesByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Where(c => c.UserId == userId || c.UserId == null)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }
}
