using Microsoft.AspNetCore.Mvc;
using MoneyMate.Application.DTOs;
using MoneyMate.Application.Interfaces;

namespace MoneyMate.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AdvisorController : ControllerBase
{
    private readonly IAdvisorService _advisorService;
    private static readonly Guid DefaultUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public AdvisorController(IAdvisorService advisorService)
    {
        _advisorService = advisorService;
    }

    [HttpPost("chat")]
    public async Task<ActionResult<AdvisorQueryResponseDto>> Chat([FromBody] AdvisorQueryRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { message = "Message cannot be empty." });

        var response = await _advisorService.AskAdvisorAsync(DefaultUserId, request.Message);
        return Ok(response);
    }
}
