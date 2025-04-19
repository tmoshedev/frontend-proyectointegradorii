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
    name: 'Simulacros',
    path: '/my-mock-exams',
    icon: 'ri-bubble-chart-line',
    permission: 'student-my-mock-exams',
  },
  {
    name: 'Gestión académica',
    icon: 'ri-graduation-cap-line',
    permissions: ['grades-index', 'classrooms-index', 'areas-index'],
    path: '',
    submenu: [
      {
        name: 'Grados',
        path: '/grades',
        permission: 'grades-index',
      },
      {
        name: 'Aulas',
        path: '/classrooms',
        permission: 'classrooms-index',
      },
      {
        name: 'Áreas/Cursos',
        path: '/areas',
        permission: 'areas-index',
      },
    ],
  },
  {
    name: 'Plan curricular',
    path: '/curriculum-plan',
    icon: 'ri-puzzle-line',
    permission: 'curriculum-plan',
  },
  {
    name: 'Gestión alumnos',
    icon: 'ri-graduation-cap-line',
    permissions: ['students', 'student-carnets'],
    path: '',
    submenu: [
      {
        name: 'Listado',
        path: '/students',
        permission: 'students',
      },
      {
        name: 'Carnets',
        path: '/student-carnets',
        permission: 'student-carnets',
      },
    ],
  },
  {
    name: 'Tesorería',
    icon: 'ri-bank-line',
    permissions: ['treasury-calendar', 'treasury-scholarships-awarded'],
    path: '',
    submenu: [
      {
        name: 'Calendario',
        path: '/treasury-calendar',
        permission: 'treasury-calendar',
      },
      {
        name: 'Becas otorgadas',
        path: '/treasury-scholarships-awarded',
        permission: 'treasury-scholarships-awarded',
      },
      {
        name: 'Generación de deudas',
        path: '/treasury-debt-generations',
        permission: 'treasury-debt-generations',
      },
      {
        name: 'Reportes',
        path: '/treasury-reports',
        permission: 'treasury-reports',
      },
    ],
  },
  {
    name: 'Cuentas por cobrar',
    icon: 'ri-refund-2-line',
    permissions: ['accounts-receivable-cash-payments'],
    path: '',
    submenu: [
      {
        name: 'Pagos por caja',
        path: '/accounts-receivable-cash-payments',
        permission: 'accounts-receivable-cash-payments',
      },
    ],
  },
  {
    name: 'Matrículas',
    icon: 'ri-file-check-line',
    permissions: ['enrollments-store', 'enrollment-imports'],
    path: '',
    submenu: [
      {
        name: 'Registro',
        path: '/enrollments-register',
        permission: 'enrollments-store', //enrollments-store
      },
      {
        name: 'Importar',
        path: '/enrollment-imports',
        permission: 'enrollment-imports', //enrollments-store
      },
    ],
  },
  {
    name: 'Asistencias',
    icon: 'ri-calendar-check-line',
    permissions: ['assists-configuration', 'assists-students', 'assists-reports-students'],
    path: '',
    submenu: [
      {
        name: 'Configuración',
        path: '/assists-configuration',
        permission: 'assists-configuration',
      },
      {
        name: 'Alumnos',
        path: '/assists-students',
        permission: 'assists-students',
      },
      {
        name: 'Reportes',
        path: '/assists-reports-students',
        permission: 'assists-reports-students',
      },
    ],
  },
  {
    name: 'Simulacros',
    icon: 'ri-bubble-chart-line',
    permissions: ['mock-exams-templates', 'mock-exams'],
    path: '',
    submenu: [
      {
        name: 'Plantillas',
        path: '/mock-exams-templates',
        permission: 'mock-exams-templates',
      },
      {
        name: 'Simulacros',
        path: '/mock-exams',
        permission: 'mock-exams',
      },
      {
        name: 'Alumnos externos',
        path: '/mock-students',
        permission: 'mock-exams-templates',
      },
    ],
  },
  {
    name: 'Mantenimientos',
    icon: 'ri-settings-3-line',
    permissions: ['maintenance-types-scholarships', 'maintenance-scholarship-reasons'],
    path: '',
    submenu: [
      {
        name: 'Tipo de becas',
        path: '/maintenance-types-scholarships',
        permission: 'maintenance-types-scholarships',
      },
      /* {
        name: 'Motivo de becas',
        path: '/maintenance-scholarship-reasons',
        permission: 'maintenance-scholarship-reasons',
      }, */
    ],
  },
  {
    name: 'Datos personales',
    path: '/personal-data',
    icon: 'ri-file-user-line',
    permission: 'personal-data',
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
  /* {
    name: 'Gestión Académica',
    icon: 'ri-booklet-line',
    permissions: ['teacher-courses'],
    path: '',
    submenu: [
      {
        name: 'Cursos',
        path: '/teacher-courses',
        permission: 'teacher-courses',
      },
      {
        name: 'Alumnos',
        path: '/student-carnets',
        permission: 'change-password',
      },
      {
        name: 'Horarios',
        path: '/student-carnets',
        permission: 'change-password',
      },
      {
        name: 'Syllabus',
        path: '/student-carnets',
        permission: 'change-password',
      },
    ],
  }, */
  {
    name: 'Cambiar contraseña',
    path: '/change-password',
    icon: 'ri-lock-line',
    permission: 'change-password',
  },
];

export default Menu;
