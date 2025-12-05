/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import PageBodyComponent from '../../../components/page/page-body.component';
import PageHeaderComponent from '../../../components/page/page-hader.component';
import { useAccessUsers, useApis } from '../../../hooks';
import FilterAccessUserComponent from './components/filter-access-user.component';
import ModalComponent from '../../../components/shared/modal.component';
import AccessUserFormComponent from './components/access-user-form.component';
import UpdateUserRoleComponent from './components/update-user-role.component';
import ManageUserRolesComponent from './components/manage-user-roles.component';
import { SweetAlert } from '../../../utilities';
import { isRoleActive } from '../../../utilities/role.utils';

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
    state: '',
    user_uuid: '',
    text: '',
    type: '',
    page: 1,
    limit: '',
    orderBy: '',
    order: '',
    roleless: '',
  });
  const {
    getAccessUsers,
    getRequirements,
    storeAccessUser,
    updateAccessUser,
    updateAccessUserRole,
    updateAccessUserRoles,
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
  const [isOpenRoleModal, setIsOpenRoleModal] = useState(false);
  const [isRoleModalState, setIsRoleModalState] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<any | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isOpenRolesModal, setIsOpenRolesModal] = useState(false);
  const [isRolesModalState, setIsRolesModalState] = useState(false);
  const [selectedUserForRoles, setSelectedUserForRoles] = useState<any | null>(null);
  const [isUpdatingRoles, setIsUpdatingRoles] = useState(false);

  const availableRoles = useMemo(() => {
    const rolesSource = (requirements as any)?.roles ?? requirements;
    if (!Array.isArray(rolesSource)) {
      return [];
    }

    return rolesSource.filter((role: any) => isRoleActive(role?.state));
  }, [requirements]);

  const resolveRoleIdFromRow = (row: any): string => {
    if (!row) {
      return '';
    }

    if (row.role_id) {
      return String(row.role_id);
    }

    if (Array.isArray(row.roles_detail) && row.roles_detail.length > 0) {
      return String(row.roles_detail[0].id);
    }

    if (Array.isArray(row.roles) && row.roles.length === 1) {
      const roleName = String(row.roles[0]).toLowerCase();
      const matchedRole = availableRoles.find(
        (role: any) => String(role.name ?? '').toLowerCase() === roleName
      );
      if (matchedRole) {
        return String(matchedRole.id);
      }
    }

    return '';
  };

  const roleModalInitialRoleId = useMemo(
    () => resolveRoleIdFromRow(selectedUserForRole),
    [selectedUserForRole, availableRoles]
  );

  const resolveRoleIdsFromRow = (row: any): string[] => {
    if (!row) return [];
    if (Array.isArray(row.roles_detail) && row.roles_detail.length > 0) {
      return row.roles_detail.map((role: any) => String(role.id));
    }
    if (Array.isArray(row.roles) && row.roles.length > 0) {
      return row.roles.map((role: any) => String(role.id ?? role));
    }
    if (row.role_id) return [String(row.role_id)];
    return [];
  };

  const roleModalInitialRoleIds = useMemo(
    () => resolveRoleIdsFromRow(selectedUserForRoles),
    [selectedUserForRoles]
  );

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
            alias: 'Correo corporativo',
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
          {
            name: 'update_role',
            tooltip: 'Actualizar rol',
            text: '',
            css: 'me-3 text-primary',
            icon: 'fa-solid fa-user-gear',
            play: {
              type: 'alls',
              name: 'state',
              values: {},
            },
          },
          {
            name: 'manage_roles',
            tooltip: 'Gestionar roles (múltiples)',
            text: '',
            css: 'me-3 text-warning',
            icon: 'fa-solid fa-user-plus',
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
      case 'update_role':
        handleOpenRoleModal(row);
        break;
      case 'manage_roles':
        handleOpenRolesModal(row);
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

  const handleOpenRoleModal = (row: any) => {
    setSelectedUserForRole(row);
    setIsOpenRoleModal(true);
    setIsRoleModalState(true);
  };

  const handleCloseRoleModal = () => {
    setIsRoleModalState(false);
  };

  const handleRoleModalClosed = () => {
    setIsOpenRoleModal(false);
    setSelectedUserForRole(null);
  };

  const handleOpenRolesModal = (row: any) => {
    setSelectedUserForRoles(row);
    setIsOpenRolesModal(true);
    setIsRolesModalState(true);
  };

  const handleCloseRolesModal = () => {
    setIsRolesModalState(false);
  };

  const handleRolesModalClosed = () => {
    setIsOpenRolesModal(false);
    setSelectedUserForRoles(null);
  };

  const handleSubmitRoleUpdate = async (roleId: string) => {
    if (!roleId) {
      SweetAlert.warning('Validación', 'Selecciona un rol para continuar.');
      return;
    }

    if (!selectedUserForRole?.id) {
      SweetAlert.error('Error', 'No se pudo identificar al usuario seleccionado.');
      return;
    }

    setIsUpdatingRole(true);
    try {
      await updateAccessUserRole(selectedUserForRole.id, roleId);
      SweetAlert.success('Mensaje', 'Rol actualizado correctamente.');
      setIsRoleModalState(false);
    } catch (error: any) {
      SweetAlert.error(
        'Error',
        error?.response?.data?.message || 'No se pudo actualizar el rol del usuario.'
      );
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleSubmitRolesUpdate = async (roleIds: string[]) => {
    if (!roleIds.length) {
      SweetAlert.warning('Validación', 'Selecciona al menos un rol.');
      return;
    }

    if (!selectedUserForRoles?.id) {
      SweetAlert.error('Error', 'No se pudo identificar al usuario seleccionado.');
      return;
    }

    setIsUpdatingRoles(true);
    try {
      await updateAccessUserRoles(selectedUserForRoles.id, roleIds);
      SweetAlert.success('Mensaje', 'Roles actualizados correctamente.');
      setIsRolesModalState(false);
    } catch (error: any) {
      SweetAlert.error(
        'Error',
        error?.response?.data?.message || 'No se pudieron actualizar los roles del usuario.'
      );
    } finally {
      setIsUpdatingRoles(false);
    }
  };

  const onChangePage = (page: number, type: string) => {
    let newPage = page;

    if (type === 'prev') newPage = filterState.page - 1;
    if (type === 'next') newPage = filterState.page + 1;

    setFilterState({ ...filterState, page: newPage });

    getAccessUsers(
      filterState.role_id,
      filterState.state,
      '',
      filterState.text,
      filterState.type,
      newPage,
      filterState.limit,
      filterState.orderBy,
      filterState.order,
      filterState.roleless,
      true,
      true
    );
  };

  const onClearFilters = () => {
    setFilterState({
      ...filterState,
      role_id: '',
      state: '',
      user_uuid: '',
      text: '',
      type: '',
      page: 1,
      limit: '',
      orderBy: '',
      order: '',
      roleless: '',
    });
    getAccessUsers('', '','',  '','', 1, '', '', '', '', true, true);
  };

  const handleFilterSearch = (newFilters: any, state: boolean) => {
    setFilterState(newFilters);
    getAccessUsers(
      newFilters.role_id,
      newFilters.state,
      newFilters.user_uuid,
      newFilters.text,
      newFilters.type,
      1,
      newFilters.limit,
      newFilters.orderBy,
      newFilters.order,
      newFilters.roleless,
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
    // Si el row tiene email pero no personal_email, lo copiamos
    const rowFixed = {
      ...row,
      personal_email: row.personal_email || row.email || '',
    };
    setDataModalResourceState({
      type: 'edit',
      buttonSubmit: 'Actualizar',
      row: rowFixed,
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
        filterState.state,
        '',
        filterState.text,
        filterState.type,
        filterState.page,
        filterState.limit,
        filterState.orderBy,
        filterState.order,
        filterState.roleless,
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
      {isOpenRoleModal && selectedUserForRole && (
        <ModalComponent
          stateModal={isRoleModalState}
          typeModal={'static'}
          onClose={handleRoleModalClosed}
          title="Actualizar rol del usuario"
          size="modal-md"
          content={
            <UpdateUserRoleComponent
              user={selectedUserForRole}
              roles={availableRoles}
              initialRoleId={roleModalInitialRoleId}
              onSubmit={handleSubmitRoleUpdate}
              onCancel={handleCloseRoleModal}
              isSubmitting={isUpdatingRole}
            />
          }
        />
      )}
      {isOpenRolesModal && selectedUserForRoles && (
        <ModalComponent
          stateModal={isRolesModalState}
          typeModal={'static'}
          onClose={handleRolesModalClosed}
          title="Gestionar roles del usuario"
          size="modal-md"
          content={
            <ManageUserRolesComponent
              user={selectedUserForRoles}
              roles={availableRoles}
              initialRoleIds={roleModalInitialRoleIds}
              onSubmit={handleSubmitRolesUpdate}
              onCancel={handleCloseRolesModal}
              isSubmitting={isUpdatingRoles}
            />
          }
        />
      )}
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
