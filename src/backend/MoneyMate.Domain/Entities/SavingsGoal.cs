namespace MoneyMate.Domain.Entities;

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
