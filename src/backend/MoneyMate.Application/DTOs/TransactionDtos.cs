namespace MoneyMate.Application.DTOs;

public record CreateTransactionDto(
    decimal Amount,
    Guid CategoryId,
    string TransactionType,
    string PaymentMethod,
    string Note,
    DateOnly Date
);

public record TransactionResponseDto(
    Guid Id,
    decimal Amount,
    Guid CategoryId,
    string TransactionType,
    string PaymentMethod,
    string Note,
    DateOnly TransactionDate,
    DateTime CreatedAtUtc
);
