import { useEffect, useState } from 'react';
import { useLeads, useSidebarResponsive } from '../../hooks';
import { LeadHistorialResponse, LeadResponse, SuccessResponse } from '../../models/responses';
import { Lead, LeadLabel, LeadProject } from '../../models';
import { useParams } from 'react-router-dom';

//Redux
import { AppStore } from '../../redux/store';

import { LeadTabsComponent } from './components/lead-tabs.component';
import LeadAddNoteComponent from './components/lead-add-note.component';
import LeadDetailsComponent from './components/lead-details.component';
import LeadEtapasComponent from './components/lead-etapas.component';
import LeadHeaderComponent from './components/lead-header.component';
import LeadHistoriaComponent from './components/lead-historia.component';
import { SweetAlert } from '../../utilities';
import { useDispatch, useSelector } from 'react-redux';
import {
  setLeadFullData,
  setOnlyHistorialData,
  setStateViewHistorial,
} from '../../redux/states/lead.slice';

export const LeadPage = () => {
  useSidebarResponsive(true);
  const { uuid } = useParams();
  const [stateMenu, setStateMenu] = useState('Notas');
  const { getLead, getLeadHistorial, updateProjects, updateLabels } = useLeads();
  const dispatch = useDispatch();
  const { lead, stateViewHistorial } = useSelector((store: AppStore) => store.lead);

  const changeHistorialView = (view: string) => {
    const stateView = view === '' ? stateViewHistorial : view;
    dispatch(setStateViewHistorial(stateView));

    getLeadHistorial(uuid ?? '', stateView, false).then((response: LeadResponse) => {
      dispatch(
        setOnlyHistorialData({
          lead_historial: response.lead_historial,
          count_historial: response.count_historial,
        })
      );
    });
  };

  useEffect(() => {
    getLead(uuid ?? '', true).then((response: LeadResponse) => {
      dispatch(
        setLeadFullData({
          lead: response.lead,
          lead_historial: response.lead_historial,
          count_historial: response.count_historial,
          projects_available: response.projects_available,
          labels_available: response.labels_available,
        })
      );
    });
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
          <LeadHeaderComponent />
          <div className="lead-header__etapas mt-4 mb-2">
            <LeadEtapasComponent />
          </div>
        </div>
        <div className="lead-content">
          <LeadDetailsComponent />
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
                          <LeadAddNoteComponent changeHistorialView={changeHistorialView} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/*Historial*/}
                <LeadHistoriaComponent changeHistorialView={changeHistorialView} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadPage;
