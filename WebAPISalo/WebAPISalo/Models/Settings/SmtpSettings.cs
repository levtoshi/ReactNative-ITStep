namespace WebAPISalo.Models.Settings;

/// <summary>
/// Налаштування SMTP-сервера. Прив'язується до секції "Smtp" в appsettings.json.
/// </summary>
public class SmtpSettings
{
    /// <summary>
    /// Адреса SMTP-сервера
    /// </summary>
    /// <example>smtp.ukr.net</example>
    public string Host { get; set; } = null!;

    /// <summary>
    /// Порт SMTP-сервера
    /// </summary>
    /// <example>2525</example>
    public int Port { get; set; }

    /// <summary>
    /// Логін для автентифікації на SMTP-сервері
    /// </summary>
    public string UserName { get; set; } = null!;

    /// <summary>
    /// Пароль для автентифікації на SMTP-сервері. Зберігати в змінних середовища, а не в appsettings.json
    /// </summary>
    public string Password { get; set; } = null!;
}
