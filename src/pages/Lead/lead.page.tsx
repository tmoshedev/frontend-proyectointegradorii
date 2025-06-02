import { useEffect, useState } from 'react';
import { useLeads, useSidebarResponsive } from '../../hooks';
import { LeadHistorialResponse, LeadResponse } from '../../models/responses';
import { Lead } from '../../models';
import { useParams } from 'react-router-dom';

import { LeadTabsComponent } from './components/lead-tabs.component';
import LeadAddNoteComponent from './components/lead-add-note.component';
import LeadDetailsComponent from './components/lead-details.component';
import LeadEtapasComponent from './components/lead-etapas.component';
import LeadHeaderComponent from './components/lead-header.component';
import LeadHistoriaComponent from './components/lead-historia.component';

export const LeadPage = () => {
  useSidebarResponsive(true);
  const { uuid } = useParams();
  const { getLead, getLeadHistorial } = useLeads();
  const [lead, setLead] = useState<Lead>({} as Lead);
  const [lead_historial, setLeadHistorial] = useState<LeadHistorialResponse[]>([]);
  const [stateMenu, setStateMenu] = useState('Notas');
  const [count_historial, setCountHistorial] = useState({
    notes: 0,
    state_changes: 0,
  });
  const [stateViewHistorial, setStateViewHistorial] = useState('alls');

  const changeHistorialView = (view: string) => {
    const stateView = view == '' ? stateViewHistorial : view;
    setStateViewHistorial(stateView);
    getLeadHistorial(uuid ?? '', stateView, false).then((response: LeadResponse) => {
      setLeadHistorial(response.lead_historial);
      setCountHistorial(response.count_historial);
    });
  };

  useEffect(() => {
    const dataInicial = () => {
      getLead(uuid ?? '', true).then((response: LeadResponse) => {
        setLead(response.lead);
        setLeadHistorial(response.lead_historial);
        setCountHistorial(response.count_historial);
      });
    };

    dataInicial();
  }, []);

  return (
    <div
      className="main-content app-content main-content--page"
      style={{ paddingLeft: '0rem', paddingRight: '0rem', backgroundColor: '#F5F5F6' }}
    >
      <div
        className="container-fluid p-0"
        style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 3.4rem)' }}
      >
        <div className="lead-header">
          <LeadHeaderComponent lead={lead} />
          <div className="lead-header__etapas mt-4 mb-2">
            <LeadEtapasComponent lead={lead} />
          </div>
        </div>
        <div className="lead-content">
          <LeadDetailsComponent lead={lead} />
          <div className="lead-content__content scroll-personalizado">
            <div className="timeline-content">
              <div className="w-100">
                {/* Timeline Header */}
                <div className="timeline-content__header">
                  <div className="timeline-content__content">
                    <div className="timeline_tabs">
                      <LeadTabsComponent stateMenu={stateMenu} setStateMenu={setStateMenu} />
                      <div className="timeline_tabs__content">
                        {stateMenu == 'Notas' && (
                          <LeadAddNoteComponent
                            changeHistorialView={changeHistorialView}
                            lead={lead}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/*Historial*/}
                <LeadHistoriaComponent
                  stateViewHistorial={stateViewHistorial}
                  changeHistorialView={changeHistorialView}
                  lead_historial={lead_historial}
                  count_historial={count_historial}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadPage;
