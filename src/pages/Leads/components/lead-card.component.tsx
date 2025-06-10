import { Lead, LeadProject } from '../../../models';
import CanCheck from '../../../resources/can';

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

  const getChannelColorClass = (channel: string) => {
  const cleanChannel = channel?.trim().toUpperCase();

  switch (cleanChannel) {
    case 'INSTAGRAM':
      return 'kanban-card-instagram';
    case 'FACEBOOK':
      return 'kanban-card-facebook';
    case 'WHATSAPP':
      return 'kanban-card-whatsapp';
    case 'WEB':
      return 'kanban-card-web';
    case 'TIKTOK':
      return 'kanban-card-tiktok';
    case 'GOOGLE ADS':
      return 'kanban-card-google';
    case 'ORGÁNICO':
      return 'kanban-card-organico';
    case 'LANDING PAGE':
      return 'kanban-card-landing';
    default:
      return 'kanban-card-default';
  }
};
  return (
    <div
      className={`kanban-card ${getChannelColorClass(props.lead.channel_name)}`}
      data-id={props.lead.id}
      onClick={() => props.onClickLead(props.lead.uuid)}
    >
      <div className="kanban-card-header">
        <h4>
          {props.lead.names} {props.lead.last_names}
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
          <span>{props.lead.channel_name}</span>
        </p>
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
