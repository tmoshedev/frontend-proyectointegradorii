import React from 'react';
import ReportChart from '../../../components/ReportChart';
import { ReportsTimeseriesResponse } from '../../../models';
import { formatInteger } from '../utils/formatters';

interface ReportTrendCardProps {
  title: string;
  description?: string;
  dataset?: ReportsTimeseriesResponse | null;
  loading?: boolean;
  footerLines?: string[];
  footerTitle?: string;
  showFooterInline?: boolean;
}

const hasData = (dataset?: ReportsTimeseriesResponse | null) =>
  Boolean(dataset && dataset.values && dataset.values.some(value => value > 0));

export default function ReportTrendCard({
  title,
  description,
  dataset,
  loading = false,
  footerLines,
  footerTitle,
  showFooterInline,
}: ReportTrendCardProps) {
  if (loading) {
    return (
      <div className="card shadow-sm h-100 border-0">
        <div className="card-body d-flex flex-column justify-content-center text-center text-muted">
          Cargando tendencia...
        </div>
      </div>
    );
  }

  if (!hasData(dataset)) {
    return (
      <div className="card shadow-sm h-100 border-0">
        <div className="card-body d-flex flex-column justify-content-center text-center text-muted">
          No hay datos disponibles para esta tendencia.
        </div>
      </div>
    );
  }

  const lastValue = dataset?.values?.[dataset.values.length - 1] ?? 0;

  return (
    <div className="card shadow-sm h-100 border-0">
      <div className="card-body d-flex flex-column gap-3">
        <div>
          <h6 className="mb-0">{title}</h6>
          {description && <small className="text-muted">{description}</small>}
        </div>
        <div>
          <span className="display-6 fw-semibold">{formatInteger(lastValue)}</span>
          <small className="text-muted d-block">Último punto registrado</small>
        </div>
        <div style={{ height: 220 }}>
          <ReportChart
            fullWidth
            type="line"
            data={{
              labels: dataset?.labels ?? [],
              datasets: [
                {
                  label: title,
                  data: dataset?.values ?? [],
                  borderColor: '#2563eb',
                  backgroundColor: '#2563eb20',
                  tension: 0.35,
                  fill: true,
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              scales: {
                x: {
                  ticks: { autoSkip: true, maxRotation: 0, minRotation: 0 },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value: number | string) => formatInteger(typeof value === 'number' ? value : Number(value)),
                  },
                },
              },
            }}
            height={220}
            showDataLabels
            dataLabelFormatter={(value: number) => formatInteger(value)}
            enableDownload
            downloadFilename={`${title.toLowerCase().replace(/\s+/g, '-')}-trend.png`}
            downloadLabel="Descargar PNG"
            footerLines={footerLines}
            footerTitle={footerTitle}
            showFooterInline={showFooterInline}
          />
        </div>
      </div>
    </div>
  );
}
