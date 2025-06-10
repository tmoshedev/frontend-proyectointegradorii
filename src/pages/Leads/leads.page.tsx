import { useState } from 'react';
import { useLeadStatus, useSidebarResponsive } from '../../hooks';
import KanbanBoardComponent from './components/kanban-board.component';
import ImportarLeadComponent from './components/importar-lead.component';
import ModalComponent from '../../components/shared/modal.component';
import LeadFormComponent from './components/form-lead.component';
import { LeadStatusResponse } from '../../models/responses';
import { LeadStatus } from '../../models';
import DistribuirLeadComponent from './components/distrubir-leads.component';
import LeadAsesorEditComponent from './components/lead-asesor-edit.component';

interface DataModalState {
  type: string;
  buttonSubmit: string | null;
  row: any | null;
  title: string | null;
  requirements: any;
  onCloseModalForm: any;
}

export const LeadsPage = () => {
  useSidebarResponsive(true);

  const { getLeadStatus } = useLeadStatus();
  const [etapas, setEtapas] = useState<LeadStatus[]>([]);
  const [stateView, setStateView] = useState<string>('KANBAN');
  //MODAL NUEVO LEAD
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isStateModal, setIsStateModal] = useState(false);
  const [dataModalResourceState, setDataModalResourceState] = useState<DataModalState>({
    type: '',
    buttonSubmit: null,
    row: null,
    title: null,
    requirements: [],
    onCloseModalForm: () => {},
  });
  //MODAL EDITAR ASESOR
  const [isOpenModalAsesor, setIsOpenModalAsesor] = useState(false);
  const [isStateModalAsesor, setIsStateModalAsesor] = useState(false);
  const [dataModalAsesorResourceState, setDataModalAsesorResourceState] = useState<DataModalState>({
    type: '',
    buttonSubmit: null,
    row: null,
    title: null,
    requirements: [],
    onCloseModalForm: () => {},
  });

  const handleStateView = (view: string) => {
    setStateView(view);
  };

  const onCloseModalForm = () => {
    setIsStateModal(false);
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
  };

  const onCloseModalAsesorForm = () => {
    setIsStateModalAsesor(false);
  };

  const handleCloseModalAsesor = () => {
    setIsOpenModalAsesor(false);
  };

  const handleModalLeadForm = (type: string) => {
    setDataModalResourceState({
      type: type,
      buttonSubmit: 'Registrar lead',
      row: null,
      title: 'Nuevo lead',
      requirements: [],
      onCloseModalForm: onCloseModalForm,
    });
    setIsOpenModal(true);
    setIsStateModal(true);
  };

  const onRefreshLeads = () => {
    getLeadStatus('1', '1', 'get', true).then((response: LeadStatusResponse) => {
      setEtapas(response.data.lead_etapas);
    });
  };

  const handleModalAsesor = (lead: any, users: any[]) => {
    setDataModalAsesorResourceState({
      type: 'EDITAR_ASESOR',
      buttonSubmit: 'Actualizar',
      row: {
        lead_uuid: lead.uuid,
        assigned_to: lead.user_id ?? '',
      },
      title: 'Editar asesor',
      requirements: {
        users: users,
      },
      onCloseModalForm: onCloseModalAsesorForm,
    });
    setIsOpenModalAsesor(true);
    setIsStateModalAsesor(true);
  };

  const updateLeadLocal = (lead: any) => {
    const updatedEtapas = etapas.map((etapa) => {
      const updatedLeads = etapa.leads.map((l) => (l.uuid === lead.uuid ? lead : l));
      return { ...etapa, leads: updatedLeads };
    });
    setEtapas(updatedEtapas);
  };

  return (
    <div
      className="main-content app-content main-content--page"
      style={{ paddingLeft: '0rem', paddingRight: '0rem' }}
    >
      <div className="container-fluid">
        {stateView == 'KANBAN' && (
          <KanbanBoardComponent
            handleStateView={handleStateView}
            handleModalLeadForm={handleModalLeadForm}
            onRefreshLeads={onRefreshLeads}
            etapas={etapas}
            setEtapas={setEtapas}
            handleModalAsesor={handleModalAsesor}
          />
        )}
        {stateView == 'IMPORTAR' && <ImportarLeadComponent handleStateView={handleStateView} />}
        {stateView == 'DISTRIBUIR' && <DistribuirLeadComponent handleStateView={handleStateView} />}
      </div>
      {/* MODAL NUEVO LEAD*/}
      {isOpenModal && (
        <ModalComponent
          stateModal={isStateModal}
          typeModal={'static'}
          onClose={handleCloseModal}
          title={dataModalResourceState.title || ''}
          size="modal-md"
          content={
            <LeadFormComponent data={dataModalResourceState} onRefreshLeads={onRefreshLeads} />
          }
        />
      )}
      {/* MODAL - EDITAR ASESOR*/}
      {isOpenModalAsesor && (
        <ModalComponent
          stateModal={isStateModalAsesor}
          typeModal={'static'}
          onClose={handleCloseModalAsesor}
          title={dataModalAsesorResourceState.title || ''}
          size="modal-md"
          content={
            <LeadAsesorEditComponent
              data={dataModalAsesorResourceState}
              updateLeadLocal={updateLeadLocal}
            />
          }
        />
      )}
    </div>
  );
};

export default LeadsPage;
