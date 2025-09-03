import React, { useState } from 'react';
import { useSidebarResponsive } from '../../../hooks';
import TableCRMSkeleton from '../../../components/shared/TableCRMSkeleton';
import { Search, UserRoundSearch } from 'lucide-react';
import { Lead, LeadLabel } from '../../../models';
import PageBodyComponent from '../../../components/page/page-body.component';

interface Props {
  leads: Lead[];
  cargarDataLeads: (page: number, search?: string) => void;
  metaData: {
    current_page: number;
    total: number;
  };
  isTableLoading: boolean;
  filtroEtiqueta: string;
  setFiltroEtiqueta: (value: string) => void;
  onClickLead: (lead_uuid: string) => void;

}

export const LeadsDataComponent = (props: Props) => {
  useSidebarResponsive(true);

  const {
    leads,
    cargarDataLeads,
    metaData,
    isTableLoading,
    filtroEtiqueta,
    setFiltroEtiqueta,
    onClickLead,
  } = props;

  const [searchTerm, setSearchTerm] = useState(filtroEtiqueta);

  const onRefresh = () => {
    setSearchTerm('');
    setFiltroEtiqueta('');
    cargarDataLeads(1, '');
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFiltroEtiqueta(searchTerm);
    cargarDataLeads(1, searchTerm);
  };

  return (
    <div className="main-content app-content">
      <div className="container-fluid">
            <div className="card">
              <div className="card-header justify-content-between d-sm-flex d-block">
                <div className="card-title">Leads dados de Baja</div>
                <div className="header-actions">
                  <div className="d-flex align-items-center">
                    <form onSubmit={handleSearchSubmit} className="me-2">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Buscar por nombre/telefono..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                        />
                        <button className="btn btn-outline-primary" type="submit">
                          <UserRoundSearch />
                        </button>
                      </div>
                    </form>
                    {/* <button className="btn btn-light" onClick={onRefresh} disabled={isTableLoading}>
                      <UserRoundSearch className={isTableLoading ? 'fa-spin' : ''} />
                      <span className="ms-2">Actualizar</span>
                    </button> */}
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div>  </div>
                {isTableLoading ? (
                  <TableCRMSkeleton columnCount={5} />
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover table-bordered">
                      <thead className="table-primary">
                        <tr>
                          <th>Nombre</th>
                          <th>Teléfono</th>
                          <th>Estado</th>
                          <th>Etiqueta de Salida</th>
                          <th>Motivo de Baja</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.length > 0 ? (
                          leads.map((lead) => (
                            <tr
                              key={lead.id}
                              onClick={() => onClickLead(lead.uuid)}
                              style={{ cursor: 'pointer' }}
                            >
                              <td>{`${lead.names} ${lead.last_names}`}</td>
                              <td>{lead.cellphone}</td>
                              <td>
                                <span className="badge bg-danger-transparent">{lead.estado_final}</span>
                              </td>
                              <td>
                                {lead.lead_labels?.map((label: LeadLabel, index: number) => (
                                  <span key={label.id} style={{ color: label.color, fontWeight: 'bold' }}>
                                    {label.name}
                                    {index < (lead.lead_labels.length - 1) ? ', ' : ''}
                                  </span>
                                ))}
                              </td>
                              <td>{lead.reason || 'N/A'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center p-5">
                              No se encontraron leads dados de baja.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {/* Paginación si es necesaria */}
            </div>
          </div>
        </div>


  );
};

export default LeadsDataComponent;