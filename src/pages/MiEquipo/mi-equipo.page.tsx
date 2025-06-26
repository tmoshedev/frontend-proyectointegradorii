import { useApis, useSidebarResponsive, useUserHierarchy } from '../../hooks';
import TableCRM from '../../components/page/table-crm.component';
import { useEffect, useState } from 'react';
import { TableCrmResponse, TableHeaderResponse } from '../../models/responses';
import TableCRMHeaderComponent from '../../components/page/table-crm-header.component';
import ModalComponent from '../../components/shared/modal.component';
import AddUserComponent from './components/add-user.component';
import { setTitleSidebar } from '../../redux/states/auth.slice';
import { useDispatch } from 'react-redux';
import { SweetAlert } from '../../utilities';
import ListUsersComponent from './components/list-users.component';

interface DataModalState {
  type: string;
  buttonSubmit: string | null;
  row: any | null;
  title: string | null;
  requirements: any;
  onCloseModalForm: any;
}

export const MiEquipoPage = () => {
  useSidebarResponsive(true);
  const dispatch = useDispatch();

  const { findPerson, findUbigeo } = useApis();
  const [data, setData] = useState<any[]>([]);
  const [tableHeader, setTableHeader] = useState<TableHeaderResponse[]>([]);
  const [metaData, setMetaData] = useState({
    current_page: 1,
    last_page: 0,
    per_page: 10,
    total: 0,
  });
  const { getUserHierarchy, deleteUserHierarchy, postHabilitarUserHierarchy } = useUserHierarchy();
  const rolActual = localStorage.getItem('rolActual') || '';
  const nameModel = rolActual == 'COMMERCIAL_LEADER' ? 'Supervisor' : 'Asesor';
  const nameModelPlural = rolActual == 'COMMERCIAL_LEADER' ? 'Supervisores' : 'Asesores';
  //BOTONES DE ACCIONES
  const buttonsAcctions = [
    {
      id: 'add_agente',
      name: 'Agregar agente',
      name_class: '',
      icon: '<i class="fa-solid fa-user-plus"></i>',
      type: 'states',
      type_value: 'state',
      values: [{ '1': true }, { '0': false }],
    },
    {
      id: 'agentes_ventas',
      name: 'Agente de ventas',
      name_class: '',
      icon: '<i class="fa-solid fa-users"></i>',
      type: 'states',
      type_value: 'state',
      values: [{ '1': true }, { '0': false }],
    },
    {
      id: 'desactivar',
      name: 'Desactivar',
      name_class: 'text-danger',
      icon: '<i class="fa-solid fa-power-off"></i>',
      type: 'states',
      type_value: 'state',
      values: [{ '1': true }, { '0': false }],
    },
    {
      id: 'habilitar',
      name: 'Habilitar',
      name_class: 'text-success',
      icon: '<i class="fa-solid fa-power-off"></i>',
      type: 'states',
      type_value: 'state',
      values: [{ '1': false }, { '0': true }],
    },
  ];
  //MODAL NUEVO LEAD
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isStateModal, setIsStateModal] = useState(false);
  const [dataModalResourceState, setDataModalResourceState] = useState<DataModalState>({
    type: '',
    buttonSubmit: null,
    row: null,
    title: null,
    requirements: [],
    onCloseModalForm: () => {},
  });
  //MODAL EQUIPO DE USERS
  const [isOpenModalUsers, setIsOpenModalUsers] = useState(false);
  const [isStateModalUsers, setIsStateModalUsers] = useState(false);
  const [dataModalUsersResourceState, setDataModalUsersResourceState] = useState<DataModalState>({
    type: '',
    buttonSubmit: null,
    row: null,
    title: null,
    requirements: [],
    onCloseModalForm: () => {},
  });

  const cargarData = (page: number) => {
    getUserHierarchy('', metaData.per_page, page, true).then((response: TableCrmResponse) => {
      setData((prevData) => [...prevData, ...response.data]); // Concatenar arrays
      setMetaData({
        current_page: response.meta.current_page,
        last_page: response.meta.last_page,
        per_page: response.meta.per_page,
        total: response.meta.total,
      });
    });
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
  };

  const onCloseModalForm = () => {
    setIsStateModal(false);
  };

  const handleCloseModalUsers = () => {
    setIsOpenModalUsers(false);
  };

  const onCloseModalUsersForm = () => {
    setIsStateModalUsers(false);
  };

  const onAddResource = () => {
    setIsOpenModal(true);
    setIsStateModal(true);
    setDataModalResourceState({
      type: 'ADD',
      buttonSubmit: 'Crear',
      row: null,
      title: 'Agregar ' + nameModel,
      requirements: [],
      onCloseModalForm: onCloseModalForm,
    });
  };

  const onRefreshTeams = () => {
    getUserHierarchy('', metaData.per_page, metaData.current_page, true).then(
      (response: TableCrmResponse) => {
        setData(response.data);
        setTableHeader(response.table_header);
        setMetaData({
          current_page: response.meta.current_page,
          last_page: response.meta.last_page,
          per_page: response.meta.per_page,
          total: response.meta.total,
        });
      }
    );
  };

  const onClickButtonPersonalizado = (row: any, id: string) => {
    switch (id) {
      case 'desactivar':
        SweetAlert.onConfirmation(
          () => handleDesactivarSupervisor(row),
          handleCancelDelete,
          '¿Está seguro que deseas desactivar al ' + nameModel + '?',
          row.names_alls
        );
        break;
      case 'habilitar':
        SweetAlert.onConfirmation(
          () => {
            postHabilitarUserHierarchy(row.id, true).then((response: any) => {
              SweetAlert.success('Mensaje', response.message);
              onRefreshTeams();
            });
          },
          handleCancelDelete,
          '¿Está seguro que deseas habilitar al ' + nameModel + '?',
          row.names_alls
        );
        break;
      case 'agentes_ventas':
        onHandleAsesores(row);
        break;
      case 'add_agente':
        onHandleAddAgente('STORE_AGENTE', row);
        break;
      default:
        break;
    }
  };

  const onHandleAddAgente = (type: string, row: any) => {
    setIsOpenModal(true);
    setIsStateModal(true);
    setDataModalResourceState({
      type: type,
      buttonSubmit: 'Crear',
      row: row,
      title: 'Agregar Agente de ventas a ' + nameModel + ': ' + row.names_alls,
      requirements: [],
      onCloseModalForm: onCloseModalForm,
    });
  };

  const handleCancelDelete = () => {};

  const handleDesactivarSupervisor = (row: any) => {
    deleteUserHierarchy(row.id, true).then((response: any) => {
      SweetAlert.success('Mensaje', response.message);
      onRefreshTeams();
    });
  };

  const onHandleAsesores = (row: any) => {
    setIsOpenModalUsers(true);
    setIsStateModalUsers(true);
    setDataModalUsersResourceState({
      type: 'LISTA_USERS',
      buttonSubmit: 'Crear',
      row: row,
      title: 'Equipo de ' + nameModel + ': ' + row.names_alls,
      requirements: [],
      onCloseModalForm: onCloseModalUsersForm,
    });
  };

  useEffect(() => {
    const dataInicial = () => {
      getUserHierarchy('', metaData.per_page, metaData.current_page, true).then(
        (response: TableCrmResponse) => {
          setData(response.data);
          setTableHeader(response.table_header);
          setMetaData({
            current_page: response.meta.current_page,
            last_page: response.meta.last_page,
            per_page: response.meta.per_page,
            total: response.meta.total,
          });
        }
      );
    };

    dataInicial();
  }, []);

  useEffect(() => {
    dispatch(setTitleSidebar('Mi equipo'));

    // Limpia el estado al desmontar
    return () => {
      dispatch(setTitleSidebar(''));
    };
  }, []);

  return (
    <div
      className="main-content app-content main-content--page"
      style={{ paddingLeft: '0rem', paddingRight: '0rem', backgroundColor: '#fff' }}
    >
      <div
        className="container-fluid p-0"
        style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 3.4rem)' }}
      >
        <div className="table-crm">
          <div className="table-crm-header">
            <TableCRMHeaderComponent
              name_resource={nameModel}
              name_plural_resource={nameModelPlural}
              onAddResource={onAddResource}
              metaData={metaData}
              tableHeader={tableHeader}
              setTableHeader={setTableHeader}
              filtros={[]}
            />
          </div>
          <div className="table-crm-body">
            <TableCRM
              tableHeader={tableHeader}
              tableData={data}
              activateCheckBoot={false}
              metaData={metaData}
              cargarData={cargarData}
              buttonsAcctions={buttonsAcctions}
              onClickButtonPersonalizado={onClickButtonPersonalizado}
            />
          </div>
        </div>
      </div>
      {/* MODAL AGREGAR EQUIPO*/}
      {isOpenModal && (
        <ModalComponent
          stateModal={isStateModal}
          typeModal={'static'}
          onClose={handleCloseModal}
          title={dataModalResourceState.title || ''}
          size="modal-lg"
          content={
            <AddUserComponent
              data={dataModalResourceState}
              onRefreshTeams={onRefreshTeams}
              findPerson={findPerson}
              findUbigeo={findUbigeo}
            />
          }
        />
      )}
      {/* MODAL EQUIPO DE AGENTE DE VENTAS*/}
      {isOpenModalUsers && (
        <ModalComponent
          stateModal={isStateModalUsers}
          typeModal={'static'}
          onClose={handleCloseModalUsers}
          title={dataModalUsersResourceState.title || ''}
          size="modal-xl"
          content={<ListUsersComponent data={dataModalUsersResourceState} />}
        />
      )}
    </div>
  );
};
export default MiEquipoPage;
