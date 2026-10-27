using Microsoft.EntityFrameworkCore;
using MoneyMate.Domain.Entities;

namespace MoneyMate.Infrastructure.Persistence;

public class MoneyMateDbContext : DbContext
{
    public MoneyMateDbContext(DbContextOptions<MoneyMateDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<SalaryProfile> SalaryProfiles => Set<SalaryProfile>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<SavingsGoal> SavingsGoals => Set<SavingsGoal>();
    public DbSet<Alert> Alerts => Set<Alert>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Precision configurations for monetary columns
        modelBuilder.Entity<SalaryProfile>()
            .Property(s => s.MonthlyTakeHome)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Category>()
            .Property(c => c.AllocatedAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Transaction>()
            .Property(t => t.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<SavingsGoal>(goal =>
        {
            goal.Property(g => g.TargetAmount).HasPrecision(18, 2);
            goal.Property(g => g.CurrentAmount).HasPrecision(18, 2);
            goal.Property(g => g.MonthlyCommitment).HasPrecision(18, 2);
        });

        // Seed initial default demo data for ₹25,000 salary profile
        var defaultUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");

        modelBuilder.Entity<User>().HasData(new User
        {
            Id = defaultUserId,
            Email = "fasil@moneymate.local",
            FullName = "Fasil Ahammed",
            CurrencyCode = "INR",
            CreatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        modelBuilder.Entity<SalaryProfile>().HasData(new SalaryProfile
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            UserId = defaultUserId,
            MonthlyTakeHome = 25000m,
            PaydayDayOfMonth = 1,
            EffectiveFrom = new DateOnly(2026, 1, 1),
            IsActive = true
        });

        var catFoodId = Guid.Parse("33333333-3333-3333-3333-333333333301");
        var catRentId = Guid.Parse("33333333-3333-3333-3333-333333333302");
        var catTravelId = Guid.Parse("33333333-3333-3333-3333-333333333303");
        var catFamilyId = Guid.Parse("33333333-3333-3333-3333-333333333304");
        var catBufferId = Guid.Parse("33333333-3333-3333-3333-333333333305");

        modelBuilder.Entity<Category>().HasData(
            new Category
            {
                Id = catFoodId,
                UserId = defaultUserId,
                Name = "Food & Groceries",
                Icon = "Utensils",
                ColorHex = "#F59E0B",
                IsEssential = true,
                AllocatedAmount = 5500m
            },
            new Category
            {
                Id = catRentId,
                UserId = defaultUserId,
                Name = "Rent & Housing",
                Icon = "Home",
                ColorHex = "#6366F1",
                IsEssential = true,
                AllocatedAmount = 7000m
            },
            new Category
            {
                Id = catTravelId,
                UserId = defaultUserId,
                Name = "Travel & Commute",
                Icon = "Car",
                ColorHex = "#3B82F6",
                IsEssential = false,
                AllocatedAmount = 2500m
            },
            new Category
            {
                Id = catFamilyId,
                UserId = defaultUserId,
                Name = "Family & Medical",
                Icon = "Users",
                ColorHex = "#EC4899",
                IsEssential = true,
                AllocatedAmount = 3000m
            },
            new Category
            {
                Id = catBufferId,
                UserId = defaultUserId,
                Name = "Buffer & Lifestyle",
                Icon = "Coffee",
                ColorHex = "#10B981",
                IsEssential = false,
                AllocatedAmount = 2000m
            }
        );

        modelBuilder.Entity<SavingsGoal>().HasData(new SavingsGoal
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            UserId = defaultUserId,
            Title = "Emergency Shield Fund",
            TargetAmount = 50000m,
            CurrentAmount = 15000m,
            MonthlyCommitment = 5000m,
            TargetDate = new DateOnly(2026, 12, 31),
            IsAchieved = false
        });

        // Seed some initial expense transactions
        modelBuilder.Entity<Transaction>().HasData(
            new Transaction
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555501"),
                UserId = defaultUserId,
                CategoryId = catRentId,
                Amount = 7000m,
                TransactionType = "EXPENSE",
                PaymentMethod = "NetBanking",
                Note = "Monthly Apartment Rent",
                TransactionDate = new DateOnly(2026, 10, 2),
                CreatedAtUtc = new DateTime(2026, 10, 2, 8, 30, 0, DateTimeKind.Utc)
            },
            new Transaction
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555502"),
                UserId = defaultUserId,
                CategoryId = catFoodId,
                Amount = 1450m,
                TransactionType = "EXPENSE",
                PaymentMethod = "UPI",
                Note = "Supermarket Grocery Restock",
                TransactionDate = new DateOnly(2026, 10, 8),
                CreatedAtUtc = new DateTime(2026, 10, 8, 14, 15, 0, DateTimeKind.Utc)
            },
            new Transaction
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555503"),
                UserId = defaultUserId,
                CategoryId = catTravelId,
                Amount = 620m,
                TransactionType = "EXPENSE",
                PaymentMethod = "UPI",
                Note = "Weekly Metro & Cab Pass",
                TransactionDate = new DateOnly(2026, 10, 14),
                CreatedAtUtc = new DateTime(2026, 10, 14, 9, 0, 0, DateTimeKind.Utc)
            },
            new Transaction
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555504"),
                UserId = defaultUserId,
                CategoryId = catFamilyId,
                Amount = 1200m,
                TransactionType = "EXPENSE",
                PaymentMethod = "UPI",
                Note = "Pharmacy & Prescription",
                TransactionDate = new DateOnly(2026, 10, 20),
                CreatedAtUtc = new DateTime(2026, 10, 20, 18, 45, 0, DateTimeKind.Utc)
            }
        );
    }
}
