export const isRoleActive = (state: unknown): boolean => {
  if (state === undefined || state === null) {
    return true;
  }

  if (typeof state === 'boolean') {
    return state;
  }

  if (typeof state === 'number') {
    return state === 1;
  }

  const normalized = String(state).trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  if (['1', 'true', 'activo', 'activa', 'active', 'enabled', 'habilitado', 'habilitada'].includes(normalized)) {
    return true;
  }

  return false;
};
