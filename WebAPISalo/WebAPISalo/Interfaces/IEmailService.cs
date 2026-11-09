namespace WebAPISalo.Interfaces;

public interface IEmailService
{
    /// <summary>
    /// Надсилає HTML-лист від імені облікового запису SMTP.
    /// </summary>
    /// <param name="to">Адреса отримувача</param>
    /// <param name="subject">Тема листа</param>
    /// <param name="htmlBody">Тіло листа у форматі HTML</param>
    /// <param name="cancellationToken">Токен скасування</param>
    Task SendAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default);

    /// <summary>
    /// Надсилає лист із кодом відновлення пароля. Тіло береться з шаблону EmailTemplates/PasswordResetCode.html.
    /// </summary>
    /// <param name="email">Email користувача, для якого відновлюється пароль. Вказується і як отримувач, і в тексті листа</param>
    /// <param name="code">Код підтвердження</param>
    /// <param name="cancellationToken">Токен скасування</param>
    Task SendPasswordResetCodeAsync(string email, string code, CancellationToken cancellationToken = default);
}
