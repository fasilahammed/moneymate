import React from 'react';
import { Shield, Calendar } from 'lucide-react';
import type { SavingsGoal, SalaryProfile, DashboardMetrics } from '../types';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  salary: SalaryProfile;
  metrics: DashboardMetrics;
}

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({ goal, salary, metrics }) => {
  const totalWithMonthly = goal.currentAmount;
  const pct = Math.min(100, Math.round((totalWithMonthly / goal.targetAmount) * 100));
  const isHealthy = metrics.safeAvailableBalance >= 0;

  return (
    <div
      className="glass-panel"
      id={`goal-card-${goal.id}`}
      style={{
        padding: '20px',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(15, 23, 42, 0.7))',
        border: '1px solid rgba(6, 182, 212, 0.25)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Shield size={20} color="var(--cyan-400)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
              {goal.title}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Monthly Allocation: {salary.currency}{goal.monthlyCommitment.toLocaleString()}/mo locked
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '20px',
            background: isHealthy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            color: isHealthy ? 'var(--emerald-400)' : 'var(--rose-400)',
            border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            fontWeight: 700
          }}
        >
          {isHealthy ? '● Savings On Track' : '⚠️ Savings At Risk'}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(to right, var(--cyan-500), var(--emerald-400))'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '6px' }}>
        <div>
          <span style={{ fontWeight: 700, color: 'var(--cyan-400)', fontFamily: 'var(--font-heading)' }}>
            {salary.currency}{goal.currentAmount.toLocaleString()}
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginLeft: '4px' }}>
            of {salary.currency}{goal.targetAmount.toLocaleString()} target ({pct}%)
          </span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={13} />
          <span>Deadline: {goal.targetDate}</span>
        </div>
      </div>
    </div>
  );
};
