using System.ComponentModel.DataAnnotations;

namespace WebAPISalo.Models.Account;

public class ForgotPasswordModel
{
    /// <summary>
    /// Електронна пошта облікового запису, для якого потрібно відновити пароль
    /// </summary>
    /// <example>user@gmail.com</example>
    [Required(ErrorMessage = "Вкажіть електронну пошту")]
    [EmailAddress(ErrorMessage = "Некоректна електронна пошта")]
    public string Email { get; set; } = null!;
}
