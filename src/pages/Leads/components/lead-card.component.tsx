import { Lead } from '../../../models';

interface LeacCardProps {
  lead: Lead;
}
export const LeadCardComponent = (props: LeacCardProps) => {
  const getInitials = (user_names: string, user_father_names: string) => {
    if (user_names && user_father_names) {
      return `${user_names.charAt(0)}${user_father_names.charAt(0)}`;
    }
    return 'U'; // Si no hay datos, usa 'U' por defecto
  };

  return (
    <div className="kanban-card" data-id={props.lead.id}>
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
          {props.lead.lead_projects.map((project) => (
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
      <div className="kanban-card-footer">
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
      </div>
    </div>
  );
};

export default LeadCardComponent;
