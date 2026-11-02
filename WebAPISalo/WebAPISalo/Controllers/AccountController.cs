using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using WebAPISalo.Constants;
using WebAPISalo.Data.Identity;
using WebAPISalo.Interfaces;
using WebAPISalo.Models.Account;

namespace WebAPISalo.Controllers;

[Route("api/[controller]/[action]")]
[ApiController]
public class AccountController(UserManager<UserEntity> userManager,
    IImageService imageService,
    IJwtTokenService jwtTokenService) 
    : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var user = await userManager.FindByEmailAsync(model.Email);
        if(user!=null)
        {
            bool isCheckPassword = await userManager.CheckPasswordAsync(user, model.Password);
            if(isCheckPassword)
            {
                string token = await jwtTokenService.CreateTokenAsync(user);
                return Ok(new { Token = token });
            }
        }
        return Unauthorized(new { error="Дані вказано не вірно!" });
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromForm] RegisterModel model)
    {
        var user = new UserEntity
        {
            FirstName = model.FirstName,
            LastName = model.LastName,
            UserName = model.Email,
            Email = model.Email,
            EmailConfirmed = true
        };
        try
        {
            if(model.ImageFile!=null)
            {
                user.Image = await imageService.SaveOptimizedImageAsync(model.ImageFile);
            }
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }

        var createResult = await userManager.CreateAsync(user, model.Password);
        if (!createResult.Succeeded)
            return BadRequest(new
            {
                erroor = $"Не вдалося створити користувача '{model.Email}': " +
                string.Join("; ", createResult.Errors.Select(e => e.Description))
            });

        var roleResult = await userManager.AddToRoleAsync(user, Roles.User);

        string token = await jwtTokenService.CreateTokenAsync(user);
        return Ok(new { Token = token });

    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var kyivTz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Kiev");

        var users = await userManager.Users
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.Image,
                Registered = TimeZoneInfo.ConvertTimeFromUtc(
                    DateTime.SpecifyKind(u.DateCreated, DateTimeKind.Utc), kyivTz)
                   .ToString("dd.MM.yyyy HH:mm:ss", CultureInfo.InvariantCulture)
            })
            .ToListAsync();


        return Ok(users);
    }
}
