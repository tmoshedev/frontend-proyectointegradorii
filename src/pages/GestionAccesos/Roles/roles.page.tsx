/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import PageBodyComponent from '../../../components/page/page-body.component';
import PageHeaderComponent from '../../../components/page/page-hader.component';
import ModalComponent from '../../../components/shared/modal.component';
import { useRoles } from "../../../hooks";
import RolPermisosComponent from "./components/rol-permisos.component";
import RolFormComponent from './components/rol-form.component';
import { SweetAlert } from "../../../utilities";
import CanCheck from "../../../resources/can";
import type { Role } from "../../../models";
import { isRoleActive } from '../../../utilities/role.utils';

export const RolesPage = () => {
  const { getRoles, permissionsAssign, permissionsNotAssign, updatePermissions, createRole, toggleRoleState } = useRoles();
  const [loadedComponent, setLoadedComponent] = useState(false);
  /** Modal Window Resource */
  const [isModalWindowOpen, setIsModalWindowOpen] = useState(false);
  const [dataModalWindowResourceState, setDataModalWindowResourceState] =
    useState({
      title: "",
      size: "",
      buttonSubmit: "",
      onCloseModalForm: () => {},
    });
  const [componentModalWindow, setComponentModalWindow] = useState<any>(null);
  const [stateModalWindow, setStateModalWindow] = useState<boolean>(false);

  //STATE

  const handleRoleStateChange = useCallback(async (role: Role, nextState: boolean) => {
    const roleId = typeof role.id === 'string' ? parseInt(role.id, 10) : role.id;
    if (!roleId || Number.isNaN(roleId)) {
      SweetAlert.error("Error", "El identificador del rol no es válido.");
      return;
    }

    try {
      const response = await toggleRoleState(roleId, nextState);
      const responseData = (response as any)?.data;

      if (responseData?.detached_users && responseData.detached_users > 0) {
        SweetAlert.warning(
          "Reasignación requerida",
          `Se desvincularon ${responseData.detached_users} usuario(s) de este rol. Debes asignar un nuevo rol antes de que puedan continuar trabajando.`,
        );
      } else {
        SweetAlert.success(
          "Rol actualizado",
          `El rol ${role.name} ahora está ${nextState ? "activo" : "bloqueado"}.`,
        );
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "No se pudo actualizar el estado del rol.";
      SweetAlert.error("Error", message);
    } finally {
      await getRoles(1, "", "", false, true);
    }
  }, [getRoles, toggleRoleState]);

  const renderRoleState = useCallback((row: Role) => {
    const isActive = isRoleActive(row.state);
    const roleId = typeof row.id === 'string' ? parseInt(row.id, 10) : row.id;
    const hasValidId = typeof roleId === 'number' && !Number.isNaN(roleId);
    return (
      <div className="d-flex align-items-center gap-2">
        <span className={`badge ${isActive ? 'bg-success' : 'bg-danger'}`}>
          {isActive ? 'Activo' : 'Bloqueado'}
        </span>
        
      </div>
    );
  }, [handleRoleStateChange]);

  const tableState = useMemo(() => ({
    page: {
      title: "Lista de roles",
      icon: "ri-group-line",
      model: "access-roles",
      header: {
        menu: ["Gestión de accesos", "Usuarios"],
      },
      gridMenu: [],
      body: [],
      buttons: {
        create: true,
        create_header: false,
        edit: false,
        destroy: false,
        import: false,
        export: false,
      },
    },
    table: {
      body: {
        widthAccion: "",
        cols: [
          {
            name: "name",
            alias: "Nombre",
            roles: [],
          },
          {
            name: "state",
            alias: "Estado",
            render: renderRoleState,
          },
        ],
        rowClass: (row: Role) => {
          const isActive = isRoleActive(row.state);
          return isActive ? '' : 'table-warning';
        },
        buttons: [
          {
            name: "permisos",
            tooltip: "Permisos del ROL",
            text: "",
            css: "me-3 text-primary",
            icon: "fa-solid fa-user-lock",
            permission: "access-roles-edit",
            play: {
              type: "alls",
              name: "state",
              values: {},
            },
          },
          {
            name: "desactivar",
            tooltip: "Bloquear rol",
            text: "",
            css: "me-3 text-danger",
            icon: "fa-solid fa-user-slash",
            permission: "access-roles-edit",
            play: {
              type: "states",
              name: "state",
              values: {
                true: true,
                false: false,
                1: true,
                0: false,
              },
            },
          },
          {
            name: "activar",
            tooltip: "Activar rol",
            text: "",
            css: "me-3 text-success",
            icon: "fa-solid fa-user-check",
            permission: "access-roles-edit",
            play: {
              type: "states",
              name: "state",
              values: {
                true: false,
                false: true,
                1: false,
                0: true,
              },
            },
          },
        ],
      },
    },
  }), [renderRoleState]);

  //METODOS DEL RECURSO
  const onClickAddResource = () => {
    setIsModalWindowOpen(true);
    setDataModalWindowResourceState({
      title: "Crear Nuevo Rol",
      size: "modal-md",
      buttonSubmit: "Crear Rol",
      onCloseModalForm: onCloseModaWindowlForm,
    });
    setComponentModalWindow(
      <RolFormComponent
        data={dataModalWindowResourceState}
        createRole={createRole}
        getRoles={getRoles}
      />
    );
    setStateModalWindow(true);
  };
  const onClickEditResource = () => {};
  const onClickDeleteResource = () => {};

  const onClickButtonPersonalizado = (row: any, name: any) => {
    switch (name) {
      case "permisos":
        onPermisos(row);
        break;
      case "desactivar":
        handleRoleStateChange(row, false);
        break;
      case "activar":
        handleRoleStateChange(row, true);
        break;
      default:
        break;
    }
  };

  const onPermisos = (row: any) => {
    setIsModalWindowOpen(true);
    setDataModalWindowResourceState({
      title: "Permisos para el ROL " + row.name,
      size: "modal-lg",
      buttonSubmit: "",
      onCloseModalForm: () => {},
    });
    setComponentModalWindow(
      <RolPermisosComponent
        role={row}
        onCloseModalWindow={handleCloseModalWindow}
        onCloseModalWindowForm={onCloseModaWindowlForm}
        permissionsAssign={permissionsAssign}
        permissionsNotAssign={permissionsNotAssign}
        updatePermissions={updatePermissions}
      />,
    );
    setStateModalWindow(true);
  };

  //METODOS DE LA PAGINACION
  const onChangePage = () => {};

  /** METODOS DEL MODAL WINDOW */
  const handleCloseModalWindow = () => {
    setIsModalWindowOpen(false);
  };

  const onCloseModaWindowlForm = () => {
    setStateModalWindow(false);
  };

  //DATA INICIAL
  useEffect(() => {
    const dataInicial = () => {
      getRoles(1, "", "", true, true).then(() => {
        setLoadedComponent(true);
      });
    };
    if (!loadedComponent) {
      dataInicial();
    }
  }, [getRoles, loadedComponent]);

  return (
    <div className="main-content app-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
          <PageHeaderComponent state={tableState} onModalResource={onClickAddResource} />
          <div className="card-body pt-1">
                    <PageBodyComponent
                      onChangeDelete={onClickDeleteResource}
                      onClickButtonPersonalizado={onClickButtonPersonalizado}
                      onChangeEdit={onClickEditResource}
                      onChangePage={onChangePage}
                      state={tableState}
                      tableCss="table-resource"
                    />
                  </div>
            </div>
          </div>
        </div>
      </div>
      {/* ModalWindow Resource */}
      {isModalWindowOpen && (
        <ModalComponent
          stateModal={stateModalWindow}
          typeModal={"static"}
          size={dataModalWindowResourceState.size}
          title={dataModalWindowResourceState.title}
          content={componentModalWindow}
          onClose={handleCloseModalWindow}
        />
      )}
    </div>
  );
};

export default RolesPage;
