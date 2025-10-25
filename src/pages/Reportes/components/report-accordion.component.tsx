import React from 'react';

export interface ReportAccordionSection {
  key: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface ReportAccordionProps {
  sections: ReportAccordionSection[];
  activeKey: string;
  onChange: (key: string) => void;
  disabled?: boolean;
}

export default function ReportAccordion({
  sections,
  activeKey,
  onChange,
  disabled = false,
}: ReportAccordionProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="list-group shadow-sm">
      {sections.map(section => {
        const isActive = section.key === activeKey;
        return (
          <button
            key={section.key}
            type="button"
            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-3 ${
              isActive ? 'active' : ''
            }`}
            onClick={() => onChange(section.key)}
            disabled={disabled}
          >
            <div className="d-flex align-items-start gap-3 text-start">
              {section.icon && <span className="fs-4 text-primary">{section.icon}</span>}
              <div>
                <div className="fw-semibold">{section.title}</div>
                {section.description && <small className="text-muted d-block">{section.description}</small>}
              </div>
            </div>
            <span className="badge bg-light text-primary rounded-pill">
              {isActive ? 'viendo' : 'ver'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
