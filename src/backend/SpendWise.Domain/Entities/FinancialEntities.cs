namespace SpendWise.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string CurrencyCode { get; set; } = "INR";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public class SalaryProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public decimal MonthlyTakeHome { get; set; }
    public int PaydayDayOfMonth { get; set; } = 1;
    public DateOnly EffectiveFrom { get; set; }
    public bool IsActive { get; set; } = true;
}

public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; } // Null for system defaults
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string ColorHex { get; set; } = string.Empty;
    public bool IsEssential { get; set; }
    public decimal AllocatedAmount { get; set; }
}

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

public class SavingsGoal
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public decimal MonthlyCommitment { get; set; }
    public DateOnly TargetDate { get; set; }
    public bool IsAchieved { get; set; }
}

public class Alert
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid? CategoryId { get; set; }
    public string AlertType { get; set; } = "PACE_WARNING";
    public string Severity { get; set; } = "WARNING"; // INFO, WARNING, CRITICAL
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
