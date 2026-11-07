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
}
