import { useEffect, useState } from "react";
import { SweetAlert } from "../../../../utilities";
import { filterOptionalPermissions } from '../../../../utilities/permission.utils';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RolPermisosComponentProps {
  onCloseModalWindow: any;
  onCloseModalWindowForm: any;
  role: any;
  permissionsAssign: any;
  permissionsNotAssign: any;
  updatePermissions: any;
}
export const RolPermisosComponent = (props: RolPermisosComponentProps) => {
  const [loadedComponent, setLoadedComponent] = useState(false);
  const [permisoSeleccionados, setPermisoSeleccionados] = useState<any[]>([]);
  const [selectAlls, setSelectAlls] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [textButton, setTextButton] = useState<string>("Remover permisos");
  const [stateView, setStateView] = useState<string>("ASIGNADOS");

  const onChangeAlls = () => {
    const newSelectAlls = !selectAlls;
    setSelectAlls(newSelectAlls);
    if (newSelectAlls) {
      // Seleccionar todos los permisos
      const allPermissionsIds = permissions.map((permission) => permission.id);
      setPermisoSeleccionados(allPermissionsIds);
    } else {
      // Deseleccionar todos los permisos
      setPermisoSeleccionados([]);
    }
  };

  const onChangeSelect = (id: string) => {
    const newPermisoSeleccionados = permisoSeleccionados.includes(id)
      ? permisoSeleccionados.filter((permisoId) => permisoId !== id)
      : [...permisoSeleccionados, id];
    setPermisoSeleccionados(newPermisoSeleccionados);
  };

  const onChangeData = (type: string) => {
    setStateView(type);
    selectAlls && setSelectAlls(false);
    permisoSeleccionados.length = 0;
    setTextButton(
      type == "ASIGNADOS" ? "Remover permisos" : "Asignar permisos",
    );
    if (type == "ASIGNADOS") {
      props.permissionsAssign(props.role.id).then((response: any) => {
        setPermissions(filterOptionalPermissions(response.data));
      });
    } else {
      props.permissionsNotAssign(props.role.id).then((response: any) => {
        setPermissions(filterOptionalPermissions(response.data));
      });
    }
  };

  const onClickUpdatePermissions = () => {
    props
      .updatePermissions(props.role.id, permisoSeleccionados, stateView)
      .then((response: any) => {
        selectAlls && setSelectAlls(false);
        permisoSeleccionados.length = 0;
        setPermissions(response.data);
        SweetAlert.success("Mensaje", "Permisos actualizados correctamente.");
        //props.onCloseModalWindow();
        //props.onCloseModalWindowForm();
      });
  };

  //DATA INICIAL
  useEffect(() => {
    const dataInicial = () => {
      props.permissionsAssign(props.role.id).then((response: any) => {
        setPermissions(filterOptionalPermissions(response.data));
        setLoadedComponent(true);
      });
    };
    if (!loadedComponent) {
      dataInicial();
    }
  }, [loadedComponent, props]);
  return (
    <div className="form form-horizontal form-scrollable">
      <div className="modal-body modal-body-scrollable">
        <div className="row h-100">
          <div className="col-md-12 h-100">
            <div role="group" className="btn-group w-100">
              <button
                onClick={() => onChangeData("ASIGNADOS")}
                type="button"
                className={
                  "btn ellipsis" +
                  (stateView == "ASIGNADOS" ? " btn-primary" : "")
                }
              >
                <i className="fas fa-check"></i> Asignados
              </button>
              <button
                onClick={() => onChangeData("SIN_ASIGNAR")}
                type="button"
                className={
                  "btn ellipsis" +
                  (stateView == "SIN_ASIGNAR" ? " btn-primary" : "")
                }
              >
                <i className="fas fa-times"></i> Sin asignar
              </button>
            </div>
            <div className="table-responsive h-80">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th className="text-center">
                      <div className="form-check" style={{ margin: 0 }}>
                        <input
                          id="alls"
                          type="checkbox"
                          className="form-check-input form-check-input"
                          value=""
                          onChange={onChangeAlls}
                          checked={selectAlls}
                        />
                      </div>
                    </th>
                    <th>
                      {stateView == "ASIGNADOS"
                        ? "Permiso asignados"
                        : "Permisos sin asginar"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="form-check" style={{ margin: 0 }}>
                          <input
                            id={"role_" + item.id}
                            type="checkbox"
                            className="form-check-input form-check-input"
                            value={item.id}
                            checked={permisoSeleccionados.includes(item.id)}
                            onChange={() => onChangeSelect(item.id)}
                          />
                        </div>
                      </td>

                      <td>{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <small className="text-muted">
              *Permisos seleccinados: {permisoSeleccionados.length}
            </small>
            <button
              onClick={onClickUpdatePermissions}
              disabled={permisoSeleccionados.length == 0}
              className="btn btn-primary w-100"
            >
              {textButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolPermisosComponent;
