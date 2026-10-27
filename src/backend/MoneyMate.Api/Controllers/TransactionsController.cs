using Microsoft.AspNetCore.Mvc;
using MoneyMate.Application.DTOs;
using MoneyMate.Application.Interfaces;

namespace MoneyMate.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;
    private static readonly Guid DefaultUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TransactionResponseDto>>> GetTransactions()
    {
        var transactions = await _transactionService.GetTransactionsByUserIdAsync(DefaultUserId);
        return Ok(transactions);
    }

    [HttpPost]
    public async Task<ActionResult<TransactionResponseDto>> CreateTransaction([FromBody] CreateTransactionDto dto)
    {
        try
        {
            var created = await _transactionService.CreateTransactionAsync(DefaultUserId, dto);
            return CreatedAtAction(nameof(GetTransactions), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTransaction(Guid id)
    {
        var success = await _transactionService.DeleteTransactionAsync(DefaultUserId, id);
        if (!success)
            return NotFound(new { message = "Transaction not found or not authorized." });

        return NoContent();
    }
}
