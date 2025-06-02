//Importar iconos
import { NotebookPen } from 'lucide-react';

interface LeadNoteComponentProps {
  stateUltimo: boolean;
  created_formatted: string;
  user_names: string;
  user_father_last_name: string;
  user_mother_last_name: string;
  data: {
    note: string;
  };
}

export const LeadNoteComponent = (props: LeadNoteComponentProps) => {
  return (
    <div className="historial-content__item">
      <div className="historial-item-left">
        <div className="historial-item-left__icon-type">
          <NotebookPen size={18} />
        </div>
        {!props.stateUltimo && <div className="historial-item-left__line"></div>}
      </div>
      <div className="historial-item">
        <div className="historial-item-item" style={{ backgroundColor: '#fff6d6' }}>
          <div className="historial-item__content">
            <div className="historial-item__content__title">
              <div className="historial-item__content__title-date">
                <div className="item-title-date-content">
                  <div className="item-title-date-content-text">
                    <span>{props.created_formatted}</span>
                    <div className="separador-history"></div>
                    <span>
                      {props.user_names} {props.user_father_last_name} {props.user_mother_last_name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="historial-item__content__description">{props.data.note}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadNoteComponent;
