import TableCRM from '../../../components/page/table-crm.component';
import { useSidebarResponsive } from '../../../hooks';
import { TableHeaderResponse } from '../../../models/responses';
import TableCRMHeaderComponent from '../../../components/page/table-crm-header.component';
import TableCRMSkeleton from '../../../components/shared/TableCRMSkeleton';

interface Props {
  handleStateView: (view: string) => void;
  handleModalLeadForm: (type: string) => void;
  onFiltrosLeads: (type: string) => void;
  leads: any[];
  cargarDataLeads: (page: number) => void;
  filtros: any[];
  metaData: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  tableHeader: TableHeaderResponse[];
  setTableHeader: React.Dispatch<React.SetStateAction<TableHeaderResponse[]>>;
  isTableLoading: boolean;
}
export const LeadsTableComponent = (props: Props) => {
  useSidebarResponsive(true);

  const cargarData = (page: number, onFinish?: () => void) => {
    console.log('Cargando datos de la página:', page);
    props.cargarDataLeads(page);
    if (onFinish) onFinish();
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
              tableHeader={props.tableHeader}
              setTableHeader={props.setTableHeader}
              onFiltros={() => props.onFiltrosLeads('LEADS_TABLE')}
              filtros={props.filtros}
            />
          </div>
          <div className="table-crm-body">
            {props.isTableLoading ? (
              <TableCRMSkeleton
                columnCount={
                  props.tableHeader.length > 0
                    ? props.tableHeader.filter((h) => h.visible).length
                    : 8
                }
              />
            ) : (
              <TableCRM
                tableHeader={props.tableHeader}
                tableData={props.leads}
                activateCheckBoot={false}
                metaData={props.metaData}
                cargarData={cargarData}
                buttonsAcctions={[]}
                onClickButtonPersonalizado={() => {}}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeadsTableComponent;
