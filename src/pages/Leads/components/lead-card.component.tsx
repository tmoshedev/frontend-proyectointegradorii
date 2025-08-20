import { useMemo, useRef, useState } from 'react';
import { Lead, LeadProject } from '../../../models';
import CanCheck from '../../../resources/can';
// Proteger contra ataques XSS
import DOMPurify from 'dompurify';
import { Dropdown } from 'bootstrap';

// Define interest levels and their properties in a single place for easy management.
const INTEREST_LEVELS = {
  CALIENTE: {
    label: 'Lead Caliente',
    icon: 'fa-solid fa-fire',
    className: 'caliente',
  },
  TIBIO: {
    label: 'Lead Tibio',
    icon: 'fa-solid fa-temperature-half',
    className: 'tibio',
  },
  FRIO: {
    label: 'Lead Frío',
    icon: 'fa-solid fa-snowflake',
    className: 'frio',
  },
};

// A fallback for when the interest level is not set.
const UNKNOWN_INTEREST = {
  label: 'Lead Desconocido',
  icon: 'fa-solid fa-question-circle',
  className: 'desconocido',
};

interface LeadCardProps {
  lead: Lead;
  onClickLead: (lead_uuid: string) => void;
  onEditarAsesor: (lead: Lead) => void;
  onChangeStateLead: (lead_uuid: string, nivel_interes: string) => void;
  disabled?: boolean;
}

/**
 * A component to display a summary of a Lead in a Kanban view.
 */
export const LeadCardComponent = ({
  lead,
  onClickLead,
  onEditarAsesor,
  onChangeStateLead,
  disabled = false, // Valor por defecto

  
}: LeadCardProps) => {
  // Destructure lead properties for cleaner access.
  const {
    uuid,
    id,
    names,
    last_names,
    cellphone,
    lead_projects,
    channel_icon_html,
    channel_name,
    supervisor_names,
    interes,
    user_id,
    user_names,
    user_father_last_name,
    user_mother_last_name,
    user_rol_name,
    actividad_estado,
    lead_state_id,
    conteo_actividad
  } = lead;

  // Retrieve current role from localStorage.
  const rolActual = localStorage.getItem('rolActual') || '';
  const dropdownToggleRef = useRef<HTMLDivElement>(null);
  const [nivelInteres, setNivelInteres] = useState(interes);

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

  /**
   * Handles the state change for the lead's interest level.
   * Prevents the event from bubbling up to the card's main click handler.
   * @param e - The mouse event.
   * @param state - The new interest state ('CALIENTE', 'TIBIO', 'FRIO').
   */
  const handleInterestChange = (e: React.MouseEvent, nivel_interes: string) => {
    e.stopPropagation();
    onChangeStateLead(uuid, nivel_interes);
    setNivelInteres(nivel_interes);

    if (dropdownToggleRef.current) {
      const dropdown = Dropdown.getOrCreateInstance(dropdownToggleRef.current);
      dropdown.hide();
    }
  };

  // Determine the current interest level's properties or use the unknown fallback.
  const currentInterest =
    INTEREST_LEVELS[nivelInteres as keyof typeof INTEREST_LEVELS] || UNKNOWN_INTEREST;

  const multiBorderStyle = useMemo(() => {
    // Asegúrate de que el array de etiquetas exista y no esté vacío
    if (!lead.lead_labels || lead.lead_labels.length === 0) {
      return {}; // No se aplica ningún estilo si no hay etiquetas
    }

    const colors = lead.lead_labels.map((label) => label.color);

    // Si solo hay un color, creamos un fondo sólido simple
    if (colors.length === 1) {
      // Usamos una variable CSS para pasar el color al pseudo-elemento
      return { '--multi-border-color': colors[0] };
    }

    // Si hay múltiples colores, construimos el gradiente
    const percentage = 100 / colors.length;
    const gradientStops = colors
      .map((color, index) => {
        const start = index * percentage;
        const end = (index + 1) * percentage;
        return `${color} ${start}%, ${color} ${end}%`;
      })
      .join(', ');

    const gradientString = `linear-gradient(to bottom, ${gradientStops})`;
    // Devolvemos el estilo con la variable CSS que contiene nuestro gradiente
    return { '--multi-border-color': gradientString };
  }, [lead.lead_labels]);

  const cardClassName = `lead-card ${disabled ? 'disabled not-draggable' : ''}`;

  return (

    <div className={cardClassName} data-id={lead.id}>

    <div
      className={`kanban-card ${actividad_estado.state_view ? 'kanban-card-alert' : ''}`}
      data-id={id}
      onClick={() => onClickLead(uuid)}
      style={{ ...multiBorderStyle, position: 'relative' } as React.CSSProperties} // importante para posicionar
    >

      {channel_name === 'ALITORRES' && (
        <img
          src="/images/alitorres.png"
          alt="Logo Alitorres"
          style={{
            position: 'absolute',
            top: '25px',
            right: '-5px',
            width: '2rem',
            height: '1.8rem',
            zIndex: 2,
            border: '1px solid #f0f0f0',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        />
      )}

      {lead.lead_state_id == "2" && (
        <div
          data-tooltip-id="tooltip-component"
          data-tooltip-content={`Número de actividades: ${lead.conteo_actividad}`}
          style={{
            position: 'absolute',
            top: '55px',
            right: '-5px',
            color: 'white',
            borderRadius: '50%',
            width: '2rem',
            height: '2rem',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            border: '1px solid #f0f0f0',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
            backgroundColor: 'green',
          }}
        >
          {lead.conteo_actividad}
        </div>
      )}



      {/* Header Section */}
      <div className="kanban-card-header">
        {actividad_estado.state_view && (
          <div
            data-tooltip-id="tooltip-component"
            data-tooltip-content={`${actividad_estado.state} - ${actividad_estado.fecha_actividad}`}
            className={`alert-lead ${
              actividad_estado.type === 'VENCIDA' ? 'alert-lead-actividad' : 'alert-lead-porvencer'
            }`}
          >
            !
          </div>
          
        )}
        
        
        <h4 className="kanban-card-title">
          <span>
            {names}
          </span>
        </h4>
        <h4 className="kanban-card-title">
          <span>
            {last_names}
          </span>
        </h4>
        {/*<small>Celular: {cellphone}</small>*/}
      </div>

      {/* Body Section */}
      <div className="kanban-card-body">
        <p>
          <b>Proyectos interesados:</b>
        </p>
        <div className="d-flex flex-wrap gap-2 mt-1">
          {lead_projects.length > 0 ? (
            lead_projects.map((project: LeadProject, index: number) => (
              <span key={`${project.id}-${index}`} className="badge bg-light text-dark">
                {project.name}
              </span>
            ))
          ) : (
            <span className="badge bg-light text-dark">Sin proyectos</span>
          )}
        </div>

        <p className="mt-2">
          <b>Origen/Canal: </b>
          <span
            className="me-1"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(channel_icon_html || '') }}
          />
          <span>{channel_name || '-'}</span>
        </p>

        {/*['COMMERCIAL_LEADER', 'DEVELOPER', 'ADMINISTRATOR'].includes(rolActual) && (
          <p className="mt-1">
            <b>Supervisor: </b>
            <span>{supervisor_names ?? '-'}</span>
          </p>
        )*/}

        {/* Interest Level Dropdown */}
        <div className="d-flex justify-content-center mt-2">
          <div className="dropdown">
            <span
              onClick={(e) => e.stopPropagation()}
              ref={dropdownToggleRef}
              className={`lead-icon ${currentInterest.className}`}
              data-bs-toggle="dropdown"
              aria-expanded="false"
              role="button"
            >
              <i className={currentInterest.icon}></i> {currentInterest.label}
            </span>
            <ul className="dropdown-menu">
              {Object.entries(INTEREST_LEVELS).map(([stateKey, { label, icon, className }]) => (
                <li key={stateKey}>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => handleInterestChange(e, stateKey)}
                  >
                    <span
                      className={`lead-icon ${
                        nivelInteres === stateKey ? className : 'menu-estado'
                      }`}
                    >
                      <i className={icon}></i> {label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div
        className="d-flex kanban-card-footer justify-content-between mt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex align-items-center kanban-card-footer-user">
          {user_id ? (
            <>
              <div
                className="avatar user-avatar user-avatar-menu mb-0"
                style={{ height: '1.8rem', width: '1.8rem' }}
              >
                {getInitials(user_names, user_father_last_name)}
              </div>
              <div className="ms-2">
                <div className="d-flex flex-column">
                  <p>
                    {user_names} {user_father_last_name} {user_mother_last_name}
                  </p>
                  <small>{user_rol_name}</small>
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
        {CanCheck('update-asesor') && (
          <div className="d-flex align-items-center">
            <button
              data-tooltip-id="tooltip-component"
              data-tooltip-content={
                rolActual === 'COMMERCIAL_LEADER' ? 'Editar Supervisor' : 'Editar asesor'
              }
              className="btn btn-outline-cancel btn-xs"
              onClick={() => onEditarAsesor(lead)}
            >
              <i className="fa-solid fa-pen-to-square"></i>
            </button>
          </div>
        )}
      </div>
    </div>
       </div>
 
  );
};

export default LeadCardComponent;
