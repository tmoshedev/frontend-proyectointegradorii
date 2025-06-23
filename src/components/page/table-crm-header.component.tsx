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
import SelectedColumnas from '../SelectedColumnas';
import { useEffect, useRef, useState } from 'react';
// @ts-ignore
import { Dropdown } from 'bootstrap';

interface Props {
  tableHeader: any[];
  metaData: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  name_resource: string;
  name_plural_resource: string;
  view_kanban?: boolean;
  view_table?: boolean;
  view_distributes?: boolean;
  view_imports?: boolean;
  view_refresh?: boolean;
  viewActual?: 'table' | 'kanban';
  onRefresh?: () => void;
  onAddResource?: () => void;
  onDistributes?: () => void;
  onImports?: () => void;
  onKankan?: () => void;
  setTableHeader: (updatedHeader: any[]) => void;
  onFiltros?: () => void;
  filtros: any[];
}
export const TableCRMHeaderComponent = (props: Props) => {
  const atLeastOneView = props.view_kanban || props.view_table || props.view_refresh;
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const [autoFocus, setAutoFocus] = useState(false);

  const onCancelColumnas = () => {
    if (dropdownRef.current) {
      const dropdownInstance = Dropdown.getOrCreateInstance(dropdownRef.current);
      dropdownInstance.hide();
    }
  };

  //focus the input when the dropdown is opened
  const handleDropdownShow = () => {
    setAutoFocus(true);
  };

  useEffect(() => {
    if (dropdownRef.current) {
      const dropdownInstance = Dropdown.getOrCreateInstance(dropdownRef.current);
      dropdownInstance._element.addEventListener('show.bs.dropdown', handleDropdownShow);
      return () => {
        dropdownInstance._element.removeEventListener('show.bs.dropdown', handleDropdownShow);
      };
    }
  }, []);

  return (
    <div className="d-flex justify-content-between align-items-center mt-1 mb-1 ms-2 me-2">
      <div className="d-flex justify-content-center align-items-center">
        <div className="d-flex justify-content-center align-items-center gap-1">
          {atLeastOneView && (
            <div className="btn-group btn-group-lg my-1">
              {props.view_kanban && (
                <button
                  onClick={props.onKankan}
                  data-tooltip-id="tooltip-component"
                  data-tooltip-content={'Vista Kankan'}
                  type="button"
                  className={`btn btn-xs btn-border ${
                    props.viewActual === 'kanban' ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                >
                  <KanbanSquare height={20} />
                </button>
              )}
              {props.view_table && (
                <button
                  data-tooltip-id="tooltip-component"
                  data-tooltip-content={'Vista tabla'}
                  type="button"
                  className={`btn btn-xs btn-border ${
                    props.viewActual === 'table' ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                >
                  <AlignJustify height={20} />
                </button>
              )}
            </div>
          )}
          <button className="btn btn-primary btn-sm" onClick={props.onAddResource}>
            <Plus height={20} /> {props.name_resource}
          </button>
          {CanCheck('leads-distrubir') && props.view_distributes && (
            <button onClick={props.onDistributes} className="btn btn-info btn-sm d-ocultar-menu">
              <Share2 height={20} /> Distribuir {props.name_plural_resource}
            </button>
          )}
          {props.view_imports && (
            <button onClick={props.onImports} className="btn btn-success btn-sm d-ocultar-menu">
              <CloudDownload height={20} /> Importar {props.name_plural_resource}
            </button>
          )}
        </div>
      </div>
      <div className="d-flex justify-content-center align-items-center gap-1">
        <span style={{ color: '#21232c' }}>
          {props.metaData.total} {props.name_plural_resource}
        </span>
        {props.view_refresh && (
          <button
            onClick={props.onRefresh}
            data-tooltip-id="tooltip-component"
            data-tooltip-content={'Actualizar'}
            type="button"
            className="btn btn-outline-primary btn-xs"
          >
            <RefreshCw height={20} />
          </button>
        )}
        <button
          onClick={props.onFiltros}
          className={`btn btn-xs ${
            props.filtros.length > 0 ? 'btn-primary' : 'btn-outline-primary'
          }`}
          data-tooltip-id="tooltip-component"
          data-tooltip-content={'Filtros'}
        >
          <Funnel height={20} />
          {props.filtros.length > 0 && ` (${props.filtros.length})`}
        </button>
        <button
          data-bs-auto-close="outside"
          data-bs-toggle="dropdown"
          className=" btn btn-outline-primary btn-xs"
          data-tooltip-id="tooltip-component"
          data-tooltip-content={'Configurar columnas'}
          ref={dropdownRef}
        >
          <Settings height={20} />
        </button>
        <SelectedColumnas
          tableHeader={props.tableHeader}
          onChange={props.setTableHeader}
          onCancel={onCancelColumnas}
          onGuardar={onCancelColumnas}
          autoFocus={autoFocus}
        />
      </div>
    </div>
  );
};

export default TableCRMHeaderComponent;
