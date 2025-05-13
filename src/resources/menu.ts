interface MenuItem {
  name: string;
  path: string;
  icon?: string;
  permission?: string;
  permissions?: string[];
  submenu?: MenuItem[];
}

const Menu: MenuItem[] = [
  {
    name: 'Escritorio',
    path: '/',
    icon: 'ri-home-8-line',
    permission: 'home-index',
  },
  {
    name: 'Leads',
    path: '/leads',
    icon: 'ri-trophy-line',
    permission: 'leads-index',
  },
  {
    name: 'Formularios',
    path: '/forms',
    icon: 'ri-window-line',
    permission: 'leads-index',
  },
  {
    name: 'Gestión accesos',
    icon: 'ri-group-line',
    permissions: ['access-users-index'],
    path: '',
    submenu: [
      {
        name: 'Usuarios',
        path: '/access-users',
        permission: 'access-users-index',
      },
    ],
  },
  {
    name: 'Cambiar contraseña',
    path: '/change-password',
    icon: 'ri-lock-line',
    permission: 'change-password',
  },
];

export default Menu;
