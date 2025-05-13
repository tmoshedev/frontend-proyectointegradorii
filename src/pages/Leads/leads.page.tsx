import { useState } from 'react';
import { useLeadStatus, useSidebarResponsive } from '../../hooks';
import KanbanBoardComponent from './components/kanban-board.component';
import ImportarLeadComponent from './components/importar-lead.component';
import ModalComponent from '../../components/shared/modal.component';
import LeadFormComponent from './components/form-lead.component';
import { LeadStatusResponse } from '../../models/responses';
import { LeadStatus } from '../../models';

interface DataModalState {
  type: string;
  buttonSubmit: string | null;
  row: any | null;
  title: string | null;
  requirements: any[];
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

  const handleStateView = (view: string) => {
    setStateView(view);
  };

  const onCloseModalForm = () => {
    setIsStateModal(false);
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
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
      setEtapas(response.data);
    });
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
          />
        )}
        {stateView == 'IMPORTAR' && <ImportarLeadComponent handleStateView={handleStateView} />}
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
    </div>
  );
};

export default LeadsPage;
