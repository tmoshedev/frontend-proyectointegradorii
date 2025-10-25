import {
  RefreshCw,
  BarChart2,
  PieChart,
  Funnel,
  LineChart,
  Share2
} from 'lucide-react';
import React from 'react';

interface ReportHeaderProps {
  onRefresh: () => void;
  onSelectReport: (type: string) => void;
  selectedReport: string;
  users: any[];
  selectedUser: string;
  onSelectUser: (id: string) => void;
  title?: string;
  filtersSlot?: React.ReactNode;
  showUserSelect?: boolean;
  actionsSlot?: React.ReactNode;
}

const reportTypes = [
  { type: 'funnel', label: 'Embudo', icon: <Funnel size={20} /> },
  { type: 'bar', label: 'Barras', icon: <BarChart2 size={20} /> },
  { type: 'pie', label: 'Torta', icon: <PieChart size={20} /> },
  { type: 'line', label: 'Líneas', icon: <LineChart size={20} /> },
];

export default function ReportHeader({
  onRefresh,
  onSelectReport,
  selectedReport,
  users,
  selectedUser,
  onSelectUser,
  filtersSlot,
  showUserSelect = true,
  actionsSlot,
}: ReportHeaderProps) {
  return (
    <div className="d-flex flex-column gap-3 mb-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between" style={{ gap: 16 }}>
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={onRefresh}
            data-tooltip-id="tooltip-component"
            data-tooltip-content={'Actualizar'}
            type="button"
            className="btn btn-outline-primary btn-xs ms-2"
          >
            <RefreshCw height={20} />
          </button>
        </div>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="d-flex align-items-center gap-1">
            {reportTypes.map(rt => (
              <button
                key={rt.type}
                className={`btn btn-xs ${selectedReport === rt.type ? 'btn-primary' : 'btn-outline-primary'}`}
                style={{ borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => onSelectReport(rt.type)}
              >
                {rt.icon} {rt.label}
              </button>
            ))}
          </div>
          {showUserSelect && (
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontWeight: 500 }}>Asesor:</span>
              <select
                value={selectedUser}
                onChange={e => onSelectUser(e.target.value)}
                className="form-select form-select-sm"
                style={{ minWidth: 160 }}
              >
                <option value="">Todos</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.names}</option>
                ))}
              </select>
            </div>
          )}
          {actionsSlot}
        </div>
      </div>
      {filtersSlot}
    </div>
  );
}
