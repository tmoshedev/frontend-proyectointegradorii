import React from 'react';
import ReportChart from '../../../components/ReportChart';
import { formatInteger, formatPercentOneDecimal } from '../utils/formatters';
import { ReportsStageTargetSummary } from '../../../models';

interface StageTargetInsightView {
  key: string;
  label: string;
  actual: number;
  target: number;
  difference: number;
  fulfillment: number | null;
  count: number;
}

interface StageTargetsChartDataset {
  labels: string[];
  actual: number[];
  target: number[];
}

interface ReportStageTargetsOverviewProps {
  dataset: StageTargetsChartDataset;
  insights: StageTargetInsightView[];
  totals: {
    actual: number;
    target: number;
  };
  summary?: ReportsStageTargetSummary | null;
  footerTitle?: string;
  footerLines?: string[];
  onManageStageTargets?: () => void;
  controlsSlot?: React.ReactNode;
}

const summarizeDifferenceLabel = (difference: number) => {
  if (difference === 0) {
    return 'En meta';
  }
  return difference > 0 ? `+${formatInteger(difference)} leads` : `${formatInteger(difference)} leads`;
};

const formatFulfillment = (value: number | null) => {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }
  return `${formatPercentOneDecimal(value)}%`;
};

const hasChartData = (dataset: StageTargetsChartDataset) => {
  if (!dataset?.labels?.length) {
    return false;
  }
  const hasTargets = dataset.target?.some((value) => (Number(value) ?? 0) > 0);
  const hasActuals = dataset.actual?.some((value) => (Number(value) ?? 0) > 0);
  return hasTargets || hasActuals;
};

const ReportStageTargetsOverview: React.FC<ReportStageTargetsOverviewProps> = ({
  dataset,
  insights,
  totals,
  summary,
  footerLines,
  footerTitle,
  onManageStageTargets,
  controlsSlot,
}) => {
  const hasData = hasChartData(dataset);

  return (
    <section className="mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h5 className="mb-0">Metas por etapa del embudo</h5>
          <small className="text-muted">
            {insights.length > 0
              ? `${insights.length} etapa${insights.length === 1 ? '' : 's'} con objetivo`
              : 'Aún no hay metas declaradas por etapa'}
          </small>
        </div>
        {(controlsSlot || onManageStageTargets) && (
          <div className="d-flex align-items-center flex-wrap gap-2 justify-content-end">
            {controlsSlot}
            {onManageStageTargets && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={onManageStageTargets}
              >
                Gestionar metas por etapa
              </button>
            )}
          </div>
        )}
      </div>

      {hasData ? (
        <div className="row g-3 align-items-stretch">
          <div className="col-12 col-xl-7">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <ReportChart
                  type="bar"
                  fullWidth
                  title="Meta vs Real por etapa"
                  data={{
                    labels: dataset.labels,
                    datasets: [
                      {
                        label: 'Meta',
                        data: dataset.target,
                      },
                      {
                        label: 'Real',
                        data: dataset.actual,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    indexAxis: 'x',
                    plugins: {
                      legend: { position: 'top' },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value: string | number) =>
                            formatInteger(typeof value === 'number' ? value : Number(value)),
                        },
                      },
                    },
                  }}
                  height={300}
                  enableDownload
                  downloadFilename="embudo-metas-por-etapa.png"
                  downloadLabel="Descargar PNG"
                  showDataLabels
                  dataLabelFormatter={(value: number) => formatInteger(value)}
                  footerLines={footerLines}
                  footerTitle={footerTitle}
                />
              </div>
            </div>
          </div>
          <div className="col-12 col-xl-5">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex flex-column gap-3">
                <div className="d-flex gap-3 flex-wrap">
                  <div>
                    <span className="text-muted d-block">Meta total</span>
                    <strong className="fs-5">{formatInteger(summary?.target_total ?? totals.target)}</strong>
                  </div>
                  <div>
                    <span className="text-muted d-block">Real total</span>
                    <strong className="fs-5">{formatInteger(totals.actual)}</strong>
                  </div>
                  <div>
                    <span className="text-muted d-block">Brecha</span>
                    <strong
                      className={`fs-5 ${totals.actual >= (summary?.target_total ?? totals.target) ? 'text-success' : 'text-danger'}`}
                    >
                      {summarizeDifferenceLabel(totals.actual - (summary?.target_total ?? totals.target))}
                    </strong>
                  </div>
                </div>
                <div className="border-top pt-3">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr className="text-muted">
                        <th>Etapa</th>
                        <th className="text-end">Meta</th>
                        <th className="text-end">Real</th>
                        <th className="text-end">Variación</th>
                        <th className="text-end">Cumpl.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insights.map((item) => (
                        <tr key={item.key}>
                          <td>
                            <span className="fw-semibold d-block">{item.label}</span>
                            {item.count > 1 && (
                              <small className="text-muted">{item.count} metas activas</small>
                            )}
                          </td>
                          <td className="text-end">{formatInteger(item.target)}</td>
                          <td className="text-end">{formatInteger(item.actual)}</td>
                          <td className={`text-end ${item.difference >= 0 ? 'text-success' : 'text-danger'}`}>
                            {summarizeDifferenceLabel(item.difference)}
                          </td>
                          <td className="text-end">{formatFulfillment(item.fulfillment)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info border-0 shadow-sm">
          <strong>Registra metas por etapa para comenzar.</strong>{' '}
          Las metas declaradas se mostrarán aquí junto con el avance real del embudo.
        </div>
      )}
    </section>
  );
};

export default ReportStageTargetsOverview;
