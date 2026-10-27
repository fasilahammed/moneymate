using MoneyMate.Application.DTOs;
using MoneyMate.Application.Interfaces;
using MoneyMate.Domain.Entities;
using MoneyMate.Domain.Interfaces;

namespace MoneyMate.Application.Services;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _transactionRepo;
    private readonly ICategoryRepository _categoryRepo;

    public TransactionService(ITransactionRepository transactionRepo, ICategoryRepository categoryRepo)
    {
        _transactionRepo = transactionRepo;
        _categoryRepo = categoryRepo;
    }

    public async Task<List<TransactionResponseDto>> GetTransactionsByUserIdAsync(Guid userId)
    {
        var list = await _transactionRepo.GetByUserIdAsync(userId);
        return list.Select(t => new TransactionResponseDto(
            t.Id,
            t.Amount,
            t.CategoryId,
            t.TransactionType,
            t.PaymentMethod,
            t.Note,
            t.TransactionDate,
            t.CreatedAtUtc
        )).ToList();
    }

    public async Task<TransactionResponseDto> CreateTransactionAsync(Guid userId, CreateTransactionDto dto)
    {
        if (dto.Amount <= 0)
            throw new ArgumentException("Amount must be strictly positive.", nameof(dto.Amount));

        var category = await _categoryRepo.GetByIdAsync(dto.CategoryId);
        if (category == null)
            throw new ArgumentException("Category does not exist.", nameof(dto.CategoryId));

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CategoryId = dto.CategoryId,
            Amount = dto.Amount,
            TransactionType = dto.TransactionType,
            PaymentMethod = dto.PaymentMethod,
            Note = dto.Note,
            TransactionDate = dto.Date,
            CreatedAtUtc = DateTime.UtcNow
        };

        await _transactionRepo.AddAsync(transaction);
        await _transactionRepo.SaveChangesAsync();

        return new TransactionResponseDto(
            transaction.Id,
            transaction.Amount,
            transaction.CategoryId,
            transaction.TransactionType,
            transaction.PaymentMethod,
            transaction.Note,
            transaction.TransactionDate,
            transaction.CreatedAtUtc
        );
    }

    public async Task<bool> DeleteTransactionAsync(Guid userId, Guid transactionId)
    {
        var tx = await _transactionRepo.GetByIdAsync(transactionId);
        if (tx == null || tx.UserId != userId)
            return false;

        _transactionRepo.Remove(tx);
        await _transactionRepo.SaveChangesAsync();
        return true;
    }
}
