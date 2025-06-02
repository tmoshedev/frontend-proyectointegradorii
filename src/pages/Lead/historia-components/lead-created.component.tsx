interface LeadCreatedProps {
  stateUltimo: boolean;
  created_formatted: string;
  data: {
    note: string;
  };
}
export const LeadCreated = (props: LeadCreatedProps) => {
  return (
    <div className="historial-content__item">
      <div className="historial-item-left">
        <div className="historial-item-left__icon"></div>
        {!props.stateUltimo && <div className="historial-item-left__line"></div>}
      </div>
      <div className="historial-item">
        <div className="historial-item__content" style={{ padding: '0' }}>
          <div className="historial-item-right__content__title">
            <div className="history-content-title">Lead creado</div>
            <div className="history-content-title-left">
              <div className="history-content-title__text__desde">
                <span>{props.created_formatted}</span>
              </div>
            </div>
          </div>
          <div className="historial-item-right__content__description">
            <span>{props.data.note}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadCreated;
