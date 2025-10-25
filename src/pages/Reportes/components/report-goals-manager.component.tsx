import { useCallback, useEffect, useMemo, useState } from 'react';
import { useReports } from '../../../hooks';
import { ReportsGoalItem, ReportsGoalPayload } from '../../../models';
import { SweetAlert } from '../../../utilities';

type Primitive = string | number;

interface SelectOption {
  value: string;
  label: string;
}

interface RawSelectable {
  id?: Primitive;
  value?: Primitive;
  codigo?: Primitive;
  name?: string;
  label?: string;
  selected?: boolean;
}

interface ReportGoalsManagerProps {
  businessId: string;
  campaigns: RawSelectable[];
  advisors: RawSelectable[];
  onClose: () => void;
  onGoalChanged: () => void;
}

type GoalScope = 'campaign' | 'advisor';

interface GoalFormState {
  goal_scope: GoalScope;
  metric: string;
  target_value: number;
  period_start: string;
  period_end: string;
  campaign_codigo?: string;
  campaign_codigos: string[];
  advisor_id?: string;
  name: string;
  notes?: string;
}

const METRIC_OPTIONS: SelectOption[] = [
  { value: 'LEADS_WON', label: 'Leads ganados' },
  { value: 'LEADS_CREATED', label: 'Leads creados' },
  { value: 'LEADS_DROPPED', label: 'Leads dado de baja' },
];

const GOAL_SCOPE_OPTIONS: { value: GoalScope; label: string }[] = [
  { value: 'campaign', label: 'Campaña específica' },
  { value: 'advisor', label: 'Asesor específico' },
];

const toInputDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const startOfCurrentMonth = (): string => {
  const now = new Date();
  return toInputDate(new Date(now.getFullYear(), now.getMonth(), 1));
};

const endOfCurrentMonth = (): string => {
  const now = new Date();
  return toInputDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
};

const mapSelectableToOption = (item: RawSelectable, fallback: string): SelectOption => {
  const label = item.name ?? item.label ?? fallback;
  const value =
    item.codigo ??
    item.value ??
    item.id ??
    fallback;
  return {
    label,
    value: String(value),
  };
};

export default function ReportGoalsManager({
  businessId,
  campaigns,
  advisors,
  onClose,
  onGoalChanged,
}: ReportGoalsManagerProps) {
  const {
    getGoals,
    createGoal,
    deleteGoal,
  } = useReports();

  const [goalList, setGoalList] = useState<ReportsGoalItem[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isCampaignPickerOpen, setIsCampaignPickerOpen] = useState(false);

  const campaignOptions = useMemo(
    () => campaigns.map((campaign, index) => mapSelectableToOption(campaign, `Campaña ${index + 1}`)),
    [campaigns]
  );

  const campaignLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    campaignOptions.forEach(option => {
      map.set(option.value, option.label);
    });
    return map;
  }, [campaignOptions]);

  const advisorOptions = useMemo(
    () => advisors.map((advisor, index) => mapSelectableToOption(advisor, `Asesor ${index + 1}`)),
    [advisors]
  );

  const [form, setForm] = useState<GoalFormState>({
    goal_scope: 'campaign',
    metric: 'LEADS_WON',
    target_value: 100,
    period_start: startOfCurrentMonth(),
    period_end: endOfCurrentMonth(),
    campaign_codigo: campaignOptions[0]?.value,
    campaign_codigos: campaignOptions[0]?.value ? [campaignOptions[0].value] : [],
    advisor_id: advisorOptions[0]?.value,
    name: '',
    notes: '',
  });

  useEffect(() => {
    setForm((prev) => {
      if (prev.goal_scope !== 'campaign') {
        return prev;
      }

      const validValues = new Set(campaignOptions.map((option) => option.value));
      const filteredSelection = prev.campaign_codigos.filter((codigo) => validValues.has(codigo));

      const nextSelection = filteredSelection.length > 0
        ? filteredSelection
        : campaignOptions[0]?.value
          ? [campaignOptions[0].value]
          : [];

      const nextPrimary = nextSelection[0];

      const isSameSelection =
        nextSelection.length === prev.campaign_codigos.length &&
        nextSelection.every((value, index) => value === prev.campaign_codigos[index]);

      if (isSameSelection && nextPrimary === prev.campaign_codigo) {
        return prev;
      }

      return {
        ...prev,
        campaign_codigos: nextSelection,
        campaign_codigo: nextPrimary,
      };
    });
  }, [campaignOptions]);

  useEffect(() => {
    setForm((prev) => {
      if (prev.goal_scope !== 'advisor') {
        return prev;
      }

      if (prev.advisor_id && advisorOptions.some((option) => option.value === prev.advisor_id)) {
        return prev;
      }

      const nextValue = advisorOptions[0]?.value ?? '';
      if (nextValue === prev.advisor_id) {
        return prev;
      }

      return {
        ...prev,
        advisor_id: nextValue,
      };
    });
  }, [advisorOptions]);

  const handleGoalScopeChange = (value: GoalScope) => {
    setIsCampaignPickerOpen(false);
    setForm((prev) => {
      const defaultCampaign = campaignOptions[0]?.value;
      const sanitizedSelection = prev.campaign_codigos.filter((codigo) =>
        campaignOptions.some((option) => option.value === codigo)
      );

      const nextCampaignSelection = value === 'campaign'
        ? (sanitizedSelection.length > 0
            ? sanitizedSelection
            : defaultCampaign
              ? [defaultCampaign]
              : [])
        : prev.campaign_codigos;

      const nextAdvisor = value === 'advisor'
        ? advisorOptions[0]?.value ?? prev.advisor_id ?? ''
        : prev.advisor_id;

      return {
        ...prev,
        goal_scope: value,
        campaign_codigos: value === 'campaign' ? nextCampaignSelection : prev.campaign_codigos,
        campaign_codigo: value === 'campaign' ? nextCampaignSelection[0] : prev.campaign_codigo,
        advisor_id: nextAdvisor,
      };
    });
  };

  const loadGoals = useCallback(async () => {
    setLoadingGoals(true);
    try {
      const response = await getGoals({ business_id: businessId }, false);
      const apiData = response?.data;
      const items =
        (Array.isArray((apiData as any)?.data) ? (apiData as any).data : undefined) ??
        (Array.isArray((apiData as any)?.goals) ? (apiData as any).goals : undefined) ??
        [];
      setGoalList(items as ReportsGoalItem[]);
    } catch (error) {
      console.error('Error al cargar metas', error);
      SweetAlert.error('Error', 'No se pudieron cargar las metas.');
    } finally {
      setLoadingGoals(false);
    }
  }, [businessId, getGoals]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleInputChange = (
    field: keyof GoalFormState,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCampaignToggle = (campaignValue: string, checked: boolean) => {
    setForm((prev) => {
      const current = new Set(prev.campaign_codigos);
      if (checked) {
        current.add(campaignValue);
      } else {
        current.delete(campaignValue);
      }

      const orderedSelection = campaignOptions
        .map((option) => option.value)
        .filter((value) => current.has(value));

      return {
        ...prev,
        campaign_codigos: orderedSelection,
        campaign_codigo: orderedSelection[0],
      };
    });
  };

  const clearCampaignSelection = () => {
    setForm((prev) => ({
      ...prev,
      campaign_codigos: [],
      campaign_codigo: undefined,
    }));
  };

  const campaignSelectionLabel = useMemo(() => {
    if (!form.campaign_codigos.length) {
      return 'Selecciona campañas';
    }
    const labels = form.campaign_codigos
      .map((codigo) => campaignLabelMap.get(codigo) ?? codigo);
    return labels.join(', ');
  }, [campaignLabelMap, form.campaign_codigos]);

  const getGoalCampaignLabel = (goal: ReportsGoalItem): string => {
    const arrayCodes = Array.isArray(goal.campaign_codigos)
      ? goal.campaign_codigos.map(codigo => String(codigo))
      : [];
    if (arrayCodes.length > 1) {
      const labels = arrayCodes.map(code => campaignLabelMap.get(String(code)) ?? String(code));
      return labels.join(', ');
    }

    if (arrayCodes.length === 1) {
      return campaignLabelMap.get(String(arrayCodes[0])) ?? String(arrayCodes[0]);
    }

    if (goal.campaign?.name) {
      return goal.campaign.name;
    }

    const fallbackCodigo = goal.campaign?.codigo;
    if (fallbackCodigo != null) {
      return campaignLabelMap.get(String(fallbackCodigo)) ?? String(fallbackCodigo);
    }

    return '—';
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      SweetAlert.warning('Validación', 'Ingresa un nombre para la meta.');
      return false;
    }

    if (!form.target_value || Number(form.target_value) <= 0) {
      SweetAlert.warning('Validación', 'Ingresa un valor objetivo mayor a cero.');
      return false;
    }

    if (new Date(form.period_start) > new Date(form.period_end)) {
      SweetAlert.warning('Validación', 'La fecha fin debe ser mayor o igual a la fecha inicio.');
      return false;
    }

    if (form.goal_scope === 'campaign') {
      const selectedCampaigns = form.campaign_codigos.filter((codigo) => codigo && codigo.trim().length > 0);
      if (selectedCampaigns.length === 0) {
        SweetAlert.warning('Validación', 'Selecciona al menos una campaña para la meta.');
        return false;
      }
    }

    if (form.goal_scope === 'advisor' && !form.advisor_id) {
      SweetAlert.warning('Validación', 'Selecciona un asesor para la meta.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload: ReportsGoalPayload = {
      goal_scope: form.goal_scope,
      metric: form.metric,
      target_value: Number(form.target_value),
      period_start: form.period_start,
      period_end: form.period_end,
      business_id: businessId,
      notes: form.notes?.trim() || undefined,
    };

    const trimmedName = form.name.trim();
    if (trimmedName) {
      payload.name = trimmedName;
    }

    if (form.goal_scope === 'campaign') {
      const selectedCampaigns = form.campaign_codigos.filter((codigo) => codigo && codigo.trim().length > 0);
      payload.campaign_codigos = selectedCampaigns;
      payload.campaign_codigo = selectedCampaigns.length === 1 ? selectedCampaigns[0] : undefined;
    } else {
      payload.advisor_id = form.advisor_id;
    }

    try {
      setSaving(true);
      await createGoal(payload, false);
      SweetAlert.success('Meta creada', 'La meta se registró correctamente.');
      await loadGoals();
      onGoalChanged();
    } catch (error) {
      console.error('Error al crear meta', error);
      SweetAlert.error('Error', 'No fue posible crear la meta.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    SweetAlert.deleteConfirmation(async () => {
      try {
        await deleteGoal(goalId, false);
        SweetAlert.success('Meta eliminada', 'La meta se eliminó correctamente.');
        await loadGoals();
        onGoalChanged();
      } catch (error) {
        console.error('Error al eliminar meta', error);
        SweetAlert.error('Error', 'No se pudo eliminar la meta.');
      }
    }, undefined, 'Eliminar meta', 'Esta acción no se puede deshacer. ¿Deseas continuar?');
  };

  const formId = 'report-goals-form';

  return (
    <div className="report-goals-manager">
      <div className="modal-body">
        <form id={formId} onSubmit={handleSubmit} className="mb-4">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label">Ámbito</label>
              <select
                className="form-select form-select-sm"
                value={form.goal_scope}
                onChange={(e) => handleGoalScopeChange(e.target.value as GoalScope)}
              >
                {GOAL_SCOPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">
                {form.goal_scope === 'campaign' ? 'Campañas' : 'Asesor'}
              </label>
              {form.goal_scope === 'campaign' ? (
                <div className="position-relative">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm w-100 text-start"
                    onClick={() => setIsCampaignPickerOpen((prev) => !prev)}
                    disabled={campaignOptions.length === 0}
                  >
                    {campaignSelectionLabel}
                  </button>
                  {isCampaignPickerOpen && (
                    <div className="border rounded bg-white shadow-sm p-3 mt-2 position-absolute w-100" style={{ zIndex: 20, maxHeight: '260px', overflowY: 'auto' }}>
                      <div className="d-flex flex-column gap-2">
                        {campaignOptions.map((option) => {
                          const isChecked = form.campaign_codigos.includes(option.value);
                          return (
                            <label key={option.value} className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={isChecked}
                                onChange={(event) => handleCampaignToggle(option.value, event.target.checked)}
                              />
                              <span className="form-check-label">{option.label}</span>
                            </label>
                          );
                        })}
                      </div>
                      <div className="d-flex justify-content-between align-items-center pt-3">
                        <button
                          type="button"
                          className="btn btn-link btn-sm text-decoration-none"
                          onClick={clearCampaignSelection}
                          disabled={!form.campaign_codigos.length}
                        >
                          Limpiar
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => setIsCampaignPickerOpen(false)}
                        >
                          Listo
                        </button>
                      </div>
                    </div>
                  )}
                  <small className="text-muted d-block mt-2">
                    Selecciona una o varias campañas. La primera del listado se usa como principal.
                  </small>
                  {campaignOptions.length === 0 && (
                    <small className="text-muted d-block">No hay campañas disponibles en el catálogo.</small>
                  )}
                </div>
              ) : (
                <select
                  className="form-select form-select-sm"
                  value={form.advisor_id ?? advisorOptions[0]?.value ?? ''}
                  onChange={(e) => handleInputChange('advisor_id', e.target.value)}
                >
                  {advisorOptions.length === 0 && <option value="">Sin opciones disponibles</option>}
                  {advisorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Nombre de la meta</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                maxLength={120}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Métrica</label>
              <select
                className="form-select form-select-sm"
                value={form.metric}
                onChange={(e) => handleInputChange('metric', e.target.value)}
              >
                {METRIC_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Valor meta</label>
              <input
                type="number"
                min={0}
                className="form-control form-control-sm"
                value={form.target_value}
                onChange={(e) => handleInputChange('target_value', Number(e.target.value))}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Desde</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={form.period_start}
                onChange={(e) => handleInputChange('period_start', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Hasta</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={form.period_end}
                onChange={(e) => handleInputChange('period_end', e.target.value)}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Notas (opcional)</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.notes ?? ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </div>
        </form>

        <div className="card border">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Metas registradas</h6>
            <span className="badge bg-light text-dark">
              {loadingGoals ? 'Cargando…' : `${goalList.length} metas`}
            </span>
          </div>
          <div className="card-body p-0">
            {loadingGoals ? (
              <div className="text-center text-muted py-4">Cargando metas…</div>
            ) : goalList.length === 0 ? (
              <div className="text-center text-muted py-4">
                No hay metas registradas aún. Usa el formulario para crear la primera.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Ámbito</th>
                      <th>Entidad</th>
                      <th>Nombre</th>
                      <th>Métrica</th>
                      <th>Objetivo</th>
                      <th>Actual</th>
                      <th>Periodo</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {goalList.map((goal) => (
                      <tr key={goal.id}>
                        <td className="text-uppercase">{goal.goal_scope ?? '-'}</td>
                        <td>{goal.goal_scope === 'campaign' ? getGoalCampaignLabel(goal) : goal.advisor?.name ?? '—'}</td>
                        <td>{goal.name ?? '—'}</td>
                        <td>{goal.metric}</td>
                        <td>{goal.target_value.toLocaleString('es-PE')}</td>
                        <td>{goal.actual_value?.toLocaleString('es-PE') ?? '0'}</td>
                        <td>
                          <small>{goal.period_start}</small>
                          <br />
                          <small>{goal.period_end}</small>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {goal.status?.label ?? 'Sin estado'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-link text-danger btn-sm"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="modal-footer d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3">
        <small className="text-muted flex-grow-1">
          Define metas mensuales para comparar el rendimiento real de tus campañas y asesores.
        </small>
        <div className="d-flex gap-2 justify-content-end">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
            Cerrar
          </button>
          <button form={formId} type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? 'Guardando...' : 'Registrar meta'}
          </button>
        </div>
      </div>
    </div>
  );
}
