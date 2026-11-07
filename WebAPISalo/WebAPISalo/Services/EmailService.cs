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
public class EmailService(
    IOptions<SmtpSettings> options,
    ILogger<EmailService> logger) : IEmailService
{
    private const int SslOnConnectPort = 465;

    private readonly SmtpSettings _settings = options.Value;

    public async Task SendAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_settings.Host))
            throw new InvalidOperationException("Smtp:Host не задано в конфігурації");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Група p34", _settings.UserName));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(_settings.Host, _settings.Port, true);
        await client.AuthenticateAsync(_settings.UserName, _settings.Password, cancellationToken);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        logger.LogInformation("Лист з темою \"{Subject}\" надіслано", subject);
    }

    public async Task SendPasswordResetCodeAsync(string email, string code, CancellationToken cancellationToken = default)
    {
        var templatePath = Path.Combine(Directory.GetCurrentDirectory(), "EmailTemplates", "PasswordResetCode.html");
        var template = await File.ReadAllTextAsync(templatePath, cancellationToken);

        var body = template
            .Replace("{{Email}}", WebUtility.HtmlEncode(email))
            .Replace("{{Code}}", WebUtility.HtmlEncode(code));

        await SendAsync(email, "Відновлення пароля Salo", body, cancellationToken);
    }
}
