import { ReactSortable, SortableEvent } from 'react-sortablejs';
import LeadHeaderComponent from './lead-header.component';
import LeadCardComponent from './lead-card.component';
import LeadFooterComponent, {
  DropAction as DropActionFooter,
} from '../components/lead-footer.component';
import { useLeads } from '../../../hooks';
import { useCallback, useState } from 'react';
import { Lead } from '../../../models';
import { EtapaConPaginacion } from '../../../models/responses';
import { useNavigate } from 'react-router-dom';
import SkeletonCardComponent from './SkeletonCardComponent';

interface KanbanBoardComponentProps {
  handleStateView: (view: string) => void;
  handleModalLeadForm: (type: string) => void;
  onRefreshLeads: () => void;
  etapas: EtapaConPaginacion[];
  setEtapas: React.Dispatch<React.SetStateAction<EtapaConPaginacion[]>>;
  handleModalAsesor: (lead: Lead, users: any[]) => void;
  onFiltrosLeads: (type: string) => void;
  users: any[];
  filtros: any[];
  nivelesInteres: string[];
  handleNivelInteresChange: (nivel: string) => void;
  cargarMasLeads: (etapaId: string) => void;
  setIsLoadingKanban: React.Dispatch<React.SetStateAction<boolean>>;
  labels: any[];
  setLabels: React.Dispatch<React.SetStateAction<any[]>>;
  handleEtiquetasKanban: (etiquetas: any[]) => void;
  handleCrearEtiqueta: () => void;
}

export const KanbanBoardComponent = (props: KanbanBoardComponentProps) => {
  const { postChangeEtapa, changeEstadoFinal, changeNivelInteres } = useLeads();

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
      postChangeEtapa(String(destColumn), String(leadId), false).then(() => {
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

  const onChangeStateLead = (lead_uuid: string, nivel_interes: string) => {
    changeNivelInteres(lead_uuid, nivel_interes, false).then(() => {});
  };

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
            nivelesInteres={props.nivelesInteres}
            handleNivelInteresChange={props.handleNivelInteresChange}
            labels={props.labels}
            setLabels={props.setLabels}
            handleEtiquetasKanban={props.handleEtiquetasKanban}
            handleCrearEtiqueta={props.handleCrearEtiqueta}
          />
          <div className="kanban-columns">
            {props.etapas.map((etapa) => (
              <div key={etapa.id} className="kanban-column" data-etapa-id={etapa.id}>
                <div className="kanban-column-header">
                  <div className="kanban-column-header-stage">
                    <h4 className="kanban-column-title p-0 m-0">{etapa.name}</h4>
                    <small className="p-0 m-0">
                      {!etapa.meta.is_loading
                        ? `Mostrando ${etapa.leads.length} de ${etapa.meta.total}`
                        : 'Cargando...'}
                    </small>
                  </div>
                </div>

                <div className="kanban-column-content">
                  {etapa.meta.is_loading && (
                    <>
                      <SkeletonCardComponent />
                      <SkeletonCardComponent />
                      <SkeletonCardComponent />
                    </>
                  )}
                  <ReactSortable
                    list={etapa.leads}
                    setList={(newLeads) => handleLeadsChange(etapa.id, newLeads)}
                    group="etapas"
                    animation={150}
                    ghostClass="ghost"
                    dragClass="drag"
                    className="sortable-container"
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
                        onChangeStateLead={onChangeStateLead}
                      />
                    ))}
                  </ReactSortable>
                  <div className="kanban-column-footer text-center">
                    {etapa.meta.is_loading && (
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                    )}
                    {!etapa.meta.is_loading && etapa.meta.current_page < etapa.meta.last_page && (
                      <button
                        className="btn btn-link btn-sm"
                        onClick={() => props.cargarMasLeads(String(etapa.id))}
                      >
                        <i className="fa-solid fa-chevron-down me-2"></i>
                        Cargar más
                      </button>
                    )}
                  </div>
                </div>
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
