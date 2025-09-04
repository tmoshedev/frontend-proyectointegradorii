import React, { useState } from 'react';
import { useSidebarResponsive } from '../../../hooks';
import TableCRMSkeleton from '../../../components/shared/TableCRMSkeleton';
import { AlignCenter, Search, Tag, UserRoundSearch } from 'lucide-react';
import { Lead, LeadLabel } from '../../../models';
import PageBodyComponent from '../../../components/page/page-body.component';
import SelectSearchCrm from '../../../components/shared/SelectSearchCrm';

interface Props {
  leads: Lead[];
  cargarDataLeads: (page: number, search?: string) => void;
  metaData: {
    current_page: number;
    total: number;
  };
  isTableLoading: boolean;
  filtroEtiqueta: string;
  setFiltroEtiqueta: (value: string) => void;
  onClickLead: (lead_uuid: string) => void;
  labels: any[];
  setLabels: React.Dispatch<React.SetStateAction<any[]>>;
  handleEtiquetasKanban: (etiquetas: any[]) => void;
  handleCrearEtiqueta: () => void;
  onEditarAsesor: (lead: Lead) => void;
}

export const LeadsDataComponent = (props: Props) => {
  useSidebarResponsive(true);
  const {
    leads,
    cargarDataLeads,
    metaData,
    isTableLoading,
    filtroEtiqueta,
    setFiltroEtiqueta,
    onClickLead,
    onEditarAsesor
  } = props;

  const [searchTerm, setSearchTerm] = useState(filtroEtiqueta);

  const onRefresh = () => {
    setSearchTerm('');
    setFiltroEtiqueta('');
    cargarDataLeads(1, '');
  };
  const [leadsSeleccionados, setLeadsSeleccionados] = useState<Lead[]>([]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFiltroEtiqueta(searchTerm);
    cargarDataLeads(1, searchTerm);
  };

  const [openLabelDropdown, setOpenLabelDropdown] = useState(false);

  /**
 * Generates initials from user names.
 * @param userNames - The user's first names.
 * @param userFatherName - The user's paternal last name.
 * @returns A string with the initials, or 'U' as a fallback.
 */
  const getInitials = (userNames?: string, userFatherName?: string): string => {
    if (userNames && userFatherName) {
      return `${userNames.charAt(0)}${userFatherName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  };

  const handleSelectAllLeads = (isChecked: boolean) => {
    if (isChecked) {
      setLeadsSeleccionados(leads);
    } else {
      setLeadsSeleccionados([]);
    }
  };

  const handleLeadSelection = (isChecked: boolean, lead: Lead) => {
    if (isChecked) {
      // Agregar el lead seleccionado
      setLeadsSeleccionados((prev) => [...prev, lead]);
    } else {
      // Remover el lead deseleccionado
      setLeadsSeleccionados((prev) => prev.filter((l) => l.id !== lead.id));
    }
  };

  const rolActual = localStorage.getItem('rolActual') || '';


  return (
    <div className="main-content app-content">
      <div className="container-fluid">
        <div className="card">
          <div className="card-header justify-content-between d-sm-flex d-block">
            <div className="card-title">Leads dados de Baja</div>
            <div className="header-actions">
              <div className="d-flex align-items-center">
                <div className="control-group" style={{ marginRight: '10px' }}>
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
                <form onSubmit={handleSearchSubmit} className="me-2">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por nombre/telefono..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    <button className="btn btn-outline-primary" type="submit">
                      <UserRoundSearch />
                    </button>
                  </div>
                </form>
                <div className="d-flex ms-2">
                  <button
                    className="btn btn-primary btn-sm btn-ganado"
                    disabled={leadsSeleccionados.length === 0}
                  >
                    <i className="fa-solid fa-thumbs-up"></i> Activar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div>  </div>
            {isTableLoading ? (
              <TableCRMSkeleton columnCount={5} />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-bordered ">
                  <thead className="table-primary">
                    <tr style={{ textAlign: 'center' }}>
                      <th>Activar lead?
                        <div className="zh-tabla-checkbox">

                          <input
                            id="leads"
                            className="form-check-input"
                            name="leads"
                            type="checkbox"
                            onChange={(e) => handleSelectAllLeads(e.target.checked)}
                            style={{ borderColor: 'black' }}
                          />
                        </div>
                      </th>
                      <th>Nombre</th>
                      <th>Teléfono</th>
                      <th>Estado</th>
                      <th>Etiqueta de Salida</th>
                      <th>Motivo de Baja</th>
                      <th>Asesor</th>

                    </tr>
                  </thead>
                  <tbody className="font-size-11" >
                    {leads.length > 0 ? (
                      leads.map((lead, index) => (
                        <tr
                          key={lead.id}
                        >
                          <td>  <div className="zh-tabla-checkbox"><input
                            id={`lead_${index}`}
                            name={`lead_${index}`}
                            type="checkbox"
                            className="form-check-input"
                            checked={leadsSeleccionados.includes(leads[index])}
                            onChange={(e) => handleLeadSelection(e.target.checked, leads[index])}
                            style={{ borderColor: 'black' }}
                          /></div></td>
                          <td
                            onClick={() => onClickLead(lead.uuid)}
                            style={{ cursor: 'pointer' }}
                          >{`${lead.names} ${lead.last_names}`}</td>
                          <td onClick={() => onClickLead(lead.uuid)}
                            style={{ cursor: 'pointer' }}>{lead.cellphone}</td>
                          <td onClick={() => onClickLead(lead.uuid)}
                            style={{ cursor: 'pointer' }}>
                            <span className="badge bg-danger-transparent">{lead.estado_final}</span>
                          </td>
                          <td onClick={() => onClickLead(lead.uuid)}
                            style={{ cursor: 'pointer' }}>
                            {lead.lead_labels?.map((label: LeadLabel, labelIndex: number) => (
                              <span key={label.id} style={{ color: label.color, fontWeight: 'bold' }}>
                                {label.name}
                                {labelIndex < (lead.lead_labels.length - 1) ? ', ' : ''}
                              </span>
                            ))}
                          </td>
                          <td onClick={() => onClickLead(lead.uuid)}
                            style={{ cursor: 'pointer' }}>{lead.reason || 'N/A'}</td>
                          <td>
                            <div
                              className="d-flex kanban-card-footer justify-content-between mt-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="d-flex align-items-center kanban-card-footer-user">
                                {lead.user_id ? (
                                  <>
                                    <div className="ms-2">
                                      <div className="d-flex flex-column">
                                        <p>
                                          {lead.user_names} {lead.user_father_last_name} {lead.user_mother_last_name}
                                        </p>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="ms-2">
                                    <div className="d-flex flex-column">
                                      <p>---</p>
                                      <small>Sin asesor asignado</small>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="d-flex align-items-center">
                                <button
                                  data-tooltip-id="tooltip-component"
                                  data-tooltip-content={
                                    rolActual === 'ADMINISTRATOR' ? 'Editar asesor' : 'Editar asesor'
                                  }
                                  className="btn btn-outline-cancel btn-xs"
                                  onClick={() => {
                                    onEditarAsesor(lead);
                                  }}
                                >
                                  <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center p-5">
                          No se encontraron leads dados de baja.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Paginación si es necesaria */}
        </div>
      </div>
    </div>


  );
};

export default LeadsDataComponent;