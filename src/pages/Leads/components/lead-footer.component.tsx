import React, { useState } from 'react';
import { ReactSortable } from 'react-sortablejs';

export type DropAction = 'CONCLUIDO' | 'SALIDA' | 'GANADO' | 'mover';

interface LeadFooterProps {
  onDropAction: (leadId: number, action: DropAction) => void;
}
const actions: { id: DropAction; label: string; className: string }[] = [
  { id: 'CONCLUIDO', label: 'CONCLUIDOS', className: '' },
  { id: 'SALIDA', label: 'SALIDAS', className: 'lead-perdido-text' },
  { id: 'GANADO', label: 'GANADOS', className: 'lead-ganado-text' },
];

const LeadFooterComponent: React.FC<LeadFooterProps> = ({ onDropAction }) => {
  const [activeZone, setActiveZone] = useState<DropAction | null>(null);

  return (
    <div className="kanban-footer d-flex justify-content-around cards-footer">
      {actions.map(({ id, label, className }) => (
        <ReactSortable
          key={id}
          tag="div"
          className={`dropzone-footer ${className} ${activeZone === id ? 'active-drop' : ''}`}
          group={{ name: 'etapas', pull: false, put: true }}
          list={[]}
          setList={() => {}}
          sort={false}
          animation={150}
          ghostClass="ghost"
          chosenClass="sortable-chosen"
          // Cuando el ghost entra en esta zona
          onMove={() => setActiveZone(id)}
          // Cuando se remueve un elemento de esta zona
          onRemove={() => {
            if (activeZone === id) setActiveZone(null);
          }}
          // Al soltar dentro
          onAdd={(evt) => {
            const leadId = Number(evt.item.getAttribute('data-id'));
            // Remueve el elemento clonado
            evt.item.parentNode?.removeChild(evt.item);
            onDropAction(leadId, id);
            setActiveZone(null);
          }}
          // Al terminar el drag (por si se cancela)
          onEnd={() => setActiveZone(null)}
        >
          <div className="dropzone-content">{label}</div>
        </ReactSortable>
      ))}
    </div>
  );
};

export default LeadFooterComponent;
