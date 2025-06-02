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
import { useNavigate } from 'react-router-dom';

interface KanbanBoardComponentProps {
  handleStateView: (view: string) => void;
  handleModalLeadForm: (type: string) => void;
  onRefreshLeads: () => void;
  etapas: LeadStatus[];
  setEtapas: React.Dispatch<React.SetStateAction<LeadStatus[]>>;
}

export const KanbanBoardComponent = (props: KanbanBoardComponentProps) => {
  const { getLeadStatus } = useLeadStatus();
  const { changeState, updateLead } = useLeads();
  const navigate = useNavigate();

  const [isDragging, setIsDragging] = useState(false);

  const handleLeadsChange = useCallback((etapaId: string, newLeads: Lead[]) => {
    props.setEtapas((prev) => prev.map((e) => (e.id === etapaId ? { ...e, leads: newLeads } : e)));
  }, []);

  const handleDragEnd = useCallback((evt: SortableEvent) => {
    const { to, from, oldIndex, newIndex, item } = evt;

    // Detectamos etapas
    const sourceColumn = Number(from.closest('.kanban-column')?.getAttribute('data-etapa-id'));
    const destColumn = Number(to.closest('.kanban-column')?.getAttribute('data-etapa-id'));

    // ID del lead movido
    const leadId = Number(item.getAttribute('data-id'));

    if (destColumn) {
      changeState(String(destColumn), String(leadId), false).then(() => {
        // Aquí podrías manejar la respuesta de la API si es necesario
      });
    }

    setIsDragging(false);
  }, []);

  const handleDropAction = (leadId: number, action: DropActionFooter) => {
    //ELIMINAR EL CARD PRIMERO
    props.setEtapas((prev) =>
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

  const onClickLead = (lead_uuid: string) => {
    navigate(`/leads/${lead_uuid}`);
  };

  useEffect(() => {
    const dataInicial = () => {
      getLeadStatus('1', '1', 'get', true).then((response: LeadStatusResponse) => {
        props.setEtapas(response.data);
      });
    };

    dataInicial();
  }, []);

  return (
    <div className="kanban-board">
      <LeadHeaderComponent
        onRefreshLeads={props.onRefreshLeads}
        handleStateView={props.handleStateView}
        handleModalLeadForm={props.handleModalLeadForm}
      />
      <div className="kanban-columns">
        {props.etapas.map((etapa) => (
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
                <LeadCardComponent lead={lead} key={lead.id} onClickLead={onClickLead} />
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
