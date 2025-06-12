import { useEffect, useState } from 'react';
import TableCRM from '../../../components/page/table-crm.component';
import { useLeads, useSidebarResponsive } from '../../../hooks';
import { TableCrmResponse, TableHeaderResponse } from '../../../models/responses';
import TableCRMHeaderComponent from '../../../components/page/table-crm-header.component';

export const LeadsTableComponent = () => {
  useSidebarResponsive(true);
  const { getLeads } = useLeads();
  const [data, setData] = useState<any[]>([]);
  const [tableHeader, setTableHeader] = useState<TableHeaderResponse[]>([]);
  const [metaData, setMetaData] = useState({
    current_page: 1,
    last_page: 0,
    per_page: 10,
    total: 0,
  });

  const cargarData = (page: number) => {
    getLeads('', metaData.per_page, page, true).then((response: TableCrmResponse) => {
      setData((prevData) => [...prevData, ...response.data]); // Concatenar arrays
      setMetaData({
        current_page: response.meta.current_page,
        last_page: response.meta.last_page,
        per_page: response.meta.per_page,
        total: response.meta.total,
      });
    });
  };
  useEffect(() => {
    const dataInicial = () => {
      getLeads('', metaData.per_page, metaData.current_page, true).then(
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
            <TableCRMHeaderComponent name_resource="Lead" name_plural_resource="Leads" />
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
    </div>
  );
};
export default LeadsTableComponent;
