import {
  KanbanSquare,
  AlignJustify,
  RefreshCw,
  CloudDownload,
  Plus,
  Share2,
  Tag,
} from 'lucide-react';
import CanCheck from '../../../resources/can';
import SelectSearchCrm from '../../../components/shared/SelectSearchCrm';
import { useState } from 'react';

interface LeadHeaderComponentProps {
  onRefreshLeads: () => void;
  handleStateView: (view: string) => void;
  handleModalLeadForm: (type: string) => void;
  onFiltrosLeads: () => void;
  filtros: any[];
  nivelesInteres: string[];
  handleNivelInteresChange: (nivel: string) => void;
  labels: any[];
  setLabels: React.Dispatch<React.SetStateAction<any[]>>;
  handleEtiquetasKanban: (etiquetas: any[]) => void;
  handleCrearEtiqueta: () => void;
}

export const LeadHeaderComponent = (props: LeadHeaderComponentProps) => {
  const [openDropdown, setOpenDropdown] = useState(false);

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
            onClick={() => props.handleStateView('LEADS_TABLE')}
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
        <button
          onClick={() => props.handleModalLeadForm('STORE')}
          className="btn btn-primary btn-sm ms-2"
        >
          <Plus height={20} /> Lead
        </button>
        {CanCheck('leads-distrubir') && (
          <button
            onClick={() => props.handleStateView('DISTRIBUIR')}
            className="btn btn-info btn-sm ms-2"
          >
            <Share2 height={20} /> Distribuir Leads
          </button>
        )}
        <button
          onClick={() => props.handleStateView('IMPORTAR')}
          className="btn btn-success btn-sm ms-2"
        >
          <CloudDownload height={20} /> Importar Leads
        </button>
      </div>

      <div className="header-controls-container">
        {/* Grupo 1: Etiquetas */}
        <div className="control-group">
          <div className="d-flex align-items-center gap-1 justify-content-center align-items-center">
            <div
              className="dropdown"
              onClick={() => setOpenDropdown(true)}
              onBlur={() => setOpenDropdown(false)}
              tabIndex={0}
            >
              <span data-bs-toggle="dropdown" aria-expanded={openDropdown} role="button">
                {props.labels.filter((label) => label.select).length > 0 ? (
                  <i
                    style={{ color: 'var(--primary-color)', fontSize: '1.4rem' }}
                    className="fa-solid fa-tag"
                  ></i>
                ) : (
                  <Tag height={20} />
                )}
              </span>
              <SelectSearchCrm
                maxHeight="250px"
                minWidth="220px"
                items={props.labels}
                icon={`fa-solid fa-tag`}
                open={openDropdown}
                onChange={props.handleEtiquetasKanban}
                store={props.handleCrearEtiqueta}
              />
            </div>
          </div>
        </div>
        {/* Grupo 2: Estados de Interés */}
        <div className="control-group">
          <div className="d-flex align-items-center gap-1 lead-header-state justify-content-center align-items-center">
            <div
              className={`item-testado-lead ${
                props.nivelesInteres.includes('CALIENTE') ? 'color-lead-caliente' : ''
              }`}
              data-tooltip-id="tooltip-component"
              data-tooltip-content={`Lead caliente`}
              onClick={() => props.handleNivelInteresChange('CALIENTE')}
            >
              <i className="fa-solid fa-fire"></i>
            </div>
            <div
              className={`item-testado-lead ${
                props.nivelesInteres.includes('TIBIO') ? 'color-lead-tibio' : ''
              }`}
              data-tooltip-id="tooltip-component"
              data-tooltip-content={`Lead tibio`}
              onClick={() => props.handleNivelInteresChange('TIBIO')}
            >
              <i className="fa-solid fa-temperature-half"></i>
            </div>
            <div
              className={`item-testado-lead ${
                props.nivelesInteres.includes('FRIO') ? 'color-lead-frio' : ''
              }`}
              data-tooltip-id="tooltip-component"
              data-tooltip-content={`Lead frío`}
              onClick={() => props.handleNivelInteresChange('FRIO')}
            >
              <i className="fa-solid fa-snowflake"></i>
            </div>
          </div>
        </div>
        {/* Grupo 3: Filtros del Modal */}
        <div className="control-group">
          <button
            onClick={props.onFiltrosLeads}
            className={`btn btn-xs ${
              props.filtros.length > 0 ? 'btn-primary' : 'btn-outline-primary'
            }`}
          >
            Filtros{props.filtros.length > 0 && ` (${props.filtros.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadHeaderComponent;
