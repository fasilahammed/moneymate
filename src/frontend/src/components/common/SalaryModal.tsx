import React, { useState } from 'react';
import { X, Wallet, Check } from 'lucide-react';
import type { SalaryProfile } from '../../types';

interface SalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  salary: SalaryProfile;
  onUpdateSalary: (newSalary: SalaryProfile) => void;
}

export const SalaryModal: React.FC<SalaryModalProps> = ({
  isOpen,
  onClose,
  salary,
  onUpdateSalary
}) => {
  const [takeHome, setTakeHome] = useState(salary.monthlyTakeHome.toString());
  const [payday, setPayday] = useState(salary.paydayDay.toString());

  React.useEffect(() => {
    if (isOpen) {
      setTakeHome(salary.monthlyTakeHome.toString());
      setPayday(salary.paydayDay.toString());
    }
  }, [isOpen, salary.monthlyTakeHome, salary.paydayDay]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(takeHome);
    const parsedDay = parseInt(payday, 10);

    if (parsedAmount > 0 && parsedDay >= 1 && parsedDay <= 31) {
      onUpdateSalary({
        ...salary,
        monthlyTakeHome: parsedAmount,
        paydayDay: parsedDay
      });
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Wallet size={22} color="var(--emerald-main)" />
            <span>Salary Profile & Cycle</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="input-salary-amount">
              Monthly Take-Home Salary (₹) *
            </label>
            <input
              id="input-salary-amount"
              type="number"
              className="form-input"
              value={takeHome}
              onChange={(e) => setTakeHome(e.target.value)}
              min="1000"
              step="500"
              required
            />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
              Used by the side-panel advisor to calculate category limits and savings ratio.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="input-payday-day">
              Payday Day of Month (1 - 31)
            </label>
            <input
              id="input-payday-day"
              type="number"
              className="form-input"
              value={payday}
              onChange={(e) => setPayday(e.target.value)}
              min="1"
              max="31"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
              Quick Presets:
            </span>
            <button
              type="button"
              className="prompt-chip"
              onClick={() => setTakeHome('25000')}
            >
              ₹25,000 (Default)
            </button>
            <button
              type="button"
              className="prompt-chip"
              onClick={() => setTakeHome('35000')}
            >
              ₹35,000
            </button>
            <button
              type="button"
              className="prompt-chip"
              onClick={() => setTakeHome('50000')}
            >
              ₹50,000
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Cancel
            </button>
            <button
              id="btn-save-salary"
              type="submit"
              className="btn-primary"
              style={{ flex: 2, justifyContent: 'center' }}
            >
              <Check size={16} />
              <span>Update Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
