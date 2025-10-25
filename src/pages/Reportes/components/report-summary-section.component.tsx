import React from 'react';

export interface SummaryCardItem {
  title: string;
  value: string;
  subtitle: string;
  className?: string;
  icon?: React.ReactNode;
}

interface ReportSummarySectionProps {
  cards: SummaryCardItem[];
}

export default function ReportSummarySection({ cards }: ReportSummarySectionProps) {
  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <div className="row g-3 mb-4 reportes-resumen">
      {cards.map((card) => (
        <div className="col-12 col-lg-4" key={card.title}>
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2">
                {card.icon && <span className="text-primary fs-4">{card.icon}</span>}
                <h6 className="text-muted mb-0">{card.title}</h6>
              </div>
              <h3 className={`fw-semibold mb-0 ${card.className ?? ''}`}>{card.value}</h3>
              <p className="mb-0 text-muted small">{card.subtitle}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
