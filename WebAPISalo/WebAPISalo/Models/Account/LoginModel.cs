namespace WebAPISalo.Models.Account;

public class LoginModel
{
    /// <summary>
    /// Електронна пошта
    /// </summary>
    /// <example>user@gmail.com</example>
    public string Email { get; set; } = null!;
    /// <summary>
    /// Пароль
    /// </summary>
    /// <example>User123</example>
    public string Password { get; set; } = null!;
}
