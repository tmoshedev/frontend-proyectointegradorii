import { FormEvent, useEffect, useMemo, useState } from 'react';

interface RoleOption {
  id: string | number;
  name: string;
}

interface Props {
  user: any;
  roles: RoleOption[];
  initialRoleIds: Array<string>;
  onSubmit: (roleIds: string[]) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const ManageUserRolesComponent = ({
  user,
  roles,
  initialRoleIds,
  onSubmit,
  onCancel,
  isSubmitting,
}: Props) => {
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set(initialRoleIds));
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    setSelectedRoleIds(new Set(initialRoleIds));
    setLocalError('');
  }, [initialRoleIds, user?.id]);

  const userName = useMemo(() => {
    if (user?.names_all) return user.names_all;
    const parts = [user?.names, user?.father_last_name, user?.mother_last_name].filter(Boolean);
    return parts.length ? parts.join(' ') : '---';
  }, [user]);

  const currentRolesLabel = useMemo(() => {
    if (!user?.roles || user.roles.length === 0) return 'Sin rol asignado';
    if (Array.isArray(user.roles)) return user.roles.join(', ');
    return user.roles;
  }, [user]);

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
    setLocalError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const roleIds = Array.from(selectedRoleIds);
    if (!roleIds.length) {
      setLocalError('Selecciona al menos un rol.');
      return;
    }
    onSubmit(roleIds);
  };

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
            <strong>Roles actuales:</strong> {currentRolesLabel}
          </p>
        </div>

        <div className="mb-2">
          <p className="mb-1 fw-semibold">Selecciona los roles a asignar</p>
          {!roles.length && (
            <small className="text-muted d-block">No hay roles activos disponibles.</small>
          )}
          <div className="d-flex flex-column gap-1" style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {roles.map((role) => {
              const roleIdStr = String(role.id);
              const checked = selectedRoleIds.has(roleIdStr);
              return (
                <label key={role.id} className="d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={checked}
                    onChange={() => toggleRole(roleIdStr)}
                    disabled={isSubmitting}
                  />
                  <span>{role.name}</span>
                </label>
              );
            })}
          </div>
          {localError && <div className="text-danger mt-1">{localError}</div>}
        </div>
        <small className="text-muted">Los roles seleccionados reemplazarán a los actuales.</small>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-light btn-sm" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={isSubmitting || !roles.length}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar roles'}
        </button>
      </div>
    </form>
  );
};

export default ManageUserRolesComponent;
