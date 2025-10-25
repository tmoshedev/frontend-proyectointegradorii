import React from 'react';

export interface IntervalOption {
  value: string;
  label: string;
}

interface ReportIntervalSelectorProps {
  value: string;
  options: IntervalOption[];
  onChange: (value: string) => void;
  loading?: boolean;
}

export default function ReportIntervalSelector({
  value,
  options,
  onChange,
  loading = false,
}: ReportIntervalSelectorProps) {
  return (
    <div className="d-flex flex-column">
      <label className="form-label text-muted mb-1">Intervalo</label>
      <select
        className="form-select form-select-sm"
        value={value}
        onChange={event => onChange(event.target.value)}
        disabled={loading}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
