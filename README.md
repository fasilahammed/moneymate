# 🪙 MoneyMate
> **Intelligent Personal Salary Management, Live Expense Tracking, Real-Time Overspending Prevention & .NET 9 Clean Architecture**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![.NET](https://img.shields.io/badge/.NET-9.0_LTS-512bd4.svg?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg?logo=vite)](https://vitejs.dev/)
[![SQL Server](https://img.shields.io/badge/Database-SQL_Server_LocalDB-CC292B.svg?logo=microsoftsqlserver)](https://www.microsoft.com/sql-server)

---

## 🌟 Executive Overview

**MoneyMate** is an enterprise-grade personal financial management platform built with **.NET 9 Clean Architecture** and a dynamic, high-performance React 19 frontend. Unlike traditional passive expense loggers, MoneyMate acts as an **active financial copilot**:

1. **Ingests Monthly Salary & Pay Schedules:** (e.g. ₹25,000/month credited on the 1st).
2. **Recommends Category Allocations in Real-Time:** (Food ₹5.5k, Travel ₹2.5k, Family ₹3k, Housing ₹7k, Emergency Savings ₹5k, Buffer ₹2k).
3. **Calculates True Safe Available Balance:** Distinguishes between cash balance and funds locked to protect your savings goals and non-negotiable living costs.
4. **Prevents Overspending Before It Happens:** Real-time impact simulation warns when an outlay threatens a category budget or breaches safe pace limits.
5. **Grounded AI Advisory:** Uses verified domain math to answer queries (*"Can I afford dinner of ₹1,200?"*) with zero LLM calculation hallucination.
6. **Rich Visual Analytics & Diagrams:** Full interactive diagrams for expense distributions, 30-day cumulative burn curves, budget comparison bars, and 50/30/20 rule alignment.
7. **Production-Grade Clean Architecture:** Implements the pattern:
   `Controller ➔ IService / Service ➔ IRepository / Repository ➔ Entity & DTO`
   with consistent `MoneyMate.*` naming conventions.

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- **.NET 9 SDK** (`dotnet --version`)
- **Microsoft SQL Server LocalDB** (`(localdb)\mssqllocaldb`)
- **Node.js** v20.0 or higher & **npm** v10.0 or higher

### 1. Launch the Backend API
```powershell
dotnet run --project src/backend/MoneyMate.Api/MoneyMate.Api.csproj --urls "http://localhost:5000"
```
The API is available at **`http://localhost:5000`** (Swagger UI at **`http://localhost:5000/swagger`**). Database and demo data are automatically created via `db.Database.EnsureCreated()`.

### 2. Launch the Frontend
```powershell
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Run Automated Tests
```powershell
dotnet test src/backend/MoneyMate.sln
```

---

## 📂 Enterprise Solution Structure

```text
i:\Desktop\moneymate\
├── docs/                                          # Architecture & System Documentation
│   ├── MONEYMATE_CLEAN_ARCHITECTURE.md            # Comprehensive Clean Architecture Spec
│   ├── SPENDWISE_MASTER_PLAN_AND_ARCHITECTURE.md # Master System Blueprint
│   └── SYSTEM_WORKFLOW_AND_ARCHITECTURE.md       # End-to-End Workflow & Details
│
├── src/
│   ├── backend/                                  # .NET 9 Clean Architecture Core
│   │   ├── MoneyMate.sln                         # Solution root
│   │   │
│   │   ├── MoneyMate.Domain/                     # LAYER 1: Core Domain (Zero External Dependencies)
│   │   │   ├── Entities/                         # [entity] Domain Business Models
│   │   │   │   └── Entities.cs                   # User, SalaryProfile, Category, Transaction, SavingsGoal, Alert
│   │   │   └── Interfaces/                       # [irepo] Repository Contracts
│   │   │       └── IRepositories.cs              # IRepository<T>, ITransactionRepository, ISalaryProfileRepository...
│   │   │
│   │   ├── MoneyMate.Application/                # LAYER 2: Application Use Cases & Business Rules
│   │   │   ├── DTOs/                             # [dto] Immutable Data Transfer Objects
│   │   │   │   └── DTOs.cs                       # DashboardMetricsDto, CreateTransactionDto, AdvisorQueryDto...
│   │   │   ├── Interfaces/                       # [iservise] Service Interfaces
│   │   │   │   └── IServices.cs                  # IDashboardService, ITransactionService, ISalaryProfileService...
│   │   │   └── Services/                         # [servise] Concrete Implementations
│   │   │       ├── FinancialCalculationService.cs# Deterministic financial math engine
│   │   │       └── ApplicationServices.cs        # DashboardService, TransactionService, AdvisorService...
│   │   │
│   │   ├── MoneyMate.Infrastructure/             # LAYER 3: Data Access & Persistence
│   │   │   ├── Persistence/                      # Entity Framework Core 9 Context
│   │   │   │   └── MoneyMateDbContext.cs         # HasPrecision(18,2) & Seed Data
│   │   │   └── Repositories/                     # [repo] Concrete Repositories
│   │   │       ├── Repository.cs                 # Generic Repository<T> : IRepository<T>
│   │   │       ├── TransactionRepository.cs      # TransactionRepository : ITransactionRepository
│   │   │       ├── SalaryProfileRepository.cs    # SalaryProfileRepository : ISalaryProfileRepository
│   │   │       ├── CategoryRepository.cs         # CategoryRepository : ICategoryRepository
│   │   │       └── SavingsGoalRepository.cs      # SavingsGoalRepository : ISavingsGoalRepository
│   │   │
│   │   └── MoneyMate.Api/                        # LAYER 4: REST API Presentation
│   │       ├── Controllers/                      # [contrler] Web API Controllers
│   │       │   ├── DashboardController.cs        # Injects IDashboardService
│   │       │   ├── TransactionsController.cs     # Injects ITransactionService
│   │       │   ├── SalaryProfileController.cs    # Injects ISalaryProfileService
│   │       │   └── AdvisorController.cs          # Injects IAdvisorService
│   │       ├── appsettings.json                  # LocalDB connection string & CORS config
│   │       └── Program.cs                        # DI setup & DB bootstrapping
│   │
│   └── frontend/                                 # React 19 + TypeScript + Vite SPA
│       ├── src/
│       │   ├── api/                              # HTTP API client to http://localhost:5000
│       │   ├── components/                       # Common, Dashboard, Advisor, Analytics, Transactions
│       │   ├── data/                             # Pure math calculation engine
│       │   ├── types/                            # Domain TypeScript contracts
│       │   ├── App.tsx                           # Root orchestrator
│       │   └── index.css                         # Dual-theme design system
│       └── index.html                            # MoneyMate web app template
│
└── tests/
    └── MoneyMate.UnitTests/                      # Automated xUnit Test Suite
        └── FinancialCalculationServiceTests.cs   # Unit tests for financial formulas
```

---

## 🎨 Key Features & UI Capabilities

### 1. Dual Theme System (Dark Obsidian & Light Crystal)
- Seamless theme switcher button in the top navbar (`Sun` / `Moon`).
- **Dark Mode:** Deep obsidian slate (`#060913`) with subtle ambient neon emerald and electric violet radial glows.
- **Light Mode:** Crisp pearl alabaster (`#f4f6fb`) with soft frosted glassmorphism and high-contrast typography.

### 2. Multi-Tab Navigation
- **📊 Dashboard:** Executive cards (Salary, Spent, Locked Savings, Safe Balance, Daily Pace), Category Progress Bars, Emergency Fund Card, Recent Ledger, and the Contextual Side-Panel Advisor.
- **📈 Monthly Diagrams:** Full analytics page with:
  - **Expense Category Distribution Donut Chart** (SVG with interactive hover percentages).
  - **30-Day Cumulative Spending Curve vs. Ideal Budget Pace** (Trajectory tracking).
  - **Budget Allocation vs. Actual Spending Comparison** (Horizontal bar charts).
  - **50 / 30 / 20 Rule Alignment** (Needs vs. Wants vs. Savings breakdown).
- **💳 Ledger:** Searchable, category-filtered full transaction table with quick delete/reversal.

### 3. Floating Action Button (`+` FAB)
- Prominent glowing circular button in the bottom right with a pulsing neon aura.
- Clicking opens the **Log Expense Modal** from anywhere in the app.

### 4. Real-Time Impact Simulation
- While typing an expense amount (e.g. ₹1,200 Food), the modal simulates what will happen:
  - Predicts new category percentage.
  - Warns if category reaches **80% (Pace Warning)** or exceeds **100% (Over-Budget)**.
  - Warns if safe available balance drops into deficit!

### 5. Grounded AI Copilot (Side Panel)
- Evaluates real-time math without LLM calculation hallucinations.
- Features prompt chips: *"Can I spend ₹2,000?"*, *"Food budget check"*, *"Savings health"*.
- Evaluates purchase feasibility against true **Safe Available Balance**, protecting your ₹5,000 savings.

---

## 📐 Deterministic Financial Formulas

All math is 100% deterministic:

$$\text{Current Cash Balance} = \text{Total Monthly Income} - \text{Total Expenses Paid}$$

$$\text{Safe Available Balance} = \text{Current Cash Balance} - \text{Committed Savings}$$

$$\text{Safe Daily Pace} = \frac{\text{Safe Available Balance}}{\text{Days Remaining in Cycle}}$$

$$\text{Overspending Trigger} = \left( \frac{\text{Category Spent}}{\text{Category Allocated}} \ge 0.80 \right) \text{ and } (\text{Days Remaining} > 7)$$

---

## 🛡️ License
Released under the [MIT License](LICENSE).
