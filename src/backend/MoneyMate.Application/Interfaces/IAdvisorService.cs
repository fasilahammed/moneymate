using MoneyMate.Application.DTOs;

namespace MoneyMate.Application.Interfaces;

public interface IAdvisorService
{
    Task<AdvisorQueryResponseDto> AskAdvisorAsync(Guid userId, string message);
}
