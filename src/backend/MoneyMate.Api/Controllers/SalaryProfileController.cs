using Microsoft.AspNetCore.Mvc;
using MoneyMate.Application.DTOs;
using MoneyMate.Application.Interfaces;
using MoneyMate.Domain.Entities;

namespace MoneyMate.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class SalaryProfileController : ControllerBase
{
    private readonly ISalaryProfileService _salaryService;
    private static readonly Guid DefaultUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public SalaryProfileController(ISalaryProfileService salaryService)
    {
        _salaryService = salaryService;
    }

    [HttpGet]
    public async Task<ActionResult<SalaryProfile>> GetSalaryProfile()
    {
        var profile = await _salaryService.GetActiveSalaryProfileAsync(DefaultUserId);
        if (profile == null)
            return NotFound();

        return Ok(profile);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSalaryProfile([FromBody] UpdateSalaryDto dto)
    {
        try
        {
            var success = await _salaryService.UpdateSalaryProfileAsync(DefaultUserId, dto);
            return Ok(new { success, message = "Salary profile updated successfully." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
