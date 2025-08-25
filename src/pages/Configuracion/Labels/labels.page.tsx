/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import PageBodyComponent from '../../../components/page/page-body.component';
import PageHeaderComponent from '../../../components/page/page-hader.component';
import { useLabels } from '../../../hooks/useLabels';
import FilterLabelsComponent from './components/filter-labels.component';
import ModalComponent from '../../../components/shared/modal.component';
import LabelFormComponent from './components/label-form.component';
import { SweetAlert } from '../../../utilities';
import { Label } from '../../../models';

interface DataModalState {
  type: string;
  buttonSubmit: string | null;
  row: any | null;
  title: string | null;
  onCloseModalForm: any;
}

export const LabelsPage = () => {
  const [filterState, setFilterState] = useState({
    text: '',
    type: '',
    page: 1,
    limit: '',
    orderBy: '',
    order: '',
  });
  const { getLabels, storeLabel, updateLabel, deleteLabel, stateLabel } =
    useLabels();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isStateModal, setIsStateModal] = useState(false);
  const [dataModalResourceState, setDataModalResourceState] =
    useState<DataModalState>({
      type: '',
      buttonSubmit: null,
      row: null,
      title: null,
      onCloseModalForm: () => {},
    });
const renderColor = (row: any) => (
  <div
    style={{
      backgroundColor: row.color,
      width: '20px',
      height: '20px',
      borderRadius: '4px',
      border: '1px solid #ccc',
    }}
  />
);
  const state = {
    page: {
      title: 'Etiquetas',
      model: 'labels',
      buttons: {
        create: true,
        edit: true,
        destroy: true,
      },
    },
    table: {
      body: {
        widthAccion: '',
        cols: [
          { name: 'name', alias: 'Nombre', roles: [] },
          {
         name: 'color', 
    alias: 'COLOR', 
    play: { type: 'color' }   // 👈 aquí le dices que use el case 'color'
        },
          
        ],
        buttons: [
          {/*
            name: 'status',
            tooltip: 'Desactivar Etiqueta',
            text: '',
            css: 'me-3 text-danger',
            icon: 'fa-solid fa-toggle-off',
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
            tooltip: 'Activar Etiqueta',
            text: '',
            css: 'me-3 text-success',
            icon: 'fa-solid fa-toggle-on',
            play: {
              type: 'states',
              name: 'state',
              values: {
                '0': true,
                '1': false,
              },
            },
          */},
        ],
      },
    },
  };

  const onClickButtonPersonalizado = (row: any, name: any) => {
    switch (name) {
      case 'status':
        onStatus(
          row,
          '¿Está seguro que desea desactivar la etiqueta?',
          'Etiqueta desactivada correctamente.'
        );
        break;
      case 'status_active':
        onStatus(
          row,
          '¿Está seguro que desea activar la etiqueta?',
          'Etiqueta activada correctamente.'
        );
        break;
      default:
        break;
    }
  };

  const onStatus = (row: any, text: string, message: string) => {
    SweetAlert.onConfirmation(
      () => handleState(row.id, message),
      () => {},
      text
    );
  };

  const handleState = (id: any, text: string) => {
    stateLabel(parseInt(id, 10)).then(() => {
      SweetAlert.success(text);
    });
  };

  const onDelete = (row: Label) => {
    SweetAlert.onConfirmation(
      () => handleDelete(row.id, 'Etiqueta eliminada correctamente.'),
      () => {},
      '¿Está seguro que desea eliminar la etiqueta?',
      row.name
    );
  };

  const handleDelete = (id: any, text: string) => {
    deleteLabel(parseInt(id, 10)).then(() => {
      SweetAlert.success(text);
    });
  };

  const onChangePage = (page: number, type: string) => {
    let newPage = page;
    if (type === 'prev') newPage = filterState.page - 1;
    if (type === 'next') newPage = filterState.page + 1;

    setFilterState({ ...filterState, page: newPage });

    getLabels(
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
      text: '',
      type: '',
      page: 1,
      limit: '',
      orderBy: '',
      order: '',
    });
    getLabels( '', '', 1, '', '', '', true, true);
  };

  const handleFilterSearch = (newFilters: any, state: boolean) => {
    setFilterState(newFilters);
    getLabels(
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
      title: 'Nueva Etiqueta',
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
      title: 'Editar Etiqueta',
      onCloseModalForm: onCloseModalForm,
    });
    setIsOpenModal(true);
    setIsStateModal(true);
  };

  useEffect(() => {
    const dataInicial = () => {
      getLabels(
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
    
      <div className="container-fluid">
        <div className="row">
            <div className="card">
              <PageHeaderComponent
                state={state}
                onModalResource={() => onClickAddResource('store')}
              />
              <div className="card-body pt-1">
                {/* <FilterLabelsComponent
                  filterState={filterState}
                  handleFilterSearch={handleFilterSearch}
                  onClearFilters={onClearFilters}
                /> */}
                <PageBodyComponent
                  tableCss="table-resource"
                  state={state}
                  onClickButtonPersonalizado={onClickButtonPersonalizado}
                  onChangeEdit={onClickEditResource}
                  onChangeDelete={onDelete}
                  onChangePage={onChangePage}
                />
              </div>
        </div>
      </div>
      {isOpenModal && (
        <ModalComponent
          stateModal={isStateModal}
          typeModal={'static'}
          onClose={handleCloseModal}
          title={dataModalResourceState.title || ''}
          size="modal-md"
          content={
            <LabelFormComponent
              data={dataModalResourceState}
              storeLabel={storeLabel}
              updateLabel={updateLabel}
            />
          }
        />
      )}
    </div>
  );
};

export default LabelsPage;
