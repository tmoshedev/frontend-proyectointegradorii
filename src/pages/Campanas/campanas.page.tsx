/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import PageBodyComponent from '../../components/page/page-body.component';
import PageHeaderComponent from '../../components/page/page-hader.component';
import { useCampaigns } from '../../hooks'; // ← Hook de campañas
import FilterCampaignComponent from './components/filter-campaign.component'; // ← Filtros de campañas
import ModalComponent from '../../components/shared/modal.component';
import CampaignFormComponent from './components/campaign-form.component'; // ← Formulario de campañas
import { SweetAlert } from '../../utilities';

interface DataModalState {
  type: string;
  buttonSubmit: string | null;
  row: any | null;
  title: string | null;
  requirements: any[];
  onCloseModalForm: any;
}

export const CampaignsPage = () => {
  const [requirements, setRequirements] = useState<any>([]);
  const [filterState, setFilterState] = useState({
    channel_id: '',
    text: '',
    type: '',
    page: 1,
    limit: '',
    orderBy: '',
    order: '',
  });
  const {
    getCampaigns,
    getRequirements,
    storeCampaign,
    updateCampaign,
    stateCampaign
  } = useCampaigns(); // ← hook adaptado

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

  const state = {
    page: {
      title: 'Campañas',
      model: 'campaigns',
      buttons: {
        create: true,
        edit: true,
        destroy: false,
        import: false,
        export: false,
      },
    },
    table: {
      body: {
        widthAccion: '',
        cols: [
          { name: 'codigo', alias: 'Código', roles: [] },
          { name: 'name', alias: 'Nombre', roles: [] },
          { name: 'channel_name', alias: 'Canal', roles: [] },
          { name: 'start_date', alias: 'Fecha Inicio', roles: [] },
          { name: 'leads', alias: 'Leads', roles: [] },
          {
            name: 'state',
            alias: 'Estado',
            roles: [],
            play: {
              type: 'states',
              name: 'state',
              values: {
                0: 'badge bg-danger-transparent',
                1: 'badge bg-success-transparent',
              },
              names: {
                0: 'Inactiva para no recepcionar leads',
                1: 'Activa para recepcionar leads',
              },
            },
          },
        ],
        buttons: [
           {
            name: 'status',
            tooltip: 'Desactivar campaña',
            text: '',
            css: 'me-3 text-danger',
            icon: 'fa-solid fa-user-slash',
            play: {
              type: 'states',
              name: 'state',
              values: {
                '0': false,
                '1': true,
              },
            },
          },
          {
            name: 'status_active',
            tooltip: 'Activar campaña',
            text: '',
            css: 'me-3 text-success',
            icon: 'fa-solid fa-user-check',
            play: {
              type: 'states',
              name: 'state',
              values: {
                '0': true,
                '1': false,
              },
            },
          },
        ], // si quieres activar/desactivar campañas, se define aquí
      },
    },
  };


  const onClickButtonPersonalizado = (row: any, name: any) => {
    switch (name) {
      case 'status':
        onStatus(
          row,
          '¿Está seguro que desea desactivar al usuario?',
          'Usuario desactivado correctamente.'
        );
        break;
      case 'status_active':
        onStatus(
          row,
          '¿Está seguro que desea activar al usuario?',
          'Usuario activado correctamente.'
        );
        break;
      default:
        break;
    }
  };


  const onStatus = (row: any, text: string, message: string) => {
    SweetAlert.onConfirmation(
      () => handleDelete(row.id, message),
      handleCancelDelete,
      text,
      row.names
    );
  };

  const handleDelete = (id: any, text: string) => {
    stateCampaign(id).then(() => {
      SweetAlert.success(text);
    });
  };
  const handleCancelDelete = () => {};
  const onChangePage = (page: number, type: string) => {
    let newPage = page;
    if (type === 'prev') newPage = filterState.page - 1;
    if (type === 'next') newPage = filterState.page + 1;

    setFilterState({ ...filterState, page: newPage });

    getCampaigns(
      filterState.channel_id,
      filterState.text,
      filterState.type,
      newPage,
      filterState.limit,
      filterState.orderBy,
      filterState.order,
      true,
      true
    );
  };

  const onClearFilters = () => {
     setFilterState({
      ...filterState,
      channel_id: '',
      text: '',
      type: '',
      page: 1,
      limit: '',
      orderBy: '',
      order: '',
    });
    getCampaigns('', '', '', 1, '', '', '', true, true);
  };

  const handleFilterSearch = (newFilters: any, state: boolean) => {
    setFilterState(newFilters);
    getCampaigns(
      newFilters.channel_id,
      newFilters.text,
      newFilters.type,
      1,
      newFilters.limit,
      newFilters.orderBy,
      newFilters.order,
      state,
      true
    );
  };

  const onCloseModalForm = () => {
    setIsStateModal(false);
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
  };

  const onClickAddResource = (type: string) => {
    setDataModalResourceState({
      type: type,
      buttonSubmit: 'Registrar',
      row: null,
      title: 'Nueva campaña',
      requirements: requirements,
      onCloseModalForm: onCloseModalForm,
    });
    setIsOpenModal(true);
    setIsStateModal(true);
  };

  const onClickEditResource = (row: any) => {
    setDataModalResourceState({
      type: 'edit',
      buttonSubmit: 'Actualizar',
      row: row,
      title: 'Editar campaña',
      requirements: requirements,
      onCloseModalForm: onCloseModalForm,
    });
    setIsOpenModal(true);
    setIsStateModal(true);
  };

  useEffect(() => {
    const dataInicial = () => {
      getRequirements(false).then((response: any) => {
        setRequirements(response);
      });
      getCampaigns(
        filterState.channel_id,
        filterState.text,
        filterState.type,
        filterState.page,
        filterState.limit,
        filterState.orderBy,
        filterState.order,
        true,
        true
      );
    };

    dataInicial();
  }, []);

  return (
    <div className="main-content app-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <PageHeaderComponent
                state={state}
                onModalResource={() => onClickAddResource('store')}
              />
              <div className="card-body pt-1">
                <FilterCampaignComponent
                  filterState={filterState}
                  handleFilterSearch={handleFilterSearch}
                  onClearFilters={onClearFilters}
                  requirements={requirements}
                />
                <PageBodyComponent
                  tableCss="table-resource"
                  state={state}
                  onClickButtonPersonalizado={onClickButtonPersonalizado}
                  onChangeEdit={onClickEditResource}
                  onChangeDelete={() => null}
                  onChangePage={onChangePage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {isOpenModal && (
        <ModalComponent
          stateModal={isStateModal}
          typeModal={'static'}
          onClose={handleCloseModal}
          title={dataModalResourceState.title || ''}
          size="modal-lg"
          content={
            <CampaignFormComponent
              data={dataModalResourceState}
              storeCampaign={storeCampaign}
              updateCampaign={updateCampaign}
            />
          }
        />
      )}
    </div>
  );
};

export default CampaignsPage;
