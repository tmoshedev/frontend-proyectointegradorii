export interface ReportsApiResponse<T> {
  success: boolean;
  data: T;
  filters?: Record<string, unknown>;
}

export interface ReportsCommonFilters {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | (string | number | boolean | null)[]
    | Record<string, unknown>
    | Record<string, unknown>[];
  date_from?: string;
  date_to?: string;
  interval_preset?: string;
  metric?: string;
  campaign_codes?: string[];
  campaign_code?: string;
  assigned_to_ids?: string[];
  advisor_ids?: string[];
  advisor_id?: string;
  lead_state_ids?: string[];
  channel_ids?: string[];
  estado_finales?: string[];
  nivel_interes?: string[];
  business_id?: string;
  closing_stage_ids?: (string | number)[];
  closing_stage_codes?: (string | number)[];
  closing_estado_finales?: string[];
  benchmarks?: Record<string, unknown>[];
  currency?: string;
}

export interface ReportsFunnelStage {
  id: number | string;
  name: string;
  order?: number;
  total: number;
  target_total?: number | null;
  reference_total?: number | null;
  conversion_from_previous?: number;
  conversion_from_total?: number;
}

export interface ReportsSummaryPeriod {
  label: string;
  from?: string;
  to?: string;
  total: number;
  leads?: number;
  fulfillment_percent?: number;
}

export interface ReportsFunnelSummary {
  total_leads: number;
  total_stages: number;
  current_period?: ReportsSummaryPeriod;
  previous_period?: ReportsSummaryPeriod;
  variation_percent?: number;
  target_total?: number;
}

export interface ReportsFunnelResponse {
  summary: ReportsFunnelSummary;
  stages: ReportsFunnelStage[];
}

export interface ReportsDistributionResponse {
  labels: string[];
  values: number[];
}

export interface ReportsTimeseriesPoint {
  period: string;
  value: number;
}

export interface ReportsTimeseriesResponse {
  labels: string[];
  values: number[];
  series: ReportsTimeseriesPoint[];
}

export interface ReportsDailyLeadDetailItem {
  id?: string | number | null;
  lead_id?: string | number | null;
  lead_uuid?: string | null;
  name?: string | null;
  lead_name?: string | null;
  advisor_id?: string | number | null;
  advisor_name?: string | null;
  stage_id?: string | number | null;
  stage_name?: string | null;
  lead_state_id?: string | number | null;
  lead_state_name?: string | null;
  campaign_code?: string | number | null;
  campaign_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ReportsDailyLeadSourceItem {
  date: string;
  total: number;
  campaign_code?: string | number | null;
  campaign_name?: string | null;
  source?: string | null;
  source_type?: string | null;
  web_hook_id?: string | null;
  registered_by_system?: boolean;
  leads?: ReportsDailyLeadDetailItem[];
}

export interface ReportsDailyLeadsSummary {
  total?: number;
  campaign_total?: number;
  system_total?: number;
  by_source?: Array<{ source: string; total: number }>;
}

export interface ReportsDailyLeadsResponse {
  records: ReportsDailyLeadSourceItem[];
  summary?: ReportsDailyLeadsSummary;
}

export interface ReportsAdvisorRankingStateItem {
  id: string | number;
  name: string;
  code?: string;
  color?: string;
  order?: number;
  total?: number;
}

export interface ReportsAdvisorRankingLeadStateItem {
  state_id?: string | number;
  state_name?: string;
  id?: string | number;
  name?: string;
  total?: number;
  percent?: number;
}

export interface ReportsAdvisorRankingItem {
  advisor_id: string;
  advisor_name: string;
  total: number;
  target?: number;
  actual?: number;
  fulfillment_percent?: number;
  lead_states?: ReportsAdvisorRankingLeadStateItem[];
  history?: ReportsAdvisorRankingHistoryPoint[];
}

export interface ReportsAdvisorRankingResponse {
  states: ReportsAdvisorRankingStateItem[];
  dataset: ReportsAdvisorRankingItem[];
  metric?: string;
  total_advisors?: number;
  total_leads?: number;
  history_interval_label?: string;
}

export interface ReportsAdvisorRankingHistoryPoint {
  period: string;
  total: number;
  lead_states?: ReportsAdvisorRankingLeadStateItem[];
}

export interface ReportsGoalStatus {
  code: string;
  label: string;
  color?: string;
}

export interface ReportsGoalEntity {
  id?: string;
  name?: string;
  code?: string;
}

export interface ReportsGoalItem {
  id: string;
  goal_scope: string;
  metric: string;
  target_value: number;
  actual_value: number;
  fulfillment_percent: number;
  difference: number;
  name?: string;
  status?: ReportsGoalStatus;
  period_start?: string;
  period_end?: string;
  campaign?: ReportsGoalEntity;
  campaigns?: ReportsGoalEntity[];
  campaign_codes?: (string | number)[];
  advisor?: ReportsGoalEntity;
  notes?: string;
}

export interface ReportsGoalsPerformanceSummary {
  target_total: number;
  actual_total: number;
  fulfillment_percent: number;
  difference: number;
  current_period?: ReportsSummaryPeriod;
  previous_period?: ReportsSummaryPeriod;
  variation_percent?: number;
}

export interface ReportsGoalsPerformanceResponse {
  summary?: ReportsGoalsPerformanceSummary;
  goals: ReportsGoalItem[];
}

export interface ReportsGoalPayload {
  goal_scope: string;
  metric: string;
  target_value: number;
  period_start: string;
  period_end: string;
  campaign_code?: string;
  campaign_codes?: string[];
  advisor_id?: string;
  name?: string;
  notes?: string;
  business_id?: string;
}

export interface ReportsGoalCreateRequest {
  goal: ReportsGoalPayload;
}

export interface ReportsGoalsListItem extends ReportsGoalItem {}

export interface ReportsGoalsListResponse {
  data: ReportsGoalsListItem[];
  goals?: ReportsGoalsListItem[];
}

export interface ReportsStageTargetScope {
  id?: string | number | null;
  name?: string;
  code?: string | number | null;
  label?: string;
  order?: number | null;
}

export interface ReportsStageTargetItem {
  id: string;
  business_id?: string | number | null;
  lead_state: ReportsStageTargetScope;
  target_total: number;
  period_start: string;
  period_end: string;
  campaign?: ReportsStageTargetScope | null;
  advisor?: ReportsStageTargetScope | null;
  notes?: string | null;
  applies_to_label?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ReportsStageTargetSummary {
  total_targets?: number;
  total_stages?: number;
  target_total?: number;
  average_target?: number;
}

export interface ReportsStageTargetsResponse {
  data?: ReportsStageTargetItem[];
  stage_targets?: ReportsStageTargetItem[];
  items?: ReportsStageTargetItem[];
  summary?: ReportsStageTargetSummary;
}

export interface ReportsStageTargetPayload {
  business_id: string;
  lead_state_id: string | number;
  target_total: number;
  period_start: string;
  period_end: string;
  campaign_code?: string;
  advisor_id?: string;
  notes?: string;
}

export interface ReportsSelectableItem {
  id?: string | number;
  value?: string | number;
  code?: string | number;
  name?: string;
  label?: string;
  selected?: boolean;
}

export interface ReportsGoalsResourcesResponse {
  campaigns: ReportsSelectableItem[];
  advisors: ReportsSelectableItem[];
}

export interface ReportsGlobalFiltersResponse {
  campaigns: ReportsSelectableItem[];
  advisors: ReportsSelectableItem[];
  metrics?: ReportsSelectableItem[];
  presets?: ReportsSelectableItem[];
}

export interface ReportsHitRateStageItem {
  stage_id?: string | number | null;
  stage_name: string;
  total: number;
  is_closing?: boolean;
}

export interface ReportsHitRateSummary {
  total_leads: number;
  closing_leads: number;
  hit_rate: number;
  stage_totals: ReportsHitRateStageItem[];
  closing_stage_codes?: string[];
  closing_stage_ids?: (string | number)[];
  closing_estado_finales?: string[];
  benchmarks?: ReportsHitRateBenchmarkItem[];
  currency?: string;
}

export interface ReportsHitRateAdvisorItem {
  advisor_id: string | null;
  advisor_name: string;
  total_leads: number;
  closing_leads: number;
  hit_rate: number;
  stage_totals?: ReportsHitRateStageItem[];
}

export interface ReportsHitRateBenchmarkItem {
  label: string;
  hit_rate: number;
}

export interface ReportsHitRateResponse {
  summary: ReportsHitRateSummary;
  advisors: ReportsHitRateAdvisorItem[];
  benchmarks?: ReportsHitRateBenchmarkItem[];
  currency?: string;
}

export interface ReportsCycleTimeStageItem {
  stage_id?: string | number | null;
  stage_name: string;
  entered_at: string;
  exited_at?: string | null;
  duration_hours: number;
  duration_days: number;
  advisor_id?: string | number | null;
  advisor_name?: string | null;
}

export interface ReportsCycleTimeLeadItem {
  lead_uuid: string;
  lead_code?: string;
  lead_name: string;
  advisor_id?: string | number | null;
  advisor_name?: string | null;
  created_at: string;
  completed_at: string;
  total_hours: number;
  total_days: number;
  stages: ReportsCycleTimeStageItem[];
}

export interface ReportsCycleTimeSummary {
  total_leads: number;
  average_hours: number;
  average_days: number;
  median_hours?: number;
  median_days?: number;
  percentile_90_hours?: number;
  percentile_90_days?: number;
  closing_stage_ids?: (string | number)[];
  closing_estado_finales?: string[];
}

export interface ReportsCycleTimeAdvisorItem {
  advisor_id: string | null;
  advisor_name: string;
  total_leads: number;
  average_hours: number;
  average_days: number;
  median_hours?: number;
  percentile_90_hours?: number;
}

export interface ReportsCycleTimeResponse {
  summary: ReportsCycleTimeSummary;
  advisors: ReportsCycleTimeAdvisorItem[];
  leads: ReportsCycleTimeLeadItem[];
}
