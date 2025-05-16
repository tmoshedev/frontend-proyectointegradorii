/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import PageBodyComponent from '../../../components/page/page-body.component';
import PageHeaderComponent from '../../../components/page/page-hader.component';
import { useAccessUsers, useApis } from '../../../hooks';
import FilterAccessUserComponent from './components/filter-access-user.component';
import ModalComponent from '../../../components/shared/modal.component';
import AccessUserFormComponent from './components/access-user-form.component';
import { SweetAlert } from '../../../utilities';

interface DataModalState {
  type: string;
  buttonSubmit: string | null;
  row: any | null;
  title: string | null;
  requirements: any[];
  onCloseModalForm: any;
}

export const UsuariosPage = () => {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [filterState, setFilterState] = useState({
    role_id: '',
    text: '',
    type: '',
    page: 1,
    limit: '',
    orderBy: '',
    order: '',
  });
  const {
    getAccessUsers,
    getRequirements,
    storeAccessUser,
    updateAccessUser,
    stateAccessUser,
    resetPasswordAccessUser,
  } = useAccessUsers();
  const { findPerson, findUbigeo } = useApis();
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
      title: 'Usuarios',
      model: 'access-users',
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
          {
            name: 'document_number',
            alias: 'Documento',
            roles: [],
          },
          {
            name: 'names_all',
            alias: 'Nombres y Apellidos',
            roles: [],
          },
          {
            name: 'email',
            alias: 'Correo institucional',
            roles: [],
          },
          {
            name: 'cellphone',
            alias: 'Celular',
            roles: [],
          },
          {
            name: 'roles',
            alias: 'Role(s)',
            roles: [],
          },
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
                0: 'Desactivado',
                1: 'Activado',
              },
            },
          },
        ],
        buttons: [
          {
            name: 'status',
            tooltip: 'Desactivar usuario',
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
            tooltip: 'Activar usuario',
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
          {
            name: 'reset_password',
            tooltip: 'Resetear contraseña',
            text: '',
            css: 'me-3 text-info',
            icon: 'fa-solid fa-lock',
            play: {
              type: 'alls',
              name: 'state',
              values: {},
            },
          },
        ],
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
      case 'reset_password':
        SweetAlert.onConfirmation(
          () => handleResetPassword(row.id),
          handleCancelDelete,
          '¿Está seguro que desea resetear la contraseña del usuario?',
          row.names
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
    stateAccessUser(id).then(() => {
      SweetAlert.success(text);
    });
  };
  const handleCancelDelete = () => {};

  const handleResetPassword = (id: any) => {
    resetPasswordAccessUser(id).then(() => {
      SweetAlert.success('Contraseña reseteada correctamente.');
    });
  };

  const onChangePage = (page: number, type: string) => {
    let newPage = page;

    if (type === 'prev') newPage = filterState.page - 1;
    if (type === 'next') newPage = filterState.page + 1;

    setFilterState({ ...filterState, page: newPage });

    getAccessUsers(
      filterState.role_id,
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
      role_id: '',
      text: '',
      type: '',
      page: 1,
      limit: '',
      orderBy: '',
      order: '',
    });
    getAccessUsers('', '', '', 1, '', '', '', true, true);
  };

  const handleFilterSearch = (newFilters: any, state: boolean) => {
    setFilterState(newFilters);
    getAccessUsers(
      newFilters.role_id,
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
      title: 'Nuevo usuario',
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
      title: 'Editar usuario',
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
      getAccessUsers(
        filterState.role_id,
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
                <FilterAccessUserComponent
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
            <AccessUserFormComponent
              data={dataModalResourceState}
              storeAccessUser={storeAccessUser}
              updateAccessUser={updateAccessUser}
              findPerson={findPerson}
              findUbigeo={findUbigeo}
            />
          }
        />
      )}
    </div>
  );
};

export default UsuariosPage;
