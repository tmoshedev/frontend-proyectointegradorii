import { Lead } from '../../../models';
import { useSelector } from 'react-redux';
import { AppStore } from '../../../redux/store';

const getInitials = (user_names: string, user_father_names: string) => {
  if (user_names && user_father_names) {
    return `${user_names.charAt(0)}${user_father_names.charAt(0)}`;
  }
  return '-'; // Si no hay datos, usa 'U' por defecto
};

export const LeadHeaderComponent = () => {
  const lead: Lead = useSelector((store: AppStore) => store.lead.lead);

  return (
    <div className="lead-header__title">
      <div className="lead-header__text">
        <h1>
          LEAD: {lead.names} {lead.last_names}
        </h1>
      </div>
      <div className="lead-header__buttons">
        <div className="d-flex align-items-center kanban-card-footer-user">
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
        </div>
        <div className="d-flex ms-2">
          <button className="btn btn-primary btn-sm me-2 btn-ganado">Ganado</button>
          <button className="btn btn-primary btn-sm btn-perdido">Perdido</button>
        </div>
      </div>
    </div>
  );
};

export default LeadHeaderComponent;
