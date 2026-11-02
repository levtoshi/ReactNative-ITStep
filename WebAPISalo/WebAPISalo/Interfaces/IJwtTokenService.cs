using WebAPISalo.Data.Identity;

namespace WebAPISalo.Interfaces;

public interface IJwtTokenService
{
    Task<string> CreateTokenAsync(UserEntity user);
}
