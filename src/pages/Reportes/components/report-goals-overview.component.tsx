import React, { useCallback, useMemo, useRef, useState } from 'react';
import ReportChart from '../../../components/ReportChart';
import { ReportsGoalsListItem } from '../../../models';
import { formatPercentOneDecimal } from '../utils/formatters';
import { Download } from 'lucide-react';
import { exportElementAsImage } from '../../../utilities/exportAsImage';

export interface GoalStatusChip {
  id: string | number;
  label: string;
  status: string;
  color: string;
  fulfillment: number | null | undefined;
}

export interface GoalsChartDataset {
  labels: string[];
  target: number[];
  actual: number[];
}

interface ReportGoalsOverviewProps {
  chartDataset: GoalsChartDataset;
  statusChips: GoalStatusChip[];
  goalsList: ReportsGoalsListItem[];
  onManageGoals?: () => void;
  controlsSlot?: React.ReactNode;
  footerLines?: string[];
  footerTitle?: string;
  showFooterInline?: boolean;
}

const hasChartData = (dataset: GoalsChartDataset) =>
  dataset.labels?.length && (dataset.target?.some((value) => value > 0) || dataset.actual?.some((value) => value > 0));

const resolveGoalEntityLabel = (goal: ReportsGoalsListItem): string => {
  if (goal.name && goal.name.trim().length > 0) {
    return goal.name;
  }

  if (Array.isArray(goal.campaign_codigos) && goal.campaign_codigos.length > 1) {
    return goal.campaign_codigos.map((code) => String(code)).join(', ');
  }

  if (goal.campaign?.name) {
    return goal.campaign.name;
  }

  if (Array.isArray(goal.campaign_codigos) && goal.campaign_codigos.length === 1) {
    return String(goal.campaign_codigos[0]);
  }

  if (goal.advisor?.name) {
    return goal.advisor.name;
  }

  return goal.goal_scope ?? 'Meta';
};

export default function ReportGoalsOverview({
  chartDataset,
  statusChips,
  goalsList,
  onManageGoals,
  controlsSlot,
  footerLines,
  footerTitle,
  showFooterInline,
}: ReportGoalsOverviewProps) {
  const totalGoals = goalsList?.length ?? 0;
  const detailListRef = useRef<HTMLDivElement | null>(null);
  const [exportingDetail, setExportingDetail] = useState(false);

  const downloadFilename = useMemo(() => 'metas-detalle.png', []);

  const handleDownloadDetail = useCallback(async () => {
    if (!detailListRef.current || exportingDetail) {
      return;
    }

    setExportingDetail(true);
    try {
      await exportElementAsImage(detailListRef.current, {
        filename: downloadFilename,
        padding: 24,
      });
    } finally {
      setExportingDetail(false);
    }
  }, [downloadFilename, exportingDetail]);

  return (
    <section className="mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h5 className="mb-0">Metas registradas</h5>
          <small className="text-muted">{totalGoals} {totalGoals === 1 ? 'meta' : 'metas'}</small>
        </div>
        {(controlsSlot || onManageGoals || totalGoals > 0) && (
          <div className="d-flex align-items-center flex-wrap gap-2 justify-content-end">
            {controlsSlot}
            {totalGoals > 0 && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                onClick={handleDownloadDetail}
                disabled={exportingDetail}
                data-export-ignore
              >
                {!exportingDetail && <Download size={16} />}
                {exportingDetail ? 'Generando…' : 'Exportar detalle'}
              </button>
            )}
            {onManageGoals && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={onManageGoals}
              >
                Gestionar metas
              </button>
            )}
          </div>
        )}
      </div>

      {totalGoals === 0 && (
        <div className="alert alert-info border-0 shadow-sm">
          <strong>No hay metas registradas.</strong> Usa el botón "Gestionar metas" para crear la primera.
        </div>
      )}

      {hasChartData(chartDataset) && (
        <ReportChart
          fullWidth
          type="bar"
          title="Meta vs Real"
          data={{
            labels: chartDataset.labels,
            datasets: [
              { label: 'Meta', data: chartDataset.target },
              { label: 'Real', data: chartDataset.actual },
            ],
          }}
          options={{
            indexAxis: 'x',
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }}
          height={260}
          showDataLabels
          dataLabelFormatter={(value: number) => Number(value || 0).toLocaleString('es-PE')}
          enableDownload
          downloadFilename="goals-meta-vs-real.png"
          downloadLabel="Descargar PNG"
          footerLines={footerLines}
          footerTitle={footerTitle}
          showFooterInline={showFooterInline}
        />
      )}

      {statusChips.length > 0 && (
        <div className="mt-4">
          <h6 className="text-muted mb-2">Estado de metas</h6>
          <div className="d-flex flex-wrap gap-2">
            {statusChips.map((chip, index) => (
              <div
                key={chip.id ?? `${chip.label}-${index}`}
                className="px-3 py-2 rounded-pill d-flex align-items-center gap-2"
                style={{ backgroundColor: `${chip.color}20`, color: chip.color }}
              >
                <span className="fw-semibold">{chip.label}</span>
                <span>{chip.status}</span>
                <span className="badge bg-light text-dark">{formatPercentOneDecimal(chip.fulfillment)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalGoals > 0 && (
        <div className="mt-4" ref={detailListRef}>
          <h6 className="text-muted mb-2">Detalle rápido</h6>
          <div className="list-group shadow-sm">
            {goalsList.slice(0, 6).map((goal) => (
              <div key={goal.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-semibold d-block">{resolveGoalEntityLabel(goal)}</span>
                  <small className="text-muted">{goal.period_start} — {goal.period_end}</small>
                </div>
                <div className="text-end">
                  <span className="d-block fw-semibold">{goal.actual_value}/{goal.target_value}</span>
                  <small className="text-muted">{formatPercentOneDecimal(goal.fulfillment_percent)}%</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
