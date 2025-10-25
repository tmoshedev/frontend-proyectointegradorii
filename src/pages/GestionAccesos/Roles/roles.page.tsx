/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import PageBodyComponent from '../../../components/page/page-body.component';
import PageHeaderComponent from '../../../components/page/page-hader.component';
import ModalComponent from '../../../components/shared/modal.component';
import { useRoles } from "../../../hooks";
import RolPermisosComponent from "./components/rol-permisos.component";

export const RolesPage = () => {
  const { getRoles, permissionsAssign, permissionsNotAssign, updatePermissions } = useRoles();
  const [loadedComponent, setLoadedComponent] = useState(false);
  /** Modal Window Resource */
  const [isModalWindowOpen, setIsModalWindowOpen] = useState(false);
  const [dataModalWindowResourceState, setDataModalWindowResourceState] =
    useState({
      title: "",
      size: "",
    });
  const [componentModalWindow, setComponentModalWindow] = useState<any>(null);
  const [stateModalWindow, setStateModalWindow] = useState<boolean>(false);

  //STATE

  const state = {
    page: {
      title: "Lista de roles",
      icon: "ri-group-line",
      model: "access-users",
      header: {
        menu: ["Gestión de accesos", "Usuarios"],
      },
      gridMenu: [],
      body: [],
      buttons: {
        create: false,
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
            name: "code",
            alias: "Código",
            roles: [],
          },
          {
            name: "name",
            alias: "Nombre",
            roles: [],
          },
        ],
        buttons: [
          {
            name: "permisos",
            tooltip: "Permisos del ROL",
            text: "",
            css: "me-3 text-primary",
            icon: "fa-solid fa-user-lock",
            play: {
              type: "alls",
              name: "state",
              values: {},
            },
          },
        ],
      },
    },
  };

  //METODOS DEL RECURSO
  const onClickAddResource = () => {};
  const onClickEditResource = () => {};
  const onClickDeleteResource = () => {};

  const onClickButtonPersonalizado = (row: any, name: any) => {
    switch (name) {
      case "permisos":
        onPermisos(row);
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
      getRoles(1, "", "", true).then(() => {
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
          <PageHeaderComponent state={state} onModalResource={onClickAddResource} />
          <div className="card-body pt-1">
                    <PageBodyComponent
                      onChangeDelete={onClickDeleteResource}
                      onClickButtonPersonalizado={onClickButtonPersonalizado}
                      onChangeEdit={onClickEditResource}
                      onChangePage={onChangePage}
                      state={state}
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
