using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebAPISalo.Data.Identity;
using WebAPISalo.Models.Account;

namespace WebAPISalo.Controllers;

[Route("api/[controller]/[action]")]
[ApiController]
public class AccountController(UserManager<UserEntity> userManager) 
    : ControllerBase
{
    //private readonly UserManager<UserEntity> _userManager;

    //public AccountController(UserManager<UserEntity> userManager)
    //{
    //    _userManager = userManager;
    //}
    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var user = await userManager.FindByEmailAsync(model.Email);
        if(user!=null)
        {
            bool isCheckPassword = await userManager.CheckPasswordAsync(user, model.Password);
            if(isCheckPassword)
            {
                return Ok(new { Token = "Тут буде токен авторизації на сервері" });
            }
        }
        return Unauthorized(new { error="Дані вказано не вірно!" });
    }
}
