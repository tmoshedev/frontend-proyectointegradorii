import { useEffect, useState } from 'react';
import { useLeads, useSidebarResponsive } from '../../hooks';
import { LeadResponse } from '../../models/responses';
import { useParams } from 'react-router-dom';

//Redux
import { AppStore } from '../../redux/store';

import { LeadTabsComponent } from './components/lead-tabs.component';
import LeadAddNoteComponent from './components/lead-add-note.component';
import LeadDetailsComponent from './components/lead-details.component';
import LeadEtapasComponent from './components/lead-etapas.component';
import LeadHeaderComponent from './components/lead-header.component';
import LeadHistoriaComponent from './components/lead-historia.component';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearLeadState,
  setLeadFullData,
  setOnlyHistorialData,
  setStateViewHistorial,
} from '../../redux/states/lead.slice';
import LeadActividadComponent from './components/lead-actividad.component';
import ModalComponent from '../../components/shared/modal.component';
import CancelarActividadComponent from './actividades-componentes/cancelar-actividad.component';
import AddEtiquetasComponent from './components/add-etiquetas.component';

interface DataModalState {
  type: string;
  buttonSubmit: string | null;
  row: any | null;
  title: string | null;
  requirements: any;
  onCloseModalForm: any;
}

export const LeadPage = () => {
  useSidebarResponsive(true);
  const { uuid } = useParams();
  const [stateMenu, setStateMenu] = useState('Notas');
  const { getLead, getLeadHistorial } = useLeads();
  const dispatch = useDispatch();
  const { lead, stateViewHistorial } = useSelector((store: AppStore) => store.lead);
  //CANCELAR ACTIVIDAD
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
  //MODAL AGREGAR ETIQUETAS
  const [isOpenModalEtiquetas, setIsOpenModalEtiquetas] = useState(false);
  const [isStateModalEtiquetas, setIsStateModalEtiquetas] = useState(false);
  const [dataModalEtiquetasResourceState, setDataModalEtiquetasResourceState] =
    useState<DataModalState>({
      type: '',
      buttonSubmit: null,
      row: null,
      title: null,
      requirements: [],
      onCloseModalForm: () => {},
    });
  const { user } = useSelector((store: AppStore) => store.user);

  const userlocal = localStorage.getItem('user');
  const userid = userlocal ? JSON.parse(userlocal).id : null;

  const rolActual = localStorage.getItem('rolActual') || '';


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

  const onCloseModalForm = () => {
    setIsStateModal(false);
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
  };

  const handleModalCancelarActividadForm = (uuid: string) => {
    setDataModalResourceState({
      type: 'cancelar-actividad',
      buttonSubmit: 'Guardar',
      row: {
        lead_activity_uuid: uuid,
      },
      title: 'Cancelar Actividad',
      requirements: [],
      onCloseModalForm: onCloseModalForm,
    });
    setIsOpenModal(true);
    setIsStateModal(true);
  };

  const handleCloseModalEtiquetas = () => {
    setIsOpenModalEtiquetas(false);
  };
  const handleModalEtiquetasForm = () => {
    setIsStateModalEtiquetas(false);
  };

  const onCrearNuevaEtiqueta = () => {
    setDataModalEtiquetasResourceState({
      type: 'crear-etiqueta',
      buttonSubmit: 'Guardar',
      row: null,
      title: 'Crear nueva etiqueta',
      requirements: [],
      onCloseModalForm: handleModalEtiquetasForm,
    });
    setIsOpenModalEtiquetas(true);
    setIsStateModalEtiquetas(true);
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
          users: response.users,
          activities: response.activities,
        })
      );
    });

    // Limpia el estado al desmontar
    return () => {
      dispatch(clearLeadState());
    };
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
          <LeadDetailsComponent onCrearNuevaEtiqueta={onCrearNuevaEtiqueta} />
          <div className="lead-content__content scroll-personalizado">
            <div className="timeline-content">
              <div className="w-100">
                {/* Timeline Header */}
                {lead.estado_final == null && (
                  <div className="timeline-content__header">
                    <div className="timeline-content__content">
                      <div className="timeline_tabs">
                        <LeadTabsComponent stateMenu={stateMenu} setStateMenu={setStateMenu} />
                        <div className="timeline_tabs__content">
                          {stateMenu == 'Notas' &&
                          (rolActual === 'ADMINISTRATOR' || (userid && lead.user_id == userid)) ? (
                            <LeadAddNoteComponent changeHistorialView={changeHistorialView} />
                          ) : (
                            <div className="content-tabs-app">
                              <div>Solo el asesor asignado o un administrador puede gestionar notas.</div>
                            </div>
                          )}
                          {stateMenu == 'Actividad' &&
                          (rolActual === 'ADMINISTRATOR' || (userid && lead.user_id == userid)) ? (
                            <LeadActividadComponent
                              changeHistorialView={changeHistorialView}
                              setStateMenu={setStateMenu}
                            />
                          ) : (
                            <div className="content-tabs-app">
                              <div>Solo el asesor asignado o un administrador puede gestionar actividades.</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/*Historial*/}
                <LeadHistoriaComponent
                  changeHistorialView={changeHistorialView}
                  handleModalCancelarActividad={handleModalCancelarActividadForm}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* MODAL CANCELAR ACTIVIDAD*/}
      {isOpenModal && (
        <ModalComponent
          stateModal={isStateModal}
          typeModal={'static'}
          onClose={handleCloseModal}
          title={dataModalResourceState.title || ''}
          size="modal-md"
          content={
            <CancelarActividadComponent
              data={dataModalResourceState}
              changeHistorialView={changeHistorialView}
            />
          }
        />
      )}
      {/* MODAL ETIQUETAS */}
      {isOpenModalEtiquetas && (
        <ModalComponent
          vHactive={true}
          stateModal={isStateModalEtiquetas}
          typeModal={'static'}
          onClose={handleCloseModalEtiquetas}
          title={dataModalEtiquetasResourceState.title || ''}
          size="modal-md"
          content={<AddEtiquetasComponent data={dataModalEtiquetasResourceState} />}
        />
      )}
    </div>
  );
};

export default LeadPage;
