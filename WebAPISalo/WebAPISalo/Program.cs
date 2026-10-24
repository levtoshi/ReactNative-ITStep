using Microsoft.EntityFrameworkCore;
using WebAPISalo.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

string conStr = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<MyDbContext>(opt =>
    opt.UseNpgsql(conStr));

builder.Services.AddControllers();

builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthorization();

app.MapControllers();

app.Run();
