import { useSelector } from 'react-redux';
import { AppStore } from '../../../redux/store';
import { iconsActividades } from '../../../utilities/iconsActividades.utilily';

interface ActividadesListProps {
  tipoActividad: string;
  setTipoActividad: (tipo: string) => void;
}

export const ActividadesListComponent = (props: ActividadesListProps) => {
  const { activities } = useSelector((store: AppStore) => store.lead);

  return (
    <div className="lead-actividad-form-group">
      <div className="btn-group btn-group-sm btn-group-actividades">
        {activities.map((item: any, index: number) => (
          <button
            onClick={() => props.setTipoActividad(item.name)}
            data-tooltip-id="tooltip-component"
            data-tooltip-content={item.name}
            key={index}
            type="button"
            className={
              `btn btn-outline-primary` + (props.tipoActividad === item.name ? ' active' : '')
            }
          >
            {iconsActividades(18)[item.name]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActividadesListComponent;
