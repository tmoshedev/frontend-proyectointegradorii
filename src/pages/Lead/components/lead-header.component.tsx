import { Lead, LeadLabel } from '../../../models';
import { useDispatch, useSelector } from 'react-redux';
import { AppStore } from '../../../redux/store';
import CanCheck from '../../../resources/can';
import SelectDosDropdown from '../../../components/shared/SelectDosDropdown';
import { useEffect, useRef, useState } from 'react';
// @ts-ignore
import { Dropdown } from 'bootstrap';
import { SweetAlert } from '../../../utilities';
import { useLeads } from '../../../hooks';
import { LeadResponse } from '../../../models/responses';
//Utilities
import { Bounce, toast } from 'react-toastify';
import { setLeadAndHistorial } from '../../../redux/states/lead.slice';
import { useNavigate } from 'react-router-dom';
import EditarSelectSearchCrm from '../../../components/EditarSelectSearchCrm'; // Importa el componente
interface Props {
  onCrearNuevaEtiqueta: () => void;
}
import {
  updateLeadLabels,
} from '../../../redux/states/lead.slice';
const getInitials = (user_names: string, user_father_names: string) => {
  if (user_names && user_father_names) {
    return `${user_names.charAt(0)}${user_father_names.charAt(0)}`;
  }
  return '-'; // Si no hay datos, usa 'U' por defecto
};

export const LeadHeaderComponent = (props: Props) => {
  const navigate = useNavigate();
  const { updateLeadAsesor, changeEstadoFinal, updateLabels } = useLeads();
  const dispatch = useDispatch();
  //const lead: Lead = useSelector((store: AppStore) => store.lead.lead);
  const usuarios: any[] = useSelector((store: AppStore) => store.lead.users);
  const { lead, projectsAvailable, labelsAvailable, channelsAvailable } = useSelector(
    (store: AppStore) => store.lead
  );
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<any[]>([]);
  const [stateSearchUsuarios, setStateSearchUsuarios] = useState<Boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // MODAL PARA CAMBIO DE ESTADO
  const [showModal, setShowModal] = useState(false);
  const [estadoFinalModal, setEstadoFinalModal] = useState<string>('');
  const [notaModal, setNotaModal] = useState<string>('');

  // Estados para etiquetas en el modal
  const [editLabels, setEditLabels] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<any[]>(lead.lead_labels || []);

  useEffect(() => {
    setSelectedLabels(lead.lead_labels || []);
  }, [lead]);

    const onActivarEditLabel = () => {
    setEditLabels(true);
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

  const openModal = (estado_final: string) => {
    setEstadoFinalModal(estado_final);
    setNotaModal('');
    setShowModal(true);
  };

  const handleModalConfirm = () => {
    SweetAlert.onConfirmation(
      () => handleLeadState(lead.id, estadoFinalModal, notaModal),
      handleCancelDelete,
      `¿Estás seguro de que deseas marcar este lead como ${estadoFinalModal.toLowerCase()}?`,
      'Sí, marcar como ' + estadoFinalModal.toLowerCase()
    );
    setShowModal(false);
  };

  const handleModalCancel = () => {
    setShowModal(false);
  };

  const onUsuariosSeleccionados = (usuarios: any[]) => {
    setUsuariosSeleccionados(usuarios);
    setStateSearchUsuarios(false);
  };

  const onCancelEditAsesor = () => {
    setStateSearchUsuarios(false);
    setUsuariosSeleccionados([
      {
        id: lead.user_id,
        name: `${lead.user_names ?? ''} ${lead.user_father_last_name ?? ''} ${
          lead.user_mother_last_name ?? ''
        }`.trim(),
      },
    ]);
    if (dropdownRef.current) {
      const dropdownInstance = Dropdown.getOrCreateInstance(dropdownRef.current);
      dropdownInstance.hide();
    }
  };

  const onGuardarEditAsesor = () => {
    const asesorId = usuariosSeleccionados[0].id;
    if (lead.user_id === asesorId) {
      SweetAlert.warning('El asesor seleccionado es el mismo que el actual.');
      return;
    }

    updateLeadAsesor(lead.uuid, asesorId, false)
      .then((response: LeadResponse) => {
        dispatch(
          setLeadAndHistorial({
            lead: response.lead,
            lead_historial: response.lead_historial,
            count_historial: response.count_historial,
          })
        );
        toast.success('Asesor actualizado correctamente.', {
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
        setStateSearchUsuarios(false);
        if (dropdownRef.current) {
          const dropdownInstance = Dropdown.getOrCreateInstance(dropdownRef.current);
          dropdownInstance.hide();
        }
      })
      .catch((error) => {
        SweetAlert.error('Error al actualizar el asesor.', error.message);
      });
  };

  // MODIFICADO: ahora abre el modal
  const onLeadState = (estado_final: string) => {
    openModal(estado_final);
  };

  const handleCancelDelete = () => {};

  const handleLeadState = (id: any, estado_final: string, nota: string = '') => {
    changeEstadoFinal(id, estado_final, true, nota)
      .then((response: LeadResponse) => {
        dispatch(
          setLeadAndHistorial({
            lead: response.lead,
            lead_historial: response.lead_historial,
            count_historial: response.count_historial,
          })
        );
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
      });
  };

  const onRegresarLeads = () => {
    if (lead.estado_final === 'BAJA') {
      navigate('/leads', { state: { view: 'KANBAN'/*, estado_final: 'BAJA'*/ } });
    } else {
      navigate('/leads', { state: { view: 'KANBAN' } });
    }
  };

  useEffect(() => {
    const dropdownEl = dropdownRef.current;
    if (!dropdownEl) return;

    const handleClose = () => setStateSearchUsuarios(false);

    dropdownEl.addEventListener('hidden.bs.dropdown', handleClose);

    return () => {
      dropdownEl.removeEventListener('hidden.bs.dropdown', handleClose);
    };
  }, []);

  useEffect(() => {
    setUsuariosSeleccionados([
      {
        id: lead.user_id,
        name: `${lead.user_names ?? ''} ${lead.user_father_last_name ?? ''} ${
          lead.user_mother_last_name ?? ''
        }`.trim(),
      },
    ]);
  }, [lead]);

  const rolActual = localStorage.getItem('rolActual') || '';

  return (
    <div className="lead-header__title">
      <div className="d-flex align-items-center">
        <button onClick={onRegresarLeads} className="btn btn-outline-primary btn-xs">
          <i className="fa-solid fa-arrow-left"></i> Regresar
        </button>
      </div>
      <div className="lead-header__text">
        <h1>
          LEAD: {lead.names} {lead.last_names}
        </h1>
      </div>
      <div className="lead-header__buttons">
        <div
          data-bs-auto-close="outside"
          data-bs-toggle="dropdown"
          className="d-flex align-items-center kanban-card-footer-user"
          style={{ cursor: 'pointer' }}
          ref={dropdownRef}
        >
          <div
            className="avatar user-avatar user-avatar-menu mb-0"
            style={{ height: '1.8rem', width: '1.8rem' }}
          >
            {getInitials(lead.user_names, lead.user_father_last_name)}
          </div>
          <div className="ms-2">
            <div className="d-flex flex-column">
              <p>
                {lead.user_names} {lead.user_father_last_name} {lead.user_mother_last_name}
              </p>
              <small>{lead.user_rol_name}</small>
            </div>
          </div>
          {CanCheck('update-asesor') && (
            <div className="ms-2">
              <i className="fa-solid fa-caret-down"></i>
            </div>
          )}
        </div>
        {CanCheck('update-asesor') && (
          <div className="main-header-dropdown dropdown-menu dropdown-edit-asesor">
            <div className="edit-asesor-header">
              <div className="edit-asesor-form">
                <label>Cambiar asesor</label>
                <div
                  className="text-current"
                  onClick={() => setStateSearchUsuarios(!stateSearchUsuarios)}
                >
                  <span>{usuariosSeleccionados[0]?.name}</span>
                  <i className="fa-solid fa-caret-down me-2 mt-1"></i>
                </div>
                {stateSearchUsuarios && (
                  <SelectDosDropdown
                    className="select-dos-edit-asesor"
                    items={usuarios}
                    itemsSelected={usuariosSeleccionados}
                    setItemSelected={onUsuariosSeleccionados}
                    textNoResult={`No se encontraron Asesores disponibles.`}
                    multipleSelect={false}
                    autoFocus={true}
                  />
                )}
              </div>
            </div>
            <div className="edit-asesor-footer">
              <button onClick={onCancelEditAsesor} className="btn btn-xs btn-outline-cancel me-2">
                Cancelar
              </button>
              <button
                disabled={usuariosSeleccionados.length == 0}
                onClick={onGuardarEditAsesor}
                className="btn btn-xs btn-primary"
              >
                Guardar
              </button>
            </div>
          </div>
        )}
        {rolActual === 'ADMINISTRATOR' && lead.estado_final == null && (
          <div className="d-flex ms-2">
            {/*<button
              onClick={() => onLeadState('GANADO')}
              className="btn btn-primary btn-sm me-2 btn-ganado"
            >
              Ganado
            </button>*/}
            <button
              onClick={() => onLeadState('BAJA')}
              className="btn btn-primary btn-sm btn-perdido"
            >
              DAR DE BAJA
            </button>
          </div>
        )}
        {lead.estado_final == 'GANADO' && (
          <div className="d-flex ms-2">
            <button className="btn btn-primary btn-sm btn-ganado">
              <i className="fa-solid fa-thumbs-up"></i> Lead ganado
            </button>
          </div>
        )}
        {lead.estado_final == 'BAJA' && (
          <div className="d-flex ms-2">
            <button className="btn btn-primary btn-sm btn-perdido">
              <i className="fa-solid fa-thumbs-down"></i> Lead dado de baja
            </button>
          </div>
        )}
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
            <h5>¿POR QUE EL LEAD SE ESTÁ DANDO DE BAJA?</h5>
            <div className="mb-3">
              <label>Describe:</label>
              <textarea
                className="form-control"
                value={notaModal}
                onChange={e => setNotaModal(e.target.value)}
                rows={3}
              />
            </div>
            
            {/* Bloque visual de etiquetas */}
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
                onCrearNuevaEtiqueta={props.onCrearNuevaEtiqueta}
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
      </div>
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

export default LeadHeaderComponent;
