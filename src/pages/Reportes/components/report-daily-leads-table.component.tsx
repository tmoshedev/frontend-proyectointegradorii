import React, { useCallback, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { Download } from 'lucide-react';
import {
  ReportsDailyLeadSourceItem,
  ReportsDailyLeadsSummary,
} from '../../../models';
import { exportElementAsImage } from '../../../utilities/exportAsImage';
import { formatInteger } from '../utils/formatters';

interface ReportDailyLeadsTableProps {
  records: ReportsDailyLeadSourceItem[];
  summary?: ReportsDailyLeadsSummary;
  filtersTitle: string;
  filtersLines: string[];
}

type DailyLeadRaw = NonNullable<ReportsDailyLeadSourceItem['leads']>[number];

type DailyLeadView = {
  id: string;
  name: string;
  advisor: string;
  stage: string;
  campaignLabel: string;
};

type GroupedDailyRecords = Array<{
  date: string;
  displayDate: string;
  total: number;
  campaigns: Array<{
    id: string;
    sourceLabel: string;
    sourceType: string;
    campaignLabel: string;
    total: number;
    leads: DailyLeadView[];
  }>;
}>;

dayjs.locale('es');

const resolveSourceType = (record: ReportsDailyLeadSourceItem) => {
  if (record.registered_by_system || !record.web_hook_id) {
    return 'Registro del sistema';
  }
  if (record.source_type) {
    return record.source_type;
  }
  return record.source ? record.source : 'Campaña';
};

const resolveSourceLabel = (record: ReportsDailyLeadSourceItem) => {
  if (record.campaign_name) {
    return record.campaign_name;
  }
  if (record.source) {
    return record.source;
  }
  if (record.campaign_code) {
    return `Campaña ${record.campaign_code}`;
  }
  if (record.registered_by_system || !record.web_hook_id) {
    return 'Registro manual';
  }
  return 'Sin especificar';
};

const resolveLeadId = (
  lead: DailyLeadRaw,
  fallback: string,
  index: number,
) => {
  const candidates = [
    (lead as any)?.id,
    (lead as any)?.lead_id,
    (lead as any)?.lead_uuid,
    `${fallback}-${index}`,
  ];

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) {
      continue;
    }
    const value = String(candidate).trim();
    if (value.length > 0) {
      return value;
    }
  }

  return `${fallback}-${index}`;
};

const formatLeadName = (lead: DailyLeadRaw) => (lead as any)?.name ?? (lead as any)?.lead_name ?? 'Sin nombre';

const formatAdvisorName = (lead: DailyLeadRaw) => (lead as any)?.advisor_name ?? 'Sin asesor';

const formatStageName = (lead: DailyLeadRaw) => (lead as any)?.stage_name ?? (lead as any)?.lead_state_name ?? 'Sin etapa';

const groupRecordsByDate = (records: ReportsDailyLeadSourceItem[]): GroupedDailyRecords => {
  const byDate = new Map<
    string,
    {
      total: number;
      campaigns: Array<{
        id: string;
        sourceLabel: string;
        sourceType: string;
        campaignLabel: string;
        total: number;
        leads: DailyLeadView[];
      }>;
    }
  >();

  records.forEach(record => {
    if (!record?.date) {
      return;
    }

    const dateKey = dayjs(record.date).isValid() ? dayjs(record.date).format('YYYY-MM-DD') : record.date;
    const bucket = byDate.get(dateKey) ?? { total: 0, campaigns: [] };
    const sourceType = resolveSourceType(record);
    const sourceLabel = resolveSourceLabel(record);
    const campaignLabel = record.campaign_name ?? sourceLabel;
    const total = Number(record.total ?? 0) || 0;

    const leadsRaw = Array.isArray(record.leads) ? record.leads : [];
    const fallbackKey = `${dateKey}-${sourceLabel}`;
    const leads: DailyLeadView[] = leadsRaw.map((lead, index) => ({
      id: resolveLeadId(lead, fallbackKey, index),
      name: formatLeadName(lead),
      advisor: formatAdvisorName(lead),
      stage: formatStageName(lead),
      campaignLabel: (lead as any)?.campaign_name ?? campaignLabel,
    }));

    bucket.total += total;
    bucket.campaigns.push({
      id: `${fallbackKey}-${bucket.campaigns.length}`,
      sourceLabel,
      sourceType,
      campaignLabel,
      total,
      leads,
    });

    byDate.set(dateKey, bucket);
  });

  const sorted = Array.from(byDate.entries())
    .map(([date, bucket]) => ({
      date,
      displayDate: dayjs(date).isValid() ? dayjs(date).locale('es').format('DD MMM YYYY') : date,
      total: bucket.total,
      campaigns: bucket.campaigns.sort((a, b) => b.total - a.total),
    }))
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

  return sorted;
};

const ReportDailyLeadsTable: React.FC<ReportDailyLeadsTableProps> = ({
  records,
  summary,
  filtersTitle,
  filtersLines,
}) => {
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const [exporting, setExporting] = useState(false);

  const groupedRecords = useMemo(() => groupRecordsByDate(records ?? []), [records]);
  const totals = useMemo(() => {
    const grandTotal = groupedRecords.reduce((acc, group) => acc + group.total, 0);
    const campaignTotal = summary?.campaign_total ?? undefined;
    const systemTotal = summary?.system_total ?? undefined;
    return {
      total: summary?.total ?? grandTotal,
      campaignTotal,
      systemTotal,
    };
  }, [groupedRecords, summary]);

  const campaignSummary = useMemo(() => {
    const registry = new Map<string, { label: string; total: number }>();
    groupedRecords.forEach(group => {
      group.campaigns.forEach(campaign => {
        const key = campaign.campaignLabel || campaign.sourceLabel;
        const entry = registry.get(key) ?? { label: key, total: 0 };
        entry.total += campaign.total;
        registry.set(key, entry);
      });
    });
    return Array.from(registry.values()).sort((a, b) => b.total - a.total);
  }, [groupedRecords]);

  const handleExport = useCallback(async () => {
    if (!tableContainerRef.current || exporting) {
      return;
    }

    setExporting(true);
    try {
      await exportElementAsImage(tableContainerRef.current, {
        filename: 'reporte-segmentador.png',
        padding: 24,
      });
    } finally {
      setExporting(false);
    }
  }, [exporting]);

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body d-flex flex-column gap-3">
        <div className="d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-3">
          <div>
            <h5 className="card-title mb-1">Reporte segmentador</h5>
            <small className="text-muted">
              Desagrega los leads diarios por campaña, asesor y etapa durante el intervalo seleccionado.
            </small>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
            onClick={handleExport}
            disabled={exporting || records.length === 0}
            data-export-ignore
          >
            {!exporting && <Download size={16} />}
            {exporting ? 'Generando…' : 'Exportar tabla'}
          </button>
        </div>

        {records.length === 0 ? (
          <div className="alert alert-info border-0 mb-0">
            Aún no se registran leads en el intervalo aplicado. Ajusta los filtros para ver información diaria.
          </div>
        ) : (
          <div ref={tableContainerRef}>
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Campaña / Origen</th>
                    <th>Lead</th>
                    <th>Asesor</th>
                    <th>Etapa actual</th>
                    <th className="text-end">Total campaña</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedRecords.map(group => {
                    const dateRowSpan = group.campaigns.reduce((acc, campaign) => {
                      const rows = Math.max(campaign.leads.length, 1);
                      return acc + rows;
                    }, 0);

                    return (
                      <React.Fragment key={group.date}>
                        {group.campaigns.map((campaign, campaignIndex) => {
                          const campaignRows = Math.max(campaign.leads.length, 1);

                          if (!campaign.leads.length) {
                            return (
                              <tr key={`${campaign.id}-empty`}>
                                {campaignIndex === 0 ? (
                                  <td rowSpan={dateRowSpan} className="fw-semibold align-middle">
                                    {group.displayDate}
                                  </td>
                                ) : null}
                                <td>
                                  <span className="fw-semibold d-block">{campaign.campaignLabel}</span>
                                  {campaign.sourceLabel && campaign.sourceLabel !== campaign.campaignLabel ? (
                                    <small className="text-muted">{campaign.sourceLabel}</small>
                                  ) : (
                                    <small className="text-muted">{campaign.sourceType}</small>
                                  )}
                                </td>
                                <td colSpan={3} className="text-muted fst-italic">
                                  Sin detalle de leads disponible
                                </td>
                                <td className="text-end fw-semibold">{formatInteger(campaign.total)}</td>
                              </tr>
                            );
                          }

                          return campaign.leads.map((lead, leadIndex) => (
                            <tr key={`${campaign.id}-${lead.id}`}>
                              {campaignIndex === 0 && leadIndex === 0 ? (
                                <td rowSpan={dateRowSpan} className="fw-semibold align-middle">
                                  {group.displayDate}
                                </td>
                              ) : null}
                              {leadIndex === 0 ? (
                                <td rowSpan={campaignRows}>
                                  <span className="fw-semibold d-block">{campaign.campaignLabel}</span>
                                  {campaign.sourceLabel && campaign.sourceLabel !== campaign.campaignLabel ? (
                                    <small className="text-muted">{campaign.sourceLabel}</small>
                                  ) : (
                                    <small className="text-muted">{campaign.sourceType}</small>
                                  )}
                                </td>
                              ) : null}
                              <td>{lead.name}</td>
                              <td>{lead.advisor}</td>
                              <td>{lead.stage}</td>
                              {leadIndex === 0 ? (
                                <td rowSpan={campaignRows} className="text-end fw-semibold">
                                  {formatInteger(campaign.total)}
                                </td>
                              ) : null}
                            </tr>
                          ));
                        })}
                        <tr className="table-active">
                          <td colSpan={5} className="text-end">
                            Total del día
                          </td>
                          <td className="text-end fw-semibold">{formatInteger(group.total)}</td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot className="table-light">
                  <tr>
                    <th colSpan={5}>Total general</th>
                    <th className="text-end">{formatInteger(totals.total ?? 0)}</th>
                  </tr>
                  {totals.campaignTotal !== undefined ? (
                    <tr>
                      <th colSpan={5}>Total por campañas</th>
                      <th className="text-end">{formatInteger(totals.campaignTotal)}</th>
                    </tr>
                  ) : null}
                  {totals.systemTotal !== undefined ? (
                    <tr>
                      <th colSpan={5}>Total por registros del sistema</th>
                      <th className="text-end">{formatInteger(totals.systemTotal)}</th>
                    </tr>
                  ) : null}
                </tfoot>
              </table>
            </div>

            {campaignSummary.length ? (
              <div className="mt-4">
                <h6 className="text-uppercase text-muted small mb-2">Totales por campaña</h6>
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Campaña / Origen</th>
                        <th className="text-end">Leads</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignSummary.map(item => (
                        <tr key={item.label}>
                          <td>{item.label}</td>
                          <td className="text-end fw-semibold">{formatInteger(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <div className="border-top pt-3 mt-3">
              <h6 className="text-uppercase text-muted small mb-1">{filtersTitle}</h6>
              <ul className="list-unstyled mb-0 small text-muted">
                {filtersLines.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDailyLeadsTable;
