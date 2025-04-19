/* eslint-disable @typescript-eslint/no-explicit-any */
export const CanRoles = (rol: string | any[]) => {
  const roles = localStorage.getItem('roles');
  const rolesArray = roles ? JSON.parse(roles) : [];
  if (Array.isArray(rol)) {
    if (rol.length == 0) return true;
    return rolesArray.some((role: any) => rol.includes(role));
  } else {
    return rolesArray.includes(rol);
  }
};

export default CanRoles;
