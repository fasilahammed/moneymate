# 🪙 SpendWise AI (MoneyMate)
> **Intelligent Personal Salary Management, Live Expense Tracking, Real-Time Overspending Prevention & Grounded Financial Advisory**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind & Custom CSS](https://img.shields.io/badge/Styling-Dual_Theme_Glassmorphism-10b981.svg)](#)

---

## 🌟 Executive Overview

**SpendWise AI** is an advanced personal finance platform built for salaried individuals. Traditional expense trackers act as passive post-mortem logbooks; SpendWise AI is an **active financial copilot** that:
1. **Ingests Monthly Salary & Pay Schedules:** (e.g. ₹25,000/month credited on the 1st).
2. **Recommends Category Allocations in Real-Time:** (Food ₹4k, Travel ₹2.5k, Family ₹5k, Housing ₹6k, Emergency Savings ₹5k, Buffer ₹2.5k).
3. **Calculates True Safe Available Balance:** Distinguishes between cash on hand and money locked for savings or pending bills.
4. **Prevents Overspending Before It Happens:** Real-time simulation in expense forms warns when an outlay threatens a category budget or breaches safe balance limits.
5. **Grounded AI Advisory:** Uses verified domain math to answer user queries (*"Can I spend ₹2,000 today?"*) with zero LLM calculation hallucination.
6. **Rich Visual Analytics & Diagrams:** Full interactive diagrams for expense distributions, 30-day cumulative burn curves, budget comparison bars, and 50/30/20 rule alignment.

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- **Node.js** v20.0 or higher
- **npm** v10.0 or higher

### 1. Launch the Application
From the project root:
```bash
# Run the development server (automatically launches frontend on port 5173)
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 2. Build for Production
```bash
npm run build
```

---

## 📂 Enterprise Solution Structure

```text
i:\Desktop\moneymate\
├── docs/                                          # Architecture & Workflow Documentation
│   ├── SPENDWISE_MASTER_PLAN_AND_ARCHITECTURE.md # Master System Blueprint
│   └── SYSTEM_WORKFLOW_AND_ARCHITECTURE.md       # Full End-to-End Workflow & Details
│
├── src/
│   ├── frontend/                                 # React 19 + TypeScript + Vite SPA
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── assets/                           # Static assets and icons
│   │   │   ├── components/                       # Modular UI Components
│   │   │   │   ├── common/                       # Shared Components
│   │   │   │   │   ├── Header.tsx                # Navbar with theme toggle & tabs
│   │   │   │   │   ├── AlertBanners.tsx          # Compact expandable notifications
│   │   │   │   │   └── SalaryModal.tsx           # Salary & pay cycle configuration
│   │   │   │   ├── dashboard/                    # Core Dashboard Views
│   │   │   │   │   ├── SummaryCards.tsx          # 5 Executive Financial Metrics
│   │   │   │   │   ├── CategoryGrid.tsx          # Category budget utilization cards
│   │   │   │   │   └── SavingsGoalCard.tsx       # Emergency fund progress tracker
│   │   │   │   ├── advisor/                      # Financial Intelligence
│   │   │   │   │   └── SideAdvisor.tsx           # Dynamic side-panel AI Copilot
│   │   │   │   ├── analytics/                    # Diagrams & Visual Insights
│   │   │   │   │   └── AnalyticsPage.tsx         # Donut chart, burn curves & 50/30/20
│   │   │   │   ├── transactions/                 # Ledger & Expense Logging
│   │   │   │   │   ├── TransactionList.tsx       # Filterable & searchable table
│   │   │   │   │   └── AddTransactionModal.tsx   # Modal with live impact simulation
│   │   │   │   └── index.ts                      # Central component barrel export
│   │   │   ├── data/
│   │   │   │   └── financialEngine.ts            # Pure deterministic financial math
│   │   │   ├── types/
│   │   │   │   └── index.ts                      # Master TypeScript contracts
│   │   │   ├── App.tsx                           # Master application orchestrator
│   │   │   ├── index.css                         # Dual-theme design system
│   │   │   └── main.tsx                          # Vite React root mounting
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── backend/                                  # Modular Clean Architecture Core (C# / .NET 9)
│       ├── SpendWise.Domain/                     # Pure business rules & entities
│       │   ├── Entities/FinancialEntities.cs     # User, Salary, Category, Transaction, Alert
│       │   └── Services/FinancialCalculationService.cs # High-precision calculation engine
│       ├── SpendWise.Application/                # Orchestration, CQRS commands & queries
│       ├── SpendWise.Infrastructure/             # EF Core, PostgreSQL & AI provider
│       └── SpendWise.Api/                        # REST Controllers & JWT security
│
├── tests/
│   └── SpendWise.UnitTests/
│       └── FinancialCalculationServiceTests.cs   # Unit tests for financial formulas
│
└── package.json                                  # Root script runner
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
