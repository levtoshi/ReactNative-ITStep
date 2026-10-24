using Microsoft.AspNetCore.Identity;

namespace WebAPISalo.Data.Identity;

public class UserEntity : IdentityUser<long>
{
    public DateTime DateCreated { get; set; } = DateTime.UtcNow;

    public string? FirstName { get; set; } = null;
    public string? LastName { get; set; } = null;
    public string? Image { get; set; } = null;

    public ICollection<UserRoleEntity> UserRoles { get; set; }
}
