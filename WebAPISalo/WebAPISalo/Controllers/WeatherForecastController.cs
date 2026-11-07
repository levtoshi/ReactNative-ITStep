using Microsoft.AspNetCore.Mvc;
using WebAPISalo.Interfaces;

namespace WebAPISalo.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController(ILogger<WeatherForecastController> logger,
        IEmailService emailService) : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };


        [HttpGet]
        public async Task<IEnumerable<WeatherForecast>> Get()
        {

            await emailService.SendAsync(
                to: "novakvova@gmail.com", 
                subject: "Яка чудова погода", 
                htmlBody: "Їж сало і <strong>будеш</strong> крутим :)");
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
        }
    }
}
