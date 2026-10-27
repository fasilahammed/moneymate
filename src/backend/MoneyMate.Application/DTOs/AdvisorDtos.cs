namespace MoneyMate.Application.DTOs;

public record AdvisorQueryRequestDto(string Message);

public record AdvisorQueryResponseDto(string Reply, bool IsAffordable, decimal SafeAvailableBalance);
