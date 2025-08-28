/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import PageBodyComponent from '../../../components/page/page-body.component';
import PageHeaderComponent from '../../../components/page/page-hader.component';
import { useLabels } from '../../../hooks/useLabels';
import FilterLabelsComponent from './components/filter-labels.component';
import ModalComponent from '../../../components/shared/modal.component';
import LabelFormComponent from './components/label-form.component';
import TypeLabelFormComponent from './components/type-label-form.component';
import { SweetAlert } from '../../../utilities';
import { Label } from '../../../models';
import { storeTypeLabel, updateTypeLabel } from '../../../services/type-labels.service';

interface DataModalState {
  type: string;
  buttonSubmit: string | null;
  row: any | null;
  title: string | null;
  onCloseModalForm: any;
}

export const LabelsPage = () => {
  // Refresca la lista de typeLabels sin recargar la página
  const onRefresh = () => {
    import('../../../services/type-labels.service').then(({ getTypeLabels }) => {
      getTypeLabels('', '', 1, '', '', '').then((res: any) => {
        setTypeLabels(res?.data || []);
      });
    });
    setIsOpenTypeLabelModal(false);
    setIsStateModal(false);
  };
  const [filterState, setFilterState] = useState({
    text: '',
    type: '',
    page: 1,
    limit: '',
    orderBy: '',
    order: '',
  });
  const { getLabels, storeLabel, updateLabel, deleteLabel, stateLabel } = useLabels();
  const [typeLabels, setTypeLabels] = useState([]);
  const [selectedTypeLabel, setSelectedTypeLabel] = useState<string>('');
  const [isOpenTypeLabelModal, setIsOpenTypeLabelModal] = useState(false);
  const [dataModalResourceStateTypeLabel, setDataModalResourceStateTypeLabel] = useState<DataModalState>({
    type: '',
    buttonSubmit: null,
    row: null,
    title: null,
    onCloseModalForm: () => {},
  });

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isStateModal, setIsStateModal] = useState(false);
  const [dataModalResourceState, setDataModalResourceState] = useState<DataModalState>({
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
    play: { type: 'color' }
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
      '',
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
    getLabels( '', '', '', 1, '', '', '', true, true);
  };

  const handleFilterSearch = (newFilters: any, state: boolean) => {
    setFilterState(newFilters);
    getLabels(
      '',
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

  const onClickAddResourceTypeLabel = (type: string) => {
    setDataModalResourceStateTypeLabel({
      type: type,
      buttonSubmit: 'Registrar',
      row: null,
      title: 'Nuevo tipo de Etiqueta',
      onCloseModalForm: onCloseModalForm,
    });
    setIsOpenTypeLabelModal(true);
    setIsStateModal(true);
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
    // Obtener TypeLabels al montar
  import('../../../services/type-labels.service').then(({ getTypeLabels }) => {
  getTypeLabels('', '', 1, '', '', '').then((res: any) => {
        setTypeLabels(res?.data || []);
      });
    });
    // Cargar etiquetas si hay tipo seleccionado
    if (selectedTypeLabel) {
      getLabels(
        selectedTypeLabel,
        filterState.text,
        '',
        filterState.page,
        filterState.limit,
        filterState.orderBy,
        filterState.order,
        true,
        true
      );
    }
  }, [selectedTypeLabel]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="card">
          <PageHeaderComponent
            state={state}
            onModalResource={() => onClickAddResource('store')}
          />
          {/* Renderizar TypeLabels como recuadros/chips arriba del botón Nuevo */}
          <div style={{ display: 'flex', gap: '8px', margin: '10px 25px' }}>
            {/* Recuadro para crear nuevo type label */}
            <div onClick={() => onClickAddResourceTypeLabel('store')} >
              <span className="btn btn-primary">+ Nuevo</span>
            </div>
            
            {/* Recuadros de typeLabels */}
            {typeLabels.map((tl: any) => (
              <div
                key={tl.id || tl.id}
                onClick={() => {
                  setSelectedTypeLabel(tl.id || tl.id);
                }}
                className="btn btn-secondary ms-2"
              >
                {tl.name}
              </div>
            ))}
          </div>
          <div className="card-body pt-1">
            {/* Solo muestra la tabla si hay tipo seleccionado */}
            {selectedTypeLabel ? (
              <PageBodyComponent
                tableCss="table-resource"
                state={state}
                onClickButtonPersonalizado={onClickButtonPersonalizado}
                onChangeEdit={onClickEditResource}
                onChangeDelete={onDelete}
                onChangePage={onChangePage}
              />
            ) : (
              <div>Selecciona un tipo de etiqueta para ver la lista.</div>
            )}
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
              data={{ ...dataModalResourceState, type_label_id: selectedTypeLabel }}
              storeLabel={(name: string, color: string) => storeLabel(selectedTypeLabel, name, color)}
              updateLabel={updateLabel}
            />
          }
        />
      )}
      {/* Modal para crear nuevo type label */}
      {isOpenTypeLabelModal && (
        <ModalComponent
          stateModal={isStateModal}
          typeModal={'static'}
          onClose={handleCloseModal}
          title={dataModalResourceStateTypeLabel.title || ''}
          size="modal-md"
          content={
            <TypeLabelFormComponent
              data={dataModalResourceStateTypeLabel}
              storeTypeLabel={storeTypeLabel}
              updateTypeLabel={updateTypeLabel}
              onRefresh={onRefresh}
            />
          }
        />
      )}
    </div>
  );
};

export default LabelsPage;
