import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ShieldCheck, Banknote, Clock } from 'lucide-react';
import type { DashboardMetrics, SalaryProfile } from '../../types';

interface SummaryCardsProps {
  metrics: DashboardMetrics;
  salary: SalaryProfile;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics, salary }) => {
  const isDeficit = metrics.safeAvailableBalance < 0;

  return (
    <div className="summary-cards-grid">
      {/* 1. Monthly Salary Inflow */}
      <div className="glass-panel summary-card inflow" id="card-monthly-inflow">
        <div className="card-header-flex">
          <span className="card-label">Monthly Salary</span>
          <div className="card-icon-bubble">
            <ArrowDownLeft size={18} color="var(--emerald-main)" />
          </div>
        </div>
        <div className="card-value">
          {salary.currency}{metrics.totalIncome.toLocaleString()}
        </div>
        <div className="card-subtext">
          <span>Credited 1st of month • 100% active</span>
        </div>
      </div>

      {/* 2. Total Expenses Paid */}
      <div className="glass-panel summary-card outflow" id="card-total-spent">
        <div className="card-header-flex">
          <span className="card-label">Expenses Spent</span>
          <div className="card-icon-bubble">
            <ArrowUpRight size={18} color="var(--rose-main)" />
          </div>
        </div>
        <div className="card-value" style={{ color: 'var(--rose-main)' }}>
          {salary.currency}{metrics.totalSpent.toLocaleString()}
        </div>
        <div className="card-subtext">
          <span>{Math.round((metrics.totalSpent / metrics.totalIncome) * 100)}% of monthly salary used</span>
        </div>
      </div>

      {/* 3. Committed Savings Reserve */}
      <div className="glass-panel summary-card savings" id="card-savings-reserve">
        <div className="card-header-flex">
          <span className="card-label">Locked Savings</span>
          <div className="card-icon-bubble">
            <ShieldCheck size={18} color="var(--cyan-main)" />
          </div>
        </div>
        <div className="card-value" style={{ color: 'var(--cyan-main)' }}>
          {salary.currency}{metrics.committedSavings.toLocaleString()}
        </div>
        <div className="card-subtext">
          <span>Protected emergency fund quota</span>
        </div>
      </div>

      {/* 4. Safe Available Balance (Real Spending Power) */}
      <div
        className="glass-panel summary-card balance"
        id="card-safe-balance"
        style={{
          border: isDeficit
            ? '1px solid var(--rose-main)'
            : '1px solid var(--emerald-main)'
        }}
      >
        <div className="card-header-flex">
          <span className="card-label" style={{ color: isDeficit ? 'var(--rose-main)' : 'var(--emerald-main)', fontWeight: 700 }}>
            Safe Available Balance
          </span>
          <div className="card-icon-bubble">
            <Banknote size={18} color={isDeficit ? 'var(--rose-main)' : 'var(--emerald-main)'} />
          </div>
        </div>
        <div
          className="card-value"
          style={{
            color: isDeficit ? 'var(--rose-main)' : 'var(--emerald-main)',
            textShadow: isDeficit
              ? '0 0 20px var(--rose-glow)'
              : '0 0 20px var(--emerald-glow)'
          }}
        >
          {salary.currency}{metrics.safeAvailableBalance.toLocaleString()}
        </div>
        <div className="card-subtext">
          <span>
            {isDeficit
              ? '⚠️ Spending exceeds safe boundary!'
              : 'Available without touching savings'}
          </span>
        </div>
      </div>

      {/* 5. Safe Daily Burn Pace */}
      <div className="glass-panel summary-card pace" id="card-burn-pace">
        <div className="card-header-flex">
          <span className="card-label">Safe Daily Pace</span>
          <div className="card-icon-bubble">
            <Clock size={18} color="var(--indigo-main)" />
          </div>
        </div>
        <div className="card-value" style={{ color: 'var(--indigo-main)' }}>
          {salary.currency}{Math.round(metrics.dailyBurnRate).toLocaleString()}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 400 }}> / day</span>
        </div>
        <div className="card-subtext">
          <span>{metrics.daysRemaining} days remaining in pay cycle</span>
        </div>
      </div>
    </div>
  );
};
