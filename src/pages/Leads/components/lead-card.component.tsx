import { Lead, LeadProject } from '../../../models';
import CanCheck from '../../../resources/can';
//Proteger contra ataques XSS
import DOMPurify from 'dompurify';

interface LeacCardProps {
  lead: Lead;
  onClickLead: (lead_uuid: string) => void;
  onEditarAsesor: (lead: Lead) => void;
}
export const LeadCardComponent = (props: LeacCardProps) => {
  const getInitials = (user_names: string, user_father_names: string) => {
    if (user_names && user_father_names) {
      return `${user_names.charAt(0)}${user_father_names.charAt(0)}`;
    }
    return 'U'; // Si no hay datos, usa 'U' por defecto
  };
  const rolActual = localStorage.getItem('rolActual') || '';

  return (
    <div
      className={`kanban-card ${props.lead.actividad_estado.state_view ? 'kanban-card-alert' : ''}`}
      data-id={props.lead.id}
      onClick={() => props.onClickLead(props.lead.uuid)}
    >
      <div className="kanban-card-header">
        {props.lead.actividad_estado.state_view && (
          <div
            data-tooltip-id="tooltip-component"
            data-tooltip-content={`${props.lead.actividad_estado.state} - ${props.lead.actividad_estado.fecha_actividad}`}
            className={`alert-lead ${
              props.lead.actividad_estado.type == 'VENCIDA'
                ? 'alert-lead-vencido'
                : 'alert-lead-porvencer'
            }`}
          >
            !
          </div>
        )}
        <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              marginRight: '0.5rem',
            }}
          >
            {props.lead.names} {props.lead.last_names}
          </span>
        </h4>
        <small>Celular: {props.lead.cellphone}</small>
      </div>
      <div className="kanban-card-body">
        <p>
          <b>Proyectos interesados:</b>
        </p>
        <div className="d-flex flex-wrap gap-2 mt-1">
          {props.lead.lead_projects.map((project: LeadProject) => (
            <span key={project.id} className="badge bg-light text-dark">
              {project.name}
            </span>
          ))}
          {props.lead.lead_projects.length === 0 && (
            <span className="badge bg-light text-dark">Sin proyectos</span>
          )}
        </div>
        <p className="mt-2">
          <b>Origen/Canal: </b>
          <span
            className="me-1"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(props.lead.channel_icon_html || ''),
            }}
          />
          <span>{props.lead.channel_name != '' ? props.lead.channel_name : '-'}</span>
        </p>
        {(rolActual == 'COMMERCIAL_LEADER' ||
          rolActual == 'DEVELOPER' ||
          rolActual == 'ADMINISTRATOR') && (
          <p className="mt-1">
            <b>Supervisor: </b>
            <span>{props.lead.supervisor_names ?? '-'}</span>
          </p>
        )}
        <div className="d-flex justify-content-center">
          <p className="mt-2 tex-center">
            <span className={`lead-icon ${props.lead.interes}`}>
              {(() => {
                switch (props.lead.interes) {
                  case 'caliente':
                    return (
                      <>
                        <i className="fa-solid fa-fire"></i> Lead Caliente
                      </>
                    );
                  case 'tibio':
                    return (
                      <>
                        <i className="fa-solid fa-temperature-half"></i> Lead Tibio
                      </>
                    );
                  case 'frio':
                    return (
                      <>
                        <i className="fa-solid fa-snowflake"></i> Lead Frío
                      </>
                    );
                  default:
                    return (
                      <>
                        <i className="fa-solid fa-question-circle"></i> Lead Desconocido
                      </>
                    );
                }
              })()}
            </span>
          </p>
        </div>
      </div>
      <div
        className="d-flex kanban-card-footer justify-content-between mt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex align-items-center kanban-card-footer-user">
          {props.lead.user_id ? (
            <>
              <div
                className="avatar user-avatar user-avatar-menu mb-0"
                style={{ height: '1.8rem', width: '1.8rem' }}
              >
                {getInitials(props.lead.user_names, props.lead.user_father_last_name)}
              </div>
              <div className="ms-2">
                <div className="d-flex flex-column">
                  <p>
                    {props.lead.user_names} {props.lead.user_father_last_name}{' '}
                    {props.lead.user_mother_last_name}
                  </p>
                  <small>{props.lead.user_rol_name}</small>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="ms-2">
                <div className="d-flex flex-column">
                  <p>---</p>
                  <small>Sin asesor asignado</small>
                </div>
              </div>
            </>
          )}
        </div>
        {CanCheck('update-asesor') && (
          <div className="d-flex align-items-center">
            <button
              className="btn btn-outline-cancel btn-xs"
              onClick={() => props.onEditarAsesor(props.lead)}
            >
              <i className="fa-solid fa-pen-to-square"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadCardComponent;
