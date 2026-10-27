using MoneyMate.Application.DTOs;

namespace MoneyMate.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardResponseDto> GetDashboardSummaryAsync(Guid userId);
}
