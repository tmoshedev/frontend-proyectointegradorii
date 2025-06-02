import { useState } from 'react';
import MultiSelectDropdown from '../../../components/MultiSelectDropdown';
import { Lead } from '../../../models';

interface Props {
  lead: Lead;
}

const categorias = [
  'PROYECTO ABC',
  'PROYECTO XYZ',
  'PROYECTO 123',
  'PROYECTO DEF',
  'PROYECTO GHI',
  'PROYECTO JKL',
];

export const LeadDetailsComponent = (props: Props) => {
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  return (
    <div className="lead-content__sidebar scroll-personalizado">
      <div className="block-item">
        <div className="bock-item__title">
          <h4>Datos del cliente</h4>
        </div>
        <div className="bock-item__datos">
          <div className="fields-list-row">
            <div className="fields-list__label">Nombres:</div>
            <div className="fields-list__components">
              <div className="fields-list__value">{props.lead.names}</div>
            </div>
          </div>
          <div className="fields-list-row">
            <div className="fields-list__label">Apellidos:</div>
            <div className="fields-list__components">
              <div className="fields-list__value">{props.lead.last_names}</div>
            </div>
          </div>
          <div className="fields-list-row">
            <div className="fields-list__label">Celular:</div>
            <div className="fields-list__components">
              <div className="fields-list__value">{props.lead.cellphone}</div>
            </div>
          </div>
          <div className="fields-list-row">
            <div className="fields-list__label">Correo:</div>
            <div className="fields-list__components">
              <div className="fields-list__value">{props.lead.email}</div>
            </div>
          </div>
          <div className="fields-list-row">
            <div className="fields-list__label">Ciudad:</div>
            <div className="fields-list__components">
              <div className="fields-list__value">{props.lead.ciudad}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="block-item">
        <div className="bock-item__title">
          <h4>Proyectos interesados</h4>
        </div>

        <div className="bock-item__datos">
          <div className="fields-list-row">
            {/* <MultiSelectDropdown
        options={categorias}
        selected={seleccionados}
        onChange={setSeleccionados}
        placeholder="Selecciona categorías"
      /> */}
            <div className="fields-list__components">
              <div className="list-fields-items">
                <ul className="fields-list__items">
                  {props.lead.lead_projects?.map((project, index) => (
                    <li key={index} className="fields-list__item">
                      <div className="fields-list__item__block">
                        <span className="fields-list__item_content">{project.names}</span>
                      </div>
                    </li>
                  ))}
                  {props.lead.lead_projects?.length === 0 && (
                    <li className="fields-list__item">
                      <div className="fields-list__item__block">
                        <span className="fields-list__item_content">Sin proyectos interesados</span>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="block-item">
        <div className="bock-item__title">
          <h4>Etiquetas</h4>
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
              <div className="fields-list__value">{props.lead.channel_name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsComponent;
