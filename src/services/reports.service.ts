import apiInstance from './api';
import {
  ReportsApiResponse,
  ReportsAdvisorRankingResponse,
  ReportsCommonFilters,
  ReportsDistributionResponse,
  ReportsFunnelResponse,
  ReportsGoalItem,
  ReportsGoalPayload,
  ReportsGoalsListResponse,
  ReportsGoalsResourcesResponse,
  ReportsGoalsPerformanceResponse,
  ReportsGlobalFiltersResponse,
  ReportsStageTargetPayload,
  ReportsStageTargetsResponse,
  ReportsTimeseriesResponse,
  ReportsHitRateResponse,
  ReportsCycleTimeResponse,
  ReportsDailyLeadsResponse,
} from '../models';

const REPORTS_BASE_URL = '/reports';

type Primitive = string | number | boolean | null | undefined;
type ParamsValue =
  | Primitive
  | (Primitive)[]
  | Record<string, unknown>
  | Record<string, unknown>[];

export type ParamsRecord = Record<string, ParamsValue>;

const serializeParams = (params: ParamsRecord = {}): Record<string, unknown> => {
  const serialized: Record<string, unknown> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return;
      }

      const isPrimitiveArray = value.every(item => item === null || ['string', 'number', 'boolean', 'undefined'].includes(typeof item));

      if (isPrimitiveArray) {
        serialized[`${key}[]`] = value.filter(item => item !== undefined);
      } else {
        serialized[key] = value;
      }
      return;
    }

    serialized[key] = value;
  });

  return serialized;
};

const buildFiltersParams = (filters: ReportsCommonFilters & ParamsRecord = {}) => {
  return serializeParams(filters);
};

const sanitizePayload = (payload: ParamsRecord = {}) => {
  const sanitized: Record<string, unknown> = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        sanitized[key] = value;
      }
      return;
    }

    sanitized[key] = value;
  });

  return sanitized;
};

export const fetchFunnelReport = async (
  filters: ReportsCommonFilters & ParamsRecord = {}
): Promise<ReportsApiResponse<ReportsFunnelResponse>> => {
  const params = buildFiltersParams(filters);
  return apiInstance.get<ReportsApiResponse<ReportsFunnelResponse>>(
    `${REPORTS_BASE_URL}/leads/funnel`,
    params
  );
};

export const fetchDistributionReport = async (
  filters: (ReportsCommonFilters & ParamsRecord) & { group_by: string }
): Promise<ReportsApiResponse<ReportsDistributionResponse>> => {
  const params = buildFiltersParams(filters);
  return apiInstance.get<ReportsApiResponse<ReportsDistributionResponse>>(
    `${REPORTS_BASE_URL}/leads/distribution`,
    params
  );
};

export const fetchTimeseriesReport = async (
  filters: (ReportsCommonFilters & ParamsRecord) & { metric: string; interval: string }
): Promise<ReportsApiResponse<ReportsTimeseriesResponse>> => {
  const params = buildFiltersParams(filters);
  return apiInstance.get<ReportsApiResponse<ReportsTimeseriesResponse>>(
    `${REPORTS_BASE_URL}/leads/timeseries`,
    params
  );
};

export const fetchDailyLeadsReport = async (
  filters: ReportsCommonFilters & ParamsRecord = {},
): Promise<ReportsApiResponse<ReportsDailyLeadsResponse>> => {
  const params = buildFiltersParams(filters);
  return apiInstance.get<ReportsApiResponse<ReportsDailyLeadsResponse>>(
    `${REPORTS_BASE_URL}/leads/daily-sources`,
    params,
  );
};

export const fetchAdvisorRanking = async (
  filters: (ReportsCommonFilters & ParamsRecord) & { metric: string; limit?: number }
): Promise<ReportsApiResponse<ReportsAdvisorRankingResponse>> => {
  const params = buildFiltersParams(filters);
  return apiInstance.get<ReportsApiResponse<ReportsAdvisorRankingResponse>>(
    `${REPORTS_BASE_URL}/advisors/ranking`,
    params
  );
};

export const fetchHitRateReport = async (
  filters: ReportsCommonFilters & ParamsRecord = {}
): Promise<ReportsApiResponse<ReportsHitRateResponse>> => {
  const payload = sanitizePayload(filters);
  return apiInstance.post<ReportsApiResponse<ReportsHitRateResponse>>(
    `${REPORTS_BASE_URL}/leads/hit-rate`,
    payload
  );
};

export const fetchCycleTimeReport = async (
  filters: ReportsCommonFilters & ParamsRecord = {}
): Promise<ReportsApiResponse<ReportsCycleTimeResponse>> => {
  const payload = sanitizePayload(filters);
  return apiInstance.post<ReportsApiResponse<ReportsCycleTimeResponse>>(
    `${REPORTS_BASE_URL}/leads/cycle-time`,
    payload
  );
};

export const fetchGoalsPerformance = async (
  filters: (ReportsCommonFilters & ParamsRecord) & { metric: string; goal_scope?: string | string[] }
): Promise<ReportsApiResponse<ReportsGoalsPerformanceResponse>> => {
  const params = buildFiltersParams(filters);
  return apiInstance.get<ReportsApiResponse<ReportsGoalsPerformanceResponse>>(
    `${REPORTS_BASE_URL}/goals/performance`,
    params
  );
};

export const fetchGoals = async (
  filters: (ReportsCommonFilters & ParamsRecord) = {}
): Promise<ReportsApiResponse<ReportsGoalsListResponse>> => {
  const params = buildFiltersParams(filters);
  return apiInstance.get<ReportsApiResponse<ReportsGoalsListResponse>>(
    `${REPORTS_BASE_URL}/goals`,
    params
  );
};

export const fetchGoalsResources = async (
  filters: (ReportsCommonFilters & ParamsRecord) = {}
): Promise<ReportsApiResponse<ReportsGoalsResourcesResponse>> => {
  const params = buildFiltersParams(filters);
  return apiInstance.get<ReportsApiResponse<ReportsGoalsResourcesResponse>>(
    `${REPORTS_BASE_URL}/goals/resources`,
    params
  );
};

export const fetchStageTargets = async (
  filters: (ReportsCommonFilters & ParamsRecord) = {}
): Promise<ReportsApiResponse<ReportsStageTargetsResponse>> => {
  const params = buildFiltersParams(filters);
  return apiInstance.get<ReportsApiResponse<ReportsStageTargetsResponse>>(
    `${REPORTS_BASE_URL}/goals/stage-targets`,
    params
  );
};

export const fetchReportsFilters = async (
  filters: (ReportsCommonFilters & ParamsRecord) = {}
): Promise<ReportsApiResponse<ReportsGlobalFiltersResponse>> => {
  const params = buildFiltersParams(filters);
  return apiInstance.get<ReportsApiResponse<ReportsGlobalFiltersResponse>>(
    `${REPORTS_BASE_URL}/filters`,
    params
  );
};

export const createGoal = async (
  payload: ReportsGoalPayload
): Promise<ReportsApiResponse<ReportsGoalItem>> => {
  return apiInstance.post<ReportsApiResponse<ReportsGoalItem>>(
    `${REPORTS_BASE_URL}/goals`,
    { goal: payload }
  );
};

export const createStageTarget = async (
  payload: ReportsStageTargetPayload
): Promise<ReportsApiResponse<ReportsStageTargetsResponse>> => {
  return apiInstance.post<ReportsApiResponse<ReportsStageTargetsResponse>>(
    `${REPORTS_BASE_URL}/goals/stage-targets`,
    { stage_target: payload }
  );
};

export const updateGoal = async (
  goalId: string,
  payload: ReportsGoalPayload
): Promise<ReportsApiResponse<ReportsGoalItem>> => {
  return apiInstance.patch<ReportsApiResponse<ReportsGoalItem>>(
    `${REPORTS_BASE_URL}/goals/${goalId}`,
    { goal: payload }
  );
};

export const updateStageTarget = async (
  targetId: string,
  payload: ReportsStageTargetPayload
): Promise<ReportsApiResponse<ReportsStageTargetsResponse>> => {
  return apiInstance.patch<ReportsApiResponse<ReportsStageTargetsResponse>>(
    `${REPORTS_BASE_URL}/goals/stage-targets/${targetId}`,
    { stage_target: payload }
  );
};

export const deleteGoal = async (goalId: string): Promise<void> => {
  await apiInstance.delete(`${REPORTS_BASE_URL}/goals/${goalId}`);
};

export const deleteStageTarget = async (targetId: string): Promise<void> => {
  await apiInstance.delete(`${REPORTS_BASE_URL}/goals/stage-targets/${targetId}`);
};

export const fetchCountByHourRange = async (
  filters: ParamsRecord & {
    date_from: string;
    date_to: string;
    start_hour: string;
    end_hour: string;
  }
): Promise<ReportsApiResponse<{ count: number; date_from: string; date_to: string; start_hour: string; end_hour: string } | { hours: number[] }>> => {
  const params = buildFiltersParams(filters as ReportsCommonFilters & ParamsRecord);
  return apiInstance.get(`${REPORTS_BASE_URL}/leads/count-by-hour-range`, params);
};
