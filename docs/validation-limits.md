# Frontend Validation Limits

This file documents the hard length caps enforced in the UI so the backend team can mirror the same database rules and API validators.

## Shared Limits (src/constants/validation.ts)

| Entity/Field | Max length | Notes |
| --- | --- | --- |
| Label name | 20 | Applies to creation from Leads, Lead detail and Configuración > Etiquetas |
| Project name / Type name | 40 | Used in Configuración > Proyectos forms |
| Lead document number | 8 | Used in manual registro e importador |
| Lead names | 50 | Manual registro e importador |
| Lead last names | 50 | Manual registro e importador |
| Lead cellphone | 15 | Manual registro e importador. Also used for duplicate detection (campaña + celular y sólo celular) |
| Lead city | 40 | Manual registro e importador |
| Campaign code (import) | 20 | Excel import only |

## Importador de Leads

- Campos obligatorios: `channel_id` (canal de captación), `names` y `cellphone`. Los demás (`campaign_code`, `project_id`, `document_number`, `last_names`, `city`) quedan opcionales.
- Se puede registrar filas manuales desde el botón “Agregar fila”; éstas siguen exactamente las mismas validaciones y límites que las filas importadas por Excel.
- Se bloquea el envío si hay filas con los mismos valores de `campaign_code` + `cellphone`. El mensaje indica las filas en conflicto. El celular se compara en formato normalizado (se ignoran caracteres no numéricos y un prefijo `+51`).
- También se bloquea si un mismo `cellphone` se repite aunque la campaña sea distinta. Se debe corregir o eliminar las filas marcadas.
- Si el backend devuelve errores (por ejemplo, "el lead ya existe"), se muestran en una alerta con el detalle crudo provisto por la API.

## Formularios actualizados

- `src/pages/Leads/components/form-lead.component.tsx`
- `src/pages/Leads/components/add-etiquetas.component.tsx`
- `src/pages/Lead/components/add-etiquetas.component.tsx`
- `src/pages/Configuracion/Projects/components/project-form.component.tsx`
- `src/pages/Configuracion/Projects/components/type-project-form.component.tsx`
- `src/pages/Configuracion/Labels/components/label-form.component.tsx`
- `src/pages/Configuracion/Labels/components/type-label-form.component.tsx`
- `src/pages/Leads/components/importar-lead.component.tsx`

These limits keep the UI aligned with the new database constraints and reduce 422 errors during `store`/`update`/`import` operations.
