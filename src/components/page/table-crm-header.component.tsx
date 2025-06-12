import {
  AlignJustify,
  CloudDownload,
  Funnel,
  KanbanSquare,
  Plus,
  RefreshCw,
  Settings,
  Share2,
} from 'lucide-react';
import CanCheck from '../../resources/can';

interface Props {
  name_resource: string;
  name_plural_resource: string;
  view_kanban?: boolean;
  view_table?: boolean;
  view_distributes?: boolean;
  view_imports?: boolean;
  view_refresh?: boolean;
  onRefresh?: () => void;
  onAddResource?: () => void;
  onDistributes?: () => void;
  onImports?: () => void;
}
export const TableCRMHeaderComponent = (props: Props) => {
  const atLeastOneView = props.view_kanban || props.view_table || props.view_refresh;
  return (
    <div className="d-flex justify-content-between align-items-center mt-1 mb-1 ms-2 me-2">
      <div className="d-flex justify-content-center align-items-center">
        <div className="d-flex justify-content-center align-items-center">
          {atLeastOneView && (
            <div className="btn-group btn-group-lg my-1">
              {props.view_kanban && (
                <button
                  data-tooltip-id="tooltip-component"
                  data-tooltip-content={'Vista Kankan'}
                  type="button"
                  className="btn btn-outline-primary btn-xs btn-border"
                >
                  <KanbanSquare height={20} />
                </button>
              )}
              {props.view_table && (
                <button
                  data-tooltip-id="tooltip-component"
                  data-tooltip-content={'Vista tabla'}
                  type="button"
                  className="btn btn-primary btn-xs"
                >
                  <AlignJustify height={20} />
                </button>
              )}
              {props.view_refresh && (
                <button
                  data-tooltip-id="tooltip-component"
                  data-tooltip-content={'Actualizar'}
                  type="button"
                  className="btn btn-outline-primary btn-xs"
                >
                  <RefreshCw height={20} />
                </button>
              )}
            </div>
          )}
          <button className="btn btn-primary btn-sm" onClick={props.onAddResource}>
            <Plus height={20} /> {props.name_resource}
          </button>
          {CanCheck('leads-distrubir') && props.view_distributes && (
            <button className="btn btn-info btn-sm">
              <Share2 height={20} /> Distribuir {props.name_plural_resource}
            </button>
          )}
          {props.view_imports && (
            <button className="btn btn-success btn-sm">
              <CloudDownload height={20} /> Importar {props.name_plural_resource}
            </button>
          )}
        </div>
      </div>
      <div className="d-flex justify-content-center align-items-center gap-1">
        <button
          className="btn btn-outline-primary btn-xs"
          data-tooltip-id="tooltip-component"
          data-tooltip-content={'Filtros'}
        >
          <Funnel height={20} />
        </button>
        <button
          className="btn btn-outline-primary btn-xs"
          data-tooltip-id="tooltip-component"
          data-tooltip-content={'Configurar columnas'}
        >
          <Settings height={20} />
        </button>
      </div>
    </div>
  );
};

export default TableCRMHeaderComponent;
