import { useEffect, useState } from 'react';
import MultiSelectDropdown from '../../../components/MultiSelectDropdown';
import { LeadLabel, LeadProject, UserLabel } from '../../../models';
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

import { updateUserLabels } from '../../../redux/states/user.slice';

//Utilities
import { Bounce, toast } from 'react-toastify';
import { useLeads, useUsers } from '../../../hooks';

export const LeadDetailsComponent = () => {
  const dispatch = useDispatch();
  const { updateProjects, updateLabels } = useLeads();
  const { updateUserLabels } = useUsers();

  const { lead, projectsAvailable, labelsAvailable, channelsAvailable } = useSelector(
    (store: AppStore) => store.lead
  );
  const { user, userlabelsAvailable } = useSelector((store: AppStore) => store.user);

  const [editProjects, setEditProjects] = useState(false);
  const [editLabels, setEditLabels] = useState(false);
  const [editChannels, setEditChannels] = useState(false);
  const [editUserLabels, setEditUserLabels] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<any[]>(lead.lead_projects || []);
  const [selectedLabels, setSelectedLabels] = useState<any[]>(lead.lead_labels || []);
  const [selectedUserLabels, setSelectedUserLabels] = useState<any[]>(user?.user_labels || []);
  const [selectedChannels, setSelectedChannels] = useState<any[]>(lead.channel || []);
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<number | ''>(lead.channel_id ?? '');
  const { requirements, updateChannels } = useLeads();

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

  const onCancelChannels = () => {
    setSelectedChannels(lead.channels || []);
    setEditChannels(false);
  };

  const onCancelUserLabels = () => {
    setSelectedUserLabels(user.user_labels || []);
    setEditUserLabels(false);
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

  const onGuardarCanal = () => {
    updateChannels(lead.uuid, String(selectedChannelId), false)
      .then((response) => {
        dispatch(updateLeadField({ name: 'channel_id', value: String(selectedChannelId) }));
        setEditChannels(false);
        toast.success(response.message, {
          position: 'top-center',
          autoClose: 4000,
          theme: 'light',
          transition: Bounce,
        });
      })
      .catch(() => {
        toast.error('Error al actualizar el canal de origen.', {
          position: 'top-center',
          autoClose: 4000,
          theme: 'light',
          transition: Bounce,
        });
      });
  };

  const onGuardarUserLabels = () => {
    updateUserLabels(user.username, selectedUserLabels, false)
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
        setEditUserLabels(false);
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

  const onActivarEditChannel = () => {
    setEditChannels(true);
  };

  const onActivarEditUserLabel = () => {
    setEditUserLabels(true);
  };

  const onUpdateLead = (name: string, value: string) => {
    dispatch(updateLeadField({ name, value }));
  };

  useEffect(() => {
    setSelectedProjects(lead.lead_projects || []);
    setSelectedLabels(lead.lead_labels || []);
  }, [lead]);

  useEffect(() => {
    setSelectedUserLabels(user?.user_labels || []);
  }, [user]);

  useEffect(() => {
    requirements(true).then((response: any) => {
      setChannels(response.channels);
    });
  }, []);

  return (
    <div className="lead-content__sidebar scroll-personalizado">
      <div className="block-item">
        <div className="bock-item__title">
          <h4>Datos del cliente</h4>
        </div>
        <div className="bock-item__datos">
          <FieldLeadComponent
            onUpdateRest={onUpdateLead}
            label={'Dni'}
            value={lead.document_number}
            name="document_number"
            uuid={lead.uuid}
          />
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
          <h4>Etiquetas propias</h4>
        </div>

        <div className="bock-item__datos">
          <div className="fields-list-row">
            {editUserLabels ? (
              <MultiSelectDropdown
                options={userlabelsAvailable}
                selected={selectedUserLabels}
                onChange={setSelectedUserLabels}
                placeholder="Selecciona tus etiquetas"
                onCancel={onCancelUserLabels}
                onGuardar={onGuardarUserLabels}
              />
            ) : (
              <div className="fields-list__components">
                <div className="list-fields-items">
                  <ul className="fields-list__items">
                    {user?.user_labels?.map((userlabel: UserLabel, index: number) => (
                      <li key={index} className="fields-list__item">
                        <div className="fields-list__item__block">
                          <span className="fields-list__item_content">{userlabel.name}</span>
                        </div>
                      </li>
                    ))}

                    {user?.user_labels?.length === 0 && (
                      <li className="fields-list__item">
                        <div className="fields-list__item__block">
                          <span className="fields-list__item_content">Sin etiquetas</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="list-fields-edit">
                  <button
                    onClick={onActivarEditUserLabel}
                    className="btn btn-outline-cancel btn-xs"
                  >
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
                {editChannels ? (
                  <div className="fields-list__components">
                    <select
                      name="channel_id"
                      id="channel_id"
                      className="form-select form-select-sm"
                      value={selectedChannelId}
                      onChange={(e) => setSelectedChannelId(Number(e.target.value))}
                    >
                      <option value="">Seleccionar canal</option>
                      {channels.map((channel: any) => (
                        <option key={channel.id} value={channel.id}>
                          {channel.name}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 d-flex justify-content-end gap-2">
                      <button
                        onClick={() => setEditChannels(false)}
                        className="btn btn-light btn-sm"
                      >
                        Cancelar
                      </button>
                      <button onClick={onGuardarCanal} className="btn btn-primary btn-sm">
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="fields-list__components">
                    <div className="fields-list__value">
                      <span
                        className="me-1"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(lead.channel_icon_html || ''),
                        }}
                      />
                      <span>{lead.channel_name !== '' ? lead.channel_name : 'SIN ASIGNAR'}</span>
                    </div>
                    <div className="list-fields-edit">
                      <button
                        onClick={onActivarEditChannel}
                        className="btn btn-outline-cancel btn-xs"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsComponent;
