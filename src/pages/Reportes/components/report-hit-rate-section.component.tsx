import React, { useEffect, useMemo, useState } from 'react';
import ReportChart from '../../../components/ReportChart';
import ReportNoData from './report-no-data.component';
import { ReportsHitRateAdvisorItem, ReportsHitRateResponse, ReportsHitRateStageItem } from '../../../models';
import { formatCurrency, formatInteger, formatPercentOneDecimal } from '../utils/formatters';

interface ReportHitRateSectionProps {
  data: ReportsHitRateResponse | null;
  filtersTitle: string;
  filtersLines: string[];
  currencyFallback?: string;
  closingStageLabels?: string[];
}

const percentageFromRate = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }
  return value * 100;
};

const resolveClosingStageLabel = (stages: ReportsHitRateStageItem[], codes?: string[]) => {
  const closingNames = stages
    .filter(stage => stage.is_closing || (codes && codes.includes(String(stage.stage_id ?? stage.stage_name))))
    .map(stage => stage.stage_name);
  return closingNames.length ? closingNames.join(', ') : 'Estados de cierre';
};

const ReportHitRateSection: React.FC<ReportHitRateSectionProps> = ({
  data,
  filtersTitle,
  filtersLines,
  currencyFallback = 'S/',
  closingStageLabels,
}) => {
  const [dealValue, setDealValue] = useState<string>('');
  const [stageInputs, setStageInputs] = useState<Record<string, { target: number; price?: number }>>({});

  const summary = data?.summary ?? null;
  const stageTotals = summary?.stage_totals ?? [];
  const currencySymbol = data?.currency ?? summary?.currency ?? currencyFallback;

  const getStageKey = (stage: ReportsHitRateStageItem, index: number) => {
    if (stage.stage_id !== null && stage.stage_id !== undefined && stage.stage_id !== '') {
      return `id:${stage.stage_id}`;
    }
    if (stage.stage_name) {
      return `name:${stage.stage_name}`;
    }
    return `index:${index}`;
  };

  const formatLeadsDelta = (value: number) => {
    if (!Number.isFinite(value) || value === 0) {
      return '0 leads';
    }
    const abs = formatInteger(Math.abs(value));
    return `${value > 0 ? '+' : '-'}${abs} leads`;
  };

  const formatCurrencyValue = (value: number | null | undefined) => {
    if (value == null || !Number.isFinite(value)) {
      return '—';
    }
    return `${currencySymbol} ${formatCurrency(value)}`;
  };

  const formatCurrencyDelta = (value: number | null | undefined) => {
    if (value == null || !Number.isFinite(value)) {
      return '—';
    }
    const abs = Math.abs(value);
    const prefix = value > 0 ? '+' : value < 0 ? '-' : '';
    return `${prefix}${currencySymbol} ${formatCurrency(abs)}`;
  };

  useEffect(() => {
    if (!stageTotals.length) {
      setStageInputs({});
      return;
    }

    setStageInputs(prev => {
      const next = { ...prev } as Record<string, { target: number; price?: number }>;
      let mutated = false;
      const validKeys = new Set<string>();

      stageTotals.forEach((stage, index) => {
        const key = getStageKey(stage, index);
        validKeys.add(key);
        const current = next[key];
        if (!current) {
          next[key] = { target: 0 };
          mutated = true;
          return;
        }
        if (current.target === undefined || current.target === null) {
          next[key] = { ...current, target: 0 };
          mutated = true;
        }
      });

      Object.keys(next).forEach(key => {
        if (!validKeys.has(key)) {
          delete next[key];
          mutated = true;
        }
      });

      return mutated ? next : prev;
    });
  }, [stageTotals]);

  const summaryBenchmarks = useMemo<NonNullable<ReportsHitRateResponse['benchmarks']>>(() => {
    if (Array.isArray(summary?.benchmarks) && summary.benchmarks.length) {
      return summary.benchmarks;
    }
    if (Array.isArray(data?.benchmarks) && data.benchmarks.length) {
      return data.benchmarks;
    }
    return [];
  }, [data, summary]);

  const parsedDealValue = useMemo(() => {
    if (!dealValue.trim()) {
      return null;
    }
    const numeric = Number(dealValue);
    return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
  }, [dealValue]);

  const expectedMonetaryImpact = useMemo(() => {
    if (!summary || parsedDealValue == null) {
      return null;
    }
    return parsedDealValue * (summary.hit_rate ?? 0);
  }, [parsedDealValue, summary]);

  const stageDataset = useMemo(() => {
    if (!summary?.stage_totals?.length) {
      return null;
    }
    return {
      labels: summary.stage_totals.map(stage => stage.stage_name),
      datasets: [
        {
          label: 'Leads',
          data: summary.stage_totals.map(stage => stage.total ?? 0),
        },
      ],
    };
  }, [summary]);

  const stageRows = useMemo(() => {
    if (!stageTotals.length) {
      return [] as Array<{
        key: string;
        stage: ReportsHitRateStageItem;
        stageName: string;
        target: number;
        actual: number;
        variation: number;
        variationLabel: string;
        variationClass: string;
        completionPercent: number | null;
        price?: number;
        metaValue: number | null;
        realValue: number | null;
      }>;
    }

    return stageTotals.map((stage, index) => {
      const key = getStageKey(stage, index);
      const manual = stageInputs[key] ?? { target: 0 };
      const target = Number.isFinite(manual.target) ? manual.target : 0;
      const actual = Number(stage.total ?? 0) || 0;
      const price = manual.price;
      const variation = actual - target;
      const completionPercent = target > 0 ? (actual / target) * 100 : null;
      const metaValue = price != null ? price * target : null;
      const realValue = price != null ? price * actual : null;
      const variationClass = variation > 0 ? 'text-success' : variation < 0 ? 'text-danger' : 'text-muted';
      return {
        key,
        stage,
        stageName: stage.stage_name ?? `Etapa ${index + 1}`,
        target,
        actual,
        variation,
        variationLabel: formatLeadsDelta(variation),
        variationClass,
        completionPercent,
        price,
        metaValue,
        realValue,
      };
    });
  }, [stageInputs, stageTotals]);

  const stageSummary = useMemo(() => {
    if (!stageRows.length) {
      return {
        metaTotal: 0,
        actualTotal: 0,
        diffTotal: 0,
        completionPercent: null as number | null,
        metaValueTotal: null as number | null,
        actualValueTotal: null as number | null,
        diffValueTotal: null as number | null,
        hasPrice: false,
      };
    }

    let metaTotal = 0;
    let actualTotal = 0;
    let metaValueTotal = 0;
    let actualValueTotal = 0;
    let hasPrice = false;

    stageRows.forEach(row => {
      metaTotal += row.target;
      actualTotal += row.actual;
      if (row.price !== undefined && row.price !== null) {
        hasPrice = true;
        if (row.metaValue != null) {
          metaValueTotal += row.metaValue;
        }
        if (row.realValue != null) {
          actualValueTotal += row.realValue;
        }
      }
    });

  const diffTotal = actualTotal - metaTotal;
  const completionPercent = metaTotal > 0 ? (actualTotal / metaTotal) * 100 : null;
    const diffValueTotal = hasPrice ? actualValueTotal - metaValueTotal : null;

    return {
      metaTotal,
      actualTotal,
      diffTotal,
      completionPercent,
      metaValueTotal: hasPrice ? metaValueTotal : null,
      actualValueTotal: hasPrice ? actualValueTotal : null,
      diffValueTotal,
      hasPrice,
    };
  }, [stageRows]);

  const advisors: ReportsHitRateAdvisorItem[] = useMemo(() => {
    if (!Array.isArray(data?.advisors)) {
      return [];
    }
    return [...data.advisors].sort((a, b) => percentageFromRate(b.hit_rate) - percentageFromRate(a.hit_rate));
  }, [data?.advisors]);

  const handleStageTargetChange = (stageKey: string, rawValue: string) => {
    const numeric = rawValue === '' ? 0 : Number(rawValue);
    if (!Number.isFinite(numeric) || numeric < 0) {
      return;
    }

    setStageInputs(prev => {
      const current = prev[stageKey] ?? { target: 0 };
      if (current.target === numeric) {
        return prev;
      }
      return {
        ...prev,
        [stageKey]: {
          ...current,
          target: numeric,
        },
      };
    });
  };

  const handleStagePriceChange = (stageKey: string, rawValue: string) => {
    const trimmed = rawValue.trim();
    if (trimmed === '') {
      setStageInputs(prev => {
        const current = prev[stageKey] ?? { target: 0 };
        if (current.price === undefined) {
          return prev;
        }
        const { price: _removed, ...rest } = current;
        return {
          ...prev,
          [stageKey]: rest,
        };
      });
      return;
    }

    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric) || numeric < 0) {
      return;
    }

    setStageInputs(prev => {
      const current = prev[stageKey] ?? { target: 0 };
      if (current.price === numeric) {
        return prev;
      }
      return {
        ...prev,
        [stageKey]: {
          ...current,
          price: numeric,
        },
      };
    });
  };

  const handleResetStageTargets = () => {
    if (!stageTotals.length) {
      setStageInputs({});
      return;
    }

    setStageInputs(() => {
      const next: Record<string, { target: number; price?: number }> = {};
      stageTotals.forEach((stage, index) => {
        const key = getStageKey(stage, index);
        next[key] = { target: 0 };
      });
      return next;
    });
  };

  if (!summary) {
    return <ReportNoData message="Aún no hay datos suficientes para calcular el Hit Rate." />;
  }

  const closingLabel = closingStageLabels?.length
    ? closingStageLabels.join(', ')
    : resolveClosingStageLabel(summary.stage_totals, summary.closing_stage_codes);
  const closingHelperText = closingStageLabels?.length
    ? 'Estados seleccionados desde el filtro.'
    : 'Estados de cierre detectados por el backend.';
  const closingPercent = percentageFromRate(summary.hit_rate);
  const totalLeads = summary.total_leads ?? 0;
  const closingLeads = summary.closing_leads ?? 0;
  const summaryVariationClass = stageSummary.diffTotal > 0
    ? 'text-success'
    : stageSummary.diffTotal < 0
      ? 'text-danger'
      : 'text-muted';

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body d-flex flex-column gap-4">
        <div className="row g-3">
          <div className="col-sm-6 col-xl-3">
            <div className="card bg-primary-subtle border-0 h-100">
              <div className="card-body">
                <p className="text-muted text-uppercase fw-semibold mb-1">Leads totales</p>
                <h4 className="mb-0">{formatInteger(totalLeads)}</h4>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="card bg-success-subtle border-0 h-100">
              <div className="card-body">
                <p className="text-muted text-uppercase fw-semibold mb-1">{closingLabel}</p>
                <h4 className="mb-0">{formatInteger(closingLeads)}</h4>
                <small className="text-muted">
                  {formatPercentOneDecimal(closingPercent)}% del total · {closingHelperText}
                </small>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="card bg-light border-0 h-100">
              <div className="card-body">
                <p className="text-muted text-uppercase fw-semibold mb-1">Hit Rate</p>
                <h4 className="mb-0">{formatPercentOneDecimal(closingPercent)}%</h4>
                <small className="text-muted">Referencia objetivo: 20%</small>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="card bg-light border-0 h-100">
              <div className="card-body">
                <p className="text-muted text-uppercase fw-semibold mb-1">Valor estimado</p>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Ingresa monto"
                    min={0}
                    value={dealValue}
                    onChange={event => setDealValue(event.target.value)}
                  />
                </div>
                <small className="text-muted">No se guarda; úsalo para estimaciones rápidas.</small>
                {expectedMonetaryImpact != null && (
                  <p className="mb-0 mt-2 fw-semibold">
                    {currencySymbol} {formatCurrency(expectedMonetaryImpact)} posibles con el Hit Rate actual
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 align-items-stretch">
          <div className="col-12 col-lg-6">
            <div className="card h-100 border-0 bg-light">
              <div className="card-body">
                <h6 className="mb-1">Distribución de leads por etapa</h6>
                <small className="text-muted">Valores absolutos para el periodo seleccionado.</small>
                {stageDataset ? (
                  <ReportChart
                    type="bar"
                    fullWidth
                    height={300}
                    title="Leads por etapa"
                    data={stageDataset}
                    enableDownload
                    downloadFilename="hit-rate-stages.png"
                    footerTitle={filtersTitle}
                    footerLines={filtersLines}
                    showDataLabels
                    dataLabelFormatter={(value: number) => formatInteger(value)}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value: number | string) =>
                              formatInteger(typeof value === 'number' ? value : Number(value)),
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="text-muted">Sin etapas reportadas para el periodo.</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card h-100 border-0">
              <div className="card-body d-flex flex-column">
                <h6 className="mb-1">Hit Rate por asesor</h6>
                <small className="text-muted">Ordenado de mayor a menor conversión.</small>
                {advisors.length ? (
                  <div className="table-responsive mt-3">
                    <table className="table table-sm align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Asesor</th>
                          <th className="text-end">Leads</th>
                          <th className="text-end">Cierres</th>
                          <th className="text-end">Hit Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {advisors.map(advisor => (
                          <tr key={advisor.advisor_id ?? 'unassigned'}>
                            <td>{advisor.advisor_name}</td>
                            <td className="text-end">{formatInteger(advisor.total_leads)}</td>
                            <td className="text-end">{formatInteger(advisor.closing_leads)}</td>
                            <td className="text-end fw-semibold">
                              {formatPercentOneDecimal(percentageFromRate(advisor.hit_rate))}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-muted mt-3">No hay desglose por asesor para el periodo.</div>
                )}
                {summaryBenchmarks.length ? (
                  <div className="mt-3">
                    <h6 className="mb-2">Benchmarks</h6>
                    <ul className="list-group list-group-flush">
                      {summaryBenchmarks.map((item, index) => (
                        <li key={`${item.label}-${index}`} className="list-group-item px-0">
                          <div className="d-flex justify-content-between align-items-center">
                            <span>{item.label}</span>
                            <span className="fw-semibold">{formatPercentOneDecimal(percentageFromRate(item.hit_rate))}%</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body d-flex flex-column gap-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h6 className="mb-1">Metas y valorización por etapa</h6>
                <small className="text-muted">
                  Ajusta metas y precios referenciales para estimar la brecha y el impacto monetario. Todos los cambios son locales.
                </small>
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleResetStageTargets}
                disabled={!stageRows.length}
              >
                Restablecer
              </button>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-3">
                <div className="bg-primary-subtle rounded-3 p-3 h-100">
                  <p className="text-muted text-uppercase fw-semibold mb-1">Meta total</p>
                  <h5 className="mb-0">{formatInteger(stageSummary.metaTotal)}</h5>
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="bg-light rounded-3 p-3 h-100">
                  <p className="text-muted text-uppercase fw-semibold mb-1">Real total</p>
                  <h5 className="mb-0">{formatInteger(stageSummary.actualTotal)}</h5>
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="bg-light rounded-3 p-3 h-100">
                  <p className="text-muted text-uppercase fw-semibold mb-1">Brecha</p>
                  <h5 className={`mb-0 ${summaryVariationClass}`}>{formatLeadsDelta(stageSummary.diffTotal)}</h5>
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="bg-light rounded-3 p-3 h-100">
                  <p className="text-muted text-uppercase fw-semibold mb-1">Cumplimiento</p>
                  <h5 className="mb-0">
                    {stageSummary.completionPercent != null
                      ? `${formatPercentOneDecimal(stageSummary.completionPercent)}%`
                      : '—'}
                  </h5>
                </div>
              </div>
            </div>

            {stageSummary.hasPrice ? (
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <div className="bg-light rounded-3 p-3 h-100">
                    <p className="text-muted text-uppercase fw-semibold mb-1">Valor meta</p>
                    <h6 className="mb-0">{formatCurrencyValue(stageSummary.metaValueTotal)}</h6>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="bg-light rounded-3 p-3 h-100">
                    <p className="text-muted text-uppercase fw-semibold mb-1">Valor real estimado</p>
                    <h6 className="mb-0">{formatCurrencyValue(stageSummary.actualValueTotal)}</h6>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="bg-light rounded-3 p-3 h-100">
                    <p className="text-muted text-uppercase fw-semibold mb-1">Brecha monetaria</p>
                    <h6 className={`mb-0 ${summaryVariationClass}`}>
                      {formatCurrencyDelta(stageSummary.diffValueTotal)}
                    </h6>
                  </div>
                </div>
              </div>
            ) : null}

            {stageRows.length ? (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Etapa</th>
                      <th className="text-end">Meta (leads)</th>
                      <th className="text-end">Real (leads)</th>
                      <th className="text-end">Variación</th>
                      <th className="text-end">Cumpl.</th>
                      <th className="text-end">Precio por lead</th>
                      <th className="text-end">Valor meta</th>
                      <th className="text-end">Valor real</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stageRows.map(row => (
                      <tr key={row.key}>
                        <td>{row.stageName}</td>
                        <td className="text-end" style={{ width: '130px' }}>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            className="form-control form-control-sm text-end"
                            value={row.target}
                            onChange={event => handleStageTargetChange(row.key, event.target.value)}
                          />
                        </td>
                        <td className="text-end fw-semibold">{formatInteger(row.actual)}</td>
                        <td className={`text-end ${row.variationClass}`}>{row.variationLabel}</td>
                        <td className="text-end">
                          {row.completionPercent != null
                            ? `${formatPercentOneDecimal(row.completionPercent)}%`
                            : '—'}
                        </td>
                        <td className="text-end" style={{ width: '190px' }}>
                          <div className="input-group input-group-sm">
                            <span className="input-group-text">{currencySymbol}</span>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              className="form-control text-end"
                              value={row.price ?? ''}
                              onChange={event => handleStagePriceChange(row.key, event.target.value)}
                            />
                          </div>
                        </td>
                        <td className="text-end">{formatCurrencyValue(row.metaValue)}</td>
                        <td className="text-end">{formatCurrencyValue(row.realValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th>Total</th>
                      <th className="text-end">{formatInteger(stageSummary.metaTotal)}</th>
                      <th className="text-end">{formatInteger(stageSummary.actualTotal)}</th>
                      <th className={`text-end ${summaryVariationClass}`}>{formatLeadsDelta(stageSummary.diffTotal)}</th>
                      <th className="text-end">
                        {stageSummary.completionPercent != null
                          ? `${formatPercentOneDecimal(stageSummary.completionPercent)}%`
                          : '—'}
                      </th>
                      <th></th>
                      <th className="text-end">{formatCurrencyValue(stageSummary.metaValueTotal)}</th>
                      <th className="text-end">{formatCurrencyValue(stageSummary.actualValueTotal)}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-muted">No hay etapas para estimar metas en este periodo.</div>
            )}

            <small className="text-muted">
              Los montos estimados utilizan únicamente las etapas con precio ingresado. Ajusta los valores según cada etapa del proceso comercial.
            </small>
          </div>
        </div>

        <div className="border-top pt-3">
          <h6 className="text-uppercase text-muted small mb-1">Contexto del filtro</h6>
          <ul className="list-unstyled mb-0 small text-muted">
            {filtersLines.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportHitRateSection;
