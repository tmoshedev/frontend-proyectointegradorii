/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import { useUserHierarchy } from '../../../hooks';
import { SweetAlert } from '../../../utilities';

/**Validations */

interface Props {
  data: any;
  onRefreshTeams: (state: boolean) => void;
}

export const ListUsersComponent = (props: Props) => {
  const [users, setUsers] = useState<any[]>([]);
  const { getUsersBySuperior, postHabilitarComercial, deshabilitarComercial, cambiarSupervisor } =
    useUserHierarchy();
  const [usuariosCargo, setUsuariosCargo] = useState<any[]>([]);
  const [usersSeleccionados, setUsuariosSeleccionados] = useState<any[]>([]);
  const [nuevoSuperiorId, setNuevoSuperiorId] = useState<string>('');

  const onHabilitar = (userId: string) => {
    postHabilitarComercial(userId, true).then((response: any) => {
      SweetAlert.success('Mensaje', response.message);
      const updatedUsers = users.map((user) => {
        if (user.id === userId) {
          return { ...user, state: 1, state_name: 'Activo' };
        }
        return user;
      });
      setUsers(updatedUsers);
    });
  };

  const onDeshabilitar = (userId: string) => {
    deshabilitarComercial(userId, true).then((response: any) => {
      SweetAlert.success('Mensaje', response.message);
      const updatedUsers = users.map((user) => {
        if (user.id === userId) {
          return { ...user, state: 0, state_name: 'Desactivado' };
        }
        return user;
      });
      setUsers(updatedUsers);
    });
  };

  const handleSelectAllUsers = (isChecked: boolean) => {
    if (isChecked) {
      setUsuariosSeleccionados(users.filter((user) => user.state === 1).map((user) => user.id));
    } else {
      setUsuariosSeleccionados([]);
    }
  };

  const handleLeadSelection = (isChecked: boolean, user: any) => {
    if (isChecked) {
      setUsuariosSeleccionados((prev) => [...prev, user.id]);
    } else {
      setUsuariosSeleccionados((prev) => prev.filter((id) => id !== user.id));
    }
  };

  const onCambiarSupervisor = () => {
    cambiarSupervisor(usersSeleccionados, nuevoSuperiorId, true).then((response: any) => {
      SweetAlert.success('Mensaje', response.message);
      props.onRefreshTeams(false);
      props.data.onCloseModalForm();
    });
  };

  useEffect(() => {
    const dataInicial = () => {
      getUsersBySuperior(props.data.row.user_id, true).then((response: any) => {
        setUsers(response.users);
        setUsuariosCargo(response.users_cargo);
      });
    };

    dataInicial();
  }, []);
  return (
    <div className="form-scrollable">
      <div className="modal-body">
        <div className="row">
          <div className="col-12">
            <div
              style={{
                maxHeight: 'calc(100vh - 25rem)',
                overflowY: 'auto',
                willChange: 'scroll-position',
                maxWidth: '100%',
              }}
            >
              <table className="table text-nowrap table-resource table-resource-scroll table-resource-zh">
                <thead className="table-primary">
                  <tr>
                    <th className="text-center">
                      <input
                        id="users"
                        className="form-check-input"
                        name="users"
                        type="checkbox"
                        onChange={(e) => handleSelectAllUsers(e.target.checked)}
                        checked={users.length > 0 && usersSeleccionados.length === users.length}
                      />
                    </th>
                    <th className="text-center">Nº</th>
                    <th>Nombres</th>
                    <th>Apellidos</th>
                    <th>Celular</th>
                    <th>Leads asignados</th>
                    <th className="text-center">Estado</th>
                    <th className="text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={index}>
                      <td className="text-center">
                        <input
                          id={`user_${index}`}
                          name={`user_${index}`}
                          type="checkbox"
                          disabled={user.state !== 1}
                          className="form-check-input"
                          checked={usersSeleccionados.includes(user.id)}
                          onChange={(e) => handleLeadSelection(e.target.checked, user)}
                        />
                      </td>
                      <td className="text-center">{index + 1}</td>
                      <td>{user.names}</td>
                      <td>
                        {user.father_last_name} {user.mother_last_name}
                      </td>
                      <td className="text-center">{user.cellphone ?? '-'}</td>
                      <td className="text-center">{user.lead_asignados_counts}</td>
                      <td className="text-center">
                        <span className={`${user.state == 1 ? 'text-success' : 'text-danger'}`}>
                          {user.state_name}
                        </span>
                      </td>
                      <td className="text-center">
                        {user.state == 1 ? (
                          <button
                            onClick={() => onDeshabilitar(user.id)}
                            type="button"
                            className="btn btn-danger btn-xs"
                          >
                            Deshabilitar
                          </button>
                        ) : (
                          <button
                            onClick={() => onHabilitar(user.id)}
                            type="button"
                            className="btn btn-primary btn-xs"
                          >
                            Habilitar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-12 mt-3 d-flex justify-content-center align-items-center">
            <select
              name="nuevo_superior_id"
              id="nuevo_superior_id"
              className="form-select form-select-sm me-2"
              style={{ width: '300px' }}
              value={nuevoSuperiorId}
              onChange={(e) => setNuevoSuperiorId(e.target.value)}
            >
              <option value="">Seleccionar</option>
              {usuariosCargo.map((cargo: any, index: number) =>
                props.data.row.user_id != cargo.user_id ? (
                  <option key={index} value={cargo.user_id}>
                    {cargo.names_alls}
                  </option>
                ) : null
              )}
            </select>
            <button
              disabled={!nuevoSuperiorId || usersSeleccionados.length == 0}
              onClick={onCambiarSupervisor}
              className="btn-primary btn btn-sm"
            >
              Cambiar de supervisor
            </button>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-light btn-sm"
          data-bs-dismiss="modal"
          onClick={props.data.onCloseModalForm}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ListUsersComponent;
