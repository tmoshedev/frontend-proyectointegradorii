/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import ReportChart from '../../../components/ReportChart';
import { fetchUserConnectionReport } from '../../../services/reports.service';
import { ReportsUserConnectionItem } from '../../../models';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

interface ReporteConexionesProps {
  show: boolean;
  handleClose: () => void;
  user: any;
}

export const ReporteConexiones = ({ show, handleClose, user }: ReporteConexionesProps) => {
  const [data, setData] = useState<ReportsUserConnectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    date_from: dayjs().format('YYYY-MM-DD'),
    date_to: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  });

  useEffect(() => {
    if (show) {
      fetchData();
    }
  }, [show, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetchUserConnectionReport({
        user_uuid: user.user_uuid,
        date_from: filters.date_from,
        date_to: filters.date_to,
      });
      setData((response as any).data || []);
    } catch (error) {
      console.error('Error fetching connection report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const processedSessions = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    return data
      .map(session => {
        const start = dayjs(session.session_start);
        const day = start.format('YYYY-MM-DD');
        let end;
        let isActive = false;

        if (session.session_end) {
          end = dayjs(session.session_end);
        } else {
          if (day === today) {
            end = dayjs();
            isActive = true;
          } else {
            return null;
          }
        }
        const durationMinutes = end.diff(start, 'minute');
        return { ...session, start, end, durationMinutes, isActive };
      })
      .filter((session): session is NonNullable<typeof session> => session !== null)
      .sort((a, b) => b.start.diff(a.start));
  }, [data]);

  const processChartData = () => {
    const connectionByDay: { [key: string]: { duration: number; count: number } } = {};

    processedSessions.forEach(session => {
      const day = session.start.format('YYYY-MM-DD');
      if (connectionByDay[day]) {
        connectionByDay[day].duration += session.durationMinutes;
        connectionByDay[day].count += 1;
      } else {
        connectionByDay[day] = { duration: session.durationMinutes, count: 1 };
      }
    });

    const labels = Object.keys(connectionByDay).sort();
    const durationData = labels.map(label => connectionByDay[label].duration / 60);
    const countData = labels.map(label => connectionByDay[label].count);

    return {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Horas conectado',
          data: durationData,
          yAxisID: 'y-axis-hours',
        },
        {
          type: 'line',
          label: 'Nro de conexiones',
          data: countData,
          yAxisID: 'y-axis-count',
        },
      ],
    };
  };

  const formatDataLabel = (value: number, context: any) => {
    if (context.dataset.label.includes('Horas')) {
      if (value > 0) {
        const hours = Math.floor(value);
        const minutes = Math.round((value - hours) * 60);
        if (hours > 0 && minutes > 0) {
          return `${hours}h ${minutes}m`;
        } else if (hours > 0) {
          return `${hours}h`;
        } else {
          return `${minutes}m`;
        }
      }
      return '';
    }
    return value.toString();
  };

  const formatTooltip = (context: any) => {
    const value = context.dataset.data[context.dataIndex];
    if (context.dataset.label.includes('Horas')) {
      const hours = Math.floor(value);
      const minutes = Math.round((value - hours) * 60);
      return `Tiempo: ${hours} h ${minutes} min`;
    }
    return `Conexiones: ${value}`;
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Reporte de Conexión - {user?.names_all}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row mb-4">
          <div className="col-md-4">
            <label htmlFor="date_from" className="form-label">Desde</label>
            <input
              type="date"
              id="date_from"
              name="date_from"
              className="form-control"
              value={filters.date_from}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="date_to" className="form-label">Hasta</label>
            <input
              type="date"
              id="date_to"
              name="date_to"
              className="form-control"
              value={filters.date_to}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            <ReportChart
              type="bar"
              data={processChartData()}
              title="Tiempo de conexión por día"
              showDataLabels
              dataLabelFormatter={formatDataLabel}
              options={{
                scales: {
                  'y-axis-hours': {
                    type: 'linear',
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Horas Conectado',
                    },
                  },
                  'y-axis-count': {
                    type: 'linear',
                    position: 'right',
                    title: {
                      display: true,
                      text: 'Nro de Conexiones',
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                },
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                  datalabels: {
                    offset: 8,
                  },
                  tooltip: {
                    callbacks: {
                      label: formatTooltip,
                    },
                  },
                },
              }}
            />
            <h4 className="mt-5">Detalle de Sesiones</h4>
            <div className="table-responsive">
              <table className="table table-bordered table-striped mt-3">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Inicio de Sesión</th>
                    <th>Fin de Sesión</th>
                    <th>Duración</th>
                  </tr>
                </thead>
                <tbody>
                  {processedSessions.map((session, index) => {
                    const hours = Math.floor(session.durationMinutes / 60);
                    const minutes = session.durationMinutes % 60;
                    const durationFormatted = `${hours}h ${minutes}m`;

                    return (
                      <tr key={(session as any).id_user_connection_log}>
                        <td>{processedSessions.length - index}</td>
                        <td>{session.start.format('DD/MM/YYYY HH:mm:ss')}</td>
                        <td>{session.isActive ? <span className="badge bg-success" style={{ fontSize: '0.9em', padding: '0.5em 0.75em' }}>Activa</span> : session.end.format('DD/MM/YYYY HH:mm:ss')}</td>
                        <td>{durationFormatted}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};
