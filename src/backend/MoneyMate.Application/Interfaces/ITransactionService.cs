using MoneyMate.Application.DTOs;

namespace MoneyMate.Application.Interfaces;

public interface ITransactionService
{
    Task<List<TransactionResponseDto>> GetTransactionsByUserIdAsync(Guid userId);
    Task<TransactionResponseDto> CreateTransactionAsync(Guid userId, CreateTransactionDto dto);
    Task<bool> DeleteTransactionAsync(Guid userId, Guid transactionId);
}
