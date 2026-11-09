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

// Маршрут api/Account/{назва методу}, напр. api/Account/ForgotPassword
[Route("api/[controller]/[action]")]
[ApiController]
// Усі залежності приходять через конструктор (їх реєструє Program.cs):
// userManager — робота з користувачами Identity; imageService — збереження фото;
// jwtTokenService — створення JWT; emailService — відправка листів; logger — запис помилок у лог
public class AccountController(UserManager<UserEntity> userManager,
    IImageService imageService,
    IJwtTokenService jwtTokenService,
    IEmailService emailService,
    ILogger<AccountController> logger)
    : ControllerBase
{
    /// <summary>
    /// Мітка призначення токена. Код відновлення дійсний лише для цієї дії.
    /// </summary>
    // Код генерується під цю мітку і під неї ж перевіряється. Код, створений для іншої дії
    // (напр. підтвердження пошти), тут не пройде перевірку
    private const string ResetPasswordPurpose = "ResetPassword";

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
                // Ключ має бути error (раніше було erroor), бо саме його читає клієнт
                error = $"Не вдалося створити користувача '{model.Email}': " +
                string.Join("; ", createResult.Errors.Select(e => e.Description))
            });

        var roleResult = await userManager.AddToRoleAsync(user, Roles.User);

        string token = await jwtTokenService.CreateTokenAsync(user);
        return Ok(new { Token = token });

    }

    /// <summary>
    /// Надсилає 6-значний код відновлення пароля на email.
    /// Відповідь однакова, незалежно від того, чи існує користувач, щоб не розкривати наявність облікових записів.
    /// </summary>
    // КРОК 1 відновлення пароля. Клієнт надсилає { "email": "..." }
    [HttpPost]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel model, CancellationToken cancellationToken)
    {
        // Шукаємо користувача за поштою (null, якщо такого немає)
        var user = await userManager.FindByEmailAsync(model.Email);
        if (user is not null)
        {
            // Генеруємо 6-значний код. Його не зберігаємо в базі: Identity обчислює його з security stamp
            // користувача, мітки призначення і поточного часу (алгоритм TOTP), тому код діє лише кілька хвилин.
            // DefaultEmailProvider — провайдер, призначений для кодів, які надсилають поштою
            var code = await userManager.GenerateUserTokenAsync(
                user, TokenOptions.DefaultEmailProvider, ResetPasswordPurpose);

            try
            {
                // Надсилаємо лист із кодом (шаблон EmailTemplates/PasswordResetCode.html)
                await emailService.SendPasswordResetCodeAsync(user.Email!, code, cancellationToken);
            }
            catch (Exception ex)
            {
                // Email у лог не пишемо, щоб не зберігати персональні дані; лише ідентифікатор користувача.
                // Помилку клієнту теж не повертаємо, щоб відповідь не виказала, що такий email існує
                logger.LogError(ex, "Не вдалося надіслати код відновлення пароля для користувача {UserId}", user.Id);
            }
        }

        // Завжди 200 і той самий текст: так не можна перебором дізнатися, які пошти зареєстровані
        return Ok(new { message = "Якщо такий email зареєстровано, код відновлення надіслано на нього." });
    }

    /// <summary>
    /// Перевіряє код із листа і встановлює новий пароль. Код одноразовий: після зміни пароля security stamp оновлюється.
    /// </summary>
    // КРОК 2 відновлення пароля. Клієнт надсилає { "email": "...", "code": "123456", "newPassword": "..." }
    [HttpPost]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
    {
        var user = await userManager.FindByEmailAsync(model.Email);
        // Одне й те саме повідомлення і для «немає такого користувача», і для «невірний код»,
        // щоб не розкривати, чи існує email
        if (user is null ||
            !await userManager.VerifyUserTokenAsync(user, TokenOptions.DefaultEmailProvider, ResetPasswordPurpose, model.Code))
        {
            return BadRequest(new { error = "Невірний або прострочений код." });
        }

        // Код із листа вже перевірено. Але метод ResetPasswordAsync вимагає власний внутрішній токен Identity,
        // тому генеруємо його тут же і одразу використовуємо; користувач цього токена не бачить
        var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);
        // Змінює пароль (з перевіркою правил з Program.cs: мін. довжина 6) і оновлює security stamp.
        // Через це старий код після зміни пароля перестає діяти
        var result = await userManager.ResetPasswordAsync(user, resetToken, model.NewPassword);
        if (!result.Succeeded)
        {
            // Напр. пароль не відповідає вимогам: повертаємо опис помилок Identity
            return BadRequest(new
            {
                error = string.Join("; ", result.Errors.Select(e => e.Description))
            });
        }

        return Ok(new { message = "Пароль успішно змінено." });
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
