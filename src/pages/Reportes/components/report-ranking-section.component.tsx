import React, { useCallback, useMemo, useRef, useState } from 'react';
import ReportChart from '../../../components/ReportChart';
import {
  ReportsAdvisorRankingItem,
  ReportsAdvisorRankingStateItem,
  ReportsAdvisorRankingLeadStateItem,
} from '../../../models';
import {
  computeNiceTickStep,
  formatInteger,
  formatPercentOneDecimal,
  getRankingStateColor,
} from '../utils/formatters';
import { Download } from 'lucide-react';
import { exportElementAsImage } from '../../../utilities/exportAsImage';

interface RankingOption {
  value: string;
  label: string;
}

interface ReportRankingSectionProps {
  data: ReportsAdvisorRankingItem[];
  states: ReportsAdvisorRankingStateItem[];
  metricLabel?: string;
  leadState: string;
  onLeadStateChange: (value: string) => void;
  leadStateOptions: RankingOption[];
  advisor: string;
  onAdvisorChange: (value: string) => void;
  advisorOptions: RankingOption[];
  stackedHeight?: number;
  baseFiltersTitle?: string;
  baseFiltersLines?: string[];
  showFiltersInline?: boolean;
}

const getLeadStateId = (state?: ReportsAdvisorRankingLeadStateItem) => String(state?.state_id ?? state?.id ?? '');

const getLeadStateTotal = (state?: ReportsAdvisorRankingLeadStateItem) => state?.total ?? 0;

const hasLeadStateBreakdown = (data: ReportsAdvisorRankingItem[]) =>
  data.some((advisor) => advisor.lead_states && advisor.lead_states.some((state) => getLeadStateTotal(state) > 0));

const normalizeAdvisorId = (id?: string | number) => String(id ?? '');

export default function ReportRankingSection({
  data,
  states,
  metricLabel,
  leadState,
  onLeadStateChange,
  leadStateOptions,
  advisor,
  onAdvisorChange,
  advisorOptions,
  stackedHeight = 320,
  baseFiltersTitle,
  baseFiltersLines,
  showFiltersInline,
}: ReportRankingSectionProps) {
  const breakdownEnabled = hasLeadStateBreakdown(data) && states.length > 0;
  const metricSlug = useMemo(() => {
    if (!metricLabel) {
      return 'principal';
    }
    const normalized = metricLabel.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '');
    return normalized || 'principal';
  }, [metricLabel]);

  const exportContainerRef = useRef<HTMLDivElement | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportRanking = useCallback(async () => {
    if (!exportContainerRef.current || exporting) {
      return;
    }

    setExporting(true);
    try {
      await exportElementAsImage(exportContainerRef.current, {
        filename: `ranking-asesores-${metricSlug}.png`,
        padding: 24,
      });
    } finally {
      setExporting(false);
    }
  }, [exporting, metricSlug]);

  const chartConfig = useMemo(() => {
    if (!breakdownEnabled) {
      return null;
    }

    const labels = data.map((advisorItem) => advisorItem.advisor_name);
    const datasets = states.map((state, stateIndex) => ({
      label: state.name,
      data: data.map((advisorItem) => {
        const match = advisorItem.lead_states?.find(
          (leadState) => getLeadStateId(leadState) === String(state.id ?? '')
        );
        return getLeadStateTotal(match);
      }),
      backgroundColor: getRankingStateColor(stateIndex, state.color),
      stack: 'ranking',
      borderWidth: 1,
    }));

    return { labels, datasets };
  }, [breakdownEnabled, data, states]);

  const rankingMaxValue = useMemo(() => {
    if (!breakdownEnabled) {
      return Math.max(...data.map((advisorItem) => advisorItem.total ?? 0), 0);
    }

    return data.reduce((max, advisorItem) => {
      const advisorMax = advisorItem.lead_states?.reduce(
        (acc, state) => Math.max(acc, getLeadStateTotal(state)),
        0
      ) ?? 0;
      return Math.max(max, advisorMax, advisorItem.total ?? 0);
    }, 0);
  }, [breakdownEnabled, data]);

  const rankingTickStep = useMemo(() => computeNiceTickStep(rankingMaxValue), [rankingMaxValue]);

  const chartOptions = useMemo(
    () => ({
      indexAxis: 'x',
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          ticks: {
            autoSkip: false,
            maxRotation: 90,
            minRotation: 90,
            align: 'start',
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          suggestedMax: rankingTickStep > 0 ? rankingTickStep * 6 : undefined,
          ticks: {
            precision: 0,
            stepSize: rankingTickStep,
            callback: (value: number | string) => {
              const numeric = typeof value === 'number' ? value : Number(value);
              if (!Number.isFinite(numeric)) return '';
              return numeric % rankingTickStep === 0 ? formatInteger(numeric) : '';
            },
          },
        },
      },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const datasetLabel = context?.dataset?.label ?? '';
              const value = context?.parsed?.y ?? 0;
              return `${datasetLabel}: ${formatInteger(value)}`;
            },
          },
        },
      },
    }),
    [rankingTickStep]
  );

  const totals = useMemo(
    () => ({
      advisors: data.length,
      leads: data.reduce((acc, advisorItem) => acc + (advisorItem.total ?? 0), 0),
    }),
    [data]
  );

  const rankingFilterLines = useMemo(() => {
    const lines = Array.isArray(baseFiltersLines) ? [...baseFiltersLines] : [];
    const leadStateLabel = leadStateOptions.find(option => option.value === leadState)?.label ?? 'Todos';
    const advisorLabel = advisorOptions.find(option => option.value === advisor)?.label ?? 'Todos';
    lines.push(`• Estado del lead: ${leadStateLabel}`);
    lines.push(`• Filtro de asesor: ${advisorLabel}`);
    return Array.from(new Set(lines));
  }, [advisor, advisorOptions, baseFiltersLines, leadState, leadStateOptions]);

  const stateColorMap = useMemo(() => {
    const map = new Map<string, string>();
    states.forEach((state, index) => {
      map.set(String(state.id), getRankingStateColor(index, state.color));
    });
    return map;
  }, [states]);

  const statesLegend = useMemo(
    () =>
      states.map((state, index) => ({
        id: state.id,
        name: state.name,
        color: getRankingStateColor(index, state.color),
        total: state.total,
      })),
    [states]
  );

  const selectedAdvisorHistory = useMemo(() => {
    if (!data.length) {
      return null;
    }

    if (advisor !== 'all') {
      return data.find(item => normalizeAdvisorId(item.advisor_id) === advisor) ?? null;
    }

    if (data.length === 1) {
      return data[0];
    }

    return null;
  }, [advisor, data]);

  const advisorHistoryChart = useMemo(() => {
    if (!selectedAdvisorHistory?.history?.length) {
      return null;
    }
    return {
      labels: selectedAdvisorHistory.history.map(point => point.period),
      datasets: [
        {
          label: 'Leads',
          data: selectedAdvisorHistory.history.map(point => point.total ?? 0),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.15)',
          tension: 0.35,
          fill: false,
        },
      ],
    };
  }, [selectedAdvisorHistory]);

  const advisorHistoryFilterLines = useMemo(() => {
    const lines = [...rankingFilterLines];
    if (selectedAdvisorHistory) {
      lines.push(`• Historial del asesor: ${selectedAdvisorHistory.advisor_name}`);
    }
    return Array.from(new Set(lines));
  }, [rankingFilterLines, selectedAdvisorHistory]);

  return (
    <section className="card shadow-sm reportes-ranking border-0">
      <div className="card-body" ref={exportContainerRef}>
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
          <div>
            <h5 className="card-title mb-0">Ranking de asesores</h5>
            <small className="text-muted">
              Top {data.length}
              {metricLabel ? ` · ${metricLabel}` : null}
            </small>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
              onClick={handleExportRanking}
              disabled={exporting || data.length === 0}
              data-export-ignore
            >
              {!exporting && <Download size={16} />}
              {exporting ? 'Generando…' : 'Exportar ranking'}
            </button>
            <div className="d-flex flex-column">
              <label className="form-label text-muted mb-1">Estado del lead</label>
              <select value={leadState} onChange={(event) => onLeadStateChange(event.target.value)} className="form-select form-select-sm">
                {leadStateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="d-flex flex-column">
              <label className="form-label text-muted mb-1">Asesor</label>
              <select value={advisor} onChange={(event) => onAdvisorChange(event.target.value)} className="form-select form-select-sm">
                {advisorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="alert alert-warning mb-0">
            No se encontraron datos para el ranking con los filtros actuales. Ajusta la métrica, estado del lead o asesor, o verifica la respuesta del endpoint correspondiente.
          </div>
        ) : (
          <>
            {breakdownEnabled && chartConfig && (
              <div className="mb-4">
                <ReportChart
                  fullWidth
                  type="bar"
                  title="Distribución por estado del lead"
                  data={{ labels: chartConfig.labels, datasets: chartConfig.datasets }}
                  options={chartOptions}
                  height={stackedHeight}
                  showDataLabels
                  dataLabelFormatter={(value: number) => formatInteger(value)}
                  enableDownload
                  downloadFilename={`ranking-breakdown-${metricSlug}.png`}
                  downloadLabel="Descargar PNG"
                  footerTitle={baseFiltersTitle}
                  footerLines={rankingFilterLines}
                  showFooterInline={showFiltersInline}
                />
              </div>
            )}

            {breakdownEnabled && statesLegend.length > 0 && (
              <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
                {statesLegend.map((state) => (
                  <span
                    key={`legend-${state.id}`}
                    className="badge rounded-pill px-3 py-2 d-flex align-items-center gap-2"
                    style={{ backgroundColor: `${state.color}15`, color: state.color }}
                  >
                    <span
                      className="rounded-circle"
                      style={{ display: 'inline-block', width: 10, height: 10, backgroundColor: state.color }}
                    />
                    <span className="fw-semibold">{state.name}</span>
                    {typeof state.total === 'number' && state.total > 0 && (
                      <span className="text-muted">{formatInteger(state.total)}</span>
                    )}
                  </span>
                ))}
              </div>
            )}

            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <span className="text-muted small">
                Asesores: <strong>{totals.advisors}</strong> · Leads: <strong>{formatInteger(totals.leads)}</strong>
              </span>
              {breakdownEnabled && <span className="text-muted small">La barra apilada refleja la proporción por estado del lead.</span>}
            </div>

            <div className="d-flex flex-column gap-3" style={{ maxHeight: 360, overflowY: 'auto', paddingRight: '0.5rem' }}>
              {data.map((advisorItem, index) => {
                const totalLeads = advisorItem.total ?? 0;
                return (
                  <div key={`${advisorItem.advisor_id}-${index}`} className="border rounded-3 p-3 shadow-sm">
                    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary text-white fs-6">{index + 1}</span>
                        <div>
                          <h6 className="mb-0">{advisorItem.advisor_name}</h6>
                          {typeof advisorItem.fulfillment_percent === 'number' && (
                            <small className={advisorItem.fulfillment_percent >= 100 ? 'text-success' : 'text-muted'}>
                              Cumplimiento: {formatPercentOneDecimal(advisorItem.fulfillment_percent)}%
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-semibold fs-5">{formatInteger(totalLeads)}</div>
                        <small className="text-muted">Leads totales</small>
                      </div>
                    </div>

                    {breakdownEnabled && totalLeads > 0 && (
                      <>
                        <div className="progress" style={{ height: 12 }}>
                          {states.map((state, stateIndex) => {
                            const match = advisorItem.lead_states?.find(
                              (leadState) => getLeadStateId(leadState) === String(state.id ?? '')
                            );
                            const stateTotal = getLeadStateTotal(match);
                            if (stateTotal <= 0) return null;
                            const percent = (stateTotal / totalLeads) * 100;
                            return (
                              <div
                                key={`${advisorItem.advisor_id}-${state.id}`}
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                  width: `${percent}%`,
                                  backgroundColor: getRankingStateColor(stateIndex, state.color),
                                }}
                                aria-valuenow={percent}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                title={`${state.name}: ${formatInteger(stateTotal)} leads (${formatPercentOneDecimal(percent)}%)`}
                              />
                            );
                          })}
                        </div>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          {states.map((state, stateIndex) => {
                            const match = advisorItem.lead_states?.find(
                              (leadState) => getLeadStateId(leadState) === String(state.id ?? '')
                            );
                            const stateTotal = getLeadStateTotal(match);
                            if (stateTotal <= 0) return null;
                            const percent = totalLeads > 0 ? (stateTotal / totalLeads) * 100 : 0;
                            const color = getRankingStateColor(stateIndex, state.color);
                            return (
                              <span
                                key={`${advisorItem.advisor_id}-${state.id}-chip`}
                                className="badge rounded-pill"
                                style={{
                                  backgroundColor: `${color}18`,
                                  color,
                                }}
                              >
                                {state.name}: {formatInteger(stateTotal)} ({formatPercentOneDecimal(percent)}%)
                              </span>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {selectedAdvisorHistory?.history?.length ? (
        <div className="card shadow-sm border-0 mt-4">
          <div className="card-body d-flex flex-column gap-4">
            {advisorHistoryChart && (
              <div style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
                <ReportChart
                  fullWidth
                  type="line"
                  title="Histórico del asesor seleccionado"
                  height={240}
                  data={advisorHistoryChart}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                      },
                    },
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                  showDataLabels
                  dataLabelFormatter={(value: number) => formatInteger(value)}
                  enableDownload
                  downloadFilename={`ranking-history-${normalizeAdvisorId(selectedAdvisorHistory?.advisor_id) || 'advisor'}.png`}
                  downloadLabel="Descargar PNG"
                  footerTitle={baseFiltersTitle}
                  footerLines={advisorHistoryFilterLines}
                  showFooterInline={showFiltersInline}
                />
              </div>
            )}

            <div className="table-responsive">
              <table className='table text-nowrap table-bordered table-resource'>
                <thead className="table-primary">
                  <tr>
                    <th style={{ width: '20%' }}>Periodo</th>
                    <th className="text-end" style={{ width: '15%' }}>Total leads</th>
                    <th>Desglose por etapa</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAdvisorHistory.history.map(point => (
                    <tr key={point.period}>
                      <td className="fw-semibold text-muted">{point.period}</td>
                      <td className="text-end fw-semibold">{formatInteger(point.total ?? 0)}</td>
                      <td>
                        {point.lead_states?.length ? (
                          <div className="d-flex flex-wrap gap-2">
                            {point.lead_states.map((state, index) => {
                              const color = stateColorMap.get(getLeadStateId(state)) ?? getRankingStateColor(index);
                              return (
                                <span
                                  key={`${point.period}-${getLeadStateId(state)}-${index}`}
                                  className="badge rounded-pill px-3 py-2"
                                  style={{ backgroundColor: `${color}20`, color }}
                                >
                                  {state.name ?? state.state_name ?? 'Estado'}: {formatInteger(getLeadStateTotal(state))}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-muted">Sin desglose disponible</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
