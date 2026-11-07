using Microsoft.Extensions.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using WebAPISalo.Interfaces;
using WebAPISalo.Models.Settings;

namespace WebAPISalo.Services;

/// <summary>
/// Відправка листів через SMTP за допомогою MailKit.
/// Порт 465 використовує SSL з початку з'єднання, інші порти — STARTTLS.
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
        message.From.Add(MailboxAddress.Parse(_settings.UserName));
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
}
