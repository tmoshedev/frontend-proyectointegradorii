import { FormEvent, useEffect, useMemo, useState } from 'react';

interface RoleOption {
  id: string | number;
  name: string;
}

interface Props {
  user: any;
  roles: RoleOption[];
  initialRoleId: string;
  onSubmit: (roleId: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const UpdateUserRoleComponent = ({
  user,
  roles,
  initialRoleId,
  onSubmit,
  onCancel,
  isSubmitting,
}: Props) => {
  const [selectedRoleId, setSelectedRoleId] = useState(initialRoleId ?? '');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    setSelectedRoleId(initialRoleId ?? '');
    setLocalError('');
  }, [initialRoleId, user?.id]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedRoleId) {
      setLocalError('Selecciona un rol para continuar.');
      return;
    }
    onSubmit(selectedRoleId);
  };

  const userName = useMemo(() => {
    if (user?.names_all) {
      return user.names_all;
    }
    const parts = [user?.names, user?.father_last_name, user?.mother_last_name].filter(Boolean);
    return parts.length ? parts.join(' ') : '---';
  }, [user]);

  const currentRolesLabel = useMemo(() => {
    if (!user?.roles) {
      return 'Sin rol asignado';
    }
    if (Array.isArray(user.roles)) {
      return user.roles.join(', ');
    }
    return user.roles;
  }, [user]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="alert alert-secondary">
          <p className="mb-1">
            <strong>Usuario:</strong> {userName}
          </p>
          <p className="mb-1">
            <strong>Documento:</strong> {user?.document_number ?? '---'}
          </p>
          <p className="mb-0">
            <strong>Rol actual:</strong> {currentRolesLabel}
          </p>
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="role_id">
            Selecciona el nuevo rol <span className="text-danger">*</span>
          </label>
          <select
            id="role_id"
            name="role_id"
            value={selectedRoleId}
            onChange={(event) => {
              setSelectedRoleId(event.target.value);
              setLocalError('');
            }}
            className="form-select form-select-sm"
            disabled={!roles.length || isSubmitting}
          >
            <option value="">Selecciona una opción</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {!roles.length && (
            <small className="text-muted d-block mt-1">
              No hay roles activos disponibles para asignar.
            </small>
          )}
          {localError && <div className="text-danger mt-1">{localError}</div>}
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-light btn-sm" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting || !roles.length}>
          {isSubmitting ? 'Actualizando...' : 'Actualizar rol'}
        </button>
      </div>
    </form>
  );
};

export default UpdateUserRoleComponent;
