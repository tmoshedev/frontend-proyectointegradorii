import {
  KanbanSquare,
  AlignJustify,
  RefreshCw,
  CloudDownload,
  Plus,
  Share2,
  Tag,
  Search,
  Megaphone,
  UserRoundSearch
} from 'lucide-react';
import CanCheck from '../../../resources/can';
import SelectSearchCrm from '../../../components/shared/SelectSearchCrm';
import SelectSearchCrmCampaign from '../../../components/shared/SelectSearchCrmCampaign';
import SelectSearchCrmUser from '../../../components/shared/SelectSearchCrmUser';
import { useState } from 'react';

interface LeadHeaderComponentProps {
  onRefreshLeads: () => void;
  handleStateView: (view: string) => void;
  handleModalLeadForm: (type: string) => void;
  onFiltrosLeads: () => void;
  filtros: any[];
  nivelesInteres: string[];
  handleNivelInteresChange: (nivel: string) => void;

  campaigns: any[];
  setCampaigns: React.Dispatch<React.SetStateAction<any[]>>;
  handleCampanasKanban: (campanas: any[]) => void;

  users: any[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  handleUsuariosKanban: (usuarios: any[]) => void;


  labels: any[];
  setLabels: React.Dispatch<React.SetStateAction<any[]>>;
  handleEtiquetasKanban: (etiquetas: any[]) => void;
  handleCrearEtiqueta: () => void;
  terminoBusqueda: string;
  setTerminoBusqueda: React.Dispatch<React.SetStateAction<string>>;
  
}

export const LeadHeaderComponent = (props: LeadHeaderComponentProps) => {
  const [openUserDropdown, setOpenUserDropdown] = useState(false);
  const [openCampaignDropdown, setOpenCampaignDropdown] = useState(false);
  const [openLabelDropdown, setOpenLabelDropdown] = useState(false);

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
        
        {<button
          onClick={() => props.handleModalLeadForm('STORE')}
          className="btn btn-primary btn-sm ms-2"
        >
          <Plus height={20} /> Lead
        </button>}
        
        {CanCheck('leads-distrubir') && (
          <button
            onClick={() => props.handleStateView('DISTRIBUIR')}
            className="btn btn-info btn-sm ms-2"
          >
            <Share2 height={20} /> Distribuir Leads
          </button>
        )}
        {CanCheck('leads-importar') && (
        <button
          onClick={() => props.handleStateView('IMPORTAR')}
          className="btn btn-success btn-sm ms-2"
        >
          <CloudDownload height={20} /> Importar Leads
        </button>)}
      </div>

      <div className="d-flex justify-content-center align-items-center">
        <div className="lead-header-search me-2">
          <Search className="search-icon" size={18} />
          <div role="group" className="btn-group w-100">
            <input
              type="text"
              className="form-control form-control-sm todo-mayuscula"
              placeholder="Buscar por nombre, DNI, celular o correo..."
              value={props.terminoBusqueda}
              onChange={(e) => props.setTerminoBusqueda(e.target.value)}
            />
            <button onClick={() => props.setTerminoBusqueda('')} className="btn btn-primary btn-xs">
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="header-controls-container">
        {/* Grupo 1: Usuarios */}
          <div className="d-flex align-items-center gap-1 justify-content-center align-items-center">
            <div
              className="dropdown"
              onClick={() => setOpenUserDropdown(true)}
              onBlur={() => setOpenUserDropdown(false)}
              tabIndex={0}
            >
              <span data-bs-toggle="dropdown" aria-expanded={openUserDropdown} role="button">
                {props.users.filter((user) => user.selected).length > 0 ? (
                  <i
                    style={{ color: 'var(--primary-color)', fontSize: '1.4rem' }}
                    className="ri-user-line"
                  ></i>
                ) : (
                  <UserRoundSearch height={30} />
                )}  
              </span>
              <SelectSearchCrmUser
                maxHeight="250px"
                minWidth="220px"
                items={props.users}
                open={openUserDropdown}
                onChange={props.handleUsuariosKanban}
              />
            </div>
          </div>

        {/* Grupo 2: Campaña */}
          <div className="d-flex align-items-center gap-1 justify-content-center align-items-center">
            <div
              className="dropdown"
              onClick={() => setOpenCampaignDropdown(true)}
              onBlur={() => setOpenCampaignDropdown(false)}
              tabIndex={0}
            >
              <span data-bs-toggle="dropdown" aria-expanded={openCampaignDropdown} role="button">
                {props.campaigns.filter((campaign) => campaign.selected).length > 0 ? (
                  <i
                    style={{ color: 'var(--primary-color)', fontSize: '1.4rem' }}
                    className="ri-megaphone-line"
                  ></i>
                ) : (
                  <Megaphone height={30} />
                )}  
              </span>
              <SelectSearchCrmCampaign
                maxHeight="250px"
                minWidth="220px"
                items={props.campaigns}
                open={openCampaignDropdown}
                onChange={props.handleCampanasKanban}
              />
            </div>
          </div>

        {/* Grupo 3: Etiquetas */}
        <div className="control-group">
          <div className="d-flex align-items-center gap-1 justify-content-center align-items-center">
            <div
              className="dropdown"
              onClick={() => setOpenLabelDropdown(true)}
              onBlur={() => setOpenLabelDropdown(false)}
              tabIndex={0}
            >
              <span data-bs-toggle="dropdown" aria-expanded={openLabelDropdown} role="button">
                {props.labels.filter((label) => label.selected).length > 0 ? (
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
                open={openLabelDropdown}
                onChange={props.handleEtiquetasKanban}
                store={props.handleCrearEtiqueta}
              />
            </div>
          </div>
        </div>
        {/* Grupo 4: Estados de Interés */}
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
        {/* Grupo 5: Filtros del Modal */}
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
