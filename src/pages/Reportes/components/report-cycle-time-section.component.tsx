import React, { useMemo, useState } from 'react';
import ReportChart from '../../../components/ReportChart';
import ModalComponent from '../../../components/shared/modal.component';
import ReportNoData from './report-no-data.component';
import {
  ReportsCycleTimeAdvisorItem,
  ReportsCycleTimeLeadItem,
  ReportsCycleTimeResponse,
  ReportsCycleTimeStageItem,
} from '../../../models';
import { formatInteger } from '../utils/formatters';

interface ReportCycleTimeSectionProps {
  data: ReportsCycleTimeResponse | null;
  filtersTitle: string;
  filtersLines: string[];
  closingStageLabels?: string[];
}

const formatDuration = (hours?: number | null) => {
  if (!Number.isFinite(hours ?? null) || !hours) {
    return '0 h';
  }
  const totalHours = Number(hours);
  const days = Math.floor(totalHours / 24);
  const remainingHours = Math.round(totalHours % 24);
  if (days <= 0) {
    return `${remainingHours} h`;
  }
  return `${days} d ${remainingHours} h`;
};

const formatStageDuration = (stage: ReportsCycleTimeStageItem) => {
  const entered = new Date(stage.entered_at);
  const exited = stage.exited_at ? new Date(stage.exited_at) : null;
  const formatter = new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const enteredLabel = formatter.format(entered);
  const exitedLabel = exited ? formatter.format(exited) : 'En proceso';

  return `${enteredLabel} → ${exitedLabel}`;
};

const ReportCycleTimeSection: React.FC<ReportCycleTimeSectionProps> = ({
  data,
  filtersTitle,
  filtersLines,
  closingStageLabels,
}) => {
  const [selectedLead, setSelectedLead] = useState<ReportsCycleTimeLeadItem | null>(null);
  const [isTimelineMounted, setIsTimelineMounted] = useState(false);
  const [isTimelineVisible, setIsTimelineVisible] = useState(false);

  const summary = data?.summary ?? null;

  const advisorDataset = useMemo(() => {
    if (!data?.advisors?.length) {
      return null;
    }
    const sorted = [...data.advisors].sort((a, b) => (b.average_hours ?? 0) - (a.average_hours ?? 0));
    return {
      labels: sorted.map(item => item.advisor_name ?? 'Sin asesor'),
      datasets: [
        {
          label: 'Horas promedio',
          data: sorted.map(item => item.average_hours ?? 0),
        },
      ],
    };
  }, [data?.advisors]);

  const openTimeline = (lead: ReportsCycleTimeLeadItem) => {
    setSelectedLead(lead);
    setIsTimelineMounted(true);
    setIsTimelineVisible(true);
  };

  const handleTimelineClose = () => {
    setIsTimelineVisible(false);
  };

  const handleTimelineUnmount = () => {
    setIsTimelineMounted(false);
    setSelectedLead(null);
  };

  if (!summary) {
    return <ReportNoData message="Aún no hay leads con tiempo de ciclo calculado." />;
  }

  const fallbackClosings = summary.closing_estado_finales
    ?? summary.closing_stage_ids?.map(item => String(item))
    ?? [];
  const closingStageDescription = closingStageLabels?.length
    ? `Cierres: ${closingStageLabels.join(', ')}`
    : fallbackClosings.length
      ? `Cierres detectados: ${fallbackClosings.join(', ')}`
      : 'Estados finales inferidos por el backend.';

  const totalLeads = summary.total_leads ?? 0;
  const averageLabel = formatDuration(summary.average_hours);
  const medianLabel = formatDuration(summary.median_hours);
  const percentile90Label = formatDuration(summary.percentile_90_hours);

  return (
    <>
      <div className="card shadow-sm border-0">
        <div className="card-body d-flex flex-column gap-4">
          <div className="row g-3">
            <div className="col-sm-6 col-xl-4">
              <div className="card bg-primary-subtle border-0 h-100">
                <div className="card-body">
                  <p className="text-muted text-uppercase fw-semibold mb-1">Leads cerrados</p>
                  <h4 className="mb-0">{formatInteger(totalLeads)}</h4>
                  <small className="text-muted">{closingStageDescription}</small>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-4">
              <div className="card bg-light border-0 h-100">
                <div className="card-body">
                  <p className="text-muted text-uppercase fw-semibold mb-1">Tiempo promedio</p>
                  <h4 className="mb-0">{averageLabel}</h4>
                  <small className="text-muted">Desde creación hasta cierre · Mediana: {medianLabel}</small>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-4">
              <div className="card bg-light border-0 h-100">
                <div className="card-body">
                  <p className="text-muted text-uppercase fw-semibold mb-1">Percentil 90</p>
                  <h4 className="mb-0">{percentile90Label}</h4>
                  <small className="text-muted">SLA estimado con los cierres seleccionados.</small>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 align-items-stretch">
            <div className="col-12 col-lg-6">
              <div className="card h-100 border-0 bg-light">
                <div className="card-body">
                  <h6 className="mb-1">Promedio de horas por asesor</h6>
                  <small className="text-muted">Ordenado de mayor a menor duración.</small>
                  {advisorDataset ? (
                    <ReportChart
                      type="bar"
                      fullWidth
                      height={300}
                      title="Horas promedio por asesor"
                      data={advisorDataset}
                      enableDownload
                      downloadFilename="cycle-time-advisors.png"
                      footerTitle={filtersTitle}
                      footerLines={filtersLines}
                      showDataLabels
                      dataLabelFormatter={(value: number) => `${formatDuration(value)} (${value.toFixed(1)} h)`}
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: (value: number | string) => {
                                const numeric = typeof value === 'number' ? value : Number(value);
                                return formatDuration(numeric);
                              },
                            },
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="text-muted">No hay desglose por asesor.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card h-100 border-0">
                <div className="card-body d-flex flex-column">
                  <h6 className="mb-1">Resumen por asesor</h6>
                  <small className="text-muted">Identifica quién acelera mejor los cierres.</small>
                  {data?.advisors?.length ? (
                    <div className="table-responsive mt-3">
                      <table className="table table-sm align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Asesor</th>
                            <th className="text-end">Leads</th>
                            <th className="text-end">Promedio</th>
                            <th className="text-end">Mediana</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.advisors.map((advisor: ReportsCycleTimeAdvisorItem) => (
                            <tr key={advisor.advisor_id ?? 'unassigned'}>
                              <td>{advisor.advisor_name}</td>
                              <td className="text-end">{formatInteger(advisor.total_leads)}</td>
                              <td className="text-end">{formatDuration(advisor.average_hours)}</td>
                              <td className="text-end">{formatDuration(advisor.median_hours)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-muted mt-3">Sin información por asesor.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h6 className="mb-2">Detalle por lead</h6>
            {data?.leads?.length ? (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Lead</th>
                      <th>Asesor</th>
                      <th className="text-end">Duración total</th>
                      <th className="text-end">Creado</th>
                      <th className="text-end">Cierre</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.leads.map(lead => {
                      const stageAdvisors = Array.isArray(lead.stages)
                        ? lead.stages.map(stage => stage.advisor_name).filter((value): value is string => Boolean(value))
                        : [];
                      const uniqueAdvisorCount = new Set(stageAdvisors).size;
                      const advisorLabel = lead.advisor_name ?? 'Sin asignar';
                      const advisorDisplay = uniqueAdvisorCount > 1
                        ? `${advisorLabel} · ${uniqueAdvisorCount} asesores`
                        : advisorLabel;

                      return (
                        <tr key={lead.lead_uuid}>
                          <td>{lead.lead_name}</td>
                          <td>{advisorDisplay}</td>
                        <td className="text-end">{formatDuration(lead.total_hours)}</td>
                        <td className="text-end">{new Date(lead.created_at).toLocaleString('es-PE')}</td>
                        <td className="text-end">{new Date(lead.completed_at).toLocaleString('es-PE')}</td>
                        <td className="text-end">
                          <button className="btn btn-outline-primary btn-xs" onClick={() => openTimeline(lead)}>
                            Ver historial
                          </button>
                        </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-muted">Sin leads cerrados en el periodo.</div>
            )}
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

      {isTimelineMounted && selectedLead && (
        <ModalComponent
          stateModal={isTimelineVisible}
          typeModal="static"
          onClose={handleTimelineUnmount}
          title={`Historia del lead · ${selectedLead.lead_name}`}
          size="modal-lg"
          vHactive
          content={
            <div className="modal-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="mb-1">Resumen</h6>
                  <p className="mb-0 small text-muted">
                    Asesor: {selectedLead.advisor_name ?? 'Sin asignar'} · Duración: {formatDuration(selectedLead.total_hours)}
                  </p>
                </div>
                <button className="btn btn-outline-secondary btn-sm" onClick={handleTimelineClose}>
                  Cerrar
                </button>
              </div>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Etapa</th>
                      <th>Asesor</th>
                      <th>Duración</th>
                      <th>Periodo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLead.stages.map((stage, index) => (
                      <tr key={`${stage.stage_name}-${index}`}>
                        <td>{stage.stage_name}</td>
                        <td>{stage.advisor_name ?? selectedLead.advisor_name ?? 'Sin asignar'}</td>
                        <td>{formatDuration(stage.duration_hours)}</td>
                        <td>{formatStageDuration(stage)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          }
        />
      )}
    </>
  );
};

export default ReportCycleTimeSection;
