import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  LineChart,
  Table,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Timer,
} from 'lucide-react';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

import DownloadableFunnelCard from '../../components/DownloadableFunnelCard';
import type { LeadState } from '../../components/FunnelReport';
import ReportChart from '../../components/ReportChart';
import ModalComponent from '../../components/shared/modal.component';

import ReportSummarySection from './components/report-summary-section.component';
import ReportGoalsOverview from './components/report-goals-overview.component';
import ReportGoalsManager from './components/report-goals-manager.component';
import ReportStageTargetsOverview from './components/report-stage-targets-overview.component';
import ReportStageTargetsManager from './components/report-stage-targets-manager.component';
import ReportRankingSection from './components/report-ranking-section.component';
import ReportWarningsList from './components/report-warnings-list.component';
import ReportAccordion, { ReportAccordionSection } from './components/report-accordion.component';
import ReportNoData from './components/report-no-data.component';
import ReportTrendCard from './components/report-trend-card.component';
import GoalsSummary, { GoalSummaryCard } from './components/goals-summary.component';
import WarningCallout from './components/warning-callout.component';
import ReportDailyLeadsTable from './components/report-daily-leads-table.component';
import ReportGlobalFilters, {
  ReportFiltersState,
  ReportSelectOption,
} from './components/report-global-filters.component';
import ReportHitRateSection from './components/report-hit-rate-section.component';
import ReportCycleTimeSection from './components/report-cycle-time-section.component';

dayjs.extend(quarterOfYear);

const DATE_FORMAT = 'YYYY-MM-DD';

import { useReports } from '../../hooks/useReports';
import { SweetAlert } from '../../utilities';

import {
  ReportsAdvisorRankingItem,
  ReportsAdvisorRankingResponse,
  ReportsAdvisorRankingLeadStateItem,
  ReportsFunnelResponse,
  ReportsGoalsListItem,
  ReportsGoalsResourcesResponse,
  ReportsGoalsPerformanceResponse,
  ReportsGoalsPerformanceSummary,
  ReportsTimeseriesResponse,
  ReportsSelectableItem,
  ReportsStageTargetItem,
  ReportsStageTargetSummary,
  ReportsStageTargetsResponse,
  ReportsHitRateResponse,
  ReportsCycleTimeResponse,
  ReportsDailyLeadsResponse,
} from '../../models';

import { formatCurrency, formatInteger, formatPercentOneDecimal } from './utils/formatters';
import { sortByNumberDesc } from './utils/sorting';

const BUSINESS_ID = '1';

const INTERVAL_PRESETS: ReportSelectOption[] = [
  { value: 'today', label: 'Hoy', description: 'Resultados del día actual' },
  { value: 'last_7_days', label: 'Últimos 7 días', description: 'Comparte desempeño semanal' },
  { value: 'this_month', label: 'Mes en curso', description: 'Desde el inicio del mes actual' },
  { value: 'previous_month', label: 'Mes anterior', description: 'Mes calendario previo' },
  { value: 'this_quarter', label: 'Trimestre actual' },
  { value: 'year_to_date', label: 'Año a la fecha' },
  { value: 'custom', label: 'Personalizado' },
];

const METRIC_OPTIONS: ReportSelectOption[] = [
  { value: 'leads', label: 'Leads totales' },
  //{ value: 'dropped_leads', label: 'Leads dado de baja' },
];

const DEFAULT_FILTERS: ReportFiltersState = {
  intervalPreset: 'this_month',
  campaignCodigos: [],
  metric: METRIC_OPTIONS[0]?.value ?? 'leads',
  closingStageIds: [],
};

type TimeseriesInterval = 'DAY' | 'WEEK' | 'MONTH';
type TimeseriesGroupingOption = TimeseriesInterval | 'AUTO';

const formatDate = (value: dayjs.Dayjs) => value.format(DATE_FORMAT);

const resolvePresetRange = (preset: string) => {
  const today = dayjs();
  switch (preset) {
    case 'today':
      return { from: formatDate(today.startOf('day')), to: formatDate(today.endOf('day')) };
    case 'last_7_days': {
      const end = today.endOf('day');
      const start = today.subtract(6, 'day').startOf('day');
      return { from: formatDate(start), to: formatDate(end) };
    }
    case 'this_month': {
      const start = today.startOf('month');
      const end = today.endOf('day');
      return { from: formatDate(start), to: formatDate(end) };
    }
    case 'previous_month': {
      const start = today.subtract(1, 'month').startOf('month');
      const end = start.endOf('month');
      return { from: formatDate(start), to: formatDate(end) };
    }
    case 'this_quarter': {
      const start = today.startOf('quarter');
      const end = today.endOf('day');
      return { from: formatDate(start), to: formatDate(end) };
    }
    case 'year_to_date': {
      const start = today.startOf('year');
      const end = today.endOf('day');
      return { from: formatDate(start), to: formatDate(end) };
    }
    default:
      return null;
  }
};

const mapPresetToTimeseriesInterval = (preset: string): TimeseriesInterval => {
  switch (preset) {
    case 'today':
    case 'last_7_days':
      return 'DAY';
    case 'this_quarter':
    case 'year_to_date':
      return 'MONTH';
    case 'previous_month':
    case 'this_month':
    default:
      return 'WEEK';
  }
};

const resolveTimeseriesInterval = (preset: string, grouping: TimeseriesGroupingOption): TimeseriesInterval => {
  if (grouping !== 'AUTO') {
    return grouping;
  }
  return mapPresetToTimeseriesInterval(preset);
};

const selectableToOptions = (items?: ReportsSelectableItem[]): ReportSelectOption[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map(item => {
      const rawValue = item.code ?? item.value ?? item.id;
      const label = item.label ?? item.name ?? (rawValue != null ? String(rawValue) : undefined);
      if (!rawValue || !label) {
        return null;
      }
      return {
        value: String(rawValue),
        label,
      } as ReportSelectOption;
    })
    .filter((option): option is ReportSelectOption => Boolean(option));
};

interface SummaryCardConfig {
  title: string;
  value: string;
  subtitle: string;
  icon?: React.ReactNode;
  className?: string;
}

interface FunnelStageValue {
  id?: string | number | null;
  order?: number | null;
  name: string;
  actual: number;
  meta?: number | null;
  comparison?: number | null;
}

const extractFunnelStages = (funnel?: ReportsFunnelResponse | null): FunnelStageValue[] => {
  if (!funnel?.stages) {
    return [];
  }

  return funnel.stages.map(stage => ({
    id: stage.id ?? null,
    order: stage.order ?? null,
    name: stage.name,
    actual: Number(stage.total ?? 0) || 0,
    meta: stage.target_total != null ? Number(stage.target_total) : undefined,
    comparison: stage.reference_total != null ? Number(stage.reference_total) : undefined,
  }));
};

const sumStageValues = (stages: FunnelStageValue[], selector: 'actual' | 'meta' | 'comparison' = 'actual') =>
  stages.reduce((acc, stage) => {
    const raw = stage[selector];
    const numeric = Number(raw ?? 0);
    return acc + (Number.isFinite(numeric) ? numeric : 0);
  }, 0);

const scaleStagesToTotal = (
  stages: FunnelStageValue[],
  targetTotal?: number | null,
): { name: string; value: number; id?: string | number | null }[] | null => {
  if (!targetTotal || !Number.isFinite(targetTotal)) {
    return null;
  }

  const baseTotal = sumStageValues(stages, 'actual');
  if (baseTotal <= 0) {
    return null;
  }

  const factor = targetTotal / baseTotal;
  return stages.map(stage => ({
    id: stage.id,
    name: stage.name,
    value: stage.actual * factor,
  }));
};

const mapStageValues = (
  stages: FunnelStageValue[],
  selector: 'actual' | 'meta' | 'comparison',
): { name: string; value: number; id?: string | number | null }[] =>
  stages.map(stage => ({
    id: stage.id,
    name: stage.name,
    value: Number(stage[selector] ?? 0) || 0,
  }));

const sumStagePairs = (stages?: { name: string; value: number }[] | null) => {
  if (!stages) {
    return null;
  }
  const total = stages.reduce((acc, stage) => acc + (Number.isFinite(stage.value) ? stage.value : 0), 0);
  return Number.isFinite(total) ? total : null;
};

const convertToLeadStates = (stages: { name: string; value: number; id?: string | number | null }[]): LeadState[] =>
  stages.map(stage => ({
    name: stage.name,
    real: stage.value,
    meta: stage.value,
  }));

const normalizeAdvisorId = (advisorId: string | number | undefined) => String(advisorId ?? '');

const METRIC_API_VALUE: Record<string, string> = {
  leads: 'LEADS_CREATED',
  contacted_leads: 'LEADS_CONTACTED',
  qualified_leads: 'LEADS_QUALIFIED',
  won_leads: 'LEADS_WON',
  dropped_leads: 'LEADS_DROPPED',
};

const mapMetricToApi = (value?: string) => {
  if (!value) {
    return METRIC_API_VALUE.leads;
  }
  return METRIC_API_VALUE[value] ?? METRIC_API_VALUE.leads;
};

const formatCycleDurationLabel = (hours?: number | null) => {
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

const uniqueAdvisorOptions = (items: ReportsAdvisorRankingItem[]) => {
  const seen = new Set<string>();
  return items.reduce<{ value: string; label: string }[]>((acc, item) => {
    const id = normalizeAdvisorId(item.advisor_id);
    if (!seen.has(id) && id !== '') {
      seen.add(id);
      acc.push({ value: id, label: item.advisor_name });
    }
    return acc;
  }, []);
};

const buildGoalsSummaryCards = (summary?: ReportsGoalsPerformanceResponse['summary']): GoalSummaryCard[] => {
  if (!summary) {
    return [];
  }

  const cards: GoalSummaryCard[] = [
    { key: 'target_total', title: 'Meta total declarada', value: summary.target_total },
    {
      key: 'difference',
      title: 'Faltante',
      value: summary.difference,
      highlight: summary.difference <= 0,
    },
    {
      key: 'fulfillment_percent',
      title: 'Cumplimiento promedio',
      value: summary.fulfillment_percent,
      highlight: summary.fulfillment_percent >= 100,
    },
  ];

  if (summary.current_period) {
    cards.unshift({
      key: 'current_period_total',
      title: `Periodo actual${summary.current_period.label ? ` · ${summary.current_period.label}` : ''}`,
      value: summary.current_period.total ?? summary.actual_total,
      subtitle: summary.previous_period
        ? `Anterior${summary.previous_period.label ? ` · ${summary.previous_period.label}` : ''}: ${formatCurrency(
            summary.previous_period.total ?? 0,
          )}`
        : undefined,
    });
  }

  /*if (typeof summary.variation_percent === 'number') {
    cards.push({
      key: 'variation_percent',
      title: 'Variación vs periodo anterior',
      value: summary.variation_percent,
      highlight: summary.variation_percent >= 0,
    });
  }*/

  return cards;
};

const goalMatchesFilters = (
  goal: { campaign?: { id?: string | number | null; code?: string | number | null } | null; advisor?: { id?: string | number | null; code?: string | number | null } | null } | null,
  filters: ReportFiltersState,
) => {
  if (!goal) {
    const hasCampaignFilter = Boolean(filters.campaignCodigo) || Boolean(filters.campaignCodigos?.length);
    return !hasCampaignFilter && !filters.advisorId;
  }

  const campaignCodeSet = filters.campaignCodigos?.length
    ? new Set(filters.campaignCodigos.map(value => String(value)))
    : filters.campaignCodigo
      ? new Set([filters.campaignCodigo])
      : null;

  if (campaignCodeSet && campaignCodeSet.size > 0) {
    const primaryIdentifier = goal.campaign?.code ?? goal.campaign?.id ?? null;
    const campaignArray = Array.isArray((goal as { campaign_codes?: unknown }).campaign_codes)
      ? ((goal as { campaign_codes?: unknown }).campaign_codes as unknown[])
          .map(value => (value != null ? String(value) : null))
          .filter((value): value is string => Boolean(value))
      : [];

    const matchFromArray = campaignArray.some(code => campaignCodeSet.has(code));
    const matchFromPrimary = primaryIdentifier != null && campaignCodeSet.has(String(primaryIdentifier));

    if (!matchFromArray && !matchFromPrimary) {
      return false;
    }
  }

  if (filters.advisorId) {
    const advisorIdentifier = goal.advisor?.id ?? goal.advisor?.code ?? null;
    if (advisorIdentifier == null || String(advisorIdentifier) !== filters.advisorId) {
      return false;
    }
  }

  return true;
};

const resolveGoalPrimaryLabel = (
  goal: { name?: string | null; campaign?: { name?: string | null }; advisor?: { name?: string | null }; goal_scope?: string },
): string => {
  if (goal?.name && goal.name.trim().length > 0) {
    return goal.name;
  }

  if (goal?.campaign?.name) {
    return goal.campaign.name;
  }

  if (goal?.advisor?.name) {
    return goal.advisor.name;
  }

  return goal?.goal_scope ?? 'Meta';
};

const normalizeIdentifier = (value?: string | number | null) => {
  if (value === undefined || value === null) {
    return null;
  }
  return String(value);
};

const normalizeNonEmptyFilterValue = (value: unknown): string | null => {
  if (value === undefined || value === null) {
    return null;
  }
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
};

const collectStageTargetCampaignIdentifiers = (target: ReportsStageTargetItem): Set<string> => {
  const identifiers = new Set<string>();
  const register = (candidate: unknown) => {
    const normalized = normalizeNonEmptyFilterValue(candidate);
    if (normalized) {
      identifiers.add(normalized);
    }
  };

  register(target.campaign?.code);
  register(target.campaign?.id);
  register((target.campaign as unknown as Record<string, unknown> | undefined)?.['value']);

  const raw = target as unknown as Record<string, unknown>;
  register(raw['campaign_code']);
  register(raw['campaign_id']);
  register(raw['campaignCode']);
  register(raw['campaignId']);

  const multiple = raw['campaign_codes'];
  if (Array.isArray(multiple)) {
    multiple.forEach(value => register(value));
  }

  return identifiers;
};

const collectStageTargetAdvisorIdentifiers = (target: ReportsStageTargetItem): Set<string> => {
  const identifiers = new Set<string>();
  const register = (candidate: unknown) => {
    const normalized = normalizeNonEmptyFilterValue(candidate);
    if (normalized) {
      identifiers.add(normalized);
    }
  };

  register(target.advisor?.id);
  register(target.advisor?.code);
  register((target.advisor as unknown as Record<string, unknown> | undefined)?.['value']);

  const raw = target as unknown as Record<string, unknown>;
  register(raw['advisor_id']);
  register(raw['advisor_code']);
  register(raw['advisorCode']);
  register(raw['advisorId']);
  register(raw['assigned_to_id']);
  register(raw['assignedToId']);
  register(raw['usuario_id']);

  return identifiers;
};

const isStageTargetItem = (candidate: unknown): candidate is ReportsStageTargetItem => {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }

  const payload = candidate as ReportsStageTargetItem;
  if (!payload.lead_state) {
    return false;
  }

  const hasTarget = payload.target_total != null && !Number.isNaN(Number(payload.target_total));
  return hasTarget;
};

const normalizeStageTargetsResponse = (
  payload: ReportsStageTargetsResponse | ReportsStageTargetItem[] | null | undefined,
): ReportsStageTargetItem[] => {
  if (!payload) {
    return [];
  }

  const result: ReportsStageTargetItem[] = [];
  const seen = new Set<string>();

  const register = (candidate: unknown) => {
    if (!isStageTargetItem(candidate)) {
      return;
    }
    const identifier = normalizeIdentifier(candidate.id) ?? `${normalizeIdentifier(candidate.lead_state?.id) ?? candidate.lead_state?.name ?? Math.random()}`;
    if (seen.has(identifier)) {
      return;
    }
    seen.add(identifier);
    result.push(candidate);
  };

  if (Array.isArray(payload)) {
    payload.forEach(register);
    return result;
  }

  const possibleCollections: unknown[] = [
    (payload as ReportsStageTargetsResponse)?.stage_targets,
    (payload as ReportsStageTargetsResponse)?.data,
    (payload as ReportsStageTargetsResponse)?.items,
    (payload as Record<string, unknown>)?.['results'],
  ];

  possibleCollections.forEach(collection => {
    if (Array.isArray(collection)) {
      collection.forEach(register);
    }
  });

  return result;
};

const stageTargetMatchesFilters = (target: ReportsStageTargetItem, filters: ReportFiltersState) => {
  if (!target) {
    return false;
  }

  const campaignFilterSet = filters.campaignCodigos?.length
    ? new Set(
        filters.campaignCodigos
          .map(value => String(value).trim())
          .filter(value => value.length > 0),
      )
    : filters.campaignCodigo
      ? new Set([String(filters.campaignCodigo).trim()])
      : null;

  if (campaignFilterSet && campaignFilterSet.size > 0) {
    const campaignIdentifiers = collectStageTargetCampaignIdentifiers(target);
    if (campaignIdentifiers.size > 0) {
      const hasMatch = Array.from(campaignFilterSet).some(code => campaignIdentifiers.has(code));
      if (!hasMatch) {
        return false;
      }
    }
  }

  const advisorFilter = filters.advisorId && filters.advisorId !== 'all' ? String(filters.advisorId).trim() : null;

  if (advisorFilter) {
    const advisorIdentifiers = collectStageTargetAdvisorIdentifiers(target);
    if (!advisorIdentifiers.has(advisorFilter)) {
      return false;
    }
  }

  const filterStart = filters.dateFrom ? dayjs(filters.dateFrom) : null;
  const filterEnd = filters.dateTo ? dayjs(filters.dateTo) : null;

  if (filterStart || filterEnd) {
    const targetStart = target.period_start ? dayjs(target.period_start) : null;
    const targetEnd = target.period_end ? dayjs(target.period_end) : targetStart;

    if (filterStart && targetEnd && targetEnd.isBefore(filterStart, 'day')) {
      return false;
    }

    if (filterEnd && targetStart && targetStart.isAfter(filterEnd, 'day')) {
      return false;
    }
  }

  return true;
};

const buildStageKey = (id?: string | number | null, name?: string | null) => {
  if (id !== undefined && id !== null && id !== '') {
    return `id:${String(id)}`;
  }
  if (name && name.trim().length > 0) {
    return `name:${name.trim().toLowerCase()}`;
  }
  return null;
};

const getStageKeyFromValue = (stage: { id?: string | number | null; name: string }) =>
  buildStageKey(stage.id, stage.name);

const getStageKeyFromTarget = (target: ReportsStageTargetItem) => {
  const state = target.lead_state ?? {};
  return buildStageKey(state.id ?? state.code ?? null, state.name ?? state.label ?? null);
};

interface StageTargetInsightItem {
  key: string;
  label: string;
  stageId?: string | number | null;
  actual: number;
  target: number;
  difference: number;
  fulfillment: number | null;
  items: ReportsStageTargetItem[];
}

interface StageTargetsChartDataset {
  labels: string[];
  actual: number[];
  target: number[];
}

interface StageTargetsInsightsResult {
  dataset: StageTargetsChartDataset;
  insights: StageTargetInsightItem[];
  totals: {
    actual: number;
    target: number;
  };
}

const buildStageTargetsInsights = (
  stages: FunnelStageValue[],
  targets: ReportsStageTargetItem[],
): StageTargetsInsightsResult => {
  const stageMap = new Map<string, FunnelStageValue>();
  const stageOrderMap = new Map<string, number>();

  stages.forEach(stage => {
    const key = getStageKeyFromValue(stage);
    if (!key) {
      return;
    }
    stageMap.set(key, stage);
    stageOrderMap.set(key, stage.order ?? stageMap.size);
  });

  const targetMap = new Map<string, { total: number; items: ReportsStageTargetItem[] }>();

  targets.forEach(target => {
    const key = getStageKeyFromTarget(target);
    if (!key) {
      return;
    }
    const total = Number(target.target_total ?? 0);
    if (!Number.isFinite(total)) {
      return;
    }
    const existing = targetMap.get(key) ?? { total: 0, items: [] };
    existing.total += total;
    existing.items.push(target);
    targetMap.set(key, existing);
  });

  const combinedKeys = new Set<string>([...stageMap.keys(), ...targetMap.keys()]);

  const insights: StageTargetInsightItem[] = [];

  combinedKeys.forEach(key => {
    const stage = stageMap.get(key);
    const targetsAggregate = targetMap.get(key);

    const label = stage?.name ?? targetsAggregate?.items?.[0]?.lead_state?.name ?? targetsAggregate?.items?.[0]?.lead_state?.label ?? 'Etapa';
    const actual = stage?.actual ?? 0;
    const targetValue = targetsAggregate?.total ?? stage?.meta ?? 0;
    const difference = actual - targetValue;
    const fulfillment = targetValue > 0 ? (actual / targetValue) * 100 : null;

    insights.push({
      key,
      label,
      stageId: stage?.id ?? null,
      actual,
      target: targetValue,
      difference,
      fulfillment,
      items: targetsAggregate?.items ?? [],
    });
  });

  insights.sort((a, b) => {
    const orderA = stageOrderMap.get(a.key) ?? Number.POSITIVE_INFINITY;
    const orderB = stageOrderMap.get(b.key) ?? Number.POSITIVE_INFINITY;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.label.localeCompare(b.label, 'es');
  });

  const dataset: StageTargetsChartDataset = {
    labels: insights.map(item => item.label),
    actual: insights.map(item => item.actual),
    target: insights.map(item => item.target),
  };

  const totals = insights.reduce(
    (acc, item) => {
      acc.actual += Number.isFinite(item.actual) ? item.actual : 0;
      acc.target += Number.isFinite(item.target) ? item.target : 0;
      return acc;
    },
    { actual: 0, target: 0 },
  );

  return { dataset, insights, totals };
};

const buildGoalsChartDataset = (
  response: ReportsGoalsPerformanceResponse | null | undefined,
  filters: ReportFiltersState,
) => {
  const goals = (response?.goals ?? []).filter(goal => goalMatchesFilters(goal, filters));
  return {
    labels: goals.map(goal => resolveGoalPrimaryLabel(goal)),
    target: goals.map(goal => goal.target_value ?? 0),
    actual: goals.map(goal => goal.actual_value ?? 0),
  };
};

const buildGoalStatusChips = (
  response: ReportsGoalsPerformanceResponse | null | undefined,
  filters: ReportFiltersState,
) => {
  const goals = (response?.goals ?? [])
    .filter(goal => goalMatchesFilters(goal, filters))
    .filter(goal => (goal.target_value ?? 0) > 0 || (goal.actual_value ?? 0) > 0)
    .map(goal => ({
      id: goal.id,
      label: resolveGoalPrimaryLabel(goal),
      status: goal.status?.label ?? 'Sin estado',
      color: goal.status?.color ?? '#2563eb',
      fulfillment: goal.fulfillment_percent,
    }));

  return goals;
};

const aggregateGoalsSummary = (
  goals: ReportsGoalsListItem[],
  base?: ReportsGoalsPerformanceSummary | null,
  stageTargets?: ReportsStageTargetItem[],
  leadsTotal?: number,
): ReportsGoalsPerformanceSummary | undefined => {
  const hasGoals = Array.isArray(goals) && goals.length > 0;
  const hasStageTargets = Array.isArray(stageTargets) && stageTargets.length > 0;

  if (!hasGoals && !hasStageTargets) {
    return base ?? undefined;
  }

  const targetTotal = (hasGoals ? goals.reduce((acc, goal) => acc + Number(goal.target_value ?? 0), 0) : 0) +
                      (hasStageTargets ? stageTargets.reduce((acc, target) => acc + Number(target.target_total ?? 0), 0) : 0);
  const actualTotal = hasGoals ? goals.reduce((acc, goal) => acc + Number(goal.actual_value ?? 0), 0) : (leadsTotal ?? 0);
  const differenceTotal = hasGoals ? goals.reduce((acc, goal) => {
    const actual = Number(goal.actual_value ?? 0);
    const target = Number(goal.target_value ?? 0);
    return acc + (target - actual);
  }, 0) : (targetTotal - actualTotal);

  const fulfillmentPercent = targetTotal > 0 ? (actualTotal / targetTotal) * 100 : 0;
  const normalizedFulfillment = Number.isFinite(fulfillmentPercent) ? fulfillmentPercent : 0;

  const currentPeriod = base?.current_period
    ? { ...base.current_period, total: base.current_period.total ?? actualTotal }
    : {
        label: 'Periodo actual',
        total: actualTotal,
      };

  const summary: ReportsGoalsPerformanceSummary = {
    target_total: targetTotal,
    actual_total: actualTotal,
    difference: differenceTotal,
    fulfillment_percent: normalizedFulfillment,
    current_period: currentPeriod,
    previous_period: base?.previous_period,
    variation_percent: base?.variation_percent,
  };

  if (base) {
    return {
      ...base,
      target_total: summary.target_total,
      actual_total: summary.actual_total,
      difference: summary.difference,
      fulfillment_percent: summary.fulfillment_percent,
      current_period: summary.current_period,
      previous_period: summary.previous_period,
      variation_percent: summary.variation_percent,
    };
  }

  return summary;
};

const getLeadStateId = (state?: ReportsAdvisorRankingLeadStateItem) =>
  String(state?.state_id ?? state?.id ?? '');

const filterRankingDataset = (
  ranking: ReportsAdvisorRankingResponse | null,
  advisorFilter: string,
  leadStateFilter: string,
): ReportsAdvisorRankingItem[] => {
  if (!ranking?.dataset) {
    return [];
  }

  let dataset = ranking.dataset;

  if (advisorFilter !== 'all') {
    dataset = dataset.filter(item => normalizeAdvisorId(item.advisor_id) === advisorFilter);
  }

  if (leadStateFilter !== 'all') {
    dataset = dataset
      .map(item => {
        const filteredStates = item.lead_states?.filter(state => getLeadStateId(state) === leadStateFilter);
        const total = filteredStates?.reduce((acc, state) => acc + (state?.total ?? 0), 0) ?? 0;
        return {
          ...item,
          lead_states: filteredStates,
          total,
        };
      })
      .filter(item => (item.total ?? 0) > 0);
  }

  return dataset;
};

export default function ReportesPage() {
  const {
    getFunnelReport,
    getTimeseriesReport,
    getAdvisorRanking,
    getHitRateReport,
    getCycleTimeReport,
    getGoalsPerformance,
    getGoals,
    getStageTargets,
    getGoalsResources,
    getReportsFilters,
    getDailyLeadsReport,
    getCountByHourRange,
  } = useReports();

  const [activeSection, setActiveSection] = useState<string>('funnel');
  const [selectedLeadState, setSelectedLeadState] = useState<string>('all');
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>('all');
  const [timeseriesGrouping, setTimeseriesGrouping] = useState<TimeseriesGroupingOption>('AUTO');

  const createInitialFilters = useCallback(() => {
    const presetRange = resolvePresetRange(DEFAULT_FILTERS.intervalPreset);
    return {
      ...DEFAULT_FILTERS,
      closingStageIds: [],
      dateFrom: presetRange?.from,
      dateTo: presetRange?.to,
    } satisfies ReportFiltersState;
  }, []);

  const [filters, setFilters] = useState<ReportFiltersState>(() => createInitialFilters());
  const [appliedFilters, setAppliedFilters] = useState<ReportFiltersState>(() => createInitialFilters());

  const [campaignFilterOptions, setCampaignFilterOptions] = useState<ReportSelectOption[]>([]);
  const [advisorFilterOptions, setAdvisorFilterOptions] = useState<ReportSelectOption[]>([]);
  const [filtersLoading, setFiltersLoading] = useState<boolean>(false);

  const [funnelReport, setFunnelReport] = useState<ReportsFunnelResponse | null>(null);
  const [timeseriesReport, setTimeseriesReport] = useState<ReportsTimeseriesResponse | null>(null);
  const [rankingReport, setRankingReport] = useState<ReportsAdvisorRankingResponse | null>(null);
  const [goalsPerformance, setGoalsPerformance] = useState<ReportsGoalsPerformanceResponse | null>(null);
  const [goalsList, setGoalsList] = useState<ReportsGoalsListItem[]>([]);
  const [stageTargets, setStageTargets] = useState<ReportsStageTargetItem[]>([]);
  const [stageTargetsSummary, setStageTargetsSummary] = useState<ReportsStageTargetSummary | null>(null);
  const [hitRateReport, setHitRateReport] = useState<ReportsHitRateResponse | null>(null);
  const [cycleTimeReport, setCycleTimeReport] = useState<ReportsCycleTimeResponse | null>(null);
  const [dailyLeadsReport, setDailyLeadsReport] = useState<ReportsDailyLeadsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showHourlyAsChart, setShowHourlyAsChart] = useState<boolean>(false);
  const [dailyHourlyData, setDailyHourlyData] = useState<{ date: string; hours: number[] }[] | null>(null);
  const [goalsResources, setGoalsResources] = useState<ReportsGoalsResourcesResponse>({ campaigns: [], advisors: [] });
  const [isGoalsModalMounted, setIsGoalsModalMounted] = useState<boolean>(false);
  const [isGoalsModalVisible, setIsGoalsModalVisible] = useState<boolean>(false);
  const [isStageTargetsModalMounted, setIsStageTargetsModalMounted] = useState<boolean>(false);
  const [isStageTargetsModalVisible, setIsStageTargetsModalVisible] = useState<boolean>(false);
  const [loadingGoalsResources, setLoadingGoalsResources] = useState<boolean>(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setHitRateReport(null);
    setCycleTimeReport(null);
    try {
      const campaignCodigos = appliedFilters.campaignCodigos?.length
        ? Array.from(
            new Set(
              appliedFilters.campaignCodigos.filter(
                (code): code is string => typeof code === 'string' && code.trim().length > 0,
              ),
            ),
          )
        : appliedFilters.campaignCodigo
          ? [appliedFilters.campaignCodigo]
          : undefined;
      const advisorIds = appliedFilters.advisorId ? [appliedFilters.advisorId] : undefined;
      const intervalPresetParam = appliedFilters.intervalPreset !== 'custom'
        ? appliedFilters.intervalPreset?.toUpperCase()
        : undefined;

      const commonFilters = {
        business_id: BUSINESS_ID,
        date_from: appliedFilters.dateFrom,
        date_to: appliedFilters.dateTo,
        interval_preset: intervalPresetParam,
        campaign_codes: campaignCodigos,
        advisor_ids: advisorIds,
        assigned_to_ids: advisorIds,
      };

      const closingStageIds = (appliedFilters.closingStageIds ?? []).filter(value => value !== undefined && value !== null && value !== '');
      const closingStageFilters = closingStageIds.length ? { closing_stage_ids: closingStageIds } : {};

      const metricParam = mapMetricToApi(appliedFilters.metric);
      const timeseriesInterval = resolveTimeseriesInterval(appliedFilters.intervalPreset, timeseriesGrouping);

      const [
        funnelResponse,
        timeseriesResponse,
        rankingResponse,
        goalsPerformanceResponse,
        goalsResponse,
        stageTargetsResponse,
        hitRateResponse,
        cycleTimeResponse,
      ] =
        await Promise.all([
          getFunnelReport(commonFilters, false),
          getTimeseriesReport({ ...commonFilters, metric: metricParam, interval: timeseriesInterval }, false),
          getAdvisorRanking({ ...commonFilters, metric: metricParam}, false),
          getGoalsPerformance({ ...commonFilters, metric: metricParam }, false),
          getGoals(commonFilters, false),
          getStageTargets(commonFilters, false),
          getHitRateReport({ ...commonFilters, ...closingStageFilters }, false),
          getCycleTimeReport({ ...commonFilters, ...closingStageFilters }, false),
        ]);

      setFunnelReport(funnelResponse.data);
      setTimeseriesReport(timeseriesResponse.data);
      setRankingReport(rankingResponse.data);
      setGoalsPerformance(goalsPerformanceResponse.data);
      const rawGoalsData = goalsResponse.data;
      const normalizedGoalsList = Array.isArray(rawGoalsData?.data)
        ? rawGoalsData.data
        : Array.isArray(rawGoalsData?.goals)
          ? rawGoalsData.goals
          : Array.isArray(goalsPerformanceResponse.data?.goals)
            ? goalsPerformanceResponse.data.goals
            : [];
      const filteredGoalsList = normalizedGoalsList.filter(goal => goalMatchesFilters(goal, appliedFilters));
      setGoalsList(filteredGoalsList);

      const rawStageTargets = stageTargetsResponse.data;
      const normalizedStageTargets = normalizeStageTargetsResponse(rawStageTargets);
      const filteredStageTargets = normalizedStageTargets.filter((target: ReportsStageTargetItem) =>
        stageTargetMatchesFilters(target, appliedFilters),
      );
      setStageTargets(filteredStageTargets);
      setStageTargetsSummary(rawStageTargets?.summary ?? null);
      setHitRateReport(hitRateResponse.data ?? null);
      setCycleTimeReport(cycleTimeResponse.data ?? null);

      try {
        const dailyResponse = await getDailyLeadsReport(commonFilters, false);
        setDailyLeadsReport(dailyResponse?.data ?? null);
      } catch (dailyError) {
        console.warn('Reporte diario de leads no disponible', dailyError);
        setDailyLeadsReport(null);
      }

      setSelectedLeadState('all');
      setSelectedAdvisor('all');

      // Load hourly data
      if (appliedFilters.dateFrom && appliedFilters.dateTo) {
        const startDate = dayjs(appliedFilters.dateFrom);
        const endDate = dayjs(appliedFilters.dateTo);
        const numDays = endDate.diff(startDate, 'day') + 1;
        // No limit for now, assuming backend handles it
        try {
          const days: string[] = [];
          for (let d = startDate.clone(); d.isBefore(endDate) || d.isSame(endDate, 'day'); d = d.add(1, 'day')) {
            days.push(d.format('YYYY-MM-DD'));
          }

          const promises = days.map(date => {
            const filters: any = {
              date_from: date,
              date_to: date,
              business_id: BUSINESS_ID,
            };
            if (appliedFilters.campaignCodigos?.length) {
              filters.campaign_code = appliedFilters.campaignCodigos[0];
            }
            if (appliedFilters.advisorId) {
              filters.assigned_to = appliedFilters.advisorId;
            }
            return getCountByHourRange(filters, false);
          });

          const results = await Promise.all(promises);
          const dailyData = results.map((result, index) => ({
            date: days[index],
            hours: (result?.data as any)?.hours ?? [],
          }));

          setDailyHourlyData(dailyData);
        } catch (hourlyError) {
          console.warn('Error al cargar datos horarios', hourlyError);
          setDailyHourlyData(null);
        }
      } else {
        setDailyHourlyData(null);
      }
    } catch (error) {
      console.error('Error al cargar los reportes', error);
      setHitRateReport(null);
      setCycleTimeReport(null);
      setDailyLeadsReport(null);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, getAdvisorRanking, getCycleTimeReport, getDailyLeadsReport, getFunnelReport, getGoals, getGoalsPerformance, getHitRateReport, getStageTargets, getTimeseriesReport, timeseriesGrouping]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleGlobalFiltersChange = useCallback((partial: Partial<ReportFiltersState>) => {
    setFilters(prev => {
      const next = { ...prev, ...partial };
      if (partial.intervalPreset && partial.intervalPreset !== 'custom') {
        const presetRange = resolvePresetRange(partial.intervalPreset);
        return {
          ...next,
          dateFrom: presetRange?.from,
          dateTo: presetRange?.to,
        };
      }
      if (partial.intervalPreset && partial.intervalPreset === 'custom' && prev.intervalPreset !== 'custom') {
        return {
          ...next,
          dateFrom: undefined,
          dateTo: undefined,
        };
      }
      return next;
    });
  }, []);

  const handleClosingStagesChange = useCallback(
    (nextClosingStageIds: string[]) => {
      const sanitized = nextClosingStageIds.filter(value => value !== undefined && value !== null && value !== '');
      handleGlobalFiltersChange({ closingStageIds: sanitized });
    },
    [handleGlobalFiltersChange],
  );

  const handleApplyFilters = useCallback(() => {
    if (filters.intervalPreset === 'custom' && (!filters.dateFrom || !filters.dateTo)) {
      SweetAlert.warning('Rango incompleto', 'Selecciona un rango de fechas para aplicar el filtro personalizado.');
      return;
    }

    const presetRange = filters.intervalPreset !== 'custom' ? resolvePresetRange(filters.intervalPreset) : null;
    const nextFilters: ReportFiltersState = {
      ...filters,
      campaignCodigos: [...(filters.campaignCodigos ?? [])],
      closingStageIds: [...(filters.closingStageIds ?? [])],
      dateFrom: filters.intervalPreset === 'custom' ? filters.dateFrom : presetRange?.from,
      dateTo: filters.intervalPreset === 'custom' ? filters.dateTo : presetRange?.to,
    };
    setAppliedFilters(nextFilters);
    setSelectedLeadState('all');
    setSelectedAdvisor('all');
    setTimeseriesGrouping('AUTO');
  }, [filters]);

  const handleResetFilters = useCallback(() => {
    const initial = createInitialFilters();
    setFilters(initial);
    setAppliedFilters(initial);
    setSelectedLeadState('all');
    setSelectedAdvisor('all');
    setTimeseriesGrouping('AUTO');
  }, [createInitialFilters]);

  const handleTimeseriesGroupingChange = useCallback((grouping: TimeseriesGroupingOption) => {
    setTimeseriesGrouping(grouping);
  }, []);

  const loadFiltersCatalog = useCallback(async () => {
    setFiltersLoading(true);
    try {
      const response = await getReportsFilters({ business_id: BUSINESS_ID }, false);
      const data = response?.data;
      setCampaignFilterOptions(selectableToOptions(data?.campaigns));
      setAdvisorFilterOptions(selectableToOptions(data?.advisors));
      return;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;

      if (status === 404) {
        try {
          const fallback = await getGoalsResources({ business_id: BUSINESS_ID }, false);
          const fallbackData = fallback?.data;
          setCampaignFilterOptions(selectableToOptions(fallbackData?.campaigns));
          setAdvisorFilterOptions(selectableToOptions(fallbackData?.advisors));
          return;
        } catch (fallbackError) {
          console.error('Error al cargar catálogos de filtros (fallback)', fallbackError);
        }
      }

      console.error('Error al cargar catálogos de filtros', error);
      SweetAlert.error('Error', 'No se pudieron cargar los filtros disponibles.');
    } finally {
      setFiltersLoading(false);
    }
  }, [getGoalsResources, getReportsFilters]);

  useEffect(() => {
    loadFiltersCatalog();
  }, [loadFiltersCatalog]);

  const closingStageOptions = useMemo<ReportSelectOption[]>(() => {
    const registry = new Map<string, string>();

    const registerStage = (id: string | number | null | undefined, label?: string) => {
      if (id === null || id === undefined || id === '') {
        return;
      }
      const key = String(id);
      if (!registry.has(key)) {
        registry.set(key, label ?? `Estado ${key}`);
      }
    };

    funnelReport?.stages?.forEach(stage => {
      registerStage(stage.id, stage.name);
    });

    hitRateReport?.summary?.stage_totals?.forEach(stage => {
      registerStage(stage.stage_id, stage.stage_name);
    });

    cycleTimeReport?.summary?.closing_stage_ids?.forEach(id => {
      registerStage(id);
    });

    const selectedIds = new Set<string>();
    (filters.closingStageIds ?? []).forEach(value => {
      if (value !== undefined && value !== null && value !== '') {
        selectedIds.add(String(value));
      }
    });
    (appliedFilters.closingStageIds ?? []).forEach(value => {
      if (value !== undefined && value !== null && value !== '') {
        selectedIds.add(String(value));
      }
    });

    selectedIds.forEach(value => {
      if (!registry.has(value)) {
        registry.set(value, `Estado ${value}`);
      }
    });

    return Array.from(registry.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es', { numeric: true, sensitivity: 'base' }));
  }, [appliedFilters.closingStageIds, cycleTimeReport, filters.closingStageIds, funnelReport, hitRateReport]);

  const closingStageLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    closingStageOptions.forEach(option => {
      map.set(option.value, option.label);
    });
    return map;
  }, [closingStageOptions]);

  const selectedClosingStageLabels = useMemo(() => {
    const selection = appliedFilters.closingStageIds ?? [];
    if (!selection.length) {
      return [] as string[];
    }
    return selection.map(value => closingStageLabelMap.get(value) ?? `Estado ${value}`);
  }, [appliedFilters.closingStageIds, closingStageLabelMap]);

  const loadGoalsResources = useCallback(async () => {
    setLoadingGoalsResources(true);
    try {
      const response = await getGoalsResources({ business_id: BUSINESS_ID }, false);
      const data = response?.data;
      setGoalsResources({
        campaigns: data?.campaigns ?? [],
        advisors: data?.advisors ?? [],
      });
      return true;
    } catch (error) {
      console.error('Error al cargar recursos de metas', error);
      SweetAlert.error('Error', 'No se pudieron cargar los datos para gestionar metas.');
      return false;
    } finally {
      setLoadingGoalsResources(false);
    }
  }, [getGoalsResources]);

  const handleOpenGoalsManager = useCallback(async () => {
    if (loadingGoalsResources) {
      return;
    }

    const success = await loadGoalsResources();
    if (!success) {
      return;
    }

    setIsGoalsModalMounted(true);
    setIsGoalsModalVisible(true);
  }, [loadGoalsResources, loadingGoalsResources]);

  const handleGoalsManagerClose = useCallback(() => {
    setIsGoalsModalVisible(false);
  }, []);

  const handleGoalsModalUnmount = useCallback(() => {
    setIsGoalsModalMounted(false);
  }, []);

  const handleGoalChanged = useCallback(() => {
    loadReports();
  }, [loadReports]);

  const handleOpenStageTargetsManager = useCallback(async () => {
    if (loadingGoalsResources) {
      return;
    }

    const success = await loadGoalsResources();
    if (!success) {
      return;
    }

    setIsStageTargetsModalMounted(true);
    setIsStageTargetsModalVisible(true);
  }, [loadGoalsResources, loadingGoalsResources]);

  const handleStageTargetsManagerClose = useCallback(() => {
    setIsStageTargetsModalVisible(false);
  }, []);

  const handleStageTargetsModalUnmount = useCallback(() => {
    setIsStageTargetsModalMounted(false);
  }, []);

  const handleStageTargetChanged = useCallback(() => {
    loadReports();
  }, [loadReports]);

  const aggregatedGoalsSummary = useMemo(
    () => aggregateGoalsSummary(goalsList, goalsPerformance?.summary, stageTargets, funnelReport?.summary?.current_period?.total),
    [goalsList, goalsPerformance, stageTargets, funnelReport],
  );

  const funnelStages = useMemo(() => extractFunnelStages(funnelReport), [funnelReport]);

  const stageTargetsInsights = useMemo(
    () => buildStageTargetsInsights(funnelStages, stageTargets),
    [funnelStages, stageTargets],
  );

  const summaryCards = useMemo<SummaryCardConfig[]>(() => {
    const funnelSummary = funnelReport?.summary;
    const totalLeads = funnelSummary?.total_leads ?? 0;
    const totalStages = funnelSummary?.total_stages ?? 0;
    const currentPeriod = funnelSummary?.current_period;
    const previousPeriod = funnelSummary?.previous_period;
    const goalsSummary = aggregatedGoalsSummary;
    const rankingDataset = rankingReport?.dataset ?? [];
    const topAdvisor = rankingDataset.length > 0 ? rankingDataset[0] : null;
    const hitRateSummary = hitRateReport?.summary ?? null;
    const cycleSummary = cycleTimeReport?.summary ?? null;

    const closingStateIdSet = new Set<string>();
    const closingStateNameSet = new Set<string>();

    (appliedFilters.closingStageIds ?? []).forEach(id => {
      if (id !== undefined && id !== null && id !== '') {
        closingStateIdSet.add(String(id));
      }
    });

    if (Array.isArray(hitRateSummary?.closing_stage_ids)) {
      hitRateSummary!.closing_stage_ids!.forEach(id => {
        if (id !== undefined && id !== null && id !== '') {
          closingStateIdSet.add(String(id));
        }
      });
    }

    if (Array.isArray(hitRateSummary?.closing_estado_finales)) {
      hitRateSummary!.closing_estado_finales!.forEach(code => {
        if (code !== undefined && code !== null && code !== '') {
          closingStateNameSet.add(String(code).toLowerCase());
        }
      });
    }

    if (closingStateIdSet.size === 0 && Array.isArray(rankingReport?.states)) {
      rankingReport!.states!.forEach(state => {
        const normalizedName = (state.name ?? '').toLowerCase();
        if (!normalizedName) {
          return;
        }
        if (normalizedName.includes('venta') || normalizedName.includes('ganad') || normalizedName.includes('cierre')) {
          if (state.id !== undefined && state.id !== null && state.id !== '') {
            closingStateIdSet.add(String(state.id));
          }
          if (state.code !== undefined && state.code !== null && state.code !== '') {
            closingStateNameSet.add(String(state.code).toLowerCase());
          }
        }
      });
    }

    const closingKeywordSet = new Set<string>(['venta', 'ganad', 'cerrad', 'cierre']);
    const selectedClosingNames = new Set<string>(selectedClosingStageLabels.map(label => label.toLowerCase()));

    const closingStatesFromCatalog = Array.isArray(rankingReport?.states)
      ? rankingReport!.states!
          .filter(state => {
            const idMatch = state.id !== undefined && state.id !== null && closingStateIdSet.has(String(state.id));
            const nameMatch = selectedClosingNames.has((state.name ?? '').toLowerCase());
            return idMatch || nameMatch;
          })
          .map(state => state.name)
          .filter((name): name is string => Boolean(name))
      : [];

    const closingLabel = selectedClosingStageLabels.length
      ? selectedClosingStageLabels.join(', ')
      : closingStatesFromCatalog.length
        ? closingStatesFromCatalog.join(', ')
        : 'Leads cerrados';

    const advisorsWithClosingTotals = rankingDataset.map(advisorItem => {
      const closingLeads = (advisorItem.lead_states ?? []).reduce((acc, state) => {
        const stateId = state?.state_id ?? state?.id ?? null;
        const normalizedStateId = stateId != null ? String(stateId) : '';
        const normalizedStateName = (state?.state_name ?? state?.name ?? '').toLowerCase();

        const matchesId = normalizedStateId && closingStateIdSet.has(normalizedStateId);
        const matchesNameCatalog = normalizedStateName && selectedClosingNames.has(normalizedStateName);
        const matchesNameKeyword = normalizedStateName
          ? Array.from(closingKeywordSet).some(keyword => normalizedStateName.includes(keyword))
          : false;

        if (matchesId || matchesNameCatalog || matchesNameKeyword) {
          return acc + (Number(state?.total ?? 0) || 0);
        }

        if (normalizedStateName && closingStateNameSet.has(normalizedStateName)) {
          return acc + (Number(state?.total ?? 0) || 0);
        }

        return acc;
      }, 0);

      return {
        advisor: advisorItem,
        closingLeads,
      };
    });

  const topCloserEntry = sortByNumberDesc(advisorsWithClosingTotals, item => item.closingLeads)[0] ?? null;
  const hasAdvisorWithClosings = topCloserEntry != null && topCloserEntry.closingLeads > 0;

    const cards: SummaryCardConfig[] = [
      {
        title: currentPeriod?.label ? `Leads · ${currentPeriod.label}` : 'Leads totales',
        value: formatInteger(currentPeriod?.total ?? totalLeads),
        subtitle: previousPeriod
          ? `Anterior${previousPeriod.label ? ` · ${previousPeriod.label}` : ''}: ${formatInteger(previousPeriod.total ?? 0)} leads`
          : `${totalStages} etapas analizadas en el embudo`,
        icon: <Users size={20} />,
      },
      {
        title: 'Cumplimiento de metas',
        value: `${formatPercentOneDecimal(goalsSummary?.fulfillment_percent ?? 0)}%`,
        subtitle: `Meta mensual: ${formatInteger(goalsSummary?.target_total ?? 0)} · Avance real: ${formatInteger(
          goalsSummary?.actual_total ?? 0,
        )}`,
        icon: <Target size={20} />,
      },
      {
        title: 'Ranking de leads por asesor',
        value: topAdvisor ? topAdvisor.advisor_name : 'Sin datos',
        subtitle: topAdvisor
          ? `${formatInteger(topAdvisor.total ?? 0)} leads `
          : 'Comparte métricas agregadas por asesor para habilitar el ranking',
        icon: <Activity size={20} />,
      },
    ];

    cards.push({
      title: 'Top asesor con leads cerrados',
      value: hasAdvisorWithClosings
        ? topCloserEntry?.advisor?.advisor_name ?? 'Asesor destacado'
        : 'Sin ventas de asesores registradas',
      subtitle: hasAdvisorWithClosings
        ? `${formatInteger(topCloserEntry?.closingLeads ?? 0)} leads en ${closingLabel} · ${
            rankingReport?.history_interval_label ?? 'Periodo reciente'
          }`
        : 'No se registran leads cerrados en el intervalo seleccionado.',
      icon: <Trophy size={20} />,
    });

    if (hitRateSummary) {
      const hitRatePercent = typeof hitRateSummary.hit_rate === 'number' ? hitRateSummary.hit_rate * 100 : null;
      cards.push({
        title: 'Hit Rate',
        value: hitRatePercent != null ? `${formatPercentOneDecimal(hitRatePercent)}%` : '0%',
        subtitle: `${formatInteger(hitRateSummary.closing_leads ?? 0)} cierres de ${formatInteger(
          hitRateSummary.total_leads ?? 0,
        )} leads`,
        icon: <TrendingUp size={20} />,
      });
    }

    if (cycleSummary) {
      cards.push({
        title: 'Tiempo promedio de cierre',
        value: formatCycleDurationLabel(cycleSummary.average_hours),
        subtitle: `P90: ${formatCycleDurationLabel(cycleSummary.percentile_90_hours)} · ${formatInteger(
          cycleSummary.total_leads ?? 0,
        )} leads`,
        icon: <Timer size={20} />,
      });
    }

    return cards;
  }, [aggregatedGoalsSummary, appliedFilters.closingStageIds, cycleTimeReport, funnelReport, hitRateReport, rankingReport, selectedClosingStageLabels]);

  const goalSummaryCards = useMemo(
    () => buildGoalsSummaryCards(aggregatedGoalsSummary),
    [aggregatedGoalsSummary],
  );

  const goalsChartDataset = useMemo(
    () => buildGoalsChartDataset(goalsPerformance, appliedFilters),
    [goalsPerformance, appliedFilters],
  );

  const goalsStatusChips = useMemo(
    () => buildGoalStatusChips(goalsPerformance, appliedFilters),
    [goalsPerformance, appliedFilters],
  );

  const rankingDataset = useMemo(
    () => filterRankingDataset(rankingReport, selectedAdvisor, selectedLeadState),
    [rankingReport, selectedAdvisor, selectedLeadState],
  );

  const rankingAdvisorOptions = useMemo(
    () => [{ value: 'all', label: 'Todos' }, ...uniqueAdvisorOptions(rankingReport?.dataset ?? [])],
    [rankingReport],
  );

  const leadStateOptions = useMemo(
    () => [
      { value: 'all', label: 'Todos' },
      ...(rankingReport?.states ?? []).map(state => ({ value: String(state.id), label: state.name })),
    ],
    [rankingReport],
  );

  const hourlyTrendDataset = useMemo(() => {
    return dailyHourlyData;
  }, [dailyHourlyData]);

  const warningMessages = useMemo(() => {
    const warnings: string[] = [];
   /* if (!goalsList.length) {
      warnings.push('Registra metas comerciales desde gestión metas para comparar Meta vs Real.');
    }
   /* if (!rankingReport?.dataset?.length) {
      warnings.push('Expone métricas agregadas por asesor en el endpoint /reports/advisors/ranking.');
    }
    if (!timeseriesReport?.values?.some(value => value > 0)) {
      warnings.push('El endpoint de series de tiempo todavía no devuelve datos para el intervalo seleccionado.');
    }*/
    return warnings;
  }, [goalsList.length, rankingReport, timeseriesReport]);

  const filterSummaryChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    const preset = INTERVAL_PRESETS.find(option => option.value === appliedFilters.intervalPreset);
    if (appliedFilters.intervalPreset === 'custom' && appliedFilters.dateFrom && appliedFilters.dateTo) {
      chips.push({ key: 'interval', label: `Del ${appliedFilters.dateFrom} al ${appliedFilters.dateTo}` });
    } else if (preset) {
      chips.push({ key: 'interval', label: preset.label });
    }

    const selectedCampaignCodes = appliedFilters.campaignCodigos?.length
      ? appliedFilters.campaignCodigos
      : appliedFilters.campaignCodigo
        ? [appliedFilters.campaignCodigo]
        : [];

    if (selectedCampaignCodes.length) {
      const campaignLabel = selectedCampaignCodes
        .map(code => campaignFilterOptions.find(option => option.value === code)?.label ?? code)
        .join(', ');
      chips.push({ key: 'campaign', label: `Campaña: ${campaignLabel}` });
    }

    if (appliedFilters.advisorId) {
      const advisorLabel = advisorFilterOptions.find(option => option.value === appliedFilters.advisorId)?.label ?? 'Asesor seleccionado';
      chips.push({ key: 'advisor', label: `Asesor: ${advisorLabel}` });
    }

    if (appliedFilters.metric) {
      const metricLabel = METRIC_OPTIONS.find(option => option.value === appliedFilters.metric)?.label ?? appliedFilters.metric;
      chips.push({ key: 'metric', label: `Métrica: ${metricLabel}` });
    }

    if (appliedFilters.closingStageIds?.length) {
      const closingLabel = appliedFilters.closingStageIds
        .map(value => closingStageLabelMap.get(value) ?? `Estado ${value}`)
        .join(', ');
      chips.push({ key: 'closing-stages', label: `Cierre: ${closingLabel}` });
    }

    return chips;
  }, [advisorFilterOptions, appliedFilters, campaignFilterOptions, closingStageLabelMap]);

  const filterContextTitle = useMemo(() => 'Filtros aplicados', []);

  const filterContextLines = useMemo(() => {
    const baseLines = filterSummaryChips.map(chip => `• ${chip.label}`);
    const lines = baseLines.length === 0 ? ['• Sin filtros adicionales'] : [...baseLines];

    if (aggregatedGoalsSummary) {
      const targetTotal = Number(aggregatedGoalsSummary.target_total ?? 0);
      const actualTotal = Number(aggregatedGoalsSummary.actual_total ?? 0);
      const fulfillment = aggregatedGoalsSummary.fulfillment_percent;
      const metaLabel = fulfillment != null
        ? `Meta vigente: ${formatInteger(targetTotal)} · Avance: ${formatInteger(actualTotal)} (${formatPercentOneDecimal(fulfillment)}%)`
        : `Meta vigente: ${formatInteger(targetTotal)} · Avance: ${formatInteger(actualTotal)}`;
      lines.push(`• ${metaLabel}`);
    }

    return lines;
  }, [aggregatedGoalsSummary, filterSummaryChips]);

  const accordionSections = useMemo<ReportAccordionSection[]>(
    () => [
      {
        key: 'funnel',
        title: 'Embudo de conversión',
        description: 'Analiza la caída de leads en cada etapa',
        icon: <TrendingUp size={18} />,
      },
      {
        key: 'segmentador',
        title: 'Reporte segmentador',
        description: 'Detalle diario de leads por campaña y asesor',
        icon: <Table size={18} />,
      },
      /*{
        key: 'goals',
        title: 'Metas comerciales',
        description: 'Seguimiento Meta vs Real con indicadores clave',
        icon: <Target size={18} />,
      },*/
      {
        key: 'hit-rate',
        title: 'Hit Rate',
        description: 'Conoce la tasa de cierre general y por asesor',
        icon: <Trophy size={18} />,
      },
      {
        key: 'cycle-time',
        title: 'Tiempo de ciclo',
        description: 'Cuánto demoran los leads desde creación hasta venta',
        icon: <Timer size={18} />,
      },
      {
        key: 'trends',
        title: 'Tendencias',
        description: 'Explora el comportamiento histórico por intervalo',
        icon: <LineChart size={18} />,
      },
      {
        key: 'ranking',
        title: 'Ranking de asesores',
        description: 'Identifica al top y oportunidades de coaching',
        icon: <Activity size={18} />,
      },
    ],
    [],
  );

  const topPerformers = useMemo(
    () => sortByNumberDesc(rankingDataset, advisor => advisor.total ?? 0).slice(0, 5),
    [rankingDataset],
  );

  const renderFunnelSection = () => {
    const baseStages = funnelStages;
    if (!baseStages.length) {
      return <ReportNoData message="El embudo aún no cuenta con conversiones registradas." />;
    }

    const actualStageValues = mapStageValues(baseStages, 'actual');
    const totalActualLeads = actualStageValues.reduce(
      (acc, stage, index) =>
        index === 0 ? acc : acc + (Number(stage.value) || 0),
      0,
    );
    const baselineFirstStageValue = Number(actualStageValues[0]?.value ?? 0);
    const normalizedFirstStageValue = totalActualLeads > 0 ? totalActualLeads : baselineFirstStageValue;
    const actualLeadStates = convertToLeadStates(
      actualStageValues.map((stage, index) =>
        index === 0
          ? {
              ...stage,
              value: normalizedFirstStageValue,
            }
          : stage,
      ),
    );

    const hasPerStageMeta = baseStages.some(stage => stage.meta != null);
    let metaStages = hasPerStageMeta
      ? mapStageValues(baseStages, 'meta')
      : scaleStagesToTotal(baseStages, aggregatedGoalsSummary?.target_total ?? funnelReport?.summary?.target_total);

    if (!hasPerStageMeta) {
      const stageTargetMetaCandidates = stageTargetsInsights.insights.filter(item => (item.target ?? 0) > 0);
      if (stageTargetMetaCandidates.length) {
        metaStages = stageTargetMetaCandidates.map(candidate => ({
          id: candidate.stageId ?? null,
          name: candidate.label,
          value: candidate.target,
        }));
      }
    }

    const hasPerStageComparison = baseStages.some(stage => stage.comparison != null);
    const comparisonStages = hasPerStageComparison
      ? mapStageValues(baseStages, 'comparison')
      : null;

    const metaLeadStates = metaStages ? convertToLeadStates(metaStages) : null;

    const referenceStageMap = new Map<string, number>();

    if (metaStages) {
      metaStages.forEach(stage => {
        const key = buildStageKey(stage.id, stage.name);
        if (key) {
          referenceStageMap.set(key, Number(stage.value ?? 0) || 0);
        }
      });
    }

    if (comparisonStages) {
      comparisonStages.forEach(stage => {
        const key = buildStageKey(stage.id, stage.name);
        if (key && !referenceStageMap.has(key)) {
          referenceStageMap.set(key, Number(stage.value ?? 0) || 0);
        }
      });
    }

    const comparisonLeadStates: LeadState[] = baseStages.map(stage => {
      const key = getStageKeyFromValue(stage);
      const referenceValue = key ? referenceStageMap.get(key) : undefined;
      const metaValue = referenceValue ?? (stage.meta != null ? Number(stage.meta) : undefined);

      return {
        name: stage.name,
        real: stage.actual,
        meta: metaValue ?? stage.actual,
      } satisfies LeadState;
    });

    const actualTotal = sumStageValues(baseStages, 'actual');
    const metaTotal = sumStagePairs(metaStages);
  const comparisonTotal = sumStagePairs(comparisonStages);
    const referenceTotal = metaTotal ?? comparisonTotal;
    const comparisonEffectivenessPercent = referenceTotal && referenceTotal > 0
      ? (actualTotal / referenceTotal) * 100
      : null;
  const firstStageValue = normalizedFirstStageValue;
    const lastStageValue = baseStages[baseStages.length - 1]?.actual ?? 0;

    const funnelFulfillmentPercent = metaTotal && metaTotal > 0 ? (actualTotal / metaTotal) * 100 : null;
    const funnelVariationPercent = comparisonTotal && comparisonTotal > 0 ? ((actualTotal - comparisonTotal) / comparisonTotal) * 100 : null;
    const closingEffectivenessPercent = firstStageValue > 0 ? (lastStageValue / firstStageValue) * 100 : null;

    const actualMetrics = [
      { label: 'Leads actuales', value: formatInteger(actualTotal) },
    ];

    const metaMetrics = metaTotal
      ? [
          { label: 'Leads meta', value: formatInteger(metaTotal) },
          {
            label: 'Brecha con la meta',
            value: `${formatInteger(Math.max(metaTotal - actualTotal, 0))} leads`,
          },
        ]
      : [];

    const comparisonMetrics: { label: string; value: string; highlight?: boolean }[] = [
      { label: 'Leads reales', value: formatInteger(actualTotal) },
    ];

    if (referenceTotal != null) {
      const referenceLabel = metaTotal != null ? 'Leads meta' : 'Leads referencia';
      const difference = actualTotal - referenceTotal;
      const differenceLabel = difference >= 0 ? 'Exceso vs referencia' : 'Brecha vs referencia';

      comparisonMetrics.push({ label: referenceLabel, value: formatInteger(referenceTotal) });
      comparisonMetrics.push({
        label: differenceLabel,
        value: `${formatInteger(Math.abs(difference))} leads`,
        highlight: difference >= 0,
      });

      if (comparisonEffectivenessPercent !== null) {
        comparisonMetrics.push({
          label: 'Cumplimiento',
          value: `${formatPercentOneDecimal(comparisonEffectivenessPercent)}%`,
          highlight: comparisonEffectivenessPercent >= 100,
        });
      }
    }

    /*if (funnelVariationPercent !== null) {
      comparisonMetrics.push({
        label: 'Variación vs periodo anterior',
        value: `${formatPercentOneDecimal(funnelVariationPercent)}%`,
        highlight: funnelVariationPercent >= 0,
      });
    }*/

    const comparisonLabel = metaTotal != null
      ? 'Meta seleccionada'
      : funnelReport?.summary?.previous_period?.label ?? 'Periodo anterior';

    const funnelCards: { key: string; node: React.ReactNode }[] = [];

    if (metaLeadStates) {
      funnelCards.push({
        key: 'meta',
        node: (
          <DownloadableFunnelCard
            title="Embudo meta"
            description="Metas declaradas por etapa para el periodo."
            leadStates={metaLeadStates}
            metrics={metaMetrics}
            downloadFilename={`funnel-meta-${appliedFilters.intervalPreset}.png`}
            footerTitle={filterContextTitle}
            footerLines={filterContextLines}
            /*effectiveness={
              funnelFulfillmentPercent !== null
                ? {
                    label: 'Avance vs meta',
                    percent: funnelFulfillmentPercent,
                    helperText: 'Comparado contra la meta declarada total.',
                  }
                : undefined
            }*/
          />
        ),
      });
    }

    funnelCards.push({
      key: 'comparison',
      node: (
        <DownloadableFunnelCard
          title="Embudo comparación"
          description={`Real vs ${comparisonLabel}`}
          leadStates={comparisonLeadStates}
          metrics={comparisonMetrics}
          downloadFilename={`funnel-comparacion-${appliedFilters.intervalPreset}.png`}
          footerTitle={filterContextTitle}
          footerLines={filterContextLines}
          /*effectiveness={
            comparisonEffectivenessPercent !== null
              ? {
                  label: 'Cumplimiento vs referencia',
                  percent: comparisonEffectivenessPercent,
                  helperText: metaTotal != null
                    ? 'Comparación directa entre el avance real y la meta declarada.'
                    : 'Comparado contra el periodo de referencia disponible.',
                }
              : undefined
          }*/
        />
      ),
    });

    funnelCards.push({
      key: 'actual',
      node: (
        <DownloadableFunnelCard
          title="Embudo real"
          description="Valores actuales con comparación contra la meta."
          leadStates={actualLeadStates}
          metrics={actualMetrics}
          downloadFilename={`funnel-real-${appliedFilters.intervalPreset}.png`}
          footerTitle={filterContextTitle}
          footerLines={filterContextLines}
          /*effectiveness={
            closingEffectivenessPercent !== null
              ? {
                  label: 'Cierre sobre ingresos',
                  percent: closingEffectivenessPercent,
                  helperText: 'Porcentaje de leads que llegan a venta sobre los ingresados.',
                }
              : undefined
          }*/
        />
      ),
    });

    const columnClass = funnelCards.length === 1
      ? 'col-12 col-md-8 col-xl-6'
      : funnelCards.length === 2
        ? 'col-12 col-md-6 col-xl-5'
        : 'col-12 col-md-6 col-xl-4';

    const stageTargetsView = stageTargetsInsights.insights.map(item => ({
      key: item.key,
      label: item.label,
      stageId: item.stageId,
      actual: item.actual,
      target: item.target,
      difference: item.difference,
      fulfillment: item.fulfillment,
      count: item.items.length,
    }));

    return (
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <ReportStageTargetsOverview
            dataset={stageTargetsInsights.dataset}
            insights={stageTargetsView}
            totals={stageTargetsInsights.totals}
            summary={stageTargetsSummary ?? undefined}
            footerTitle={filterContextTitle}
            footerLines={filterContextLines}
            onManageStageTargets={handleOpenStageTargetsManager}
            controlsSlot={
              loadingGoalsResources ? <span className="text-muted small">Cargando recursos…</span> : undefined
            }
          />
          <div className="d-flex flex-wrap gap-2 mb-3">
            {funnelReport?.summary?.current_period && (
              <span className="badge bg-primary-subtle text-primary-emphasis">
                Periodo actual · {funnelReport.summary.current_period.label ?? 'N/A'} ·{' '}
                {formatInteger(funnelReport.summary.current_period.total ?? 0)} leads
              </span>
            )}
            {funnelReport?.summary?.previous_period && (
              <span className="badge bg-light text-muted">
                Anterior · {funnelReport.summary.previous_period.label ?? 'N/A'} ·{' '}
                {formatInteger(funnelReport.summary.previous_period.total ?? 0)} leads
              </span>
            )}
            {typeof funnelReport?.summary?.variation_percent === 'number' && (
              <span
                className={`badge ${
                  (funnelReport.summary.variation_percent ?? 0) >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
                }`}
              >
                Variación: {formatPercentOneDecimal(funnelReport.summary.variation_percent)}%
              </span>
            )}
          </div>
          <div className="row g-3 justify-content-center align-items-stretch">
            {funnelCards.map(card => (
              <div key={card.key} className={`${columnClass} d-flex`}>
                <div className="w-100">{card.node}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGoalsSection = () => {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <ReportGoalsOverview
            chartDataset={goalsChartDataset}
            statusChips={goalsStatusChips}
            goalsList={goalsList}
            onManageGoals={handleOpenGoalsManager}
            controlsSlot={
              loadingGoalsResources ? (
                <span className="text-muted small">Cargando recursos…</span>
              ) : undefined
            }
            footerTitle={filterContextTitle}
            footerLines={filterContextLines}
          />
        </div>
      </div>
    );
  };

  const renderTrendsSection = () => {
    if (!timeseriesReport?.values?.length) {
      return <ReportNoData message="La serie de tiempo aún no devuelve datos para esta métrica." />;
    }

    const groupingOptions: TimeseriesGroupingOption[] = ['AUTO', 'DAY', 'WEEK', 'MONTH'];
    const intervalLabelMap: Record<TimeseriesGroupingOption, string> = {
      AUTO: 'Automático',
      DAY: 'Día',
      WEEK: 'Semana',
      MONTH: 'Mes',
    };
    const effectiveTimeseriesInterval = resolveTimeseriesInterval(appliedFilters.intervalPreset, timeseriesGrouping);
    const intervalDisplayLabel = timeseriesGrouping === 'AUTO'
      ? `${intervalLabelMap.AUTO} · ${intervalLabelMap[effectiveTimeseriesInterval]}`
      : intervalLabelMap[timeseriesGrouping];

    return (
      <div className="d-flex flex-column gap-3">
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-2">
          <div>
            <h6 className="mb-0">Intervalo de tendencia</h6>
            <small className="text-muted">
              Observa la serie completa agrupada por {intervalLabelMap[effectiveTimeseriesInterval].toLowerCase()}.
            </small>
          </div>
          <div className="btn-group" role="group" aria-label="Seleccionar intervalo de tendencia">
            {groupingOptions.map(option => {
              const isActive = timeseriesGrouping === option;
              return (
                <button
                  key={option}
                  type="button"
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleTimeseriesGroupingChange(option)}
                >
                  {intervalLabelMap[option]}
                </button>
              );
            })}
          </div>
        </div>
        <div className="row g-3">
          <div className="col-12 col-xl-6">
            <ReportTrendCard
              title="Leads por periodo"
              description={`Métrica: ${METRIC_OPTIONS.find(option => option.value === appliedFilters.metric)?.label ?? appliedFilters.metric} · Intervalo: ${intervalDisplayLabel}`}
              dataset={timeseriesReport}
              footerTitle={filterContextTitle}
              footerLines={filterContextLines}
            />
          </div>
          <div className="col-12 col-xl-6">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body d-flex flex-column gap-3">
                <h6 className="mb-0">Distribución por etapa</h6>
                {funnelReport?.stages?.length ? (
                  <ReportChart
                    title="Leads por estado"
                    fullWidth
                    type="pie"
                    height={180}
                    data={{
                      labels: funnelReport.stages.map(stage => stage.name),
                      datasets: [
                        {
                          label: 'Leads',
                          data: funnelReport.stages.map(stage => stage.total ?? 0),
                          backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF',
                            '#FF9F40',
                            '#C9CBCF',
                            '#4BC0C0',
                            '#FF6384',
                            '#36A2EB',
                          ],
                          borderColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF',
                            '#FF9F40',
                            '#C9CBCF',
                            '#4BC0C0',
                            '#FF6384',
                            '#36A2EB',
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    showDataLabels
                    enableDownload
                    downloadFilename={`funnel-distribucion-${appliedFilters.intervalPreset}.png`}
                    downloadLabel="Descargar PNG"
                    dataLabelFormatter={(value: number, context: any) => {
                      const dataset = context?.chart?.data?.datasets?.[0]?.data ?? [];
                      const total = Array.isArray(dataset)
                        ? dataset.reduce((acc: number, item: number) => acc + (Number(item) || 0), 0)
                        : 0;
                      if (!total) {
                        return value.toLocaleString('es-PE');
                      }
                      const percent = total > 0 ? ((Number(value) || 0) / total) * 100 : 0;
                      return `${Number(value || 0).toLocaleString('es-PE')} (${percent.toFixed(1)}%)`;
                    }}
                    footerTitle={filterContextTitle}
                    footerLines={filterContextLines}
                  />
                ) : (
                  <div className="text-muted">No hay suficientes datos para el gráfico de distribución.</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-12">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body d-flex flex-column gap-3">
                <h6 className="mb-0">Leads por día y hora</h6>
                <small className="text-muted">Leads creados por fecha y franja horaria.</small>
                <button className="btn btn-sm btn-outline-secondary align-self-start" onClick={() => setShowHourlyAsChart(!showHourlyAsChart)}>
                  {showHourlyAsChart ? <Table size={16} /> : <LineChart size={16} />} {showHourlyAsChart ? 'Ver tabla' : 'Ver gráfico'}
                </button>
                {hourlyTrendDataset ? (
                  showHourlyAsChart ? (
                    <ReportChart
                      title="Leads por hora"
                      fullWidth
                      type="line"
                      height={300}
                      data={{
                        labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
                        datasets: hourlyTrendDataset.map((dayData, index) => ({
                          label: dayData.date,
                          data: dayData.hours,
                          borderColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
                          backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%, 0.1)`,
                          tension: 0.1,
                        })),
                      }}
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            ticks: { autoSkip: true },
                          },
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: (value: number | string) => formatInteger(typeof value === 'number' ? value : Number(value)),
                            },
                          },
                        },
                      }}
                      showDataLabels={false}
                      enableDownload
                      downloadFilename={`leads-por-hora-${appliedFilters.intervalPreset}.png`}
                      downloadLabel="Descargar PNG"
                      footerTitle={filterContextTitle}
                      footerLines={filterContextLines}
                    />
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm table-striped">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            {Array.from({ length: 24 }, (_, i) => (
                              <th key={i}>{String(i).padStart(2, '0')}:00</th>
                            ))}
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hourlyTrendDataset.map((dayData, index) => {
                            const dayTotal = dayData.hours.reduce((sum, count) => sum + count, 0);
                            return (
                              <tr key={index}>
                                <td>{dayData.date}</td>
                                {dayData.hours.map((count, hourIndex) => (
                                  <td key={hourIndex} className={count > 0 ? 'bg-danger-subtle fw-bold' : ''}>{formatInteger(count)}</td>
                                ))}
                                <td className={dayTotal > 0 ? 'bg-danger-subtle fw-bold' : ''}><strong>{formatInteger(dayTotal)}</strong></td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td><strong>Total</strong></td>
                            {Array.from({ length: 24 }, (_, hourIndex) => {
                              const total = hourlyTrendDataset.reduce((sum, dayData) => sum + (dayData.hours[hourIndex] || 0), 0);
                              return <td key={hourIndex} className={total > 0 ? 'bg-danger-subtle fw-bold' : ''}><strong>{formatInteger(total)}</strong></td>;
                            })}
                            <td className="bg-danger-subtle fw-bold"><strong>{formatInteger(hourlyTrendDataset.reduce((sum, dayData) => sum + dayData.hours.reduce((s, c) => s + c, 0), 0))}</strong></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )
                ) : (
                  <div className="text-muted">Aún no hay registros suficientes por horario.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRankingSection = () => {
    if (!rankingReport?.dataset?.length) {
      return <ReportNoData message="Aún no contamos con datos de ranking." />;
    }

    return (
      <ReportRankingSection
        data={rankingDataset}
        states={rankingReport.states ?? []}
        metricLabel={
          METRIC_OPTIONS.find(option => option.value === appliedFilters.metric)?.label
          ?? appliedFilters.metric
          ?? 'Métrica seleccionada'
        }
        leadState={selectedLeadState}
        onLeadStateChange={setSelectedLeadState}
        leadStateOptions={leadStateOptions}
    advisor={selectedAdvisor}
    onAdvisorChange={setSelectedAdvisor}
    advisorOptions={rankingAdvisorOptions}
        stackedHeight={320}
        baseFiltersTitle={filterContextTitle}
        baseFiltersLines={filterContextLines}
      />
    );
  };

  const renderHitRateSection = () => (
    <ReportHitRateSection
      data={hitRateReport}
      filtersTitle={filterContextTitle}
      filtersLines={filterContextLines}
      closingStageLabels={selectedClosingStageLabels}
    />
  );

  const renderCycleTimeSection = () => (
    <ReportCycleTimeSection
      data={cycleTimeReport}
      filtersTitle={filterContextTitle}
      filtersLines={filterContextLines}
      closingStageLabels={selectedClosingStageLabels}
    />
  );

  const renderSegmentadorSection = () => (
    <ReportDailyLeadsTable
      records={dailyLeadsReport?.records ?? []}
      summary={dailyLeadsReport?.summary}
      filtersTitle={filterContextTitle}
      filtersLines={filterContextLines}
    />
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'segmentador':
        return renderSegmentadorSection();
      case 'funnel':
        return renderFunnelSection();
      case 'goals':
        return renderGoalsSection();
      case 'hit-rate':
        return renderHitRateSection();
      case 'cycle-time':
        return renderCycleTimeSection();
      case 'trends':
        return renderTrendsSection();
      case 'ranking':
        return renderRankingSection();
      default:
        return <ReportNoData />;
    }
  };

  return (
    <div className="main-content app-content">
      <div className="container-fluid">
        <div className="row"> 
    <div className="container-fluid py-3 reportes-dashboard">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3 mb-4">
        <div>
          <h2 className="mb-1">Dashboard de reportes</h2>
          <p className="text-muted mb-0">
            Visualiza el desempeño comercial, identifica oportunidades y comparte hallazgos accionables.
          </p>
        </div>
      </div>

      <ReportGlobalFilters
        filters={filters}
        presetOptions={INTERVAL_PRESETS}
        campaignOptions={campaignFilterOptions}
        advisorOptions={advisorFilterOptions}
        metricOptions={METRIC_OPTIONS}
        closingStageOptions={closingStageOptions}
        onFiltersChange={handleGlobalFiltersChange}
        onClosingStagesChange={handleClosingStagesChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onRefresh={loadReports}
        loading={loading || filtersLoading}
      />

      {filterSummaryChips.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          {filterSummaryChips.map(chip => (
            <span
              key={chip.key}
              className="badge rounded-pill bg-primary-subtle text-primary-emphasis px-3 py-2"
            >
              {chip.label}
            </span>
          ))}
        </div>
      )}

      <ReportSummarySection
        cards={summaryCards.map(card => ({
          title: card.title,
          value: card.value,
          subtitle: card.subtitle,
          icon: card.icon,
          className: card.className,
        }))}
      />

      <WarningCallout warnings={warningMessages} />

      <div className="row g-4 align-items-stretch">
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Metas resumidas</h5>
              {goalSummaryCards.length ? (
                <GoalsSummary cards={goalSummaryCards} />
              ) : (
                <p className="text-muted mb-0">Registra metas para ver su resultado acumulado.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-8">
          <ReportAccordion
            sections={accordionSections}
            activeKey={activeSection}
            onChange={setActiveSection}
            disabled={loading}
          />
        </div>
      </div>

      <div className="mt-4">{renderActiveSection()}</div>
{/*
      {topPerformers.length > 0 && (
        <div className="card shadow-sm border-0 mt-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Top 5 asesores</h5>
            <div className="list-group list-group-flush">
              {topPerformers.map((advisor, index) => (
                <div
                  key={`${advisor.advisor_id}-${index}`}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary">{index + 1}</span>
                    <span className="fw-semibold">{advisor.advisor_name}</span>
                  </div>
                  <div className="text-end">
                    <div className="fw-semibold">{formatInteger(advisor.total ?? 0)} leads</div>
                    {typeof advisor.fulfillment_percent === 'number' && (
                      <small className="text-muted">
                        {formatPercentOneDecimal(advisor.fulfillment_percent)}% cumplimiento
                      </small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* <ReportWarningsList warnings={warningMessages} /> */}
      {isGoalsModalMounted && (
        <ModalComponent
          stateModal={isGoalsModalVisible}
          typeModal="static"
          onClose={handleGoalsModalUnmount}
          title="Gestionar metas comerciales"
          size="modal-xl"
          vHactive
          content={
            <ReportGoalsManager
              businessId={BUSINESS_ID}
              campaigns={goalsResources.campaigns}
              advisors={goalsResources.advisors}
              onClose={handleGoalsManagerClose}
              onGoalChanged={handleGoalChanged}
            />
          }
        />
      )}
      {isStageTargetsModalMounted && (
        <ModalComponent
          stateModal={isStageTargetsModalVisible}
          typeModal="static"
          onClose={handleStageTargetsModalUnmount}
          title="Gestionar metas por etapa"
          size="modal-xl"
          vHactive
          content={
            <ReportStageTargetsManager
              businessId={BUSINESS_ID}
              stages={funnelReport?.stages ?? []}
              campaigns={goalsResources.campaigns}
              advisors={goalsResources.advisors}
              onClose={handleStageTargetsManagerClose}
              onStageTargetChanged={handleStageTargetChanged}
              defaultFilters={{
                campaignCodigo: appliedFilters.campaignCodigo,
                advisorId: appliedFilters.advisorId,
                dateFrom: appliedFilters.dateFrom,
                dateTo: appliedFilters.dateTo,
              }}
            />
          }
        />
      )}
    </div>
    </div>
      </div>
    </div>
  );
}