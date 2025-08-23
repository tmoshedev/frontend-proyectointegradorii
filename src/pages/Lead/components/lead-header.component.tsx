import { Lead } from '../../../models';
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

const getInitials = (user_names: string, user_father_names: string) => {
  if (user_names && user_father_names) {
    return `${user_names.charAt(0)}${user_father_names.charAt(0)}`;
  }
  return '-'; // Si no hay datos, usa 'U' por defecto
};

export const LeadHeaderComponent = () => {
  const navigate = useNavigate();
  const { updateLeadAsesor, changeEstadoFinal } = useLeads();
  const dispatch = useDispatch();
  const lead: Lead = useSelector((store: AppStore) => store.lead.lead);
  const usuarios: any[] = useSelector((store: AppStore) => store.lead.users);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<any[]>([]);
  const [stateSearchUsuarios, setStateSearchUsuarios] = useState<Boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const onLeadState = (estado_final: string) => {
    SweetAlert.onConfirmation(
      () => handleLeadState(lead.id, estado_final),
      handleCancelDelete,
      `¿Estás seguro de que deseas marcar este lead como ${estado_final.toLowerCase()}?`,
      'Sí, marcar como ' + estado_final.toLowerCase()
    );
  };

  const handleCancelDelete = () => {};

  const handleLeadState = (id: any, estado_final: string) => {
    changeEstadoFinal(id, estado_final, true)
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
    navigate('/leads');
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
        {rolActual === 'ADMINISTRATOR' || lead.estado_final == null && (
          <div className="d-flex ms-2">
            {/*<button
              onClick={() => onLeadState('GANADO')}
              className="btn btn-primary btn-sm me-2 btn-ganado"
            >
              Ganado
            </button>*/}
            <button
              onClick={() => onLeadState('SALIDA')}
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
        {lead.estado_final == 'SALIDA' && (
          <div className="d-flex ms-2">
            <button className="btn btn-primary btn-sm btn-perdido">
              <i className="fa-solid fa-thumbs-down"></i> Lead salida
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadHeaderComponent;
