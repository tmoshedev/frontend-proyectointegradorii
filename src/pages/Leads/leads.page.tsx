import { useCallback, useEffect, useState } from 'react';
import { useLeads, useLeadStatus, useSidebarResponsive } from '../../hooks';
import { ReactSortable, SortableEvent } from 'react-sortablejs';
import LeadHeaderComponent from './components/lead-header.component';
import LeadFooterComponent, {
  DropAction as DropActionFooter,
} from './components/lead-footer.component';
import LeadCardComponent from './components/lead-card.component';
import { LeadStatusResponse } from '../../models/responses';
import { Lead, LeadStatus } from '../../models';

export const LeadsPage = () => {
  useSidebarResponsive(true);

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
    <div
      className="main-content app-content main-content--page"
      style={{ paddingLeft: '0rem', paddingRight: '0rem' }}
    >
      <div className="container-fluid">
        <div className="kanban-board">
          <LeadHeaderComponent onRefreshLeads={onRefreshLeads} />

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
                  onStart={handleDragStart} // <<< aquí
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
      </div>
    </div>
  );
};

export default LeadsPage;
