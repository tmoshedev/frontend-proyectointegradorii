import { Plus } from 'lucide-react';
import '../../scss/theme/_select-search-crm.scss';
import { useEffect, useRef, useState } from 'react';

interface SelectSearchCrmProps {
  maxHeight: string;
  minWidth: string;
  items: any[];
  icon: string;
  open: boolean;
  onChange: (newItems: any[]) => void;
  store: () => void;
}
export const SelectSearchCrm = (props: SelectSearchCrmProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  const toggleSelect = (id: any) => {
    const newItems = props.items.map((item) =>
      item.id == id ? { ...item, selected: !item.selected } : item
    );
    props.onChange(newItems);
  };

  const filteredItems = props.items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (props.open) {
      inputRef.current?.focus();
    }
  }, [props.open]);

  return (
    <div className="dropdown-menu select-search-crm" style={{ minWidth: props.minWidth }}>
      <div className="d-flex flex-column" style={{ maxHeight: props.maxHeight }}>
        <div className="ssc-search">
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar..."
            className="form-control form-control-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="scc-add-item" onClick={props.store}>
          <Plus height={15} /> Crear nueva etiqueta
        </div>
        <ul className="ssc-items scroll-personalizado">
          {filteredItems.map((item, index) => (
            <li
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                toggleSelect(item.id);
              }}
              className={item.selected ? 'selected' : ''}
              style={{ userSelect: 'none' }}
            >
              <span className="ssc-item-icon" style={{ color: item.color }}>
                <i className={props.icon}></i>
              </span>
              <div className="ssc-item-name">{item.name}</div>
              <span
                className="ssc-item-checkbox"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(item.id);
                }}
              >
                <input
                  readOnly
                  className="form-check-input"
                  type="checkbox"
                  checked={item.selected}
                />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SelectSearchCrm;
