using Microsoft.AspNetCore.Identity;

namespace WebAPISalo.Data.Identity;

public class RoleEntity : IdentityRole<long>
{
    public RoleEntity() : base() { }
    public RoleEntity(string roleName) : base(roleName) { }

    public ICollection<UserRoleEntity> UserRoles { get; set; }
}
