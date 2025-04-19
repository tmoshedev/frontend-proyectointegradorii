/* eslint-disable @typescript-eslint/no-explicit-any */
export const CanCheck = (permission: any) => {
  const permissions = localStorage.getItem('permissions')?.split(',');
  return permissions?.includes(permission);
};

export default CanCheck;
