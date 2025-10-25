import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useReports } from '../../../hooks';
import {
  ReportsStageTargetItem,
  ReportsStageTargetPayload,
  ReportsStageTargetsResponse,
} from '../../../models';
import { SweetAlert } from '../../../utilities';

interface StageOption {
  value: string;
  label: string;
}

interface RawSelectable {
  id?: string | number | null;
  value?: string | number | null;
  codigo?: string | number | null;
  name?: string | null;
  label?: string | null;
}

interface StageReference {
  id?: string | number | null;
  codigo?: string | number | null;
  name?: string | null;
  label?: string | null;
  order?: number | null;
}

interface ReportStageTargetsManagerProps {
  businessId: string;
  stages: StageReference[];
  campaigns: RawSelectable[];
  advisors: RawSelectable[];
  onClose: () => void;
  onStageTargetChanged: () => void;
  defaultFilters?: {
    campaignCodigo?: string;
    advisorId?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

interface StageTargetFiltersState {
  period_start: string;
  period_end: string;
  campaign_codigo?: string;
  advisor_id?: string;
  notes?: string;
}

interface AdvisorTargetsRow {
  key: string;
  advisorId?: string;
  advisorLabel?: string;
  valuesByStage: Record<string, number>;
  locked?: boolean;
}

const normalizeValue = (value?: string | number | null) => (value != null ? String(value) : '');

const normalizeNonEmptyString = (value: unknown): string | null => {
  if (value === undefined || value === null) {
    return null;
  }
  const stringValue = String(value).trim();
  return stringValue.length > 0 ? stringValue : null;
};

const extractStageTargetCampaignIdentifiers = (target: ReportsStageTargetItem): string[] => {
  const identifiers = new Set<string>();
  const register = (candidate: unknown) => {
    const normalized = normalizeNonEmptyString(candidate);
    if (normalized) {
      identifiers.add(normalized);
    }
  };

  register(target.campaign?.codigo);
  register(target.campaign?.id);
  register((target.campaign as unknown as Record<string, unknown>)?.['value']);

  const raw = target as unknown as Record<string, unknown>;
  register(raw['campaign_codigo']);
  register(raw['campaign_id']);
  register(raw['campaignCode']);
  register(raw['campaignId']);

  const multiple = raw['campaign_codigos'];
  if (Array.isArray(multiple)) {
    multiple.forEach(value => register(value));
  }

  return Array.from(identifiers);
};

const extractStageTargetAdvisorIdentifiers = (target: ReportsStageTargetItem): string[] => {
  const identifiers = new Set<string>();
  const register = (candidate: unknown) => {
    const normalized = normalizeNonEmptyString(candidate);
    if (normalized) {
      identifiers.add(normalized);
    }
  };

  register(target.advisor?.id);
  register(target.advisor?.codigo);
  register((target.advisor as unknown as Record<string, unknown>)?.['value']);

  const raw = target as unknown as Record<string, unknown>;
  register(raw['advisor_id']);
  register(raw['advisor_codigo']);
  register(raw['advisorCode']);
  register(raw['advisorId']);
  register(raw['assigned_to_id']);
  register(raw['assignedToId']);
  register(raw['usuario_id']);

  return Array.from(identifiers);
};

const toInputDate = (value?: string | null) => {
  if (!value) {
    return '';
  }
  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return '';
  }
  return parsed.format('YYYY-MM-DD');
};

const startOfCurrentMonth = () => dayjs().startOf('month').format('YYYY-MM-DD');
const endOfCurrentMonth = () => dayjs().endOf('month').format('YYYY-MM-DD');

const resolveMonthlyRangeFromDates = (start?: string | null, end?: string | null) => {
  const candidate = start && dayjs(start).isValid()
    ? dayjs(start)
    : end && dayjs(end).isValid()
      ? dayjs(end)
      : dayjs();
  return {
    start: candidate.startOf('month').format('YYYY-MM-DD'),
    end: candidate.endOf('month').format('YYYY-MM-DD'),
  };
};

dayjs.locale('es');

const mapSelectableToOption = (item: RawSelectable, fallbackLabel: string): StageOption => {
  const label = item.label ?? item.name ?? fallbackLabel;
  const value = item.id ?? item.value ?? item.codigo ?? fallbackLabel;
  return {
    value: String(value),
    label,
  };
};

const mapStageToOption = (stage: StageReference, fallbackIndex: number): StageOption => {
  const label = stage.name ?? stage.label ?? `Etapa ${fallbackIndex}`;
  const value = stage.id ?? stage.codigo ?? label;
  return {
    value: String(value),
    label,
  };
};

const normalizeStageTargetsResponse = (
  payload?: ReportsStageTargetsResponse | ReportsStageTargetItem[] | null,
): ReportsStageTargetItem[] => {
  if (!payload) {
    return [];
  }

  const result: ReportsStageTargetItem[] = [];
  const seen = new Set<string>();

  const register = (candidate: unknown) => {
    if (!candidate || typeof candidate !== 'object') {
      return;
    }
    const item = candidate as ReportsStageTargetItem;
    if (!item.lead_state && !(item as any).lead_state_id) {
      return;
    }
    const identifier = item.id ? String(item.id) : `${(item.lead_state?.name ?? (item as any).lead_state_id ?? '')}-${item.period_start}-${item.period_end}`;
    if (seen.has(identifier)) {
      return;
    }
    seen.add(identifier);
    result.push(item);
  };

  if (Array.isArray(payload)) {
    payload.forEach(register);
    return result;
  }

  const collections = [payload.stage_targets, payload.data, payload.items, (payload as any)?.results];
  collections.forEach(collection => {
    if (Array.isArray(collection)) {
      collection.forEach(register);
    }
  });

  return result;
};

export default function ReportStageTargetsManager({
  businessId,
  stages,
  campaigns,
  advisors,
  onClose,
  onStageTargetChanged,
  defaultFilters,
}: ReportStageTargetsManagerProps) {
  const {
    getStageTargets,
    createStageTarget,
    updateStageTarget,
    deleteStageTarget,
  } = useReports();

  const stageOptions = useMemo(() => {
    if (!Array.isArray(stages) || stages.length === 0) {
      return [];
    }
    const options = stages
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((stage, index) => mapStageToOption(stage, index + 1));
    return options;
  }, [stages]);

  const campaignOptions = useMemo(
    () => campaigns.map((item, index) => mapSelectableToOption(item, `Campaña ${index + 1}`)),
    [campaigns],
  );

  const campaignOptionValueSet = useMemo(() => {
    return new Set(campaignOptions.map(option => option.value));
  }, [campaignOptions]);

  const advisorOptions = useMemo(
    () => advisors.map((item, index) => mapSelectableToOption(item, `Asesor ${index + 1}`)),
    [advisors],
  );

  const advisorOptionLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    advisorOptions.forEach(option => {
      map.set(option.value, option.label);
    });
    return map;
  }, [advisorOptions]);

  const [stageTargets, setStageTargets] = useState<ReportsStageTargetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [advisorRows, setAdvisorRows] = useState<AdvisorTargetsRow[]>([]);

  const baseStageValues = useMemo(() => {
    const template: Record<string, number> = {};
    stageOptions.forEach(option => {
      template[option.value] = 0;
    });
    return template;
  }, [stageOptions]);

  const stageOptionValues = useMemo(() => new Set(stageOptions.map(option => option.value)), [stageOptions]);

  const generateRowKey = useCallback(
    () => `row-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    [],
  );

  const stageValueLookup = useMemo(() => {
    const map = new Map<string, string>();
    stageOptions.forEach(option => {
      map.set(option.value, option.value);
      if (option.label) {
        map.set(option.label.toLowerCase(), option.value);
      }
    });
    stages.forEach(stage => {
      const identifiers = [
        normalizeValue(stage.id),
        normalizeValue(stage.codigo),
        normalizeValue(stage.name),
        normalizeValue(stage.label),
      ].filter(Boolean);

      if (!identifiers.length) {
        return;
      }

      const matchedOption = stageOptions.find(option => identifiers.includes(option.value));
      const resolvedValue = matchedOption?.value ?? identifiers[0];
      if (!resolvedValue) {
        return;
      }

      identifiers.forEach(identifier => {
        const key = identifier;
        map.set(key, resolvedValue);
        map.set(key.toLowerCase(), resolvedValue);
      });
    });

    return map;
  }, [stageOptions, stages]);

  const resolveStageOptionValue = useCallback(
    (item: ReportsStageTargetItem): string | null => {
      const candidates = [
        normalizeValue(item.lead_state?.id),
        normalizeValue(item.lead_state?.codigo),
        normalizeValue(item.lead_state?.name),
        normalizeValue(item.lead_state?.label),
        normalizeValue((item as any).lead_state_id),
      ].filter(Boolean);

      for (const candidate of candidates) {
        if (!candidate) {
          continue;
        }
        const direct = stageValueLookup.get(candidate);
        if (direct) {
          return direct;
        }
        const lower = stageValueLookup.get(candidate.toLowerCase());
        if (lower) {
          return lower;
        }
      }

      return null;
    },
    [stageValueLookup],
  );


  const initialFilters = useMemo<StageTargetFiltersState>(() => {
    const defaultStart = defaultFilters?.dateFrom ? toInputDate(defaultFilters.dateFrom) : undefined;
    const defaultEnd = defaultFilters?.dateTo ? toInputDate(defaultFilters.dateTo) : undefined;
    const { start, end } = resolveMonthlyRangeFromDates(defaultStart, defaultEnd);

    return {
      period_start: start,
      period_end: end,
      campaign_codigo: defaultFilters?.campaignCodigo ?? '',
      advisor_id: defaultFilters?.advisorId ?? '',
      notes: '',
    };
  }, [defaultFilters]);

  const [filtersState, setFiltersState] = useState<StageTargetFiltersState>(initialFilters);

  useEffect(() => {
    setFiltersState(initialFilters);
  }, [initialFilters]);

  const currentMonthlyRange = useMemo(
    () => resolveMonthlyRangeFromDates(filtersState.period_start, filtersState.period_end),
    [filtersState.period_end, filtersState.period_start],
  );

  const normalizedCampaignFilter = useMemo(
    () => normalizeValue(filtersState.campaign_codigo),
    [filtersState.campaign_codigo],
  );

  const stageTargetsForCurrentFilters = useMemo(() => {
    if (!stageTargets.length) {
      return [] as ReportsStageTargetItem[];
    }

  const filtered = stageTargets.filter(item => {
    const itemStart = toInputDate(item.period_start);
    const itemEnd = toInputDate(item.period_end);
    const matchesPeriod = itemStart === currentMonthlyRange.start && itemEnd === currentMonthlyRange.end;
    if (!matchesPeriod) {
      return false;
    }

    const campaignIdentifiers = extractStageTargetCampaignIdentifiers(item);
    if (normalizedCampaignFilter) {
      return campaignIdentifiers.includes(normalizedCampaignFilter);
    } else {
      return true;
    }
  });    console.log('Metas filtradas para período y campaña actual:', filtered);
    return filtered;
  }, [campaignOptionValueSet, currentMonthlyRange.end, currentMonthlyRange.start, normalizedCampaignFilter, stageTargets]);

  const buildRowsForCurrentPeriod = useCallback((): AdvisorTargetsRow[] => {
    const rowsMap = new Map<string, AdvisorTargetsRow>();

    const registerRow = (advisorId: string, label: string, locked: boolean) => {
      const normalizedAdvisor = normalizeValue(advisorId);
      const key = normalizedAdvisor || 'general';
      const existing = rowsMap.get(key);
      if (existing) {
        if (label && label !== existing.advisorLabel) {
          existing.advisorLabel = label;
        }
        if (locked && !existing.locked) {
          existing.locked = true;
        }
        return existing;
      }

      const row: AdvisorTargetsRow = {
        key: locked ? `fixed-${key}` : generateRowKey(),
        advisorId: normalizedAdvisor,
        advisorLabel: label,
        valuesByStage: { ...baseStageValues },
        locked,
      };
      rowsMap.set(key, row);
      return row;
    };

    // Registrar filas para asesores del catálogo
    advisorOptions.forEach(option => {
      registerRow(option.value, option.label, true);
    });

    // Registrar filas para asesores que aparecen en metas existentes pero no en el catálogo
    const knownAdvisorIds = new Set(advisorOptions.map(option => option.value));
    stageTargetsForCurrentFilters.forEach(item => {
      const advisorIdentifiers = extractStageTargetAdvisorIdentifiers(item);
      const primaryAdvisorId = advisorIdentifiers[0] ?? '';
      if (primaryAdvisorId && !knownAdvisorIds.has(primaryAdvisorId)) {
        const advisorLabel = item.advisor?.name ?? item.advisor?.label ?? primaryAdvisorId;
        registerRow(primaryAdvisorId, advisorLabel, false);
        knownAdvisorIds.add(primaryAdvisorId);
      }
    });

    // Poblar valores desde metas existentes
    stageTargetsForCurrentFilters.forEach(item => {
      const stageValue = resolveStageOptionValue(item);
      const advisorIdentifiers = extractStageTargetAdvisorIdentifiers(item);
      if (!stageValue || !stageOptionValues.has(stageValue)) {
        return;
      }

      const primaryAdvisorId = advisorIdentifiers[0] ?? '';
      const advisorLabel =
        item.advisor?.name ??
        item.advisor?.label ??
        (primaryAdvisorId ? advisorOptionLabelMap.get(primaryAdvisorId) ?? primaryAdvisorId : 'General');
      const isKnownAdvisor =
        primaryAdvisorId === '' || advisorIdentifiers.some(identifier => advisorOptionLabelMap.has(identifier));

      const row = registerRow(primaryAdvisorId, advisorLabel, isKnownAdvisor);
      const currentValue = Number(row.valuesByStage[stageValue] ?? 0);
      const incomingValue = Number(item.target_total ?? 0);
      const nextValue =
        (Number.isFinite(currentValue) ? currentValue : 0) + (Number.isFinite(incomingValue) ? incomingValue : 0);
      row.valuesByStage[stageValue] = nextValue;
    });

    const rows = Array.from(rowsMap.values());
    rows.sort((a, b) => {
      const aId = a.advisorId ?? '';
      const bId = b.advisorId ?? '';
      if (aId === '' && bId !== '') {
        return -1;
      }
      if (aId !== '' && bId === '') {
        return 1;
      }
      const labelA = (a.advisorLabel ?? '').toLowerCase();
      const labelB = (b.advisorLabel ?? '').toLowerCase();
      return labelA.localeCompare(labelB, 'es', { sensitivity: 'base' });
    });

    return rows;
  }, [advisorOptionLabelMap, advisorOptions, baseStageValues, generateRowKey, resolveStageOptionValue, stageOptionValues, stageTargetsForCurrentFilters]);

  useEffect(() => {
    setAdvisorRows(buildRowsForCurrentPeriod());
  }, [buildRowsForCurrentPeriod]);

  useEffect(() => {
    setAdvisorRows(prevRows =>
      prevRows.map(row => {
        const nextValues: Record<string, number> = { ...baseStageValues };
        Object.keys(row.valuesByStage ?? {}).forEach(stageId => {
          if (stageOptionValues.has(stageId)) {
            const numeric = Number(row.valuesByStage[stageId] ?? 0);
            nextValues[stageId] = Number.isFinite(numeric) ? numeric : 0;
          }
        });
        return { ...row, valuesByStage: nextValues };
      }),
    );
  }, [baseStageValues, stageOptionValues]);

  const handleRowStageChange = useCallback((rowKey: string, stageId: string, rawValue: string) => {
    setAdvisorRows(prevRows =>
      prevRows.map(row => {
        if (row.key !== rowKey) {
          return row;
        }
        const numeric = Number(rawValue);
        const sanitized = Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
        return {
          ...row,
          valuesByStage: {
            ...row.valuesByStage,
            [stageId]: sanitized,
          },
        };
      }),
    );
  }, []);

  const computeRowTotal = useCallback(
    (row: AdvisorTargetsRow) =>
      stageOptions.reduce((acc, option) => {
        const numeric = Number(row.valuesByStage?.[option.value] ?? 0);
        return acc + (Number.isFinite(numeric) ? numeric : 0);
      }, 0),
    [stageOptions],
  );

  const stageTotalsPreview = useMemo(() => {
    const totals: Record<string, number> = {};
    stageOptions.forEach(option => {
      totals[option.value] = 0;
    });

    advisorRows.forEach(row => {
      stageOptions.forEach(option => {
        const numeric = Number(row.valuesByStage?.[option.value] ?? 0);
        totals[option.value] += Number.isFinite(numeric) ? numeric : 0;
      });
    });

    return totals;
  }, [advisorRows, stageOptions]);

  const grandTotalPreview = useMemo(
    () => advisorRows.reduce((acc, row) => acc + computeRowTotal(row), 0),
    [advisorRows, computeRowTotal],
  );

  const handleResetAdvisorRows = useCallback(() => {
    setAdvisorRows(buildRowsForCurrentPeriod());
  }, [buildRowsForCurrentPeriod]);

  const handleSaveAdvisorRows = async () => {
    if (saving) {
      return;
    }

    if (!validateFilters()) {
      return;
    }

    if (!stageOptions.length) {
      SweetAlert.info('Configura etapas', 'Debes tener etapas registradas para guardar metas por asesor.');
      return;
    }

    if (!advisorRows.length) {
      SweetAlert.info('Sin registros', 'No hay asesores disponibles para este periodo.');
      return;
    }

    const { start: monthlyStart, end: monthlyEnd } = resolveMonthlyRangeFromDates(
      filtersState.period_start,
      filtersState.period_end,
    );

    const payloadBase: Omit<ReportsStageTargetPayload, 'lead_state_id' | 'target_total'> = {
      business_id: businessId,
      period_start: monthlyStart,
      period_end: monthlyEnd,
      campaign_codigo: normalizeValue(filtersState.campaign_codigo) || undefined,
      notes: filtersState.notes?.trim() ? filtersState.notes.trim() : undefined,
    };

    const operations: Array<() => Promise<unknown>> = [];

    advisorRows.forEach(row => {
      stageOptions.forEach(option => {
        const rawValue = Number(row.valuesByStage?.[option.value] ?? 0);
        const nextValue = Number.isFinite(rawValue) ? Math.max(0, Math.round(rawValue)) : 0;

        const rowFilters: StageTargetFiltersState = {
          ...filtersState,
          period_start: monthlyStart,
          period_end: monthlyEnd,
          advisor_id: row.advisorId ?? '',
        };

        const existing = findExistingTarget(option.value, rowFilters);

        // DEBUG: Log payloads que se envían al backend
        if (nextValue > 0) {
          const advisorIdentifier = normalizeValue(row.advisorId);
          const payload: ReportsStageTargetPayload = {
            ...payloadBase,
            advisor_id: advisorIdentifier || undefined,
            lead_state_id: option.value,
            target_total: nextValue,
          };
          // eslint-disable-next-line no-console
          console.log('Enviando meta', existing ? 'update' : 'create', payload);

          if (existing) {
            const previous = Number(existing.target_total ?? 0);
            const notesChanged = (payload.notes ?? '') !== (existing.notes ?? '');
            if (previous !== nextValue || notesChanged) {
              operations.push(() => updateStageTarget(String(existing.id), payload, false));
            }
          } else {
            operations.push(() => createStageTarget(payload, false));
          }
        } else if (existing) {
          // eslint-disable-next-line no-console
          console.log('Eliminando meta', existing.id);
          operations.push(() => deleteStageTarget(String(existing.id), false));
        }
      });
    });

    if (operations.length === 0) {
      SweetAlert.info('Sin cambios', 'No se detectaron variaciones en las metas por asesor.');
      return;
    }

    try {
      setSaving(true);
      await Promise.all(operations.map(operation => operation()));
  SweetAlert.success('Metas actualizadas', 'Las metas mensuales por asesor se guardaron correctamente.');
      await loadStageTargets();
      onStageTargetChanged();
    } catch (error) {
      console.error('Error al guardar metas por asesor', error);
      SweetAlert.error('Error', 'No fue posible guardar todas las metas por asesor. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const loadStageTargets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getStageTargets({ business_id: businessId }, false);
      const data = normalizeStageTargetsResponse(response?.data);
      setStageTargets(data);
    } catch (error) {
      console.error('Error al cargar metas por etapa', error);
      SweetAlert.error('Error', 'No se pudieron cargar las metas por etapa.');
    } finally {
      setLoading(false);
    }
  }, [businessId, getStageTargets]);

  useEffect(() => {
    loadStageTargets();
  }, [loadStageTargets]);

  const findExistingTarget = useCallback(
    (stageValue: string, filters: StageTargetFiltersState): ReportsStageTargetItem | undefined => {
      const normalizedCampaign = normalizeValue(filters.campaign_codigo);
      const normalizedAdvisor = normalizeValue(filters.advisor_id);
      const { start: normalizedStart, end: normalizedEnd } = resolveMonthlyRangeFromDates(
        filters.period_start,
        filters.period_end,
      );

      return stageTargets.find(item => {
        const stageIdentifiers = [
          normalizeValue(item.lead_state?.id),
          normalizeValue(item.lead_state?.codigo),
          normalizeValue(item.lead_state?.name),
          normalizeValue(item.lead_state?.label),
        ].filter(Boolean);

        if (!stageIdentifiers.includes(stageValue)) {
          return false;
        }

        const campaignIdentifiers = extractStageTargetCampaignIdentifiers(item);
        if (normalizedCampaign) {
          if (!campaignIdentifiers.includes(normalizedCampaign)) {
            return false;
          }
        } else if (campaignIdentifiers.length > 0) {
          return false;
        }

        const advisorIdentifiers = extractStageTargetAdvisorIdentifiers(item);
        if (normalizedAdvisor) {
          if (!advisorIdentifiers.includes(normalizedAdvisor)) {
            return false;
          }
        } else if (advisorIdentifiers.length > 0) {
          return false;
        }

        const itemStart = toInputDate(item.period_start);
        const itemEnd = toInputDate(item.period_end);

        return itemStart === normalizedStart && itemEnd === normalizedEnd;
      });
    },
    [stageTargets],
  );

  const currentPeriodLabel = useMemo(() => {
    const parsed = dayjs(filtersState.period_start);
    if (!parsed.isValid()) {
      return 'Periodo mensual';
    }
    return parsed.locale('es').format('MMMM YYYY');
  }, [filtersState.period_start]);

  const isCurrentPeriod = useMemo(() => {
    return (
      filtersState.period_start === startOfCurrentMonth() &&
      filtersState.period_end === endOfCurrentMonth()
    );
  }, [filtersState.period_end, filtersState.period_start]);

  const handleResetPeriod = useCallback(() => {
    setFiltersState(prev => ({
      ...prev,
      period_start: startOfCurrentMonth(),
      period_end: endOfCurrentMonth(),
    }));
  }, []);

  const handleFiltersChange = (field: keyof StageTargetFiltersState, value: string) => {
    setFiltersState(prev => {
      if (field === 'period_start') {
        const parsed = dayjs(value);
        if (!parsed.isValid()) {
          return prev;
        }
        const nextStart = parsed.startOf('month').format('YYYY-MM-DD');
        const nextEnd = parsed.endOf('month').format('YYYY-MM-DD');
        return { ...prev, period_start: nextStart, period_end: nextEnd };
      }
      if (field === 'period_end') {
        const parsed = dayjs(value);
        if (!parsed.isValid()) {
          return prev;
        }
        const nextEnd = parsed.endOf('month').format('YYYY-MM-DD');
        const nextStart = parsed.startOf('month').format('YYYY-MM-DD');
        return { ...prev, period_start: nextStart, period_end: nextEnd };
      }
      if (field === 'notes') {
        return { ...prev, notes: value };
      }
      const sanitizedValue = value === 'general' ? '' : value;
      return { ...prev, [field]: sanitizedValue };
    });
  };

  const validateFilters = (): boolean => {
    const start = dayjs(filtersState.period_start);
    const end = dayjs(filtersState.period_end);
    if (!start.isValid() || !end.isValid()) {
      SweetAlert.warning('Validación', 'Selecciona un rango de fechas válido.');
      return false;
    }
    if (end.isBefore(start, 'day')) {
      SweetAlert.warning('Validación', 'La fecha fin debe ser igual o posterior a la fecha inicio.');
      return false;
    }
    return true;
  };


  return (
    <div className="report-stage-targets-manager form-scrollable d-flex flex-column h-100">
      <div className="modal-body flex-grow-1 overflow-auto">
        <div className="d-flex flex-column gap-4">
          <form
            onSubmit={event => {
              event.preventDefault();
              handleSaveAdvisorRows();
            }}
          >
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label">Campaña</label>
                <select
                  className="form-select form-select-sm"
                  value={filtersState.campaign_codigo ?? ''}
                  onChange={event => handleFiltersChange('campaign_codigo', event.target.value)}
                >
                  <option value="">General</option>
                  {campaignOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <small className="text-muted d-block mt-1">
                  {campaignOptions.length
                    ? `${campaignOptions.length} campaña${campaignOptions.length === 1 ? '' : 's'} activas`
                    : 'Sin campañas activas registradas'}
                </small>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Periodo</label>
                <div className="form-control form-control-sm bg-light">
                  {currentPeriodLabel}
                </div>
                <small className="text-muted d-block mt-1">
                  Las metas se gestionan por mes calendario (1 al último día).
                </small>
                <button
                  type="button"
                  className="btn btn-link btn-sm px-0"
                  onClick={handleResetPeriod}
                  disabled={isCurrentPeriod}
                >
                  {isCurrentPeriod ? 'En mes actual' : 'Volver al mes actual'}
                </button>
              </div>

              <div className="col-12">
                <label className="form-label">Notas (opcional)</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={filtersState.notes ?? ''}
                  onChange={event => handleFiltersChange('notes', event.target.value)}
                />
              </div>
              {/* Nueva sección: Registrar metas por asesor (filas dinámicas) */}
            <div className="card border mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Registrar metas por asesor</h6>
                <span className="badge bg-light text-dark">{Number(grandTotalPreview).toLocaleString('es-PE')} leads meta</span>
              </div>
              <div className="card-body">
                {!stageOptions.length ? (
                  <div className="alert alert-warning mb-0">
                    Configura etapas del embudo para poder distribuir metas por asesor.
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Asesor</th>
                            {stageOptions.map(option => (
                              <th key={option.value} className="text-end">
                                {option.label}
                              </th>
                            ))}
                            <th className="text-end">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {advisorRows.length === 0 ? (
                            <tr>
                              <td colSpan={stageOptions.length + 2} className="text-center text-muted py-4">
                                No hay asesores registrados para este periodo.
                              </td>
                            </tr>
                          ) : (
                            advisorRows.map(row => (
                              <tr key={row.key}>
                                <td style={{ minWidth: 200 }}>
                                  <div className="d-flex flex-column">
                                    <span className="fw-semibold">{row.advisorLabel ?? 'General'}</span>
                                    {row.advisorId ? (
                                      <small className="text-muted">ID: {row.advisorId}</small>
                                    ) : null}
                                  </div>
                                </td>
                                {stageOptions.map(opt => (
                                  <td key={opt.value} className="text-end" style={{ width: 120 }}>
                                    <input
                                      type="number"
                                      min={0}
                                      className="form-control form-control-sm text-end"
                                      value={Number(row.valuesByStage[opt.value] ?? 0)}
                                      onChange={event => handleRowStageChange(row.key, opt.value, event.target.value)}
                                      disabled={saving}
                                    />
                                  </td>
                                ))}
                                <td className="text-end fw-semibold">
                                  {Number(computeRowTotal(row)).toLocaleString('es-PE')}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot className="table-light">
                          <tr>
                            <th>Total etapa</th>
                            {stageOptions.map(opt => (
                              <th key={opt.value} className="text-end">
                                {Number(stageTotalsPreview[opt.value] ?? 0).toLocaleString('es-PE')}
                              </th>
                            ))}
                            <th className="text-end">{Number(grandTotalPreview).toLocaleString('es-PE')}</th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="text-muted small">
                        La meta mensual se calcula como la suma de las metas declaradas por cada asesor y etapa.
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => {
                            loadStageTargets();
                            setAdvisorRows(buildRowsForCurrentPeriod());
                          }}
                          disabled={loading || saving}
                        >
                          Recargar datos
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={handleResetAdvisorRows}
                          disabled={saving}
                        >
                          Restablecer valores
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm"
                          disabled={saving}
                        >
                          {saving ? 'Guardando…' : 'Guardar metas mensuales'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
