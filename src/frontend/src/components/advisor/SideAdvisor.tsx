import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  HelpCircle,
  Shield,
  UtensilsCrossed,
  Car,
  HeartHandshake,
  Home,
  ShoppingBag
} from 'lucide-react';
import type {
  AdvisorRecommendation,
  DashboardMetrics,
  CategoryStatus,
  SalaryProfile
} from '../../types';
import { answerAdvisorQuery } from '../../data/financialEngine';
import { moneyMateApi } from '../../api/moneyMateApi';

interface SideAdvisorProps {
  advisor: AdvisorRecommendation;
  metrics: DashboardMetrics;
  categoryStatuses: CategoryStatus[];
  salary: SalaryProfile;
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home size={15} color="#3b82f6" />,
  HeartHandshake: <HeartHandshake size={15} color="#ec4899" />,
  UtensilsCrossed: <UtensilsCrossed size={15} color="#f59e0b" />,
  Car: <Car size={15} color="#06b6d4" />,
  ShieldCheck: <Shield size={15} color="#10b981" />,
  ShoppingBag: <ShoppingBag size={15} color="#8b5cf6" />
};

export const SideAdvisor: React.FC<SideAdvisorProps> = ({
  advisor,
  metrics,
  categoryStatuses,
  salary
}) => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<
    { sender: 'user' | 'ai'; text: string; time: string }[]
  >([
    {
      sender: 'ai',
      text: `Hello! I'm your MoneyMate Copilot. Based on your ₹${salary.monthlyTakeHome.toLocaleString()} salary, your safe daily allowance is ₹${Math.round(metrics.dailyBurnRate)}/day. Ask me anytime before making a purchase!`,
      time: 'Just now'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: queryText,
      time: 'Now'
    };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      // Query the live ASP.NET Core backend API
      const result = await moneyMateApi.askAdvisor(queryText);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai' as const,
          text: result.reply,
          time: 'Now'
        }
      ]);
    } catch {
      // Graceful local engine fallback
      const response = answerAdvisorQuery(queryText, metrics, categoryStatuses);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai' as const,
          text: response,
          time: 'Now'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleChipClick = (sampleQuery: string) => {
    handleSendQuery(sampleQuery);
  };

  const scoreColor =
    metrics.healthScore >= 80
      ? 'var(--emerald-main)'
      : metrics.healthScore >= 60
      ? 'var(--amber-main)'
      : 'var(--rose-main)';

  return (
    <aside className="glass-panel side-advisor-panel" id="side-advisor-container">
      {/* Header with Copilot Badge and Financial Health Score */}
      <div className="advisor-top-badge">
        <div className="copilot-chip">
          <Sparkles size={14} />
          <span>AI Money Copilot</span>
        </div>

        <div className="health-score-circle" title="Financial Health Score out of 100">
          <div>
            <div className="score-label">Health Score</div>
            <div className="score-num" style={{ color: scoreColor }}>
              {metrics.healthScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Advisory Note */}
      <div
        className="advisor-recommendation-box"
        style={{
          borderLeft: `4px solid ${
            advisor.status === 'ALERT'
              ? 'var(--rose-main)'
              : advisor.status === 'CAUTION'
              ? 'var(--amber-main)'
              : 'var(--indigo-main)'
          }`
        }}
      >
        <div className="advisor-recom-title">
          <Bot size={17} color="var(--indigo-main)" />
          <span>{advisor.headline}</span>
        </div>
        <p className="advisor-recom-text">{advisor.adviceParagraph}</p>
      </div>

      {/* Recommended Salary Allocation */}
      <div className="suggested-breakdown-box">
        <div className="suggested-header">
          <span>Target ₹{salary.monthlyTakeHome.toLocaleString()} Allocation Plan</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--emerald-main)' }}>100% Balanced</span>
        </div>

        <div>
          {categoryStatuses.map((cs) => {
            const iconNode = CATEGORY_ICON_MAP[cs.category.icon] || <ShoppingBag size={14} />;
            const pct = Math.round((cs.category.allocatedAmount / salary.monthlyTakeHome) * 100);

            return (
              <div key={cs.category.id} className="suggested-item">
                <div className="suggested-name">
                  {iconNode}
                  <span>{cs.category.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="suggested-val">
                    {salary.currency}{cs.category.allocatedAmount.toLocaleString()}
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginLeft: '4px' }}>
                      ({pct}%)
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: cs.status === 'EXCEEDED' ? 'var(--rose-main)' : cs.status === 'WARNING' ? 'var(--amber-main)' : 'var(--text-dim)' }}>
                    Spent: {salary.currency}{cs.spent.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ask Copilot Interactive Query Box */}
      <div className="copilot-chat-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-bright)' }}>
          <HelpCircle size={15} color="var(--indigo-main)" />
          <span>Ask Before You Spend</span>
        </div>

        {/* Quick query chips */}
        <div className="copilot-prompt-chips">
          <button
            type="button"
            className="prompt-chip"
            onClick={() => handleChipClick('Can I afford a ₹2,000 dinner tonight?')}
          >
            Can I spend ₹2,000?
          </button>
          <button
            type="button"
            className="prompt-chip"
            onClick={() => handleChipClick('Can I buy a ₹7,000 watch?')}
          >
            Can I buy ₹7,000 item?
          </button>
          <button
            type="button"
            className="prompt-chip"
            onClick={() => handleChipClick('How much food budget is left?')}
          >
            Food budget check
          </button>
          <button
            type="button"
            className="prompt-chip"
            onClick={() => handleChipClick('Check my emergency savings status')}
          >
            Savings health
          </button>
        </div>

        {/* Chat message history display */}
        <div
          style={{
            maxHeight: '180px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingRight: '4px'
          }}
        >
          {chatHistory.slice(-3).map((msg, index) => (
            <div
              key={index}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '92%'
              }}
            >
              {msg.sender === 'user' ? (
                <div
                  style={{
                    background: 'var(--indigo-glow)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    padding: '8px 12px',
                    borderRadius: '12px 12px 2px 12px',
                    fontSize: '0.8rem',
                    color: 'var(--text-bright)'
                  }}
                >
                  {msg.text}
                </div>
              ) : (
                <div className="ai-response-bubble">{msg.text}</div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="ai-response-bubble" style={{ color: 'var(--indigo-main)' }}>
              Querying backend financial engine...
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery(chatInput);
          }}
          className="chat-input-wrapper"
        >
          <input
            id="input-copilot-query"
            type="text"
            placeholder="e.g. Can I spend ₹1,500 on shoes?"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button id="btn-copilot-send" type="submit" className="chat-send-btn" title="Send question">
            <Send size={13} />
          </button>
        </form>
      </div>
    </aside>
  );
};
