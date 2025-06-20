import { useApis, useSidebarResponsive, useUserHierarchy } from '../../hooks';
import TableCRM from '../../components/page/table-crm.component';
import { useEffect, useState } from 'react';
import { TableCrmResponse, TableHeaderResponse } from '../../models/responses';
import TableCRMHeaderComponent from '../../components/page/table-crm-header.component';
import ModalComponent from '../../components/shared/modal.component';
import AddUserComponent from './components/add-user.component';
import { setTitleSidebar } from '../../redux/states/auth.slice';
import { useDispatch } from 'react-redux';

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
  const { getUserHierarchy } = useUserHierarchy();
  const rolActual = localStorage.getItem('rolActual') || '';
  const nameModel = rolActual == 'COMMERCIAL_LEADER' ? 'Supervisor' : 'Asesor';
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
              name_plural_resource="Asesores"
              onAddResource={onAddResource}
              metaData={metaData}
              tableHeader={tableHeader}
              setTableHeader={setTableHeader}
            />
          </div>
          <div className="table-crm-body">
            <TableCRM
              tableHeader={tableHeader}
              tableData={data}
              activateCheckBoot={false}
              metaData={metaData}
              cargarData={cargarData}
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
    </div>
  );
};
export default MiEquipoPage;
