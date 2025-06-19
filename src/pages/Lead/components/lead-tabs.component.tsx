//Importar iconos
import { NotebookPen } from 'lucide-react';
import { CalendarDays } from 'lucide-react';
import { PhoneOutgoing } from 'lucide-react';
import { Paperclip } from 'lucide-react';

const menus = [
  { name: 'Notas', icon: <NotebookPen size={18} /> },
  { name: 'Actividad', icon: <CalendarDays size={18} /> },
  /* { name: 'Llamada', icon: <PhoneOutgoing size={18} /> },
  { name: 'Archivos', icon: <Paperclip size={18} /> }, */
];

interface Props {
  stateMenu: string;
  setStateMenu: (menu: string) => void;
}

export const LeadTabsComponent = (props: Props) => {
  return (
    <div className="timeline_tabs__tabs">
      <div className="tabs-app-lead">
        <div className="tabs-app-wrapper">
          {menus.map((menu) => (
            <div
              key={menu.name}
              className={`tabs-app_item ${
                props.stateMenu === menu.name ? 'tabs-app_item--active' : ''
              }`}
              onClick={() => props.setStateMenu(menu.name)}
            >
              {menu.icon}
              <span className="ms-1">{menu.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadTabsComponent;
