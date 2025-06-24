import { use, useEffect, useState } from 'react';
import { useLeads, useLeadStatus, useSidebarResponsive } from '../../hooks';
import KanbanBoardComponent from './components/kanban-board.component';
import ImportarLeadComponent from './components/importar-lead.component';
import ModalComponent from '../../components/shared/modal.component';
import LeadFormComponent from './components/form-lead.component';
import { LeadStatusResponse, TableCrmResponse } from '../../models/responses';
import { LeadStatus } from '../../models';
import DistribuirLeadComponent from './components/distrubir-leads.component';
import LeadAsesorEditComponent from './components/lead-asesor-edit.component';
import LeadsTableComponent from './components/leads-table.component';
import { useDispatch, useSelector } from 'react-redux';
import { setTitleSidebar } from '../../redux/states/auth.slice';
import LeadFiltrosComponent from './components/lead-filtros.component';
import { AppStore } from '../../redux/store';

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
  const authState = useSelector((state: AppStore) => state.auth);

  const dispatch = useDispatch();
  //LEADS TABLE
  const { getLeads } = useLeads();
  const [metaData, setMetaData] = useState({
    current_page: 1,
    last_page: 0,
    per_page: 50,
    total: 0,
  });
  //KANBAN
  const { getLeadStatus } = useLeadStatus();
  const [leads, setLeads] = useState<LeadStatus[]>([]);
  const [etapas, setEtapas] = useState<LeadStatus[]>([]);
  const [stateView, setStateView] = useState<string>('KANBAN');
  const [users, setUsers] = useState<any[]>([]);
  const [labels, setLabels] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);

  //FILTROS MODAL
  const TODOS_LOS_FILTROS = {
    'Usuario asignado': {
      value: 'user_ids',
      opciones: [
        {
          label: `${authState.user.names} ${authState.user.father_last_name} (Tú)`,
          value: authState.user.id,
          avatar: true,
        },
        {
          label: `Sin asignar`,
          value: '0',
          avatar: true,
        },
        ...users
          .filter((u) => u.id !== authState.user.id)
          .map((u) => ({ label: u.name, value: u.id, avatar: true })),
      ],
    },
    'Origen/Canal': {
      value: 'channel_ids',
      opciones: channels.map((c) => ({ label: c.name, value: c.id })),
    },
    Etapas: {
      value: 'stage_ids',
      opciones: stages.map((c) => ({ label: c.name, value: c.id })),
    },
    Etiquetas: {
      value: 'lead_labels_ids',
      opciones: labels.map((c) => ({ label: c.name, value: c.id })),
    },
  };
  const [filtros, setFiltros] = useState<any[]>([]);
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

  //FILTROS
  const [isOpenModalFiltros, setIsOpenModalFiltros] = useState(false);
  const [isStateModalFiltros, setIsStateModalFiltros] = useState(false);
  const [dataModalFiltrosResourceState, setDataModalFiltrosResourceState] =
    useState<DataModalState>({
      type: '',
      buttonSubmit: null,
      row: null,
      title: null,
      requirements: [],
      onCloseModalForm: () => {},
    });

  const handleStateView = (view: string) => {
    setStateView(view);
    setFiltros([]);
  };

  const onCloseModalForm = () => {
    setIsStateModal(false);
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
  };

  const onCloseModalFiltrosForm = () => {
    setIsStateModalFiltros(false);
  };

  const handleCloseModalFiltros = () => {
    setIsOpenModalFiltros(false);
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
    getLeadStatus('1', '1', 'get', '', '', '', '', true).then((response: LeadStatusResponse) => {
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

  const onFiltrosLeads = (type: string) => {
    setDataModalFiltrosResourceState({
      type: type,
      buttonSubmit: null,
      row: null,
      title: 'Filtros',
      requirements: [],
      onCloseModalForm: onCloseModalFiltrosForm,
    });
    setIsOpenModalFiltros(true);
    setIsStateModalFiltros(true);
  };

  const onHandleAddFiltro = () => {
    setFiltros([...filtros, { id: Date.now(), tipo: '', valoresSeleccionados: [] }]);
  };

  const onHandleDeleteFiltro = (id: number) => {
    const nuevosFiltros = filtros.filter((f) => f.id !== id);
    setFiltros(nuevosFiltros);
    onAplicarFiltros(nuevosFiltros);
  };

  const onHandleChangeTipoFiltro = (id: number, nuevoTipo: string) => {
    const nuevosFiltros = filtros.map((f) =>
      f.id === id
        ? { ...f, tipo: nuevoTipo, valoresSeleccionados: [] } // Resetea valores al cambiar tipo
        : f
    );
    setFiltros(nuevosFiltros);
    onAplicarFiltros(nuevosFiltros);
  };

  const onHandleChangeValoresFiltro = (id: number, nuevosValores: any[]) => {
    const newFiltros = filtros.map((f) =>
      f.id === id ? { ...f, valoresSeleccionados: nuevosValores } : f
    );
    setFiltros(newFiltros);

    onAplicarFiltros(newFiltros);
  };

  const refreshDataLeads = (
    user_ids: string,
    channel_ids: string,
    lead_label_ids: string,
    stage_ids: string,
    per_page: number,
    current_page: number,
    loanding: boolean
  ) => {
    getLeads(
      user_ids,
      channel_ids,
      lead_label_ids,
      stage_ids,
      '',
      per_page,
      current_page,
      loanding
    ).then((response: TableCrmResponse) => {
      setLeads(response.data);
      setMetaData({
        current_page: response.meta.current_page,
        last_page: response.meta.last_page,
        per_page: response.meta.per_page,
        total: response.meta.total,
      });
    });
  };

  const cargarDataLeads = (page: number) => {
    const getValorFiltro = (tipoApi: string) => {
      const filtro = filtros.find(
        (f) =>
          f.tipo && TODOS_LOS_FILTROS[f.tipo as keyof typeof TODOS_LOS_FILTROS]?.value === tipoApi
      );
      return filtro?.valoresSeleccionados.map((v: any) => v.value).join(',') || '';
    };

    const user_ids = getValorFiltro('user_ids');
    const channel_ids = getValorFiltro('channel_ids');
    const lead_label_ids = getValorFiltro('lead_labels_ids');
    const stage_ids = getValorFiltro('stage_ids');

    refreshDataLeads(
      user_ids,
      channel_ids,
      lead_label_ids,
      stage_ids,
      metaData.per_page,
      page,
      true
    );
  };

  const onAplicarFiltros = (filtrosAplicados: any[]) => {
    let user_ids = '';
    let channel_ids = '';
    let lead_label_ids = '';
    let stage_ids = '';

    filtrosAplicados.forEach((filtro) => {
      if (filtro.tipo && filtro.valoresSeleccionados && filtro.valoresSeleccionados.length > 0) {
        const valores = filtro.valoresSeleccionados.map((v: any) => v.value).join(',');
        const tipoApi = TODOS_LOS_FILTROS[filtro.tipo as keyof typeof TODOS_LOS_FILTROS]?.value;

        switch (tipoApi) {
          case 'user_ids':
            user_ids = valores;
            break;
          case 'channel_ids':
            channel_ids = valores;
            break;
          case 'lead_labels_ids':
            lead_label_ids = valores;
            break;
          case 'stage_ids':
            stage_ids = valores;
            break;
          default:
            break;
        }
      }
    });

    if (dataModalFiltrosResourceState.type == 'LEADS_KANBAN') {
      getLeadStatus('1', '1', 'get', user_ids, channel_ids, lead_label_ids, stage_ids, false).then(
        (response: LeadStatusResponse) => {
          setEtapas(response.data.lead_etapas);
        }
      );
    } else if (dataModalFiltrosResourceState.type == 'LEADS_TABLE') {
      refreshDataLeads(user_ids, channel_ids, lead_label_ids, stage_ids, 50, 1, false);
    }
  };

  useEffect(() => {
    dispatch(setTitleSidebar('Leads'));

    // Limpia el estado al desmontar
    return () => {
      dispatch(setTitleSidebar(''));
    };
  }, []);

  return (
    <>
      {stateView == 'KANBAN' && (
        <KanbanBoardComponent
          handleStateView={handleStateView}
          handleModalLeadForm={handleModalLeadForm}
          onRefreshLeads={onRefreshLeads}
          etapas={etapas}
          setEtapas={setEtapas}
          handleModalAsesor={handleModalAsesor}
          onFiltrosLeads={onFiltrosLeads}
          users={users}
          setUsers={setUsers}
          setLabels={setLabels}
          setChannels={setChannels}
          setStages={setStages}
          filtros={filtros}
        />
      )}
      {stateView == 'IMPORTAR' && <ImportarLeadComponent handleStateView={handleStateView} />}
      {stateView == 'DISTRIBUIR' && <DistribuirLeadComponent handleStateView={handleStateView} />}
      {stateView == 'LEADS_TABLE' && (
        <LeadsTableComponent
          handleStateView={handleStateView}
          handleModalLeadForm={handleModalLeadForm}
          onFiltrosLeads={onFiltrosLeads}
          leads={leads}
          setLeads={setLeads}
          metaData={metaData}
          setMetaData={setMetaData}
          cargarDataLeads={cargarDataLeads}
          filtros={filtros}
        />
      )}

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
      {/* MODAL - FILTROS*/}
      {isOpenModalFiltros && (
        <ModalComponent
          stateModal={isStateModalFiltros}
          typeModal={'static'}
          onClose={handleCloseModalFiltros}
          title={dataModalFiltrosResourceState.title || ''}
          size="modal-lg"
          content={
            <LeadFiltrosComponent
              data={dataModalFiltrosResourceState}
              todosLosFiltros={TODOS_LOS_FILTROS}
              filtrosActivos={filtros}
              onAdd={onHandleAddFiltro}
              onDelete={onHandleDeleteFiltro}
              onTipoChange={onHandleChangeTipoFiltro}
              onValoresChange={onHandleChangeValoresFiltro}
            />
          }
        />
      )}
    </>
  );
};

export default LeadsPage;
