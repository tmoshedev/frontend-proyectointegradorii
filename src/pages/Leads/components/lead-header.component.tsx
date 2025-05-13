import { KanbanSquare, AlignJustify, RefreshCw, ListFilter, CloudDownload } from 'lucide-react';

interface LeadHeaderComponentProps {
  onRefreshLeads: () => void;
  handleStateView: (view: string) => void;
}

export const LeadHeaderComponent = (props: LeadHeaderComponentProps) => {
  return (
    <div className="d-flex justify-content-between align-items-center mt-1 mb-1">
      <div className="d-flex justify-content-center align-items-center">
        <div className="btn-group btn-group-lg my-1">
          <button
            data-tooltip-id="tooltip-component"
            data-tooltip-content={'Vista Kankan'}
            type="button"
            className="btn btn-primary btn-xs btn-border"
          >
            <KanbanSquare height={20} />
          </button>
          <button
            data-tooltip-id="tooltip-component"
            data-tooltip-content={'Vista tabla'}
            type="button"
            className="btn btn-outline-primary btn-xs"
          >
            <AlignJustify height={20} />
          </button>
          <button
            onClick={props.onRefreshLeads}
            data-tooltip-id="tooltip-component"
            data-tooltip-content={'Actualizar'}
            type="button"
            className="btn btn-outline-primary btn-xs"
          >
            <RefreshCw height={20} />
          </button>
        </div>
        <button className="btn btn-primary btn-sm ms-2">
          <i className="fa-solid fa-plus me-2"></i>
          Lead
        </button>
        <button
          onClick={() => props.handleStateView('IMPORTAR')}
          className="btn btn-success btn-sm ms-2"
        >
          <CloudDownload height={20} /> Importar
        </button>
      </div>

      <div className="d-flex justify-content-center align-items-center">
        <button className="btn btn-outline-primary btn-xs">Filtro</button>
      </div>
    </div>
  );
};

export default LeadHeaderComponent;
