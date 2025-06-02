import ListHistorialLeadComponent from '../historia-components/list-historial-lead.component';
import LeadHistoriaEtapa from '../historia-components/lead-historia-etapa.component';
import LeadNoteComponent from '../historia-components/lead-note.component';
import LeadItemActividad from '../historia-components/lead-item-actividad.component';
import { LeadHistorialResponse } from '../../../models/responses';
import LeadCreated from '../historia-components/lead-created.component';

interface LeadHistoriaComponentProps {
  stateViewHistorial: string;
  changeHistorialView: (view: string) => void;
  lead_historial: LeadHistorialResponse[];
  count_historial: {
    notes: number;
    state_changes: number;
  };
}
export const LeadHistoriaComponent = (props: LeadHistoriaComponentProps) => {
  return (
    <div className="area-historial">
      <div className="area-historial__header">
        <div className="area-historial__header__title">
          <h4>Historia del Lead</h4>
        </div>
      </div>
      <ListHistorialLeadComponent
        count_historial={props.count_historial}
        stateViewHistorial={props.stateViewHistorial}
        changeHistorialView={props.changeHistorialView}
      />
      <div className="historial-content">
        {props.lead_historial.map((item: LeadHistorialResponse, idx: number) => {
          const stateUltimo = idx === props.lead_historial.length - 1;
          switch (item.type) {
            case 'created':
              return <LeadCreated key={idx} {...item} stateUltimo={stateUltimo} />;
            case 'stage_change':
              return <LeadHistoriaEtapa key={idx} {...item} stateUltimo={stateUltimo} />;
            case 'note':
              return <LeadNoteComponent key={idx} {...item} stateUltimo={stateUltimo} />;
            case 'activity':
              return <LeadItemActividad key={idx} {...item} stateUltimo={stateUltimo} />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default LeadHistoriaComponent;
