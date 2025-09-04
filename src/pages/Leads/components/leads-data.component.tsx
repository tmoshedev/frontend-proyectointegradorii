import React, { useRef, useState } from 'react';
import { useSidebarResponsive } from '../../../hooks';
import TableCRMSkeleton from '../../../components/shared/TableCRMSkeleton';
import { AlignCenter, Search, Tag, UserRoundSearch } from 'lucide-react';
import { Lead, LeadLabel } from '../../../models';
import PageBodyComponent from '../../../components/page/page-body.component';
import SelectSearchCrm from '../../../components/shared/SelectSearchCrm';
import EditarSelectSearchCrm from '../../../components/EditarSelectSearchCrm';
import { AppStore } from '../../../redux/store';
import { useSelector } from 'react-redux';
import { changeEstadoFinal, updateLabels } from '../../../services/leads.service';
import { Bounce, toast } from 'react-toastify';
import { setLeadAndHistorial, updateLeadLabels } from '../../../redux/states/lead.slice';
import { SweetAlert } from '../../../utilities';
import { LeadResponse } from '../../../models/responses';

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
  const [estadoFinalModal, setEstadoFinalModal] = useState<string>('');
  const [notaModal, setNotaModal] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

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


  //const lead: Lead = useSelector((store: AppStore) => store.lead.lead);
  const { lead, projectsAvailable, labelsAvailable, channelsAvailable } = useSelector(
    (store: AppStore) => store.lead
  );
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<any[]>([]);
  const [stateSearchUsuarios, setStateSearchUsuarios] = useState<Boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Estados para etiquetas en el modal
  const [editLabels, setEditLabels] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<any[]>(lead.lead_labels || []);


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

  const onCancelLabels = () => {
    setSelectedLabels(lead.lead_labels || []);
    setEditLabels(false);
  };
  const onGuardarLabels = (items: any[]) => {
      updateLabels(lead.uuid, items, false)
        .then((response) => {
          toast.success(response.message, {
            position: 'top-center',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: 'light',
            transition: Bounce,
          });
          dispatch(updateLeadLabels(items));
          setEditLabels(false);
        })
        .catch((error) => {
          toast.error('Error al actualizar las etiquetas.', {
            position: 'top-center',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: 'light',
            transition: Bounce,
          });
        });
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

  const onLeadState = (estado_final: string) => {
    openModal(estado_final);
  };

  const openModal = (estado_final: string) => {
    setEstadoFinalModal(estado_final);
    setNotaModal('');
    setShowModal(true);
  };

  const onActivarEditLabel = () => {
    setEditLabels(true);
  };

  const handleModalConfirm = () => {
    const totalLeads = leadsSeleccionados.length;
    const confirmationText =
      totalLeads > 1
        ? `¿Estás seguro que quieres reactivar ${totalLeads} leads?`
        : '¿Estás seguro que quieres reactivar el lead?';
    const successButtonText = totalLeads > 1 ? 'Sí, reactivar leads' : 'Sí, reactivar lead';

    SweetAlert.onConfirmation(
      () => {
        const promises = leadsSeleccionados.map(lead =>
          handleLeadState(lead.id, estadoFinalModal, notaModal)
        );

        Promise.all(promises).then(() => {
          setLeadsSeleccionados([]);
          cargarDataLeads(1, searchTerm);
        });
      },
      handleCancelDelete,
      confirmationText,
      successButtonText
    );
    setShowModal(false);
  };
  
    const handleModalCancel = () => {
      setShowModal(false);
    };

      const handleCancelDelete = () => {};


    const handleLeadState = (id: any, estado_final: string, nota: string = '') => {
        return changeEstadoFinal(id, estado_final, true, nota)
          .then((response: LeadResponse) => {
            // No actualizamos el lead individual en Redux aquí para evitar sobreescrituras en el bucle.
            // La actualización de la lista se encargará de reflejar los cambios.
            toast.success(`Lead marcado como ${estado_final.toLowerCase()}.`, {
              position: 'top-center',
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              progress: undefined,
              theme: 'light',
              transition: Bounce,
            });
          })
          .catch((error) => {
            SweetAlert.error(
              `Error al marcar el lead como ${estado_final.toLowerCase()}.`,
              error.message
            );
            // Rechazamos la promesa para que Promise.all pueda detectar el error si es necesario
            return Promise.reject(error);
          });
      };
    
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
                     onClick={() => onLeadState(' ')}
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
      {/* MODAL CAMBIO DE ESTADO */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '8px',
              minWidth: '320px',
              maxWidth: '90vw',
            }}
          >
            <h5>¿POR QUE EL LEAD SE ESTÁ REACTIVANDO?</h5>
            <div className="mb-3">
              <label>Describe:</label>
              <textarea
                className="form-control"
                value={notaModal}
                onChange={e => setNotaModal(e.target.value)}
                rows={3}
              />
            </div>
            
            {/* Bloque visual de etiquetas 
      <div className="block-item">
        <div className="bock-item__title">
          <h4>Etiquetas</h4>
        </div>
        <div className="bock-item__datos">
          <div className="fields-list-row">
            {editLabels ? (
              <EditarSelectSearchCrm
                options={labelsAvailable}
                selected={selectedLabels}
                onChange={setSelectedLabels}
                placeholder="Seleccionar etiquetas"
                onCancel={onCancelLabels}
                onGuardar={onGuardarLabels}
                onCrearNuevaEtiqueta={() => {}}
              />
            ) : (
              <div className="fields-list__components">
                <div className="list-fields-items">
                  <ul className="fields-list__items">
                    {selectedLabels?.map((label: LeadLabel, index: number) => (
                      <li key={index} className="fields-list__item">
                        <div className="fields-list__item__block">
                          <span className="fields-list__item_content">
                            <i style={{ color: label.color }} className="fa-solid fa-tag"></i>{' '}
                            {label.name}
                          </span>
                        </div>
                      </li>
                    ))}
                    {lead.lead_labels?.length === 0 && (
                      <li className="fields-list__item">
                        <div className="fields-list__item__block">
                          <span className="fields-list__item_content">Sin etiquetas</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="list-fields-edit">
                  <button onClick={onActivarEditLabel} className="btn btn-outline-cancel btn-xs">
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>*/}
      {/* Fin bloque etiquetas */}
      
            {/* Puedes agregar más campos aquí si lo necesitas */}
            <div className="d-flex justify-content-end">
              <button className="btn btn-outline-secondary me-2" onClick={handleModalCancel}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleModalConfirm}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>


  );
};

export default LeadsDataComponent;

function dispatch(arg0: any) {
  throw new Error('Function not implemented.');
}
