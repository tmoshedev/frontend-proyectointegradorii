import { PhoneOutgoing } from 'lucide-react';

interface LeadItemActividadProps {
  stateUltimo: boolean;
}
export const LeadItemActividad = (props: LeadItemActividadProps) => {
  return (
    <div className="historial-content__item">
      <div className="historial-item-left">
        <div className="historial-item-left__icon-type">
          <PhoneOutgoing size={18} />
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
                      <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <span className="item-title-item-text__text">Realizar llamada Junio 2025</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="historial-item__details">
              <span>02 Junio del 2025</span>
              <div className="separador-history"></div>
              <span>Guillermo Santisteban</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeadItemActividad;
