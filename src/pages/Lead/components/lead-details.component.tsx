import { useEffect, useState } from 'react';
import MultiSelectDropdown from '../../../components/MultiSelectDropdown';
import { LeadLabel, LeadProject } from '../../../models';
import FieldLeadComponent from './field-lead.component';
import DOMPurify from 'dompurify';
// Redux
import { AppStore } from '../../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateLeadField,
  updateLeadLabels,
  updateLeadProjects,
} from '../../../redux/states/lead.slice';

//Utilities
import { Bounce, toast } from 'react-toastify';
import { useLeads } from '../../../hooks';

export const LeadDetailsComponent = () => {
  const dispatch = useDispatch();
  const { updateProjects, updateLabels } = useLeads();
  const { lead, projectsAvailable, labelsAvailable } = useSelector((store: AppStore) => store.lead);

  const [editProjects, setEditProjects] = useState(false);
  const [editLabels, setEditLabels] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<any[]>(lead.lead_projects || []);
  const [selectedLabels, setSelectedLabels] = useState<any[]>(lead.lead_labels || []);

  const onCancelProyectos = () => {
    setSelectedProjects(lead.lead_projects || []);
    setEditProjects(false);
  };

  const onGuardarProyectos = () => {
    updateProjects(lead.uuid, selectedProjects, false)
      .then((response) => {
        dispatch(updateLeadProjects(selectedProjects));
        setEditProjects(false);
        toast.success(response.message, {
          position: 'top-center',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Bounce,
        });
      })
      .catch((error) => {
        toast.error('Error al actualizar los proyectos interesados.', {
          position: 'top-center',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Bounce,
        });
      });
  };

  const onActivarEditProjects = () => {
    setEditProjects(true);
  };

  const onCancelLabels = () => {
    setSelectedLabels(lead.lead_labels || []);
    setEditLabels(false);
  };

  const onGuardarLabels = () => {
    updateLabels(lead.uuid, selectedLabels, false)
      .then((response) => {
        toast.success(response.message, {
          position: 'top-center',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Bounce,
        });
        dispatch(updateLeadLabels(selectedLabels));
        setEditLabels(false);
      })
      .catch((error) => {
        toast.error('Error al actualizar las etiquetas.', {
          position: 'top-center',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Bounce,
        });
      });
  };

  const onActivarEditLabel = () => {
    setEditLabels(true);
  };

  const onUpdateLead = (name: string, value: string) => {
    dispatch(updateLeadField({ name, value }));
  };

  useEffect(() => {
    setSelectedProjects(lead.lead_projects || []);
    setSelectedLabels(lead.lead_labels || []);
  }, [lead]);

  return (
    <div className="lead-content__sidebar scroll-personalizado">
      <div className="block-item">
        <div className="bock-item__title">
          <h4>Datos del cliente</h4>
        </div>
        <div className="bock-item__datos">
          <FieldLeadComponent
            onUpdateRest={onUpdateLead}
            label={'Nombres'}
            value={lead.names}
            name="names"
            uuid={lead.uuid}
          />
          <FieldLeadComponent
            onUpdateRest={onUpdateLead}
            label={'Apellidos'}
            value={lead.last_names}
            name="last_names"
            uuid={lead.uuid}
          />
          <FieldLeadComponent
            onUpdateRest={onUpdateLead}
            label={'Celular'}
            value={lead.cellphone}
            name="cellphone"
            uuid={lead.uuid}
          />
          <FieldLeadComponent
            onUpdateRest={onUpdateLead}
            label={'Correo'}
            value={lead.email}
            name="email"
            uuid={lead.uuid}
          />
          <FieldLeadComponent
            onUpdateRest={onUpdateLead}
            label={'Ciudad'}
            value={lead.ciudad}
            name="ciudad"
            uuid={lead.uuid}
          />
        </div>
      </div>
      <div className="block-item">
        <div className="bock-item__title">
          <h4>Proyectos interesados</h4>
        </div>

        <div className="bock-item__datos">
          <div className="fields-list-row">
            {editProjects ? (
              <MultiSelectDropdown
                options={projectsAvailable}
                selected={selectedProjects}
                onChange={setSelectedProjects}
                placeholder="Seleccionar proyectos"
                onCancel={onCancelProyectos}
                onGuardar={onGuardarProyectos}
              />
            ) : (
              <div className="fields-list__components">
                <div className="list-fields-items">
                  <ul className="fields-list__items">
                    {lead.lead_projects?.map((project: LeadProject, index: number) => (
                      <li key={index} className="fields-list__item">
                        <div className="fields-list__item__block">
                          <span className="fields-list__item_content">{project.name}</span>
                        </div>
                      </li>
                    ))}
                    {lead.lead_projects?.length === 0 && (
                      <li className="fields-list__item">
                        <div className="fields-list__item__block">
                          <span className="fields-list__item_content">
                            Sin proyectos interesados
                          </span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="list-fields-edit">
                  <button onClick={onActivarEditProjects} className="btn btn-outline-cancel btn-xs">
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="block-item">
        <div className="bock-item__title">
          <h4>Etiquetas</h4>
        </div>

        <div className="bock-item__datos">
          <div className="fields-list-row">
            {editLabels ? (
              <MultiSelectDropdown
                options={labelsAvailable}
                selected={selectedLabels}
                onChange={setSelectedLabels}
                placeholder="Seleccionar etiquetas"
                onCancel={onCancelLabels}
                onGuardar={onGuardarLabels}
              />
            ) : (
              <div className="fields-list__components">
                <div className="list-fields-items">
                  <ul className="fields-list__items">
                    {lead.lead_labels?.map((label: LeadLabel, index: number) => (
                      <li key={index} className="fields-list__item">
                        <div className="fields-list__item__block">
                          <span className="fields-list__item_content">{label.name}</span>
                        </div>
                      </li>
                    ))}
                    {lead.lead_labels?.length === 0 && (
                      <li className="fields-list__item">
                        <div className="fields-list__item__block">
                          <span className="fields-list__item_content">Sin etiquetas</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="list-fields-edit">
                  <button onClick={onActivarEditLabel} className="btn btn-outline-cancel btn-xs">
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="block-item">
        <div className="bock-item__title">
          <h4>Origen</h4>
        </div>
        <div className="bock-item__datos">
          <div className="fields-list-row">
            <div className="fields-list__label">Canal de origen:</div>
            <div className="fields-list__components">
              <div className="fields-list__value">
                <span
                  className="me-1"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(lead.channel_icon_html || ''),
                  }}
                />
                <span>{lead.channel_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsComponent;
