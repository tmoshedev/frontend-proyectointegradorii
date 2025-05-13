import { ReactSortable, SortableEvent } from 'react-sortablejs';
import LeadHeaderComponent from './lead-header.component';
import LeadCardComponent from './lead-card.component';
import LeadFooterComponent, {
  DropAction as DropActionFooter,
} from '../components/lead-footer.component';
import { useLeads, useLeadStatus } from '../../../hooks';
import { useCallback, useEffect, useState } from 'react';
import { Lead, LeadStatus } from '../../../models';
import { LeadStatusResponse } from '../../../models/responses';

interface KanbanBoardComponentProps {
  handleStateView: (view: string) => void;
}

export const KanbanBoardComponent = (props: KanbanBoardComponentProps) => {
  const { getLeadStatus } = useLeadStatus();
  const { changeState, updateLead } = useLeads();
  const [etapas, setEtapas] = useState<LeadStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleLeadsChange = useCallback((etapaId: string, newLeads: Lead[]) => {
    setEtapas((prev) => prev.map((e) => (e.id === etapaId ? { ...e, leads: newLeads } : e)));
  }, []);

  const handleDragEnd = useCallback((evt: SortableEvent) => {
    const { to, from, oldIndex, newIndex, item } = evt;

    // Detectamos etapas
    const sourceColumn = Number(from.closest('.kanban-column')?.getAttribute('data-etapa-id'));
    const destColumn = Number(to.closest('.kanban-column')?.getAttribute('data-etapa-id'));

    // ID del lead movido
    const leadId = Number(item.getAttribute('data-id'));

    console.log(
      `Lead ${leadId} moved from etapa ${sourceColumn} index ${oldIndex} ` +
        `to etapa ${destColumn} index ${newIndex}`
    );

    if (destColumn) {
      changeState(String(destColumn), String(leadId), false).then(() => {
        // Aquí podrías manejar la respuesta de la API si es necesario
      });
    }

    setIsDragging(false);
  }, []);

  const handleDropAction = (leadId: number, action: DropActionFooter) => {
    console.log(`Lead ${leadId} dropped in action ${action}`);
    //ELIMINAR EL CARD PRIMERO
    setEtapas((prev) =>
      prev.map((etapa) => ({
        ...etapa,
        leads: etapa.leads.filter((lead) => lead.id !== leadId),
      }))
    );

    updateLead(String(leadId), { estado_final: action }, false).then(() => {
      // Aquí podrías manejar la respuesta de la API si es necesario
    });
  };

  const handleDragStart = useCallback(() => {
    setIsDragging(true); // <<< enciende la barra
  }, []);

  const onRefreshLeads = () => {
    getLeadStatus('1', '1', 'get', true).then((response: LeadStatusResponse) => {
      setEtapas(response.data);
    });
  };

  useEffect(() => {
    const dataInicial = () => {
      getLeadStatus('1', '1', 'get', true).then((response: LeadStatusResponse) => {
        setEtapas(response.data);
      });
    };

    dataInicial();
  }, []);

  return (
    <div className="kanban-board">
      <LeadHeaderComponent
        onRefreshLeads={onRefreshLeads}
        handleStateView={props.handleStateView}
      />
      <div className="kanban-columns">
        {etapas.map((etapa) => (
          <div key={etapa.id} className="kanban-column" data-etapa-id={etapa.id}>
            <div className="kanban-column-header">
              <div className="kanban-column-header-stage">
                <h4 className="kanban-column-title p-0 m-0">{etapa.name}</h4>
                <small className="p-0 m-0">{etapa.leads.length} leads</small>
              </div>
            </div>
            <ReactSortable
              list={etapa.leads}
              setList={(newLeads) => handleLeadsChange(etapa.id, newLeads)}
              group="etapas"
              animation={150}
              ghostClass="ghost"
              dragClass="drag"
              className="kanban-column-content"
              forceFallback
              onStart={handleDragStart}
              onEnd={handleDragEnd}
            >
              {etapa.leads.map((lead) => (
                <LeadCardComponent lead={lead} key={lead.id} />
              ))}
            </ReactSortable>
          </div>
        ))}
      </div>
      {isDragging && <LeadFooterComponent onDropAction={handleDropAction} />}
    </div>
  );
};

export default KanbanBoardComponent;
