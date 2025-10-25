import React from 'react';

interface ReportWarningsListProps {
  warnings: string[];
}

export default function ReportWarningsList({ warnings }: ReportWarningsListProps) {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <div className="alert alert-info mt-4" role="alert">
      <strong>Aviso:</strong>
      <ul className="mb-0 mt-2">
        {warnings.map((warning, index) => (
          <li key={index}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}
