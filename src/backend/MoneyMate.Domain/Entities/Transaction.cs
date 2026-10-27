namespace MoneyMate.Domain.Entities;

public class Transaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid CategoryId { get; set; }
    public decimal Amount { get; set; }
    public string TransactionType { get; set; } = "EXPENSE"; // EXPENSE, INCOME, SAVING
    public DateOnly TransactionDate { get; set; }
    public string PaymentMethod { get; set; } = "UPI";
    public string Note { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
