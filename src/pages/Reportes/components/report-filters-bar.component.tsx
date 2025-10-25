import React, { useState } from 'react';
import { Search, Tag, Megaphone, UserRoundSearch } from 'lucide-react';
import SelectSearchCrm from '../../../components/shared/SelectSearchCrm';
import SelectSearchCrmCampaign from '../../../components/shared/SelectSearchCrmCampaign';
import SelectSearchCrmUser from '../../../components/shared/SelectSearchCrmUser';

interface ReportFiltersBarProps {
  terminoBusqueda: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  users: any[];
  onChangeUsers: (items: any[]) => void;
  campaigns: any[];
  onChangeCampaigns: (items: any[]) => void;
  labels: any[];
  onChangeLabels: (items: any[]) => void;
  onCreateLabel?: () => void;
  nivelesInteres: string[];
  onToggleNivel: (nivel: string) => void;
  filtrosCount: number;
  onOpenFilters: () => void;
}

export default function ReportFiltersBar({
  terminoBusqueda,
  onSearchChange,
  onClearSearch,
  users,
  onChangeUsers,
  campaigns,
  onChangeCampaigns,
  labels,
  onChangeLabels,
  onCreateLabel,
  nivelesInteres,
  onToggleNivel,
  filtrosCount,
  onOpenFilters,
}: ReportFiltersBarProps) {
  const [openUserDropdown, setOpenUserDropdown] = useState(false);
  const [openCampaignDropdown, setOpenCampaignDropdown] = useState(false);
  const [openLabelDropdown, setOpenLabelDropdown] = useState(false);

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
      <div className="lead-header-search me-2 flex-grow-1" style={{ minWidth: 260 }}>
        <Search className="search-icon" size={18} />
        <div role="group" className="btn-group w-100">
          <input
            type="text"
            className="form-control form-control-sm todo-mayuscula"
            placeholder="Buscar por nombre, DNI, celular o correo..."
            value={terminoBusqueda}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button onClick={onClearSearch} className="btn btn-primary btn-xs">
            Limpiar
          </button>
        </div>
      </div>

      <div className="d-flex align-items-center flex-wrap gap-3">
        {/* Usuarios */}
        <div className="d-flex align-items-center gap-1">
          <div
            className="dropdown"
            onClick={() => setOpenUserDropdown(true)}
            onBlur={() => setOpenUserDropdown(false)}
            tabIndex={0}
          >
            <span data-bs-toggle="dropdown" aria-expanded={openUserDropdown} role="button">
              {users.filter((user) => user.selected).length > 0 ? (
                <i style={{ color: 'var(--primary-color)', fontSize: '1.4rem' }} className="ri-user-line"></i>
              ) : (
                <UserRoundSearch height={26} />
              )}
            </span>
            <SelectSearchCrmUser
              maxHeight="250px"
              minWidth="220px"
              items={users}
              open={openUserDropdown}
              onChange={onChangeUsers}
            />
          </div>
        </div>

        {/* Campañas */}
        <div className="d-flex align-items-center gap-1">
          <div
            className="dropdown"
            onClick={() => setOpenCampaignDropdown(true)}
            onBlur={() => setOpenCampaignDropdown(false)}
            tabIndex={0}
          >
            <span data-bs-toggle="dropdown" aria-expanded={openCampaignDropdown} role="button">
              {campaigns.filter((camp) => camp.selected).length > 0 ? (
                <i style={{ color: 'var(--primary-color)', fontSize: '1.4rem' }} className="ri-megaphone-line"></i>
              ) : (
                <Megaphone height={26} />
              )}
            </span>
            <SelectSearchCrmCampaign
              maxHeight="250px"
              minWidth="220px"
              items={campaigns}
              open={openCampaignDropdown}
              onChange={onChangeCampaigns}
            />
          </div>
        </div>

        {/* Etiquetas */}
        <div className="d-flex align-items-center gap-1">
          <div
            className="dropdown"
            onClick={() => setOpenLabelDropdown(true)}
            onBlur={() => setOpenLabelDropdown(false)}
            tabIndex={0}
          >
            <span data-bs-toggle="dropdown" aria-expanded={openLabelDropdown} role="button">
              {labels.filter((label) => label.selected).length > 0 ? (
                <i style={{ color: 'var(--primary-color)', fontSize: '1.4rem' }} className="fa-solid fa-tag"></i>
              ) : (
                <Tag height={22} />
              )}
            </span>
            <SelectSearchCrm
              maxHeight="250px"
              minWidth="220px"
              items={labels}
              icon="fa-solid fa-tag"
              open={openLabelDropdown}
              onChange={onChangeLabels}
              store={onCreateLabel ?? (() => {})}
            />
          </div>
        </div>

        {/* Estados de interés */}
        <div className="d-flex align-items-center gap-1 lead-header-state">
          <div
            className={`item-testado-lead ${nivelesInteres.includes('CALIENTE') ? 'color-lead-caliente' : ''}`}
            data-tooltip-id="tooltip-component"
            data-tooltip-content="Lead caliente"
            onClick={() => onToggleNivel('CALIENTE')}
          >
            <i className="fa-solid fa-fire"></i>
          </div>
          <div
            className={`item-testado-lead ${nivelesInteres.includes('TIBIO') ? 'color-lead-tibio' : ''}`}
            data-tooltip-id="tooltip-component"
            data-tooltip-content="Lead tibio"
            onClick={() => onToggleNivel('TIBIO')}
          >
            <i className="fa-solid fa-temperature-half"></i>
          </div>
          <div
            className={`item-testado-lead ${nivelesInteres.includes('FRIO') ? 'color-lead-frio' : ''}`}
            data-tooltip-id="tooltip-component"
            data-tooltip-content="Lead frío"
            onClick={() => onToggleNivel('FRIO')}
          >
            <i className="fa-solid fa-snowflake"></i>
          </div>
        </div>

        {/* Filtros avanzados */}
        <button
          onClick={onOpenFilters}
          className={`btn btn-xs ${filtrosCount > 0 ? 'btn-primary' : 'btn-outline-primary'}`}
        >
          Filtros{filtrosCount > 0 ? ` (${filtrosCount})` : ''}
        </button>
      </div>
    </div>
  );
}
