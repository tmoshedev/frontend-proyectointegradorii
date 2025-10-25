import React, { useEffect, useMemo, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/l10n/es';
import dayjs from 'dayjs';
import MultiSelect from '../../../components/MultiSelectDropdown';

export interface ReportSelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface ReportFiltersState {
  intervalPreset: string;
  dateFrom?: string;
  dateTo?: string;
  campaignCodigo?: string;
  campaignCodigos?: string[];
  advisorId?: string;
  metric?: string;
  closingStageIds?: string[];
}

interface ReportGlobalFiltersProps {
  filters: ReportFiltersState;
  presetOptions: ReportSelectOption[];
  campaignOptions: ReportSelectOption[];
  advisorOptions: ReportSelectOption[];
  metricOptions: ReportSelectOption[];
  closingStageOptions?: ReportSelectOption[];
  onFiltersChange: (partial: Partial<ReportFiltersState>) => void;
  onClosingStagesChange?: (nextClosingStageIds: string[]) => void;
  onApply: () => void;
  onReset: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

const DATE_FORMAT = 'Y-m-d';
const DAYJS_FORMAT = 'YYYY-MM-DD';

const formatRangeLabel = (from?: string, to?: string) => {
  if (!from || !to) {
    return 'Selecciona un rango';
  }
  if (from === to) {
    return dayjs(from).format('DD MMM YYYY');
  }
  return `${dayjs(from).format('DD MMM YYYY')} al ${dayjs(to).format('DD MMM YYYY')}`;
};

export default function ReportGlobalFilters({
  filters,
  presetOptions,
  campaignOptions,
  advisorOptions,
  metricOptions,
  closingStageOptions,
  onFiltersChange,
  onClosingStagesChange,
  onApply,
  onReset,
  onRefresh,
  loading,
}: ReportGlobalFiltersProps) {
  const isCustomInterval = filters.intervalPreset === 'custom';

  const selectedPreset = useMemo(
    () => presetOptions.find(option => option.value === filters.intervalPreset),
    [filters.intervalPreset, presetOptions],
  );

  const selectedCampaignIds = filters.campaignCodigos ?? (filters.campaignCodigo ? [filters.campaignCodigo] : []);
  const selectedClosingStageIds = filters.closingStageIds ?? [];
  const selectedClosingStageCount = selectedClosingStageIds.length;
  const totalClosingStages = closingStageOptions?.length ?? 0;

  const campaignOptionsMap = useMemo(() => {
    return new Map(
      campaignOptions.map(option => [String(option.value), { id: option.value, name: option.label }]),
    );
  }, [campaignOptions]);

  const selectedCampaignOptions = useMemo(() => {
    return selectedCampaignIds
      .map(id => campaignOptionsMap.get(String(id)))
      .filter((option): option is { id: string; name: string } => Boolean(option));
  }, [campaignOptionsMap, selectedCampaignIds]);

  const [campaignDraftSelection, setCampaignDraftSelection] = useState<
    Array<{ id: string | number; name: string }>
  >(selectedCampaignOptions);

  useEffect(() => {
    setCampaignDraftSelection(selectedCampaignOptions);
  }, [selectedCampaignOptions]);

  const handleCampaignSelectionChange = (nextSelection: Array<{ id: string | number; name: string }>) => {
    if (loading) {
      return;
    }
    setCampaignDraftSelection(nextSelection);
    // Aplicar la selección de campañas inmediatamente para facilitar el filtrado
    const unique = Array.from(
      new Map(nextSelection.map(option => [String(option.id), option])).values(),
    );

    const values = unique.map(option => String(option.id));
    onFiltersChange({
      campaignCodigos: values,
      campaignCodigo: values.length === 1 ? values[0] : undefined,
    });
  };

  const handleCampaignGuardar = () => {
    if (loading) {
      return;
    }
    const unique = Array.from(
      new Map(
        campaignDraftSelection.map(option => [String(option.id), option]),
      ).values(),
    );

    if (unique.length === 0) {
      onFiltersChange({ campaignCodigo: undefined, campaignCodigos: [] });
      return;
    }

    const values = unique.map(option => String(option.id));
    onFiltersChange({
      campaignCodigos: values,
      campaignCodigo: values.length === 1 ? values[0] : undefined,
    });
  };

  const handleCampaignCancel = () => {
    if (loading) {
      return;
    }
    setCampaignDraftSelection(selectedCampaignOptions);
  };

  const handlePresetChange = (presetValue: string) => {
    onFiltersChange({ intervalPreset: presetValue });
  };

  const handleDateFromChange = (selectedDates: Date[]) => {
    if (!selectedDates.length) {
      onFiltersChange({ dateFrom: undefined, dateTo: undefined });
      return;
    }

    const nextFrom = dayjs(selectedDates[0]).format(DAYJS_FORMAT);
    let nextTo = filters.dateTo;

    if (nextTo && dayjs(nextTo).isBefore(nextFrom)) {
      nextTo = nextFrom;
    }

    onFiltersChange({ dateFrom: nextFrom, dateTo: nextTo ?? nextFrom });
  };

  const handleDateToChange = (selectedDates: Date[]) => {
    if (!selectedDates.length) {
      onFiltersChange({ dateTo: undefined });
      return;
    }

    const nextTo = dayjs(selectedDates[selectedDates.length - 1]).format(DAYJS_FORMAT);
    let nextFrom = filters.dateFrom;

    if (!nextFrom || dayjs(nextFrom).isAfter(nextTo)) {
      nextFrom = nextTo;
    }

    onFiltersChange({ dateFrom: nextFrom, dateTo: nextTo });
  };

  const handleClosingStageToggle = (value: string, checked: boolean) => {
    if (!onClosingStagesChange) {
      return;
    }

    const nextSelection = checked
      ? Array.from(new Set([...selectedClosingStageIds, value]))
      : selectedClosingStageIds.filter(stageId => stageId !== value);

    onClosingStagesChange(nextSelection);
  };

  const handleClearClosingStages = () => {
    if (!onClosingStagesChange) {
      return;
    }
    onClosingStagesChange([]);
  };

  const handleSelectAllClosingStages = () => {
    if (!onClosingStagesChange || !totalClosingStages) {
      return;
    }
    onClosingStagesChange((closingStageOptions ?? []).map(option => option.value));
  };

  return (
    <section className="card shadow-sm border-0 mb-4">
      <div className="card-body d-flex flex-column gap-4">
        <div className="d-flex flex-column flex-xl-row gap-3 align-items-xl-center justify-content-between">
          <div>
            <h5 className="mb-1">Filtros globales</h5>
            <p className="text-muted mb-0">Configura intervalo, campaña, asesor y métricas para todo el dashboard.</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {onRefresh && (
              <button type="button" className="btn btn-outline-primary btn-sm" disabled={loading} onClick={onRefresh}>
                Recargar datos
              </button>
            )}
            <button type="button" className="btn btn-outline-secondary btn-sm" disabled={loading} onClick={onReset}>
              Limpiar filtros
            </button>
            <button type="button" className="btn btn-primary btn-sm" disabled={loading} onClick={onApply}>
              {loading ? 'Aplicando…' : 'Aplicar filtros'}
            </button>
          </div>
        </div>

        <div className="d-flex flex-column gap-3">
          <div>
            <label className="form-label text-muted">Intervalo</label>
            <div className="d-flex flex-wrap gap-2">
              {presetOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`btn btn-sm ${filters.intervalPreset === option.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => handlePresetChange(option.value)}
                  disabled={loading}
                >
                  <span className="d-flex flex-column align-items-start">
                    <span>{option.label}</span>
                    {option.description && <small className="text-muted">{option.description}</small>}
                  </span>
                </button>
              ))}
            </div>
            {isCustomInterval && (
              <div className="mt-3">
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted mb-1">Desde</label>
                    <Flatpickr
                      options={{
                        locale: 'es',
                        dateFormat: DATE_FORMAT,
                        maxDate: filters.dateTo,
                      }}
                      className="form-control"
                      value={filters.dateFrom ? [filters.dateFrom] : []}
                      placeholder="Fecha inicial"
                      onChange={handleDateFromChange}
                      disabled={loading}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted mb-1">Hasta</label>
                    <Flatpickr
                      options={{
                        locale: 'es',
                        dateFormat: DATE_FORMAT,
                        minDate: filters.dateFrom,
                      }}
                      className="form-control"
                      value={filters.dateTo ? [filters.dateTo] : []}
                      placeholder="Fecha final"
                      onChange={handleDateToChange}
                      disabled={loading}
                    />
                  </div>
                </div>
                <small className="text-muted d-block mt-2">
                  {formatRangeLabel(filters.dateFrom, filters.dateTo)}
                </small>
              </div>
            )}
            {!isCustomInterval && selectedPreset?.description && (
              <small className="text-muted d-block mt-2">{selectedPreset.description}</small>
            )}
          </div>

          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-6 col-xl-3">
              <label className="form-label text-muted">Campañas</label>
              <MultiSelect
                options={campaignOptions.map(option => ({ id: option.value, name: option.label }))}
                selected={campaignDraftSelection}
                placeholder="Todas las campañas"
                onChange={handleCampaignSelectionChange}
                onCancel={handleCampaignCancel}
                onGuardar={handleCampaignGuardar}
                hideFooter
              />
            </div>
            <div className="col-12 col-md-6 col-xl-3 mt-n5">
              <label className="form-label text-muted">Asesor</label>
              <select
                className="form-select form-select-sm"
                value={filters.advisorId ?? 'all'}
                onChange={event =>
                  onFiltersChange({ advisorId: event.target.value === 'all' ? undefined : event.target.value })
                }
                disabled={loading}
              >
                <option value="all">Todos</option>
                {advisorOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6 col-xl-3 mt-n1">
              <label className="form-label text-muted">Métrica principal</label>
              <select
                className="form-select form-select-sm"
                value={filters.metric ?? metricOptions[0]?.value ?? ''}
                onChange={event => onFiltersChange({ metric: event.target.value })}
                disabled={loading}
              >
                {metricOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/*closingStageOptions?.length ? (
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label text-muted mb-0">Estados de cierre</label>
                <span className="badge bg-primary-subtle text-primary-emphasis">
                  {selectedClosingStageCount} seleccionados
                </span>
              </div>
              <div className="border rounded p-3 bg-light">
                <div className="d-flex flex-wrap gap-3">
                  {closingStageOptions.map(option => {
                    const isChecked = selectedClosingStageIds.includes(option.value);
                    return (
                      <label key={option.value} className="form-check form-check-inline mb-0">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          value={option.value}
                          checked={isChecked}
                          disabled={loading}
                          onChange={event => handleClosingStageToggle(option.value, event.target.checked)}
                        />
                        <span className="form-check-label">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <small className="text-muted">
                    Aplica estos estados como cierres tanto para el Hit Rate como para el tiempo de ciclo.
                  </small>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-decoration-none"
                      onClick={handleSelectAllClosingStages}
                      disabled={loading || selectedClosingStageCount === totalClosingStages}
                    >
                      Seleccionar todo
                    </button>
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-decoration-none"
                      onClick={handleClearClosingStages}
                      disabled={loading || selectedClosingStageIds.length === 0}
                    >
                      Limpiar selección
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null*/}
        </div>
      </div>
    </section>
  );
}
