import { useState } from 'react';
import { useSidebarResponsive } from '../../hooks';
import KanbanBoardComponent from './components/kanban-board.component';
import ImportarLeadComponent from './components/importar-lead.component';

export const LeadsPage = () => {
  useSidebarResponsive(true);
  const [stateView, setStateView] = useState<string>('KANBAN');

  const handleStateView = (view: string) => {
    setStateView(view);
  };

  return (
    <div
      className="main-content app-content main-content--page"
      style={{ paddingLeft: '0rem', paddingRight: '0rem' }}
    >
      <div className="container-fluid">
        {stateView == 'KANBAN' && <KanbanBoardComponent handleStateView={handleStateView} />}
        {stateView == 'IMPORTAR' && <ImportarLeadComponent handleStateView={handleStateView} />}
      </div>
    </div>
  );
};

export default LeadsPage;
