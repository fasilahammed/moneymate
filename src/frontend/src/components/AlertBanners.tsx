import React, { useState } from 'react';
import { AlertTriangle, AlertOctagon, X, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import type { AlertItem } from '../types';

interface AlertBannersProps {
  alerts: AlertItem[];
  onDismissAlert?: (id: string) => void;
}

export const AlertBanners: React.FC<AlertBannersProps> = ({ alerts, onDismissAlert }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (alerts.length === 0) return null;

  const topAlert = alerts[0];
  const remainingCount = alerts.length - 1;

  return (
    <div className="compact-alert-container">
      {/* Primary Alert Banner */}
      <div
        className={`compact-alert-item ${topAlert.severity === 'CRITICAL' ? 'critical' : 'warning'}`}
        id={`banner-${topAlert.id}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          {topAlert.severity === 'CRITICAL' ? (
            <AlertOctagon size={20} color="var(--rose-main)" style={{ flexShrink: 0 }} />
          ) : (
            <AlertTriangle size={20} color="var(--amber-main)" style={{ flexShrink: 0 }} />
          )}

          <div>
            <strong style={{ fontSize: '0.88rem', marginRight: '6px' }}>{topAlert.title}:</strong>
            <span style={{ fontSize: '0.83rem', opacity: 0.95 }}>{topAlert.message}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {remainingCount > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: 'inherit',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600
              }}
              type="button"
            >
              <Bell size={12} />
              <span>+{remainingCount} more</span>
              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}

          {onDismissAlert && (
            <button
              onClick={() => onDismissAlert(topAlert.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                opacity: 0.75,
                padding: '4px'
              }}
              title="Dismiss warning"
              type="button"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded additional alerts */}
      {isExpanded &&
        alerts.slice(1).map((alert) => (
          <div
            key={alert.id}
            id={`banner-${alert.id}`}
            className={`compact-alert-item ${alert.severity === 'CRITICAL' ? 'critical' : 'warning'}`}
            style={{ animation: 'fadeIn 0.2s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              {alert.severity === 'CRITICAL' ? (
                <AlertOctagon size={18} color="var(--rose-main)" style={{ flexShrink: 0 }} />
              ) : (
                <AlertTriangle size={18} color="var(--amber-main)" style={{ flexShrink: 0 }} />
              )}
              <div>
                <strong style={{ fontSize: '0.86rem', marginRight: '6px' }}>{alert.title}:</strong>
                <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>{alert.message}</span>
              </div>
            </div>

            {onDismissAlert && (
              <button
                onClick={() => onDismissAlert(alert.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  opacity: 0.75,
                  padding: '4px'
                }}
                title="Dismiss warning"
                type="button"
              >
                <X size={15} />
              </button>
            )}
          </div>
        ))}
    </div>
  );
};
