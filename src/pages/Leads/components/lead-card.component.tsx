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

  const getChannelIcon = (channel: string) => {
  const normalized = channel.trim().toLowerCase();

  switch (normalized) {
    case 'facebook':
      return <i className="fa-brands fa-facebook ms-2" style={{ color: '#1877F2' }} title="Facebook"></i>;
    case 'instagram':
      return <i className="fa-brands fa-instagram ms-2" style={{ color: '#E4405F' }} title="Instagram"></i>;
    case 'tiktok':
      return <i className="fa-brands fa-tiktok ms-2" style={{ color: '#000000' }} title="TikTok"></i>;
    case 'google ads':
      return <i className="fa-brands fa-google ms-2" style={{ color: '#4285F4' }} title="Google Ads"></i>;
    case 'orgánico':
      return <i className="fa-solid fa-leaf ms-2" style={{ color: '#28a745' }} title="Orgánico"></i>;
    case 'landing page':
      return <i className="fa-solid fa-globe ms-2" style={{ color: '#17a2b8' }} title="Landing Page"></i>;
    default:
      return <i className="fa-solid fa-question-circle ms-2" style={{ color: '#6c757d' }} title="Canal desconocido"></i>;
  }
};

  return (
    <div
      className="kanban-card"
      data-id={props.lead.id}
      onClick={() => props.onClickLead(props.lead.uuid)}
    >
      <div className="kanban-card-header">
        <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap', 
            flex: 1, 
            marginRight: '0.5rem' 
          }}>
            {props.lead.names} {props.lead.last_names}
          </span>
          {getChannelIcon(props.lead.channel_name)}
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
