using Microsoft.EntityFrameworkCore;
using MoneyMate.Application.Interfaces;
using MoneyMate.Application.Services;
using MoneyMate.Domain.Interfaces;
using MoneyMate.Infrastructure.Persistence;
using MoneyMate.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=(localdb)\\mssqllocaldb;Database=MoneyMateDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";

builder.Services.AddDbContext<MoneyMateDbContext>(options =>
    options.UseSqlServer(connectionString));

// 2. Repositories Registration
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<ISalaryProfileRepository, SalaryProfileRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ISavingsGoalRepository, SavingsGoalRepository>();

// 3. Application Services Registration
builder.Services.AddScoped<IFinancialCalculationService, FinancialCalculationService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ISalaryProfileService, SalaryProfileService>();
builder.Services.AddScoped<IAdvisorService, AdvisorService>();

// 4. API Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 5. CORS policy for React Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("MoneyMateCorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Ensure Database is Created & Seeded
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MoneyMateDbContext>();
    try
    {
        db.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Could not initialize database via EnsureCreated, verify SQL Server connection.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("MoneyMateCorsPolicy");
app.UseAuthorization();
app.MapControllers();

app.Run();
