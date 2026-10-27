import React from 'react';
import { AlertTriangle, AlertOctagon, X } from 'lucide-react';
import type { AlertItem } from '../types';

interface AlertBannersProps {
  alerts: AlertItem[];
  onDismissAlert?: (id: string) => void;
}

export const AlertBanners: React.FC<AlertBannersProps> = ({ alerts, onDismissAlert }) => {
  if (alerts.length === 0) return null;

  return (
    <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {alerts.map((alert) => {
        const isCritical = alert.severity === 'CRITICAL';
        return (
          <div
            key={alert.id}
            id={`banner-${alert.id}`}
            className={`alert-banner ${isCritical ? 'critical' : 'warning'}`}
          >
            <div className="alert-icon">
              {isCritical ? (
                <AlertOctagon size={22} color="var(--rose-400)" />
              ) : (
                <AlertTriangle size={22} color="var(--amber-400)" />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div className="alert-title">{alert.title}</div>
              <div className="alert-desc">{alert.message}</div>
            </div>
            {onDismissAlert && (
              <button
                onClick={() => onDismissAlert(alert.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  opacity: 0.7,
                  padding: '4px'
                }}
                title="Dismiss warning"
              >
                <X size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
