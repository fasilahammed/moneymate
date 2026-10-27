using MoneyMate.Application.DTOs;
using MoneyMate.Domain.Entities;

namespace MoneyMate.Application.Interfaces;

public interface ISalaryProfileService
{
    Task<SalaryProfile?> GetActiveSalaryProfileAsync(Guid userId);
    Task<bool> UpdateSalaryProfileAsync(Guid userId, UpdateSalaryDto dto);
}
