import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppStore } from '../../redux/store';
import { setUser } from '../../redux/states/auth.slice';
import { SweetAlert } from '../../utilities';
import * as accessService from '../../services/access-users.service';

interface Props {
  data: any;
}
export const CambiarRolComponent = (props: Props) => {
  const userState = useSelector((state: AppStore) => state.auth.user);
  const rolActualName = localStorage.getItem('rolActualName') || '';
  const dispatch = useDispatch();
  const [isSwitching, setIsSwitching] = useState(false);
  const roles = userState?.roles ?? [];

  const toArray = useCallback((source: any): any[] => {
    if (!source) {
      return [];
    }

    if (Array.isArray(source)) {
      return source;
    }

    if (Array.isArray(source?.data)) {
      return source.data;
    }

    return [];
  }, []);

  const normalizePermissionValues = useCallback((entries: any[]): string[] => {
    const collected: string[] = [];

    entries.forEach((entry) => {
      if (entry === null || entry === undefined) {
        return;
      }

      if (typeof entry === 'string' || typeof entry === 'number') {
        const value = String(entry).trim();
        if (value) {
          collected.push(value);
        }
        return;
      }

      if (typeof entry === 'object') {
        const candidate = entry.name ?? entry.permission ?? entry.slug ?? entry.code ?? entry.id;
        if (candidate !== undefined && candidate !== null) {
          const value = String(candidate).trim();
          if (value) {
            collected.push(value);
          }
        }
      }
    });

    return Array.from(new Set(collected));
  }, []);

  const resolvePermissionsFromRole = useCallback(
    async (role: any): Promise<string[]> => {
      const inlinePermissions = normalizePermissionValues(
        toArray(
          role?.permissions ??
            role?.permission_names ??
            role?.permission_list ??
            role?.permissions_detail
        )
      );

      if (inlinePermissions.length > 0) {
        return inlinePermissions;
      }

      if (role?.id === undefined || role?.id === null) {
        return [];
      }

      const response = await accessService.permissionsAssign(String(role.id));
      const payload = response?.data ?? response;
      return normalizePermissionValues(toArray(payload));
    },
    [normalizePermissionValues, toArray]
  );

  const onCambiarRol = async (role: any) => {
    if (isSwitching) {
      return;
    }

    setIsSwitching(true);

    const previousRoleCode = localStorage.getItem('rolActual');
    const previousRoleName = localStorage.getItem('rolActualName');

    try {
      localStorage.setItem('rolActual', role.code);
      localStorage.setItem('rolActualName', role.name);

      const permissions = await resolvePermissionsFromRole(role);

      localStorage.setItem('permissions', permissions.join(','));

      if (userState) {
        const updatedUser = {
          ...userState,
          permissions,
        };
        dispatch(setUser(updatedUser));
      }
    } catch (error) {
      console.error('Failed to switch role permissions', error);
      SweetAlert.error(
        'Error',
        'No se pudieron obtener los permisos para el rol seleccionado. Inténtalo nuevamente.'
      );
      if (previousRoleCode) {
        localStorage.setItem('rolActual', previousRoleCode);
      } else {
        localStorage.removeItem('rolActual');
      }

      if (previousRoleName) {
        localStorage.setItem('rolActualName', previousRoleName);
      } else {
        localStorage.removeItem('rolActualName');
      }
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="form-scrollable">
      <div className="modal-body">
        {roles.length === 0 ? (
          <div className="alert alert-warning text-center mb-0">
            <i className="ri-alert-line me-2"></i>
            Actualmente no tienes roles activos asignados. Espera a que un administrador te otorgue un nuevo rol para continuar.
          </div>
        ) : (
          <div className="row">
            {roles.map((role: any) => (
              <div
                className="col-4"
                key={role.code}
                onClick={() => !isSwitching && onCambiarRol(role)}
                style={isSwitching ? { pointerEvents: 'none', opacity: 0.6 } : undefined}
              >
                <div
                  className={`card card-cambiar-rol ${rolActualName === role.name ? 'active' : ''}`}
                >
                  <div className="card-body text-center">
                    <p className="p-0 m-0 rol-icon">
                      <i className="fa-regular fa-user"></i>
                    </p>
                    <p className="p-0 m-0 rol-text">{role.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CambiarRolComponent;
