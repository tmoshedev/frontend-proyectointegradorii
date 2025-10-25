/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import PageBodyComponent from '../../components/page/page-body.component';
import PageHeaderComponent from '../../components/page/page-hader.component';
import { SweetAlert } from '../../utilities';
import { useAccessUsers } from '../../hooks';
import { useWebSocket } from '../../hooks/useWebSocket';

export const UsuariosConectadosPage = () => {
  const [filterState, setFilterState] = useState({
    page: 1,
    orderBy: '',
    order: '',
  });
  const [usersData, setUsersData] = useState<any[]>([]);
  const { getAccessUsers } = useAccessUsers();
  const { onlineUsers } = useWebSocket();

  const state = {
    page: {
      title: 'Usuarios Conectados',
      model: 'connected-users',
      buttons: {
        create: false,
        edit: false,
        destroy: false,
        import: false,
        export: false,
      },
    },
    table: {
      body: {
        widthAccion: '',
        cols: [
          {
            name: 'names_all',
            alias: 'Nombres y Apellidos',
            roles: [],
          },
          {
            name: 'email',
            alias: 'Correo corporativo',
            roles: [],
          },
          {
            name: 'roles',
            alias: 'Role(s)',
            roles: [],
          },
          {
            name: 'status',
            alias: 'Estado',
            roles: [],
            play: {
              type: 'states',
              name: 'status',
              values: {
                'ONLINE': 'badge bg-success-transparent',
                'OFFLINE': 'badge bg-danger-transparent',
              },
              names: {
                'ONLINE': 'Conectado',
                'OFFLINE': 'Desconectado',
              },
            },
          },
          {
            name: 'last_login',
            alias: 'Última Conexión',
            roles: [],
          },
        ],
        buttons: [
          {
            name: 'stats',
            tooltip: 'Próximamente estadísticas de conectado',
            text: '',
            css: 'me-3 text-info',
            icon: 'fa-solid fa-chart-line',
            play: {
              type: 'alls',
              name: 'state',
              values: {},
            },
          },
        ],
      },
    },
  };

  const onClickButtonPersonalizado = (row: any, name: any) => {
    switch (name) {
      case 'stats':
        SweetAlert.info('Próximamente estadísticas de conectado');
        break;
      default:
        break;
    }
  };

  const onChangePage = (page: number, type: string) => {
    let newPage = page;

    if (type === 'prev') newPage = filterState.page - 1;
    if (type === 'next') newPage = filterState.page + 1;

    setFilterState({ ...filterState, page: newPage });

    const fetchUsers = async () => {
      try {
        const response = await getAccessUsers(
          '',
          '1',
          '',
          '',
          '',
          newPage,
          '100',
          filterState.orderBy,
          filterState.order,
          true,
          true
        );
        setUsersData((response as any).data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAccessUsers(
          '',
          '1',
          '',
          '',
          '',
          filterState.page,
          '',
          filterState.orderBy,
          filterState.order,
          true,
          true
        );
        setUsersData((response as any).data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    setUsersData(prev => prev.map(user => ({
      ...user,
      status: onlineUsers.includes(user.user_uuid) ? 'ONLINE' : 'OFFLINE'
    })));
  }, [onlineUsers]);

  return (
    <div className="main-content app-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <PageHeaderComponent state={state} onModalResource={() => {}} />
              <div className="card-body pt-1">
                <PageBodyComponent
                  tableCss="table-resource"
                  state={state}
                  data={usersData}
                  onClickButtonPersonalizado={onClickButtonPersonalizado}
                  onChangeEdit={() => {}}
                  onChangeDelete={() => {}}
                  onChangePage={onChangePage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsuariosConectadosPage;