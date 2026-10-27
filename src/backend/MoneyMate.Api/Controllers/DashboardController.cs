using Microsoft.AspNetCore.Mvc;
using MoneyMate.Application.DTOs;
using MoneyMate.Application.Interfaces;

namespace MoneyMate.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private static readonly Guid DefaultUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardResponseDto>> GetDashboardSummary()
    {
        var summary = await _dashboardService.GetDashboardSummaryAsync(DefaultUserId);
        return Ok(summary);
    }
}
