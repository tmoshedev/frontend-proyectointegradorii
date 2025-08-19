import { Circle } from 'lucide-react';
import { iconsActividades } from '../../../utilities/iconsActividades.utilily';

interface LeadItemActividadProps {
  stateUltimo: boolean;
  created_formatted: string;
  user_names: string;
  user_father_last_name: string;
  user_mother_last_name: string;
  data: {
    state_current: string;
    state_moved: string;
    text: string;
    title: string;
    activity_name: string;
    state: string;
    uuid: string;
    motivo: string;
  };
  onActividadCompletada: (uuid: string) => void;
  handleModalCancelarActividad: (lead_activity_uuid: string) => void;
}
export const LeadItemActividad = (props: LeadItemActividadProps) => {
  return (
    <div className="historial-content__item">
      <div className="historial-item-left">
        <div className="historial-item-left__icon-type">
          {iconsActividades(18)[props.data.activity_name]}
        </div>
        {!props.stateUltimo && <div className="historial-item-left__line"></div>}
      </div>
      <div className="historial-item">
        <div className="historial-item-item">
          <div className="historial-item__content">
            <div className="historial-item__content__title">
              <div className="historial-item__content__title-date">
                <div className="item-title-item">
                  <div className="item-title-item-text">
                    <div className="item-title-item-text__icon">
                      {props.data.state == 'PENDIENTE' && (
                        <Circle
                          role="button"
                          height={17}
                          color="rgba(33,35,44,.24)"
                          data-tooltip-id="tooltip-component"
                          data-tooltip-content={'Marcar como hecho'}
                          onClick={() => props.onActividadCompletada(props.data.uuid)}
                        />
                      )}
                      {props.data.state == 'COMPLETADO' && (
                        <i
                          role="button"
                          data-tooltip-id="tooltip-component"
                          data-tooltip-content={'Actividad completada'}
                          className="fa-solid fa-circle-check"
                        ></i>
                      )}
                      {props.data.state == 'CANCELADO' && (
                        <i
                          role="button"
                          data-tooltip-id="tooltip-component"
                          data-tooltip-content={'Actividad cancelada'}
                          className="fa-solid fa-xmark text-danger"
                        ></i>
                      )}
                    </div>
                    <span className="item-title-item-text__text">
                      {props.data.title} - {props.created_formatted}
                    </span>
                  </div>
                </div>
                <div className="btn-group mb-0">
                  <a
                    aria-label="anchor"
                    className="option-dots show"
                    data-bs-toggle="dropdown"
                    aria-expanded="true"
                  >
                    <i className="fa fa-ellipsis-v"></i>
                  </a>
                  <div className="dropdown-menu p-0" style={{ width: '12rem' }}>
                    {props.data.state == 'PENDIENTE' && (
                      <a
                        onClick={() => props.handleModalCancelarActividad(props.data.uuid)}
                        className="dropdown-item"
                        role="button"
                      >
                        <i className="fa-solid fa-xmark me-2"></i> Cancelar actividad
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="historial-item__details">
              <span></span>
              <div className="separador-history"></div>
              <span>
                {props.user_names} {props.user_father_last_name} {props.user_mother_last_name}
              </span>
            </div>
            {props.data.state == 'CANCELADO' && (
              <div className="historial-item__content__description">{props.data.motivo}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeadItemActividad;
