import { useEffect, useRef, useState } from 'react';
import SelectDosDropdown from '../../../components/shared/SelectDosDropdown';
import { CircleUser, Share2 } from 'lucide-react';
import { Lead, LeadProject } from '../../../models';
import { useLeads } from '../../../hooks';
import { LeadDistribucionResponse } from '../../../models/responses';
import { SweetAlert } from '../../../utilities';
import { AppStore } from '../../../redux/store';
import { useSelector } from 'react-redux';

interface Props {
  handleStateView: (view: string) => void;
}

export const DistribuirLeadComponent = (props: Props) => {
  const { getDistribucion, postDistribuirLeads } = useLeads();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [leadsSeleccionados, setLeadsSeleccionados] = useState<Lead[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [type, setType] = useState<string>('equitable');
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<any[]>([]);
  const userState = useSelector((state: AppStore) => state.auth.user);

  let textTypeUser = 'Usuarios';
  switch (userState.roles[0].name) {
    case 'SUPERVISOR DE VENTAS':
      textTypeUser = 'Asesores';
      break;
    case 'LIDER COMERCIAL':
      textTypeUser = 'Supervisores';
      break;
    default:
      textTypeUser = 'Usuarios';
  }

  let textTypeUserSingular = 'Usuario';
  switch (userState.roles[0].name) {
    case 'SUPERVISOR DE VENTAS':
      textTypeUserSingular = 'Asesor';
      break;
    case 'LIDER COMERCIAL':
      textTypeUserSingular = 'Supervisor';
      break;
    default:
      textTypeUserSingular = 'Usuario';
  }

  const onChangeType = (type: string) => {
    setType(type);
    setUsuariosSeleccionados([]);
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

  const onDistribuirLeads = () => {
    if (leadsSeleccionados.length === 0) {
      SweetAlert.warning('Mensaje', 'Debe seleccionar al menos un lead para distribuir.');
      return;
    }
    if (usuariosSeleccionados.length === 0) {
      SweetAlert.warning(
        'Mensaje',
        `Debe seleccionar al menos un ${textTypeUserSingular} para distribuir los leads.`
      );
      return;
    }
    postDistribuirLeads(type, leadsSeleccionados, usuariosSeleccionados, true)
      .then((response: LeadDistribucionResponse) => {
        SweetAlert.success('Mensaje', 'Leads distribuidos correctamente.');
        setLeadsSeleccionados([]);
        setUsuariosSeleccionados([]);
        setType('equitable');
        setLeads(response.leads);
        setUsuarios(response.users);
      })
      .catch((error) => {
        SweetAlert.error('Error', error.message || 'Ocurrió un error al distribuir los leads.');
      });
  };

  useEffect(() => {
    const el = dropdownRef.current;
    if (!el) return;

    const handler = () => {
      const input: HTMLInputElement | null = el.querySelector('input');
      input?.focus();
    };

    el.addEventListener('shown.bs.dropdown', handler);

    return () => {
      el.removeEventListener('shown.bs.dropdown', handler);
    };
  }, []);

  useEffect(() => {
    const dataInicial = () => {
      getDistribucion(true).then((response: LeadDistribucionResponse) => {
        setLeads(response.leads);
        setUsuarios(response.users);
      });
    };

    dataInicial();
  }, []);

  return (
    <div
      className="main-content app-content main-content--page"
      style={{ paddingLeft: '0rem', paddingRight: '0rem' }}
    >
      <div className="container-fluid">
        <div className="importar-data">
          <div className="distribuir-lead-header mt-1 mb-2">
            <div className="dl__title-header">
              <h4 className="mt-3">Distribuir leads</h4>
            </div>
            <div className="dl__actions-header">
              <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
                <input
                  type="radio"
                  className="btn-check"
                  name="type"
                  id="type"
                  checked={type === 'equitable'}
                  onChange={() => onChangeType('equitable')}
                />
                <label className="btn btn-outline-primary" htmlFor="type">
                  Distribución equitativa
                </label>
                <input
                  type="radio"
                  className="btn-check"
                  name="type"
                  id="type_manual"
                  checked={type === 'manual'}
                  onChange={() => onChangeType('manual')}
                />
                <label className="btn btn-outline-primary" htmlFor="type_manual">
                  Distribución manual
                </label>
              </div>
              <div className="btn-asesores" ref={dropdownRef}>
                <button
                  data-bs-auto-close="outside"
                  data-bs-toggle="dropdown"
                  className="btn btn-success"
                >
                  <CircleUser /> {textTypeUser} ({usuariosSeleccionados.length})
                </button>
                <div className="main-header-dropdown dropdown-menu">
                  <SelectDosDropdown
                    items={usuarios}
                    itemsSelected={usuariosSeleccionados}
                    setItemSelected={setUsuariosSeleccionados}
                    textNoResult={`No se encontraron ${textTypeUser} disponibles.`}
                    multipleSelect={type === 'manual' ? false : true}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="importa-data-body">
            <div className="tabla-container">
              <div className="tabla-row-distribuir tabla-header">
                <div className="zh-tabla-checkbox">
                  <input
                    id="leads"
                    className="form-check-input"
                    name="leads"
                    type="checkbox"
                    onChange={(e) => handleSelectAllLeads(e.target.checked)}
                  />
                </div>
                <div className="tabla-cell text-center">Proyecto</div>
                <div className="tabla-cell text-center">Origen</div>
                <div className="tabla-cell text-center">Nombres</div>
                <div className="tabla-cell text-center">Apellidos</div>
                <div className="tabla-cell text-center">Celular</div>
                <div className="tabla-cell text-center">Correo</div>
                <div className="tabla-cell text-center">Ciudad</div>
              </div>
              <div
                className="zh-tabla-body overflow-auto"
                style={{ height: 'calc(100vh - 13.2rem)' }}
              >
                {leads.map((lead: Lead, index: number) => (
                  <div
                    className={`tabla-row-distribuir ${
                      leadsSeleccionados.includes(lead) ? 'tabla-row-seleccionado' : ''
                    }`}
                    key={lead.id}
                  >
                    <div className="zh-tabla-checkbox">
                      <input
                        id={`lead_${index}`}
                        name={`lead_${index}`}
                        type="checkbox"
                        className="form-check-input"
                        checked={leadsSeleccionados.includes(leads[index])}
                        onChange={(e) => handleLeadSelection(e.target.checked, leads[index])}
                      />
                    </div>
                    <div className="tabla-cell">
                      <div className="d-flex gap-1">
                        {lead.lead_projects.map((project: LeadProject) => (
                          <span key={project.id} className="badge bg-light text-dark">
                            {project.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="tabla-cell">{lead.channel_name ?? '-'}</div>
                    <div className="tabla-cell">{lead.names ?? '-'}</div>
                    <div className="tabla-cell">{lead.last_names ?? '-'}</div>
                    <div className="tabla-cell">{lead.cellphone ?? '-'}</div>
                    <div className="tabla-cell">{lead.email ?? '-'}</div>
                    <div className="tabla-cell">{lead.ciudad ?? '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="importa-data-footer">
            <button onClick={() => props.handleStateView('KANBAN')} className="btn btn-light me-2">
              <i className="fa-solid fa-xmark"></i> Cancelar
            </button>
            <button onClick={onDistribuirLeads} className="btn btn-primary">
              <Share2 height={18} /> Distribuir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistribuirLeadComponent;
