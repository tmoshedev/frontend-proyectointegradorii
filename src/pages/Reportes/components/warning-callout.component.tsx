import React from 'react';

interface WarningCalloutProps {
  warnings: string[];
}

export default function WarningCallout({ warnings }: WarningCalloutProps) {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  const items = Array.from(
    new Set(
      warnings
        .filter(warning => typeof warning === 'string' && warning.trim().length > 0)
        .map(warning => warning.trim()),
    ),
  ).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="alert alert-info border-0 shadow-sm" role="alert">
      <strong>Aviso:</strong>
      <ul className="mb-0 mt-2">
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
