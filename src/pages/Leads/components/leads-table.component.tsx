import { useEffect, useState } from 'react';
import TableCRM from '../../../components/page/table-crm.component';
import { useLeads, useSidebarResponsive } from '../../../hooks';
import { TableCrmResponse, TableHeaderResponse } from '../../../models/responses';
import TableCRMHeaderComponent from '../../../components/page/table-crm-header.component';

interface Props {
  handleStateView: (view: string) => void;
  handleModalLeadForm: (type: string) => void;
  onFiltrosLeads: (type: string) => void;
  leads: any[];
  setLeads: any;
  metaData: any;
  setMetaData: any;
  cargarDataLeads: (page: number) => void;
  filtros: any[];
}
export const LeadsTableComponent = (props: Props) => {
  useSidebarResponsive(true);
  const { getLeads } = useLeads();
  const [tableHeader, setTableHeader] = useState<TableHeaderResponse[]>([]);

  const cargarData = (page: number) => {
    props.cargarDataLeads(page);
  };

  const onKankan = () => {
    props.handleStateView('KANBAN');
  };

  const onRefresh = () => {
    props.cargarDataLeads(props.metaData.current_page);
  };

  const onAddResource = () => {
    props.handleModalLeadForm('STORE');
  };

  const onDistributes = () => {
    props.handleStateView('DISTRIBUIR');
  };

  const onImports = () => {
    props.handleStateView('IMPORTAR');
  };

  useEffect(() => {
    const dataInicial = () => {
      getLeads(
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        props.metaData.per_page,
        props.metaData.current_page,
        true
      ).then((response: TableCrmResponse) => {
        props.setLeads(response.data);
        setTableHeader(response.table_header);
        props.setMetaData({
          current_page: response.meta.current_page,
          last_page: response.meta.last_page,
          per_page: response.meta.per_page,
          total: response.meta.total,
        });
      });
    };

    dataInicial();
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
              view_kanban={true}
              view_table={true}
              view_distributes={true}
              view_imports={true}
              view_refresh={true}
              viewActual="table"
              name_resource="Lead"
              name_plural_resource="Leads"
              onKankan={onKankan}
              onRefresh={onRefresh}
              onAddResource={onAddResource}
              onDistributes={onDistributes}
              onImports={onImports}
              metaData={props.metaData}
              tableHeader={tableHeader}
              setTableHeader={setTableHeader}
              onFiltros={() => props.onFiltrosLeads('LEADS_TABLE')}
              filtros={props.filtros}
            />
          </div>
          <div className="table-crm-body">
            <TableCRM
              tableHeader={tableHeader}
              tableData={props.leads}
              activateCheckBoot={false}
              metaData={props.metaData}
              cargarData={cargarData}
              buttonsAcctions={[]}
              onClickButtonPersonalizado={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeadsTableComponent;
