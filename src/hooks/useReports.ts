import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { setLoading } from '../redux/states/loading.slice';
import type { ParamsRecord } from '../services/reports.service';
import {
  fetchAdvisorRanking,
  fetchDistributionReport,
  fetchFunnelReport,
  fetchGoals,
  fetchGoalsPerformance,
  fetchGoalsResources,
  fetchStageTargets,
  fetchReportsFilters,
  fetchTimeseriesReport,
  createGoal as createGoalService,
  updateGoal as updateGoalService,
  deleteGoal as deleteGoalService,
  createStageTarget as createStageTargetService,
  updateStageTarget as updateStageTargetService,
  deleteStageTarget as deleteStageTargetService,
  fetchHitRateReport,
  fetchCycleTimeReport,
  fetchDailyLeadsReport,
  fetchCountByHourRange,
} from '../services/reports.service';
import {
  ReportsAdvisorRankingResponse,
  ReportsApiResponse,
  ReportsCommonFilters,
  ReportsDistributionResponse,
  ReportsFunnelResponse,
  ReportsGoalItem,
  ReportsGoalPayload,
  ReportsGoalsListResponse,
  ReportsGoalsResourcesResponse,
  ReportsGlobalFiltersResponse,
  ReportsGoalsPerformanceResponse,
  ReportsStageTargetsResponse,
  ReportsStageTargetPayload,
  ReportsTimeseriesResponse,
  ReportsHitRateResponse,
  ReportsCycleTimeResponse,
  ReportsDailyLeadsResponse,
} from '../models';

type LoadingOption = boolean | undefined;

const withLoading = async <T>(
  dispatch: Dispatch,
  showLoading: LoadingOption,
  callback: () => Promise<T>
): Promise<T> => {
  const shouldShow = showLoading ?? true;
  if (shouldShow) {
    dispatch(setLoading(true));
  }
  try {
    return await callback();
  } finally {
    if (shouldShow) {
      dispatch(setLoading(false));
    }
  }
};

export function useReports() {
  const dispatch = useDispatch();

  const getFunnelReport = useCallback(
    (
      filters: ReportsCommonFilters = {},
      showLoading?: boolean
    ): Promise<ReportsApiResponse<ReportsFunnelResponse>> => {
      return withLoading(dispatch, showLoading, () => fetchFunnelReport(filters));
    },
    [dispatch]
  );

  const getDistributionReport = useCallback(
    (
      filters: (ReportsCommonFilters & { group_by: string }),
      showLoading?: boolean
    ): Promise<ReportsApiResponse<ReportsDistributionResponse>> => {
      return withLoading(dispatch, showLoading, () => fetchDistributionReport(filters));
    },
    [dispatch]
  );

  const getTimeseriesReport = useCallback(
    (
      filters: (ReportsCommonFilters & { metric: string; interval: string }),
      showLoading?: boolean
    ): Promise<ReportsApiResponse<ReportsTimeseriesResponse>> => {
      return withLoading(dispatch, showLoading, () => fetchTimeseriesReport(filters));
    },
    [dispatch]
  );

  const getAdvisorRanking = useCallback(
    (
      filters: (ReportsCommonFilters & { metric: string; limit?: number }),
      showLoading?: boolean
    ): Promise<ReportsApiResponse<ReportsAdvisorRankingResponse>> => {
      return withLoading(dispatch, showLoading, () => fetchAdvisorRanking(filters));
    },
    [dispatch]
  );

  const getHitRateReport = useCallback(
    (
      filters: ReportsCommonFilters = {},
      showLoading?: boolean
    ): Promise<ReportsApiResponse<ReportsHitRateResponse>> => {
      return withLoading(dispatch, showLoading, () => fetchHitRateReport(filters));
    },
    [dispatch]
  );

  const getCycleTimeReport = useCallback(
    (
      filters: ReportsCommonFilters = {},
      showLoading?: boolean
    ): Promise<ReportsApiResponse<ReportsCycleTimeResponse>> => {
      return withLoading(dispatch, showLoading, () => fetchCycleTimeReport(filters));
    },
    [dispatch]
  );

  const getGoalsPerformance = useCallback(
    (
      filters: (ReportsCommonFilters & { metric: string; goal_scope?: string | string[] }),
      showLoading?: boolean
    ): Promise<ReportsApiResponse<ReportsGoalsPerformanceResponse>> => {
      return withLoading(dispatch, showLoading, () => fetchGoalsPerformance(filters));
    },
    [dispatch]
  );

  const getDailyLeadsReport = useCallback(
    (
      filters: ReportsCommonFilters = {},
      showLoading?: boolean,
    ): Promise<ReportsApiResponse<ReportsDailyLeadsResponse>> => {
      return withLoading(dispatch, showLoading, () => fetchDailyLeadsReport(filters));
    },
    [dispatch],
  );

  const getCountByHourRange = useCallback(
    (
      filters: ParamsRecord & { date_from: string; date_to: string; start_hour: string; end_hour: string },
      showLoading?: boolean
    ): Promise<ReportsApiResponse<{ count: number; date_from: string; date_to: string; start_hour: string; end_hour: string } | { hours: number[] }>> => {
      return withLoading(dispatch, showLoading, () => fetchCountByHourRange(filters));
    },
    [dispatch]
  );

  const getGoals = useCallback(
    (
      filters: ReportsCommonFilters = {},
      showLoading?: boolean
    ): Promise<ReportsApiResponse<ReportsGoalsListResponse>> => {
      return withLoading(dispatch, showLoading, () => fetchGoals(filters));
    },
    [dispatch]
  );

  const getStageTargets = useCallback(
    (
      filters: ReportsCommonFilters = {},
      showLoading?: boolean
    ): Promise<ReportsApiResponse<ReportsStageTargetsResponse>> => {
      return withLoading(dispatch, showLoading, () => fetchStageTargets(filters));
    },
    [dispatch]
  );

  const getGoalsResources = useCallback(
    (
      filters: ReportsCommonFilters = {},
      showLoading?: boolean
    ): Promise<ReportsApiResponse<ReportsGoalsResourcesResponse>> => {
      return withLoading(dispatch, showLoading, () => fetchGoalsResources(filters));
    },
    [dispatch]
  );

  const getReportsFilters = useCallback(
    (
      filters: ReportsCommonFilters = {},
      showLoading?: boolean
    ): Promise<ReportsApiResponse<ReportsGlobalFiltersResponse>> => {
      return withLoading(dispatch, showLoading, () => fetchReportsFilters(filters));
    },
    [dispatch]
  );

  const createGoal = useCallback(
    (
      payload: ReportsGoalPayload,
      showLoading?: boolean
    ): Promise<ReportsApiResponse<ReportsGoalItem>> => {
      return withLoading(dispatch, showLoading, () => createGoalService(payload));
    },
    [dispatch]
  );

  const createStageTarget = useCallback(
    (
      payload: ReportsStageTargetPayload,
      showLoading?: boolean
    ): Promise<ReportsApiResponse<ReportsStageTargetsResponse>> => {
      return withLoading(dispatch, showLoading, () => createStageTargetService(payload));
    },
    [dispatch]
  );

  const updateGoal = useCallback(
    (
      goalId: string,
      payload: ReportsGoalPayload,
      showLoading?: boolean
    ): Promise<ReportsApiResponse<ReportsGoalItem>> => {
      return withLoading(dispatch, showLoading, () => updateGoalService(goalId, payload));
    },
    [dispatch]
  );

  const updateStageTarget = useCallback(
    (
      targetId: string,
      payload: ReportsStageTargetPayload,
      showLoading?: boolean
    ): Promise<ReportsApiResponse<ReportsStageTargetsResponse>> => {
      return withLoading(dispatch, showLoading, () => updateStageTargetService(targetId, payload));
    },
    [dispatch]
  );

  const deleteGoal = useCallback(
    (
      goalId: string,
      showLoading?: boolean
    ): Promise<void> => {
      return withLoading(dispatch, showLoading, () => deleteGoalService(goalId));
    },
    [dispatch]
  );

  const deleteStageTarget = useCallback(
    (
      targetId: string,
      showLoading?: boolean
    ): Promise<void> => {
      return withLoading(dispatch, showLoading, () => deleteStageTargetService(targetId));
    },
    [dispatch]
  );

  return useMemo(
    () => ({
      getFunnelReport,
      getDistributionReport,
      getTimeseriesReport,
      getAdvisorRanking,
  getDailyLeadsReport,
  getCountByHourRange,
  getHitRateReport,
  getCycleTimeReport,
      getGoalsPerformance,
      getGoals,
      getStageTargets,
      getGoalsResources,
      getReportsFilters,
      createGoal,
      createStageTarget,
      updateGoal,
      updateStageTarget,
      deleteGoal,
      deleteStageTarget,
    }),
    [
      createStageTarget,
      createGoal,
      deleteStageTarget,
      deleteGoal,
  getAdvisorRanking,
  getDailyLeadsReport,
  getCountByHourRange,
  getHitRateReport,
  getCycleTimeReport,
      getDistributionReport,
      getFunnelReport,
      getGoals,
      getStageTargets,
      getGoalsResources,
      getReportsFilters,
      getGoalsPerformance,
      getTimeseriesReport,
      updateStageTarget,
      updateGoal,
    ]
  );
}
