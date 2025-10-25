import React from 'react';

interface ReportNoDataProps {
  message?: string;
}

export default function ReportNoData({ message }: ReportNoDataProps) {
  return (
    <div className="alert alert-warning border-0 shadow-sm" role="alert">
      <strong>Sin datos.</strong> {message ?? 'Ajusta los filtros o verifica que el endpoint esté devolviendo información.'}
    </div>
  );
}
