using System.ComponentModel.DataAnnotations;

namespace WebAPISalo.Models.Account;

public class ResetPasswordModel
{
    /// <summary>
    /// Електронна пошта облікового запису
    /// </summary>
    /// <example>user@gmail.com</example>
    [Required(ErrorMessage = "Вкажіть електронну пошту")]
    [EmailAddress(ErrorMessage = "Некоректна електронна пошта")]
    public string Email { get; set; } = null!;

    /// <summary>
    /// 6-значний код із листа
    /// </summary>
    /// <example>123456</example>
    [Required(ErrorMessage = "Вкажіть код із листа")]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "Код має складатися з 6 цифр")]
    public string Code { get; set; } = null!;

    /// <summary>
    /// Новий пароль
    /// </summary>
    /// <example>NewPass1</example>
    [Required(ErrorMessage = "Вкажіть новий пароль")]
    [MinLength(6, ErrorMessage = "Пароль має бути мін 6 символів")]
    public string NewPassword { get; set; } = null!;
}
