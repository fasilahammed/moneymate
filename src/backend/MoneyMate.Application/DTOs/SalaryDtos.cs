namespace MoneyMate.Application.DTOs;

public record UpdateSalaryDto(
    decimal MonthlyTakeHome,
    int PaydayDayOfMonth
);
