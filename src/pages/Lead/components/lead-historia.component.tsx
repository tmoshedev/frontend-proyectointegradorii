import ListHistorialLeadComponent from '../historia-components/list-historial-lead.component';
import LeadHistoriaEtapa from '../historia-components/lead-historia-etapa.component';
import LeadNoteComponent from '../historia-components/lead-note.component';
import LeadItemActividad from '../historia-components/lead-item-actividad.component';
import { LeadHistorialResponse } from '../../../models/responses';
import LeadCreated from '../historia-components/lead-created.component';
//Redux
import { AppStore } from '../../../redux/store';
import { setOnlyHistorialData, setStateViewHistorial } from '../../../redux/states/lead.slice';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useCalendarioActividades, useLeads } from '../../../hooks';
import LeadAction from '../historia-components/lead-action.component';
import { SweetAlert } from '../../../utilities';

interface LeadHistoriaComponentProps {
  changeHistorialView: (view: string) => void;
  handleModalCancelarActividad: (lead_activity_uuid: string) => void;
}
export const LeadHistoriaComponent = (props: LeadHistoriaComponentProps) => {
  const dispatch = useDispatch();
  const { uuid } = useParams();
  const { getLeadHistorial } = useLeads();
  const { postActividadCompletada } = useCalendarioActividades();

  const { lead, historial, count_historial, stateViewHistorial } = useSelector(
    (store: AppStore) => store.lead
  );

  const changeHistorialView = (view: string) => {
    const selectedView = view === '' ? stateViewHistorial : view;
    dispatch(setStateViewHistorial(selectedView));

    getLeadHistorial(uuid ?? '', selectedView, false).then((response: any) => {
      dispatch(
        setOnlyHistorialData({
          lead_historial: response.lead_historial,
          count_historial: response.count_historial,
        })
      );
    });
  };

  const onActividadCompletada = (uuid: string) => {
    // Logic to handle activity completion
    console.log(`Activity with UUID ${uuid} completed.`);

    SweetAlert.onConfirmation(
      () => handleActividadCompletada(uuid),
      handleCancelDelete,
      '¿Está seguro que deseas marcar como completa la actividad?'
    );
  };

  const handleActividadCompletada = (lead_activity_uuid: string) => {
    postActividadCompletada(lead_activity_uuid, true).then(() => {
      SweetAlert.success('Mensaje', 'Actividad marcada como completada');
      getLeadHistorial(uuid ?? '', stateViewHistorial, false).then((response: any) => {
        dispatch(
          setOnlyHistorialData({
            lead_historial: response.lead_historial,
            count_historial: response.count_historial,
          })
        );
      });
    });
  };

  const handleCancelDelete = () => {};

  return (
    <div className="area-historial">
      <div className="area-historial__header">
        <div className="area-historial__header__title">
          <h4>Historia del Lead</h4>
        </div>
      </div>
      <ListHistorialLeadComponent
        count_historial={count_historial}
        stateViewHistorial={stateViewHistorial}
        changeHistorialView={changeHistorialView}
      />
      <div className="historial-content">
        {historial.map((item: LeadHistorialResponse, idx: number) => {
          const stateUltimo = idx === historial.length - 1;
          switch (item.type) {
            case 'created':
              return <LeadCreated key={idx} {...item} stateUltimo={stateUltimo} />;
            case 'stage_change':
              return <LeadHistoriaEtapa key={idx} {...item} stateUltimo={stateUltimo} />;
            case 'note':
              return <LeadNoteComponent key={idx} {...item} stateUltimo={stateUltimo} />;
            case 'activity':
              return (
                <LeadItemActividad
                  key={idx}
                  {...item}
                  stateUltimo={stateUltimo}
                  onActividadCompletada={onActividadCompletada}
                  handleModalCancelarActividad={props.handleModalCancelarActividad}
                  activity_user_id={item.user_id} // El ID del creador de la actividad
                   lead_assigned_user_id={lead.user_id}
                  
                />
              );
            case 'action':
              return <LeadAction key={idx} {...item} stateUltimo={stateUltimo} />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default LeadHistoriaComponent;
