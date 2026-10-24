using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using WebAPISalo.Constants;
using WebAPISalo.Data;
using WebAPISalo.Data.Identity;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

string conStr = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<MyDbContext>(opt =>
    opt.UseNpgsql(conStr));

builder.Services.AddIdentity<UserEntity, RoleEntity>(opt =>
{
    opt.Password.RequiredLength = 6;
    opt.Password.RequireDigit = false;
    opt.Password.RequireLowercase = false;
    opt.Password.RequireUppercase = false;
    opt.Password.RequireNonAlphanumeric = false;
})
    .AddEntityFrameworkStores<MyDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddControllers();

builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthorization();

app.MapControllers();

await SeedIdentityAsync(app);

app.Run();

static async Task SeedIdentityAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    var db = scope.ServiceProvider.GetRequiredService<MyDbContext>();
    await db.Database.MigrateAsync();

    var roleManager = services.GetRequiredService<RoleManager<RoleEntity>>();
    var userManager = services.GetRequiredService<UserManager<UserEntity>>();

    // 1. Ролі
    if (!db.Roles.Any())
    {
        foreach (var roleName in Roles.AllRoles)
        {
            var result = await roleManager.CreateAsync(new RoleEntity { Name = roleName });
            if (!result.Succeeded)
                Console.WriteLine($"Не вдалося створити роль '{roleName}': " +
                    string.Join("; ", result.Errors.Select(e => e.Description)));

        }
    }

    // 2. Користувачі: (email, пароль, роль)
    var users = new[]
    {
        (Email: "admin@gmail.com", Password: "Admin123", Role: Roles.Admin),
        (Email: "user@gmail.com",  Password: "User123",  Role: Roles.User),
    };

    if (!db.Users.Any())
    {
        foreach (var u in users)
        {

            var user = new UserEntity
            {
                UserName = u.Email,
                Email = u.Email,
                EmailConfirmed = true
            };

            var createResult = await userManager.CreateAsync(user, u.Password);
            if (!createResult.Succeeded)
                Console.WriteLine($"Не вдалося створити користувача '{u.Email}': " +
                    string.Join("; ", createResult.Errors.Select(e => e.Description)));

            var roleResult = await userManager.AddToRoleAsync(user, u.Role);
            if (!roleResult.Succeeded)
                Console.WriteLine($"Не вдалося додати '{u.Email}' до ролі '{u.Role}': " +
                    string.Join("; ", roleResult.Errors.Select(e => e.Description)));
        }
    }
}
