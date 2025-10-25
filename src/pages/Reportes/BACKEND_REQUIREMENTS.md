# Requerimientos de backend para el dashboard de reportes

## Metas por etapa del embudo
- Extender la respuesta de `GET /reports/funnel` para incluir, por cada etapa (`stages`), los campos:
  - `target_total` (number | null): cantidad objetivo declarada para la etapa.
  - `reference_total` (number | null, opcional): total del periodo de referencia, si se dispone a nivel de etapa.
- (Opcional) Incluir en `summary`:
  - `target_total`: meta global (suma de objetivos) para mostrar el avance agregado.

### Ejemplo de respuesta
```json
{
  "summary": {
    "total_leads": 400,
    "target_total": 879,
    "current_period": { "label": "Octubre 2025", "total": 412 },
    "previous_period": { "label": "Septiembre 2025", "total": 398 }
  },
  "stages": [
    { "id": 1, "name": "Nuevo", "total": 420, "target_total": 400 },
    { "id": 2, "name": "Reactivación", "total": 12, "target_total": 5 },
    { "id": 3, "name": "Descubrimiento", "total": 305, "target_total": 300 },
    { "id": 4, "name": "Oportunidad", "total": 162, "target_total": 150 },
    { "id": 5, "name": "Separación", "total": 24, "target_total": 20 },
    { "id": 6, "name": "Venta", "total": 5, "target_total": 4 }
  ]
}
```

## Gestión dinámica de metas
- Proveer endpoints para crear/editar metas por etapa y campaña. Alternativas:
  - `POST /reports/goals/stage-targets` para registrar objetivos por campaña + etapa (rango de fechas).
  - `GET /reports/goals/stage-targets` filtrado por `campaign_codigo`, `advisor_id`, `date_from`, `date_to` para devolver lo configurado.
- El frontend enviará los filtros actuales (campaña, asesor, rango, métrica). La respuesta debe ajustarse al filtro vigente.
- Para `POST /reports/goals` (creación de metas globales) el cliente ahora envía:
  - `goal.name` (string) para identificar la meta en la UI.
  - `goal.campaign_codigos` (array de strings) cuando la meta aplica a varias campañas a la vez. Si se envía un solo código, también se envía `goal.campaign_codigo` para mantener compatibilidad.
- Las respuestas de `GET /reports/goals` y `GET /reports/goals/performance` deben incluir el campo `name` y, si aplica, la lista de campañas asociadas para poder mostrarlas en el gestor de metas.

## Descarga de gráficos
- No requiere cambios de backend. Todos los gráficos se exportan en PNG desde el cliente usando `html-to-image`.

## Consideraciones adicionales
- Si no hay metas declaradas para alguna etapa, devolver `null` o simplemente omitir `target_total` y el frontend volverá a calcular la referencia con el total global.
- Para métricas de comparación (periodo anterior) puedes devolver `reference_total` por etapa o solamente el `summary.previous_period.total`; ambos caminos son soportados.
- Mantener consistencia de nombres de etapas: se usa `stage.name` como identificador para emparejar metas con valores reales.

## Filtros avanzados y catálogos
- `campaign_codigos` debe aceptar un **arreglo** (`["ALPHA", "BETA"]`) para combinar campañas que pertenecen a la misma iniciativa.
- El frontend envía `closing_stage_ids` como arreglo con los estados finales seleccionados en la UI; aplica tanto para Hit Rate como para Tiempo de ciclo. Si se omite, el backend puede inferirlos.
- Devuelve los estados consumidos en cada respuesta dentro de `summary.closing_stage_ids` y/o `summary.closing_estado_finales` para que el dashboard pueda mostrarlos como contexto.
- El catálogo de etapas proviene de `GET /reports/funnel`: asegúrate de incluir `id` y `name` para cada etapa, ya que se usan para poblar el selector de estados de cierre.
- Para el ranking de asesores incluir, por cada estado de lead, un identificador estable (`id`) y un `code` legible. Marcar los estados que representan cierre (ej. `Venta`, `Separación`) para que el frontend pueda distinguirlos sin depender únicamente del nombre.

## Reporte diario de leads por origen
- **Nuevo endpoint**: `GET /reports/leads/daily-sources`.
- Filtros soportados: mismos filtros globales (`business_id`, `date_from`, `date_to`, `interval_preset`, `campaign_codigos`, `advisor_ids`).
- Respuesta esperada:
  - `records`: arreglo con objetos `{ "date": "2025-10-15", "total": 12, "campaign_codigo": "FACEBOOK", "campaign_name": "Facebook Ads", "source_type": "CAMPAÑA" | "REGISTRO_DEL_SISTEMA", "source": "Facebook", "web_hook_id": "abc123", "registered_by_system": false }`.
  - `summary`: totales agregados `{ "total": 120, "campaign_total": 95, "system_total": 25, "by_source": [{ "source": "Facebook", "total": 60 }] }`.
- Reglas de negocio:
  - Si un lead proviene de webhook/campaña debe incluir `web_hook_id` y la campaña asociada.
  - Si el lead se creó manualmente (sin webhook) marcar `registered_by_system: true` y `source_type` como `REGISTRO_DEL_SISTEMA`.
  - Permitir múltiples registros por fecha/campaña. El frontend agrupa y muestra subtotales por día.
- Debe respetar los filtros globales y devolver fechas ordenadas (idealmente descendentes).

## Ranking de asesores y cierres
- La respuesta de `GET /reports/advisors/ranking` debe incluir en `states` un campo `code` que identifique si el estado corresponde a una venta/cierre.
- Se recomienda devolver `lead_states` por asesor con `state_id`, `state_name`, `total` para que el cliente pueda calcular:
  - Top general de asesores (por total gestionado).
  - Top de asesores con leads cerrados (sumando los estados marcados como cierre por el backend). Si no se especifican, el frontend recurre a heurísticas sobre el nombre del estado.

## Reporte de Hit Rate
- Endpoint disponible: `POST /api/v1/reports/leads/hit-rate` (payload JSON).
- Acepta los mismos filtros generales (`business_id`, `date_from`, `date_to`, `interval_preset`, `campaign_codigos`, `advisor_ids`, `assigned_to_ids`) más campos opcionales:
  - `closing_stage_ids`: lista de etapas a considerar como cierre (se infieren si se omiten).
  - `closing_estado_finales`: estados finales que cuentan como cierre.
  - `benchmarks`: arreglo de referencias `{ "label": string, "hit_rate": number }` que el backend puede devolver en el resumen.
  - `currency`: código/símbolo monetario para eco en el resumen.
- Respuesta esperada:
  - `summary`:
    - `total_leads` (number): leads totales en el periodo.
    - `closing_leads` (number): leads que alcanzaron un estado de cierre.
    - `hit_rate` (number): proporción en formato decimal (ej. `0.23` ⇒ 23%).
    - `stage_totals` (array): lista de etapas con `stage_id`, `stage_name`, `total`, `is_closing` (boolean opcional para marcar estados finales). Es clave que `stage_id` sea numérico para que el frontend pueda asociar metas manuales por etapa.
    - `closing_stage_ids` / `closing_stage_codes` / `closing_estado_finales` (opcionales): metadatos de cierre devueltos por el backend.
    - `benchmarks` (array opcional): referencias consumibles por el frontend.
    - `currency` (string opcional): símbolo monetario eco del request.
  - `advisors` (array): por asesor `advisor_id`, `advisor_name`, `total_leads`, `closing_leads`, `hit_rate` (decimal), `stage_totals` opcional.

### Ejemplo de respuesta
```json
{
  "summary": {
    "total_leads": 420,
    "closing_leads": 86,
    "hit_rate": 0.205,
    "stage_totals": [
      { "stage_id": 1, "stage_name": "Nuevo", "total": 420 },
      { "stage_id": 6, "stage_name": "Venta", "total": 64, "is_closing": true },
      { "stage_id": 7, "stage_name": "Separación", "total": 22, "is_closing": true }
    ],
    "closing_stage_codes": ["Venta", "Separación"]
  },
  "advisors": [
    { "advisor_id": "12", "advisor_name": "Ana Flores", "total_leads": 110, "closing_leads": 32, "hit_rate": 0.291 },
    { "advisor_id": "34", "advisor_name": "Luis Soto", "total_leads": 95, "closing_leads": 14, "hit_rate": 0.147 }
  ],
  "benchmarks": [
    { "label": "Objetivo comercial", "hit_rate": 0.20 },
    { "label": "Promedio 2024", "hit_rate": 0.18 }
  ],
  "currency": "S/"
}
```

## Reporte de tiempo de ciclo (lead time)
- Endpoint disponible: `POST /api/v1/reports/leads/cycle-time`.
- Filtros admitidos: los generales (`business_id`, fechas, campañas, asesores) y opcionalmente `closing_stage_ids` / `closing_estado_finales` para definir qué estados cuentan como cierre (el backend los infiere si se omiten).
- Respuesta esperada:
  - `summary`:
    - `total_leads` (number): leads cerrados en el periodo.
    - `average_hours` / `average_days`: duración promedio entre creación y estado final.
    - `median_hours` (number, opcional).
    - `percentile_90_hours` (number, opcional): valor p90 para establecer SLA.
    - `closing_stage_ids` / `closing_estado_finales` (opcionales): metadatos devueltos por el backend.
  - `advisors` (array): `advisor_id`, `advisor_name`, `total_leads`, `average_hours`, `median_hours`, `percentile_90_hours`.
  - `leads` (array):
    - Datos del lead (`lead_uuid`, `lead_name`, `advisor_id`, `advisor_name`, `created_at`, `completed_at`).
    - Duraciones agregadas (`total_hours`, `total_days`).
    - `stages`: historial ordenado con `stage_id`, `stage_name`, `entered_at`, `exited_at`, `duration_hours`, `duration_days`, y opcionalmente `advisor_id` / `advisor_name` para identificar qué asesores atendieron cada transición.

### Ejemplo de respuesta
```json
{
  "summary": {
    "total_leads": 58,
    "average_hours": 142.6,
    "median_hours": 96,
    "percentile_90_hours": 312
  },
  "advisors": [
    { "advisor_id": "12", "advisor_name": "Ana Flores", "total_leads": 20, "average_hours": 118, "median_hours": 90 },
    { "advisor_id": "34", "advisor_name": "Luis Soto", "total_leads": 15, "average_hours": 156, "median_hours": 110 }
  ],
  "leads": [
    {
      "lead_uuid": "b36c...",
      "lead_name": "Juan Pérez",
      "advisor_id": "12",
      "advisor_name": "Ana Flores",
      "created_at": "2025-01-03T09:32:00-05:00",
      "completed_at": "2025-01-12T18:40:00-05:00",
      "total_hours": 226,
      "stages": [
        {
          "stage_id": 1,
          "stage_name": "Nuevo",
          "entered_at": "2025-01-03T09:32:00-05:00",
          "exited_at": "2025-01-04T12:10:00-05:00",
          "duration_hours": 26.6
        },
        {
          "stage_id": 6,
          "stage_name": "Venta",
          "entered_at": "2025-01-10T15:00:00-05:00",
          "exited_at": "2025-01-12T18:40:00-05:00",
          "duration_hours": 51.6
        }
      ]
    }
  ]
}
```
