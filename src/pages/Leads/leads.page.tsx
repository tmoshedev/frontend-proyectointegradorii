import { useCallback, useEffect, useState } from 'react';
import { useLeadStatus, useSidebarResponsive } from '../../hooks';
import { ReactSortable, SortableEvent } from 'react-sortablejs';
import LeadHeaderComponent from './components/lead-header.component';
import LeadFooterComponent, {
  DropAction as DropActionFooter,
} from './components/lead-footer.component';
import LeadCardComponent from './components/lead-card.component';
import { LeadStatusResponse } from '../../models/responses';
import { Lead, LeadStatus } from '../../models';

// Define DropAction type

/* const etapasIniciales = [
  {
    id: 1,
    name: 'Nuevos',
    leads: [
      { id: 101, name: 'Jose Guillermo Santisteban Guerrero', interes: 'frio' },
      { id: 102, name: 'Lead B', interes: 'frio' },
    ],
  },
  { id: 2, name: 'Contactados', leads: [{ id: 201, name: 'Lead C', interes: 'frio' }] },
  { id: 3, name: 'En seguimiento', leads: [{ id: 301, name: 'Lead D', interes: 'tibio' }] },
  { id: 4, name: 'Visita agendada', leads: [] },
  { id: 5, name: 'Cierre en proceso', leads: [{ id: 308, name: 'Lead F', interes: 'caliente' }] },
]; */

export const LeadsPage = () => {
  useSidebarResponsive(true);

  const {getLeadStatus} = useLeadStatus();
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

    // Aquí podrías llamar a la API con:
    // { leadId, fromStage: sourceColumn, toStage: destColumn, toPosition: newIndex }
    // y después, si quieres, refrescar todo el estado o confiar en lo que ya hizo ReactSortable.
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
  };

  const handleDragStart = useCallback(() => {
    setIsDragging(true); // <<< enciende la barra
  }, []);

  useEffect(() => {
    const dataInicial = () => {
      getLeadStatus('1', 'get', true).then((response: LeadStatusResponse) => {
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
          <LeadHeaderComponent />

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
