import React, { useState } from 'react';
import {
  PieChart as PieChartIcon,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import type { CategoryStatus, DashboardMetrics, SalaryProfile, Transaction } from '../types';

interface AnalyticsPageProps {
  salary: SalaryProfile;
  metrics: DashboardMetrics;
  categoryStatuses: CategoryStatus[];
  transactions: Transaction[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  salary,
  metrics,
  categoryStatuses,
  transactions
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // 1. Calculate Donut Slices
  const totalExpenseSpent = metrics.totalSpent > 0 ? metrics.totalSpent : 1;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  const donutSlices = categoryStatuses
    .filter((cs) => cs.spent > 0)
    .map((cs) => {
      const slicePct = cs.spent / totalExpenseSpent;
      const strokeDash = slicePct * circumference;
      const strokeDashoffset = -accumulatedAngle * circumference;
      accumulatedAngle += slicePct;

      return {
        id: cs.category.id,
        name: cs.category.name,
        color: cs.category.colorHex,
        spent: cs.spent,
        pct: (slicePct * 100).toFixed(1),
        strokeDash,
        strokeDashoffset
      };
    });

  // 2. 50/30/20 Rule Analysis
  // Needs: Housing, Family, Food, Travel
  // Wants: Buffer, Shopping
  // Savings: Locked Savings
  const needsSpent = categoryStatuses
    .filter((c) => c.category.isEssential && c.category.id !== 'cat-savings')
    .reduce((sum, c) => sum + c.spent, 0);

  const wantsSpent = categoryStatuses
    .filter((c) => !c.category.isEssential)
    .reduce((sum, c) => sum + c.spent, 0);

  const savingsCommitted = metrics.committedSavings;

  const needsPct = Math.round((needsSpent / salary.monthlyTakeHome) * 100);
  const wantsPct = Math.round((wantsSpent / salary.monthlyTakeHome) * 100);
  const savingsPct = Math.round((savingsCommitted / salary.monthlyTakeHome) * 100);

  // 3. 30-Day Spending Trend (Cumulative)
  // Simulate day by day spend based on transactions
  const daysInMonth = 31;
  const spendByDay: number[] = new Array(daysInMonth + 1).fill(0);
  transactions.forEach((tx) => {
    if (tx.type === 'EXPENSE') {
      const day = parseInt(tx.date.split('-')[2] || '1', 10);
      if (day >= 1 && day <= daysInMonth) {
        spendByDay[day] += tx.amount;
      }
    }
  });

  const cumulativeActual: { day: number; spent: number }[] = [];
  let runningTotal = 0;
  for (let d = 1; d <= 16; d++) {
    runningTotal += spendByDay[d];
    cumulativeActual.push({ day: d, spent: runningTotal });
  }

  // Max scale for chart is salary take-home
  const chartHeight = 160;
  const chartWidth = 500;
  const maxBudget = salary.monthlyTakeHome;

  // Generate SVG path for actual curve
  const points = cumulativeActual.map((pt) => {
    const x = ((pt.day - 1) / (daysInMonth - 1)) * chartWidth;
    const y = chartHeight - (pt.spent / maxBudget) * chartHeight;
    return `${x},${y}`;
  });
  const actualPath = `M ${points.join(' L ')}`;

  // Ideal linear pace line from day 1 (0) to day 31 (budget limit ₹20k)
  const targetSpendLimit = salary.monthlyTakeHome - metrics.committedSavings;
  const paceYEnd = chartHeight - (targetSpendLimit / maxBudget) * chartHeight;
  const idealPacePath = `M 0,${chartHeight} L ${chartWidth},${paceYEnd}`;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Page Header */}
      <div className="section-title-row" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.6rem' }}>
            <PieChartIcon size={26} color="var(--indigo-light)" />
            <span>Monthly Financial Analytics & Diagrams</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '4px' }}>
            Visual breakdown of salary distribution, daily burn velocity, and category budget vs. actuals for {salary.monthName}.
          </p>
        </div>
      </div>

      {/* DIAGRAMS GRID */}
      <div className="analytics-grid">
        {/* DIAGRAM 1: Category Expense Donut Chart */}
        <div className="glass-panel diagram-card" id="diagram-donut">
          <div className="diagram-header">
            <div>
              <div className="diagram-title">
                <PieChartIcon size={19} color="var(--indigo-main)" />
                <span>Expense Category Distribution</span>
              </div>
              <div className="diagram-sub">Proportional share of total outflows (₹{metrics.totalSpent.toLocaleString()})</div>
            </div>
          </div>

          <div className="donut-chart-container">
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '180px', height: '180px' }}>
              <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke="var(--pill-bg)"
                  strokeWidth="20"
                />
                {/* Donut Slices */}
                {donutSlices.map((slice) => {
                  const isHovered = hoveredCategory === slice.id;
                  return (
                    <circle
                      key={slice.id}
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="none"
                      stroke={slice.color}
                      strokeWidth={isHovered ? 26 : 20}
                      strokeDasharray={`${slice.strokeDash} ${circumference}`}
                      strokeDashoffset={slice.strokeDashoffset}
                      style={{
                        transition: 'stroke-width 0.25s ease, opacity 0.2s ease',
                        cursor: 'pointer',
                        opacity: hoveredCategory && !isHovered ? 0.45 : 1
                      }}
                      onMouseEnter={() => setHoveredCategory(slice.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Metrics in Donut */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none'
                }}
              >
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Spent
                </div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-bright)' }}>
                  ₹{metrics.totalSpent.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--rose-main)', fontWeight: 600 }}>
                  {Math.round((metrics.totalSpent / salary.monthlyTakeHome) * 100)}% Used
                </div>
              </div>
            </div>

            {/* Slices Legend List */}
            <div className="donut-legend-list">
              {donutSlices.map((slice) => {
                const isHovered = hoveredCategory === slice.id;
                return (
                  <div
                    key={slice.id}
                    className="donut-legend-item"
                    onMouseEnter={() => setHoveredCategory(slice.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    style={{
                      background: isHovered ? 'var(--pill-bg)' : undefined,
                      borderLeft: isHovered ? `3px solid ${slice.color}` : '3px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="legend-dot" style={{ background: slice.color }} />
                      <span style={{ fontWeight: isHovered ? 700 : 500, color: 'var(--text-main)' }}>
                        {slice.name}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--text-bright)' }}>
                      ₹{slice.spent.toLocaleString()} <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>({slice.pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* DIAGRAM 2: 30-Day Cumulative Burn Velocity Line Diagram */}
        <div className="glass-panel diagram-card" id="diagram-velocity-curve">
          <div className="diagram-header">
            <div>
              <div className="diagram-title">
                <TrendingUp size={19} color="var(--emerald-main)" />
                <span>Cumulative Spending Curve vs. Ideal Budget Pace</span>
              </div>
              <div className="diagram-sub">Trajectory of spending across the 31-day cycle</div>
            </div>
          </div>

          <div style={{ padding: '8px 0' }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} className="burn-chart-svg">
              {/* Grid Lines */}
              <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="var(--border-subtle)" strokeDasharray="4 4" />
              <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="var(--border-subtle)" strokeDasharray="4 4" />
              <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="var(--border-subtle)" />

              {/* Ideal Pace Line (Dashed Green) */}
              <path d={idealPacePath} fill="none" stroke="var(--emerald-main)" strokeWidth="2.5" strokeDasharray="6 4" />

              {/* Actual Spending Curve (Solid Gradient / Rose) */}
              <path d={actualPath} fill="none" stroke="var(--rose-main)" strokeWidth="3" />

              {/* Day Points */}
              {cumulativeActual.map((pt, i) => {
                const x = ((pt.day - 1) / (daysInMonth - 1)) * chartWidth;
                const y = chartHeight - (pt.spent / maxBudget) * chartHeight;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={i === cumulativeActual.length - 1 ? 5 : 3}
                    fill={i === cumulativeActual.length - 1 ? 'var(--rose-main)' : 'var(--indigo-main)'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Today marker label */}
              <text x={chartWidth * 0.5} y={chartHeight + 20} fill="var(--text-dim)" fontSize="11" textAnchor="middle">
                Day 16 (Today) • ₹{metrics.totalSpent.toLocaleString()} Spent
              </text>
            </svg>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.78rem', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '3px', background: 'var(--rose-main)', display: 'inline-block' }} />
                <span>Actual Cumulative Spend</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '3px', background: 'var(--emerald-main)', display: 'inline-block', borderTop: '2px dashed var(--emerald-main)' }} />
                <span>Recommended Pace (Safe Budget)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DIAGRAM 3: Planned Budget Limit vs Actual Spending (Horizontal Comparison Bar Diagram) */}
      <div className="glass-panel diagram-card" style={{ marginBottom: '24px' }}>
        <div className="diagram-header">
          <div>
            <div className="diagram-title">
              <BarChart3 size={19} color="var(--cyan-main)" />
              <span>Budget Allocation vs. Actual Spending Comparison</span>
            </div>
            <div className="diagram-sub">Side-by-side comparison for each spending category</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {categoryStatuses.map((cs) => {
            const allocated = cs.category.allocatedAmount;
            const spent = cs.spent;
            const isOver = spent > allocated;
            const spentPct = Math.min(100, (spent / allocated) * 100);

            return (
              <div key={cs.category.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: cs.category.colorHex }} />
                    <span>{cs.category.name}</span>
                  </div>
                  <div>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 700, color: isOver ? 'var(--rose-main)' : 'var(--text-bright)' }}>
                      ₹{spent.toLocaleString()}
                    </span>
                    <span style={{ color: 'var(--text-dim)', marginLeft: '4px' }}>
                      / ₹{allocated.toLocaleString()}
                    </span>
                    <span
                      style={{
                        marginLeft: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isOver ? 'var(--rose-main)' : 'var(--emerald-main)'
                      }}
                    >
                      {isOver ? `(+₹${(spent - allocated).toLocaleString()} Over)` : `(₹${(allocated - spent).toLocaleString()} Left)`}
                    </span>
                  </div>
                </div>

                {/* Multi-Bar comparison */}
                <div style={{ position: 'relative', width: '100%', height: '10px', background: 'var(--pill-bg)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${spentPct}%`,
                      background: isOver
                        ? 'linear-gradient(to right, var(--rose-main), #dc2626)'
                        : `linear-gradient(to right, ${cs.category.colorHex}, ${cs.category.colorHex}dd)`,
                      borderRadius: '6px',
                      transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DIAGRAM 4: The 50 / 30 / 20 Financial Health Rule Breakdown */}
      <div className="glass-panel ratio-rule-card">
        <div className="diagram-header">
          <div>
            <div className="diagram-title">
              <ShieldCheck size={20} color="var(--emerald-main)" />
              <span>50 / 30 / 20 Financial Rule Alignment</span>
            </div>
            <div className="diagram-sub">
              Standard personal finance benchmark: 50% Essential Needs, 30% Discretionary Wants, 20% Savings
            </div>
          </div>
          <div
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--emerald-main)',
              fontSize: '0.78rem',
              fontWeight: 700
            }}
          >
            ● Savings Met (20%)
          </div>
        </div>

        {/* Stacked Proportional Bar */}
        <div className="ratio-bar-multi">
          <div
            className="ratio-slice"
            style={{
              width: `${needsPct}%`,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)'
            }}
            title={`Needs: ₹${needsSpent.toLocaleString()} (${needsPct}%)`}
          >
            Needs ({needsPct}%)
          </div>
          <div
            className="ratio-slice"
            style={{
              width: `${wantsPct}%`,
              background: 'linear-gradient(135deg, #f59e0b, #ec4899)'
            }}
            title={`Wants: ₹${wantsSpent.toLocaleString()} (${wantsPct}%)`}
          >
            Wants ({wantsPct}%)
          </div>
          <div
            className="ratio-slice"
            style={{
              width: `${savingsPct}%`,
              background: 'linear-gradient(135deg, #10b981, #06b6d4)'
            }}
            title={`Savings: ₹${savingsCommitted.toLocaleString()} (${savingsPct}%)`}
          >
            Savings ({savingsPct}%)
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '16px' }}>
          <div style={{ padding: '12px', background: 'var(--pill-bg)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Essential Needs (Target: 50%)
            </div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', color: '#60a5fa' }}>
              ₹{needsSpent.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({needsPct}%)</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Housing, Family & Groceries</div>
          </div>

          <div style={{ padding: '12px', background: 'var(--pill-bg)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Discretionary Wants (Target: 30%)
            </div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', color: '#f59e0b' }}>
              ₹{wantsSpent.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({wantsPct}%)</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Personal buffer, dining & leisure</div>
          </div>

          <div style={{ padding: '12px', background: 'var(--pill-bg)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Committed Savings (Target: 20%)
            </div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', color: 'var(--emerald-main)' }}>
              ₹{savingsCommitted.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({savingsPct}%)</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Locked Emergency Reserve</div>
          </div>
        </div>
      </div>

      {/* AI Advisory Diagnostics Card */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, var(--indigo-glow), var(--bg-card))',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={18} color="var(--indigo-light)" />
          <span style={{ fontWeight: 700, color: 'var(--text-bright)' }}>AI Monthly Financial Diagnostic</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
          With <strong>₹{metrics.safeAvailableBalance.toLocaleString()}</strong> remaining in safe spending capacity and 15 days left in October, your burn velocity is concentrated in <strong>Family Support</strong> (84% spent) and <strong>Food</strong> (84% spent). Your ₹5,000 Emergency Fund allocation remains 100% safeguarded. We recommend restricting dining out and keeping daily outlays under <strong>₹{Math.round(metrics.dailyBurnRate)}/day</strong> until next payday.
        </p>
      </div>
    </div>
  );
};
