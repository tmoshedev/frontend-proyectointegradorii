import React from 'react';
import { formatCurrency, formatPercentOneDecimal } from '../utils/formatters';

export interface GoalSummaryCard {
  key: string;
  title: string;
  value: number;
  subtitle?: string;
  highlight?: boolean;
}

interface GoalsSummaryProps {
  cards: GoalSummaryCard[];
}

export default function GoalsSummary({ cards }: GoalsSummaryProps) {
  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <div className="d-flex flex-column gap-3">
      {cards.map(card => (
        <div key={card.key} className="d-flex justify-content-between align-items-center">
          <div className="text-muted">{card.title}</div>
          <div className={`fw-semibold ${card.highlight ? 'text-success' : ''}`}>
            {card.key.includes('percent') ? `${formatPercentOneDecimal(card.value)}%` : formatCurrency(card.value)}
          </div>
          {card.subtitle && <small className="text-muted text-end">{card.subtitle}</small>}
        </div>
      ))}
    </div>
  );
}
