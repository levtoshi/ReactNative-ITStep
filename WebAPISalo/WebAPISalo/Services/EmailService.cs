using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using WebAPISalo.Interfaces;
using WebAPISalo.Models.Settings;

namespace WebAPISalo.Services;

/// <summary>
/// Відправка листів через SMTP за допомогою MailKit.
/// </summary>
// IOptions<SmtpSettings> — налаштування SMTP з секції "Smtp" у appsettings.json (хост, порт, логін, пароль)
public class EmailService(
    IOptions<SmtpSettings> options,
    ILogger<EmailService> logger) : IEmailService
{
    private const int SslOnConnectPort = 465;

    // Забираємо самі значення налаштувань з обгортки IOptions
    private readonly SmtpSettings _settings = options.Value;

    // Універсальний метод: надсилає будь-який HTML-лист
    public async Task SendAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        // Якщо SMTP не налаштовано — зупиняємось із зрозумілою помилкою
        if (string.IsNullOrWhiteSpace(_settings.Host))
            throw new InvalidOperationException("Smtp:Host не задано в конфігурації");

        // Збираємо лист: від кого, кому, тема
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Група p34", _settings.UserName));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        // Тіло листа — HTML
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        // Підключаємось до SMTP-сервера (true — із шифруванням SSL), входимо під логіном і паролем,
        // надсилаємо лист і відключаємось. using закриває з'єднання, навіть якщо сталася помилка
        using var client = new SmtpClient();
        await client.ConnectAsync(_settings.Host, _settings.Port, true);
        await client.AuthenticateAsync(_settings.UserName, _settings.Password, cancellationToken);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        // У лог пишемо лише тему, без адреси отримувача
        logger.LogInformation("Лист з темою \"{Subject}\" надіслано", subject);
    }

    // Лист із кодом відновлення пароля: бере HTML-шаблон і підставляє в нього email та код
    public async Task SendPasswordResetCodeAsync(string email, string code, CancellationToken cancellationToken = default)
    {
        // Шаблон лежить у папці EmailTemplates (csproj копіює її поруч із програмою при збірці)
        var templatePath = Path.Combine(Directory.GetCurrentDirectory(), "EmailTemplates", "PasswordResetCode.html");
        var template = await File.ReadAllTextAsync(templatePath, cancellationToken);

        // Замінюємо {{Email}} і {{Code}}. HtmlEncode екранує спецсимволи (<, >, &),
        // щоб у лист не можна було вставити сторонній HTML
        var body = template
            .Replace("{{Email}}", WebUtility.HtmlEncode(email))
            .Replace("{{Code}}", WebUtility.HtmlEncode(code));

        await SendAsync(email, "Відновлення пароля Salo", body, cancellationToken);
    }
}
