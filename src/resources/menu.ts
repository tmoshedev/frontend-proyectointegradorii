interface MenuItem {
  name: string;
  path: string;
  icon?: string;
  permission?: string;
  permissions?: string[];
  submenu?: MenuItem[];
  rolesPermitidos: string[];
}

const Menu: MenuItem[] = [
  {
    name: 'Escritorio',
    path: '/',
    icon: 'ri-home-8-line',
    permission: 'home-index',
    rolesPermitidos: ['ALLS'],
  },
  {
    name: 'Campaña',
    path: '/campaigns',
    icon: 'ri-megaphone-line',
    permission: 'campaigns-index',
    rolesPermitidos: ['DEVELOPER', 'CEO', 'ADMINISTRATOR'],
  },
  {
    name: 'Calendario',
    path: '/calendar',
    icon: 'ri-calendar-2-line',
    permission: 'home-index',
    rolesPermitidos: ['ALLS'],
  },
  {
    name: 'Mi equipo',
    path: '/my-teams',
    icon: 'ri-user-heart-line',
    permission: 'teams-index',
    rolesPermitidos: ['SALES_SUPERVISOR', 'COMMERCIAL_LEADER','DEVELOPER', 'CEO', 'ADMINISTRATOR' ],
  },
  {
    name: 'Leads',
    path: '/leads',
    icon: 'ri-trophy-line',
    permission: 'leads-index',
    rolesPermitidos: ['ALLS'],
  },
  {
    name: 'Formularios',
    path: '/forms',
    icon: 'ri-window-line',
    permission: 'forms-index',
    rolesPermitidos: ['ALLS'],
  },
  {
    name: 'Reportes',
    path: '/reportes',
    icon: 'ri-file-chart-line',
    permission: 'reportes-index',
    rolesPermitidos: ['ADMINISTRATOR','DEVELOPER'],
  },
  {
    name: 'Gestión accesos',
    icon: 'ri-group-line',
    permissions: ['access-users-index'],
    path: '',
    rolesPermitidos: ['DEVELOPER', 'CEO', 'ADMINISTRATOR'],
    submenu: [
      {
        name: 'Usuarios',
        path: '/access-users',
        permission: 'access-users-index',
        rolesPermitidos: ['ALLS'],
      },
      {
        name: 'Roles',
        path: '/access-roles',
        permission: 'access-roles-index',
        rolesPermitidos: ['ADMINISTRATOR' ,'DEVELOPER', 'CEO' ],
      },
      {
        name: 'Usuarios Conectados',
        path: '/connected-users',
        permission: 'access-users-index',
        rolesPermitidos: ['ALLS'],
      },
    ],
  },
  {
    name: 'Configuración',
    path: '/settings',
    icon: 'ri-settings-2-line',
    permission: 'settings-index',
    rolesPermitidos: ['DEVELOPER', 'CEO', 'ADMINISTRATOR'],
  },
  {
    name: 'Cambiar contraseña',
    path: '/change-password',
    icon: 'ri-lock-line',
    permission: 'change-password',
    rolesPermitidos: ['ALLS'],
  },
  
];

export default Menu;
