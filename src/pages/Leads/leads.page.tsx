import { use, useCallback, useEffect, useState } from 'react';
import { useLeads, useLeadStatus, useSidebarResponsive } from '../../hooks';
import KanbanBoardComponent from './components/kanban-board.component';
import ImportarLeadComponent from './components/importar-lead.component';
import ModalComponent from '../../components/shared/modal.component';
import LeadFormComponent from './components/form-lead.component';
import { EtapaConPaginacion, TableCrmResponse, TableHeaderResponse } from '../../models/responses';
import { LeadStatus } from '../../models';
import DistribuirLeadComponent from './components/distrubir-leads.component';
import LeadAsesorEditComponent from './components/lead-asesor-edit.component';
import LeadsTableComponent from './components/leads-table.component';
import { useDispatch, useSelector } from 'react-redux';
import { setTitleSidebar } from '../../redux/states/auth.slice';
import LeadFiltrosComponent from './components/lead-filtros.component';
import { AppStore } from '../../redux/store';
import { et } from 'date-fns/locale';
import AddEtiquetasComponent from './components/add-etiquetas.component';

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
  const rolActual = localStorage.getItem('rolActual') || '';
  const dispatch = useDispatch();

  // ---- ESTADOS ----
  const [etapas, setEtapas] = useState<EtapaConPaginacion[]>([]); // Para Kanban
  const [leads, setLeads] = useState<LeadStatus[]>([]); // Para Tabla
  const [metaData, setMetaData] = useState({
    current_page: 1,
    last_page: 0,
    per_page: 50,
    total: 0,
    showing: 0,
  }); // Para Tabla
  const [tableHeader, setTableHeader] = useState<TableHeaderResponse[]>([]);
  const [stateView, setStateView] = useState<string>('KANBAN');
  const [isTableLoading, setIsTableLoading] = useState(false);

  // Estados de datos estáticos (usuarios, etiquetas, etc.)
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [labels, setLabels] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  // Estados de filtros
  const [filtros, setFiltros] = useState<any[]>([]);
  const [nivelesInteres, setNivelesInteres] = useState<string[]>(['CALIENTE', 'TIBIO', 'FRIO']);

  // Hooks de API
  const { getLeads } = useLeads();
  const { getLeadStatus, getLeadByEtapa } = useLeadStatus();

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
    /* Etapas: {
      value: 'stage_ids',
      opciones: stages.map((c) => ({ label: c.name, value: c.id })),
    }, */
    /* Etiquetas: {
      value: 'lead_labels_ids',
      opciones: labels.map((c) => ({ label: c.name, value: c.id })),
    }, */
    Proyectos: {
      value: 'project_ids',
      opciones: [
        { label: 'Sin proyecto', value: '0' },
        ...projects.map((p) => ({ label: p.name, value: p.id })),
      ],
    },
    'Vencimiento de actividad': {
      value: 'activity_expiration_ids',
      opciones: [
        { label: 'Vencida', value: 'vencida' },
        { label: 'Por vencer', value: 'por_vencer' },
        { label: 'Hoy', value: 'hoy' },
        { label: 'Mañana', value: 'manana' },
        { label: 'Esta semana', value: 'esta_semana' },
        { label: 'Próxima semana', value: 'proxima_semana' },
        { label: 'Este mes', value: 'este_mes' },
        { label: 'Próximo mes', value: 'proximo_mes' },
      ],
    },
  };

  //KANBAN
  const [isLoadingKanban, setIsLoadingKanban] = useState(true);

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
  //MODAL AGREGAR ETIQUETAS
  const [isOpenModalEtiquetas, setIsOpenModalEtiquetas] = useState(false);
  const [isStateModalEtiquetas, setIsStateModalEtiquetas] = useState(false);
  const [dataModalEtiquetasResourceState, setDataModalEtiquetasResourceState] =
    useState<DataModalState>({
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
    setFiltros([]);
    setNivelesInteres(['CALIENTE', 'TIBIO', 'FRIO']);
    setStateView(view);
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

  const handleCloseModalEtiquetas = () => {
    setIsOpenModalEtiquetas(false);
  };
  const handleModalEtiquetasForm = () => {
    setIsStateModalEtiquetas(false);
  };

  const onRefreshLeads = () => {
    onAplicarFiltros(filtros, nivelesInteres, labels, campaigns);
  };

  const handleModalAsesor = (lead: any, users: any[]) => {
    setDataModalAsesorResourceState({
      type: 'EDITAR_ASESOR',
      buttonSubmit: 'Actualizar',
      row: {
        lead_uuid: lead.uuid,
        assigned_to: lead.user_id ?? '',
      },
      title: rolActual === 'COMMERCIAL_LEADER' ? 'Editar Supervisor' : 'Editar asesor',
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
    onAplicarFiltros(nuevosFiltros, nivelesInteres, labels, campaigns);
  };

  const onHandleChangeTipoFiltro = (id: number, nuevoTipo: string) => {
    const nuevosFiltros = filtros.map((f) =>
      f.id === id ? { ...f, tipo: nuevoTipo, valoresSeleccionados: [] } : f
    );

    setFiltros(nuevosFiltros);
  };

  // En LeadsPage.tsx (ESTA FUNCIÓN ESTÁ BIEN, NO LA CAMBIES)

  const onHandleChangeValoresFiltro = (id: number, nuevosValores: any[]) => {
    const nuevosFiltros = filtros.map((f) =>
      f.id === id ? { ...f, valoresSeleccionados: nuevosValores } : f
    );

    onAplicarFiltros(nuevosFiltros, nivelesInteres, labels, campaigns);
  };

  const refreshDataLeads = (
    user_ids: string,
    channel_ids: string,
    lead_label_ids: string,
    stage_ids: string,
    project_ids: string,
    activity_expiration_ids: string,
    lead_campaign_names: string,
    per_page: number,
    current_page: number,
    add_data: boolean = false,
    loanding: boolean
  ) => {
    return getLeads(
      user_ids,
      channel_ids,
      lead_label_ids,
      stage_ids,
      project_ids,
      activity_expiration_ids,
      lead_campaign_names,
      '',
      per_page,
      current_page,
      loanding
    ).then((response: TableCrmResponse) => {
      if (add_data) {
        setLeads((prevLeads) => [...prevLeads, ...response.data]);
      } else {
        setLeads(response.data);
      }
      setMetaData({
        current_page: response.meta.current_page,
        last_page: response.meta.last_page,
        per_page: response.meta.per_page,
        total: response.meta.total,
        showing: response.meta.showing,
      });
      setTableHeader(response.table_header || []);
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
    const project_ids = getValorFiltro('project_ids');
    const activity_expiration_ids = getValorFiltro('activity_expiration_ids');
    const lead_campaign_names = getValorFiltro('lead_campaign_names');

    const addData = page == 1 ? false : true;

    return refreshDataLeads(
      user_ids,
      channel_ids,
      lead_label_ids,
      stage_ids,
      project_ids,
      activity_expiration_ids,
      lead_campaign_names,
      metaData.per_page,
      page,
      addData,
      true
    );
  };

  const filtrosActuales = (filtrosAplicados: any[]) => {
    let user_ids = '';
    let channel_ids = '';
    let lead_label_ids = '';
    let stage_ids = '';
    let project_ids = '';
    let activity_expiration_ids = '';
    let lead_campaign_names = '';

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
          case 'project_ids':
            project_ids = valores;
            break;
          case 'activity_expiration_ids':
            activity_expiration_ids = valores;
            break;
          case 'lead_campaign_names':
            lead_campaign_names = valores;
            break;
          default:
            break;
        }
      }
    });
    return {
      user_ids,
      channel_ids,
      lead_label_ids,
      stage_ids,
      project_ids,
      activity_expiration_ids,
      lead_campaign_names
    };
  };

  const onAplicarFiltros = (
    filtrosAplicados: any[],
    nivelesAplicados: string[],
    etiquetasAplicadas: string[],
    campanasAplicadas: string[],
  ) => {
    setFiltros(filtrosAplicados);
    setNivelesInteres(nivelesAplicados);
    setLabels(etiquetasAplicadas);
    setCampaigns(campanasAplicadas);

    if (stateView === 'KANBAN') {
      recargarDatosKanban(filtrosAplicados, nivelesAplicados, etiquetasAplicadas, campanasAplicadas, terminoBusqueda);
    } else if (stateView === 'LEADS_TABLE') {
      recargarDatosTabla(filtrosAplicados, nivelesAplicados, 1);
    }
  };

  const handleNivelInteresChange = (nivel: string) => {
    const nuevosNiveles = nivelesInteres.includes(nivel)
      ? nivelesInteres.filter((n) => n !== nivel)
      : [...nivelesInteres, nivel];
    onAplicarFiltros(filtros, nuevosNiveles, labels, campaigns);
  };

  const cargarMasLeads = (etapaId: number | string) => {
    const etapaActual = etapas.find((e) => String(e.id) === String(etapaId));
    if (
      !etapaActual ||
      etapaActual.meta.is_loading ||
      etapaActual.meta.current_page >= etapaActual.meta.last_page
    ) {
      return;
    }

    const nextPage = etapaActual.meta.current_page + 1;

    setEtapas((prev) =>
      prev.map((e) =>
        String(e.id) === String(etapaId) ? { ...e, meta: { ...e.meta, is_loading: true } } : e
      )
    );

    const {
      user_ids,
      channel_ids,
      lead_label_ids,
      stage_ids,
      project_ids,
      activity_expiration_ids,
      lead_campaign_names
    } = filtrosActuales(filtros);

    const nivel_interes = nivelesInteres.join(',');

    getLeadByEtapa(
      '1', // business_id
      '1', // lead_activos
      String(etapaId),
      user_ids,
      channel_ids,
      lead_label_ids,
      stage_ids,
      project_ids,
      activity_expiration_ids,
      lead_campaign_names,
      nivel_interes,
      terminoBusqueda,
      50, // per_page
      nextPage,
      false
    ).then((response) => {
      // 5. Actualiza el estado con los nuevos leads
      setEtapas((prev) =>
        prev.map((e) => {
          if (String(e.id) === String(etapaId)) {
            return {
              ...e,
              // Añade los nuevos leads a la lista existente
              leads: [...e.leads, ...response.leads],
              // Actualiza la meta de paginación
              meta: {
                ...e.meta,
                ...response.meta,
                is_loading: false,
              },
            };
          }
          return e;
        })
      );
    });
  };

  const recargarDatosKanban = useCallback(
    async (
      currentFiltros: any[],
      currentNiveles: string[],
      etiquetas: any[],
      campanas: any[],
      termino: string,
      first: boolean = false
    ) => {
      // Lógica para recargar el Kanban:
      // 1. Obtiene los parámetros de los filtros
      const {
        user_ids,
        channel_ids,
        lead_label_ids,
        stage_ids,
        project_ids,
        activity_expiration_ids,

      } = filtrosActuales(currentFiltros);
      const nivel_interes = currentNiveles.join(',');
      const etiquetas_ids = Array.isArray(etiquetas)
        ? etiquetas
            .filter((etiqueta) => etiqueta.selected)
            .map((etiqueta) => etiqueta.id)
            .join(',')
        : '';
      const lead_campaign_names = Array.isArray(campanas)
        ? campanas
            .filter((campana) => campana.selected)
            .map((campana) => campana.name)
            .join(',')
        : '';

      // 2. Llama a la API para obtener la estructura y los conteos ya filtrados
      const response = await getLeadStatus(
        '1',
        '1',
        'get',
        user_ids,
        channel_ids,
        etiquetas_ids,
        stage_ids,
        project_ids,
        activity_expiration_ids,
        lead_campaign_names,
        nivel_interes,
        false
      );

      // 3. Prepara el estado inicial del tablero con los nuevos conteos
      const etapasIniciales: EtapaConPaginacion[] = response.data.lead_etapas.map((etapa) => ({
        ...etapa,
        leads: [],
        meta: {
          total: etapa.leads_count,
          current_page: 0,
          last_page: 1,
          per_page: 50,
          is_loading: true,
        },
      }));

      setEtapas(etapasIniciales);
      setUsers(response.data.users);
      if (first) {
        const etiquetasInicializadas = response.data.labels.map((label: any) => ({
          ...label,
          selected: false,
        }));
        setLabels(etiquetasInicializadas);
      }
      setChannels(response.data.channels);
      setStages(response.data.stages);
      setProjects(response.data.projects);

      // 4. Llama a la API para obtener la primera página de leads de CADA etapa
      const promesasDeCarga = etapasIniciales.map((etapa) =>
        getLeadByEtapa(
          '1',
          '1',
          String(etapa.id),
          user_ids,
          channel_ids,
          etiquetas_ids,
          stage_ids,
          project_ids,
          activity_expiration_ids,
          lead_campaign_names,
          nivel_interes,
          termino,
          50,
          1,
          false
        )
      );
      const responsesLeads = await Promise.all(promesasDeCarga);

      // 5. Rellena el tablero con los leads
      setEtapas((currentEtapas) =>
        currentEtapas.map((etapa, index) => {
          const responseParaEstaEtapa = responsesLeads[index];
          return {
            ...etapa,
            leads: responseParaEstaEtapa.leads,
            meta: { ...etapa.meta, ...responseParaEstaEtapa.meta, is_loading: false },
          };
        })
      );
    },
    [getLeadStatus, getLeadByEtapa, labels, users]
  );

  const recargarDatosTabla = useCallback(
    async (currentFiltros: any[], currentNiveles: string[], page = 1) => {
      setIsTableLoading(true);
      const {
        user_ids,
        channel_ids,
        lead_label_ids,
        stage_ids,
        project_ids,
        activity_expiration_ids,
        lead_campaign_names,
      } = filtrosActuales(currentFiltros);
      const nivel_interes = currentNiveles.join(',');

      const response = await getLeads(
        user_ids,
        channel_ids,
        lead_label_ids,
        stage_ids,
        project_ids,
        activity_expiration_ids,
        lead_campaign_names,
        '',
        50,
        page,
        false
      );

      setLeads(response.data);
      setMetaData(response.meta);
      setTableHeader(response.table_header || []);
      setIsTableLoading(false);
    },
    [getLeads]
  );

  const handleEtiquetasKanban = (etiquetas: any[]) => {
    onAplicarFiltros(filtros, nivelesInteres, etiquetas, campaigns);
  };

  const handleCrearEtiqueta = () => {
    setDataModalEtiquetasResourceState({
      type: 'CREAR_ETIQUETA',
      buttonSubmit: 'Crear etiqueta',
      row: null,
      title: 'Nueva etiqueta',
      requirements: [],
      onCloseModalForm: handleModalEtiquetasForm,
    });
    setIsOpenModalEtiquetas(true);
    setIsStateModalEtiquetas(true);
  };

  const onBuscarKanban = (termino: string) => {
    setTerminoBusqueda(termino);
    recargarDatosKanban(filtros, nivelesInteres, labels,campaigns , termino);
  };

  useEffect(() => {
    dispatch(setTitleSidebar('Leads'));
    return () => {
      dispatch(setTitleSidebar(''));
    };
  }, [dispatch]);

  useEffect(() => {
    setEtapas([]);
    setMetaData({
      current_page: 1,
      last_page: 0,
      per_page: 50,
      total: 0,
      showing: 0,
    }); // Para Tabla
    setLeads([]); // Para Tabla
    setTableHeader([]); // Para Tabla
    const filtrosReseteados: any[] = [];
    const nivelesReseteados: string[] = [];
    if (stateView === 'KANBAN') {
      recargarDatosKanban(filtros, nivelesInteres, labels,campaigns, terminoBusqueda, true);
    } else if (stateView === 'LEADS_TABLE') {
      recargarDatosTabla(filtrosReseteados, nivelesReseteados, 1);
    }
  }, [stateView]);

  function handleCampanasKanban(campanas: any[]): void {
    throw new Error('Function not implemented.');
  }

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
          filtros={filtros}
          nivelesInteres={nivelesInteres}
          handleNivelInteresChange={handleNivelInteresChange}
          cargarMasLeads={cargarMasLeads}
          setIsLoadingKanban={setIsLoadingKanban}
          campaigns={campaigns}
          setCampaigns={setCampaigns}
          handleCampanasKanban={handleCampanasKanban}
          labels={labels}
          setLabels={setLabels}
          handleEtiquetasKanban={handleEtiquetasKanban}
          handleCrearEtiqueta={handleCrearEtiqueta}
          terminoBusqueda={terminoBusqueda}
          setTerminoBusqueda={onBuscarKanban}
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
          cargarDataLeads={cargarDataLeads}
          filtros={filtros}
          metaData={metaData}
          tableHeader={tableHeader}
          setTableHeader={setTableHeader}
          isTableLoading={isTableLoading}
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
      {isOpenModalEtiquetas && (
        <ModalComponent
          vHactive={true}
          stateModal={isStateModalEtiquetas}
          typeModal={'static'}
          onClose={handleCloseModalEtiquetas}
          title={dataModalEtiquetasResourceState.title || ''}
          size="modal-md"
          content={
            <AddEtiquetasComponent
              data={dataModalEtiquetasResourceState}
              labels={labels}
              setLabels={setLabels}
            />
          }
        />
      )}
      
    </>
  );
};

export default LeadsPage;
