import React from 'react';
import {
  UtensilsCrossed,
  Car,
  HeartHandshake,
  Home,
  ShieldCheck,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import type { CategoryStatus, SalaryProfile } from '../types';

interface CategoryGridProps {
  categoryStatuses: CategoryStatus[];
  salary: SalaryProfile;
  onSelectCategory?: (categoryId: string) => void;
}

const ICONS: Record<string, React.ReactNode> = {
  Home: <Home size={20} color="#3b82f6" />,
  HeartHandshake: <HeartHandshake size={20} color="#ec4899" />,
  UtensilsCrossed: <UtensilsCrossed size={20} color="#f59e0b" />,
  Car: <Car size={20} color="#06b6d4" />,
  ShieldCheck: <ShieldCheck size={20} color="#10b981" />,
  ShoppingBag: <ShoppingBag size={20} color="#8b5cf6" />
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categoryStatuses,
  salary,
  onSelectCategory
}) => {
  return (
    <div>
      <div className="section-title-row">
        <h2 className="section-title">
          <Sparkles size={20} color="var(--emerald-400)" />
          <span>Category Budgets & Live Tracking</span>
        </h2>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          Real-time consumption vs planned allocations
        </span>
      </div>

      <div className="category-grid">
        {categoryStatuses.map((cs) => {
          const icon = ICONS[cs.category.icon] || <ShoppingBag size={20} />;
          const isExceeded = cs.status === 'EXCEEDED';
          const isWarning = cs.status === 'WARNING';

          const badgeClass = isExceeded
            ? 'badge-exceeded'
            : isWarning
            ? 'badge-warning'
            : 'badge-healthy';

          const fillClass = isExceeded
            ? 'fill-exceeded'
            : isWarning
            ? 'fill-warning'
            : 'fill-healthy';

          const pctClamped = Math.min(100, cs.percentageUsed);

          return (
            <div
              key={cs.category.id}
              id={`cat-card-${cs.category.id}`}
              className="glass-panel category-card"
              onClick={() => onSelectCategory && onSelectCategory(cs.category.id)}
              style={{
                borderColor: isExceeded
                  ? 'rgba(244, 63, 94, 0.4)'
                  : isWarning
                  ? 'rgba(245, 158, 11, 0.35)'
                  : undefined
              }}
            >
              <div className="category-header">
                <div className="cat-info-flex">
                  <div
                    className="cat-icon-wrap"
                    style={{
                      background: `${cs.category.colorHex}20`,
                      border: `1px solid ${cs.category.colorHex}40`
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <div className="cat-name">{cs.category.name}</div>
                    <div className="cat-sub">
                      Allocated: {salary.currency}{cs.category.allocatedAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className={`cat-badge ${badgeClass}`}>
                  {isExceeded ? 'Exceeded' : isWarning ? 'Pace Alert' : 'Healthy'}
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="progress-container">
                <div className="progress-track">
                  <div
                    className={`progress-fill ${fillClass}`}
                    style={{ width: `${pctClamped}%` }}
                  />
                </div>
              </div>

              {/* Financial Numbers Row */}
              <div className="cat-finance-row">
                <div>
                  <span className="cat-spent-strong" style={{ color: isExceeded ? 'var(--rose-400)' : 'var(--text-bright)' }}>
                    {salary.currency}{cs.spent.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '4px' }}>
                    ({cs.percentageUsed.toFixed(0)}%)
                  </span>
                </div>
                <div className="cat-remain-muted">
                  {isExceeded ? (
                    <span style={{ color: 'var(--rose-400)', fontWeight: 600 }}>
                      - {salary.currency}{(cs.spent - cs.category.allocatedAmount).toLocaleString()} over
                    </span>
                  ) : (
                    <span>
                      {salary.currency}{cs.remaining.toLocaleString()} left
                    </span>
                  )}
                </div>
              </div>

              {/* Safe Daily Pace Remainder */}
              <div
                style={{
                  fontSize: '0.73rem',
                  color: 'var(--text-dim)',
                  marginTop: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                  paddingTop: '6px'
                }}
              >
                <span>Daily allowance:</span>
                <span style={{ color: isExceeded ? 'var(--rose-400)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {isExceeded ? '₹0 / day' : `₹${Math.round(cs.dailySafePace)} / day`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
