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
  handleModalAsesor: (lead: Lead, users: any[]) => void;
  onFiltrosLeads: (type: string) => void;
  users: any[];
  setUsers: any;
  setLabels: any;
  setChannels: any;
  setStages: any;
  setProjects: any;
  filtros: any[];
}

export const KanbanBoardComponent = (props: KanbanBoardComponentProps) => {
  const { getLeadStatus } = useLeadStatus();
  const { changeState, changeEstadoFinal } = useLeads();
  const navigate = useNavigate();

  const [isDragging, setIsDragging] = useState(false);

  const handleLeadsChange = useCallback((etapaId: string, newLeads: Lead[]) => {
    props.setEtapas((prev) => prev.map((e) => (e.id === etapaId ? { ...e, leads: newLeads } : e)));
  }, []);

  const handleDragEnd = useCallback((evt: SortableEvent) => {
    const { to, from, oldIndex, newIndex, item } = evt;

    // Detectamos etapas
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

    changeEstadoFinal(String(leadId), action, false).then(() => {
      // Aquí podrías manejar la respuesta de la API si es necesario
    });
  };

  const handleDragStart = useCallback(() => {
    setIsDragging(true); // <<< enciende la barra
  }, []);

  const onClickLead = (lead_uuid: string) => {
    navigate(`/leads/${lead_uuid}`);
  };

  const onEditarAsesor = (lead: Lead) => {
    props.handleModalAsesor(lead, props.users);
  };

  const onFiltrosLeads = () => {
    props.onFiltrosLeads('LEADS_KANBAN');
  };

  useEffect(() => {
    const dataInicial = () => {
      getLeadStatus('1', '1', 'get', '', '', '', '', '', true).then(
        (response: LeadStatusResponse) => {
          props.setEtapas(response.data.lead_etapas);
          props.setUsers(response.data.users);
          props.setLabels(response.data.labels);
          props.setChannels(response.data.channels);
          props.setStages(response.data.stages);
          props.setProjects(response.data.projects);
        }
      );
    };

    dataInicial();
  }, []);

  return (
    <div
      className="main-content app-content main-content--page"
      style={{ paddingLeft: '0rem', paddingRight: '0rem' }}
    >
      <div className="container-fluid">
        <div className="kanban-board">
          <LeadHeaderComponent
            onRefreshLeads={props.onRefreshLeads}
            handleStateView={props.handleStateView}
            handleModalLeadForm={props.handleModalLeadForm}
            onFiltrosLeads={onFiltrosLeads}
            filtros={props.filtros}
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
                    <LeadCardComponent
                      lead={lead}
                      key={lead.id}
                      onClickLead={onClickLead}
                      onEditarAsesor={onEditarAsesor}
                    />
                  ))}
                </ReactSortable>
              </div>
            ))}
          </div>
          {isDragging && <LeadFooterComponent onDropAction={handleDropAction} />}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoardComponent;
