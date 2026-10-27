namespace MoneyMate.Domain.Entities;

public class SalaryProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public decimal MonthlyTakeHome { get; set; }
    public int PaydayDayOfMonth { get; set; } = 1;
    public DateOnly EffectiveFrom { get; set; }
    public bool IsActive { get; set; } = true;
}
