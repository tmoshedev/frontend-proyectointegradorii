interface LeadCreatedProps {
  stateUltimo: boolean;
  created_formatted: string;
  user_names: string;
  user_father_last_name: string;
  user_mother_last_name: string;
  data: {
    state_current: string;
    state_moved: string;
    text: string;
  };
}

export const LeadAction = (props: LeadCreatedProps) => {
  return (
    <div className="historial-content__item">
      <div className="historial-item-left">
        <div className="historial-item-left__icon"></div>
        {!props.stateUltimo && <div className="historial-item-left__line"></div>}
      </div>
      <div className="historial-item">
        <div className="historial-item__content" style={{ padding: '0' }}>
          <div className="historial-item-right__content__title">
            <div className="history-content-title">{props.data.text}</div>
          </div>
          <div className="historial-item-right__content__description">
            <span>{props.created_formatted}</span>
            <div className="separador-history"></div>
            <span>
              {props.user_names} {props.user_father_last_name} {props.user_mother_last_name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadAction;
