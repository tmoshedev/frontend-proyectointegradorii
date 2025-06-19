interface ListHistorialLeadComponentProps {
  stateViewHistorial: string;
  changeHistorialView: (state: string) => void;
  count_historial: {
    notes: number;
    state_changes: number;
    activities: number;
  };
}
export const ListHistorialLeadComponent = (props: ListHistorialLeadComponentProps) => {
  const onChangeViewHistorial = (view: string) => {
    props.changeHistorialView(view);
  };
  return (
    <div className="list-historial">
      <div className="list-historial__item">
        <a
          onClick={() => onChangeViewHistorial('alls')}
          role="button"
          className={`${props.stateViewHistorial == 'alls' ? 'active' : ''}`}
        >
          Todos
        </a>
      </div>
      <div className="list-historial__item">
        <a
          onClick={() => onChangeViewHistorial('notes')}
          role="button"
          className={`${props.stateViewHistorial == 'notes' ? 'active' : ''}`}
        >
          Notas({props.count_historial.notes})
        </a>
      </div>
      <div className="list-historial__item">
        <a
          onClick={() => onChangeViewHistorial('activities')}
          className={`${props.stateViewHistorial == 'activities' ? 'active' : ''}`}
          role="button"
        >
          Actividades({props.count_historial.activities})
        </a>
      </div>
      {/* <div className="list-historial__item">
        <a role="button">Archivos (2)</a>
      </div> */}
      <div className="list-historial__item">
        <a
          onClick={() => onChangeViewHistorial('stage_change')}
          role="button"
          className={`${props.stateViewHistorial == 'stage_change' ? 'active' : ''}`}
        >
          Registro de cambios
        </a>
      </div>
    </div>
  );
};

export default ListHistorialLeadComponent;
