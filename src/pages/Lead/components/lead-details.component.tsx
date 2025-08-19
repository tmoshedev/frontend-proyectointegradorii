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

//Utilities
import { Bounce, toast } from 'react-toastify';
import { useLeads, useUsers } from '../../../hooks';
import EditarSelectSearchCrm from '../../../components/EditarSelectSearchCrm';

interface Props {
  onCrearNuevaEtiqueta: () => void;
}

export const LeadDetailsComponent = (props: Props) => {
  const dispatch = useDispatch();
  const { updateProjects, updateLabels } = useLeads();
  const { updateUserLabels } = useUsers();

  const { lead, projectsAvailable, labelsAvailable, channelsAvailable } = useSelector(
    (store: AppStore) => store.lead
  );
  const { user, userlabelsAvailable } = useSelector((store: AppStore) => store.user);

  const userlocal = localStorage.getItem('user');
  const userid = userlocal ? JSON.parse(userlocal).id : null;

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

  const onGuardarLabels = (items: any[]) => {
    updateLabels(lead.uuid, items, false)
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
        dispatch(updateLeadLabels(items));
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

  console.log(lead?.user_id, userid);

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
            disabled={!(userid && lead.user_id === userid)}
          />
          <FieldLeadComponent
            onUpdateRest={onUpdateLead}
            label={'Nombres'}
            value={lead.names}
            name="names"
            uuid={lead.uuid}
            disabled={!(userid && lead.user_id == userid)}
          />
          <FieldLeadComponent
            onUpdateRest={onUpdateLead}
            label={'Apellidos'}
            value={lead.last_names}
            name="last_names"
            uuid={lead.uuid}
            disabled={!(userid && lead.user_id == userid)}
          />
          {lead.user_id ? (
          (userid && lead.user_id == userid) ? (
            <FieldLeadComponent
              onUpdateRest={onUpdateLead}
              label={'Celular'}
              value={lead.cellphone}
              name="cellphone"
              uuid={lead.uuid}
              disabled={!(userid && lead.user_id == userid)}
            />
          ) : (
            <FieldLeadComponent
              onUpdateRest={onUpdateLead}
              label={'Celular'}
              value={'NO DISPONIBLE'}
              name="cellphone"
              uuid={lead.uuid}
              disabled={!(userid && lead.user_id == userid)}
            />
          )
        ) : (
          <FieldLeadComponent
            onUpdateRest={onUpdateLead}
            label={'Celular'}
            value={'SIN ASESOR ASIGNADO'}
            name="cellphone"
            uuid={lead.uuid}
            disabled={!(userid && lead.user_id == userid)}
          />
        )}
          <FieldLeadComponent
            onUpdateRest={onUpdateLead}
            label={'Correo'}
            value={lead.email}
            name="email"
            uuid={lead.uuid}
            disabled={!(userid && lead.user_id == userid)}
          />
          <FieldLeadComponent
            onUpdateRest={onUpdateLead}
            label={'Ciudad'}
            value={lead.ciudad}
            name="ciudad"
            uuid={lead.uuid}
            disabled={!(userid && lead.user_id == userid)}
          />
          <FieldLeadComponent
            onUpdateRest={onUpdateLead}
            label={'Precio'}
            value={lead.precio}
            name="precio"
            uuid={lead.uuid}
            disabled={!(userid && lead.user_id == userid)}
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
                  {lead.user_id ? (
                    (userid && lead.user_id == userid) ? (
                      <button onClick={onActivarEditProjects} className="btn btn-outline-cancel btn-xs" >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                    ) : (
                      <button className="btn btn-outline-cancel btn-xs" disabled>
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                    )
                  ) : null}
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
              <EditarSelectSearchCrm
                options={labelsAvailable}
                selected={selectedLabels}
                onChange={setSelectedLabels}
                placeholder="Seleccionar etiquetas"
                onCancel={onCancelLabels}
                onGuardar={onGuardarLabels}
                onCrearNuevaEtiqueta={props.onCrearNuevaEtiqueta}
              />
            ) : (
              <div className="fields-list__components">
                <div className="list-fields-items">
                  <ul className="fields-list__items">
                    {lead.lead_labels?.map((label: LeadLabel, index: number) => (
                      <li key={index} className="fields-list__item">
                        <div className="fields-list__item__block">
                          <span className="fields-list__item_content">
                            <i style={{ color: label.color }} className="fa-solid fa-tag"></i>{' '}
                            {label.name}
                          </span>
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
                {lead.user_id ? (
                    (userid && lead.user_id == userid) ? (
                <div className="list-fields-edit">
                  <button onClick={onActivarEditLabel} className="btn btn-outline-cancel btn-xs">
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </div>
                    ) : (
                <div className="list-fields-edit">
                  <button className="btn btn-outline-cancel btn-xs" disabled>
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </div>
                )
              ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="block-item">
        {/*
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
                  {lead.user_id ? (
                    (userid && lead.user_id == userid) ? (
                  <button
                    onClick={onActivarEditUserLabel}
                    className="btn btn-outline-cancel btn-xs"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                    ) : (
                      <button
                        onClick={onActivarEditUserLabel}
                        className="btn btn-outline-cancel btn-xs"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                  </button>

                )
                  ) : null}
               </div>

              </div>
            )}
          </div>
        </div>*/}
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
      {lead.user_id ? (
                    (userid && lead.user_id == userid) ? (

                      <button
                        onClick={onActivarEditChannel}
                        className="btn btn-outline-cancel btn-xs"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                    ) : (

 <button
                        onClick={onActivarEditChannel}
                        className="btn btn-outline-cancel btn-xs"
                      disabled>
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                  )): null}

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
