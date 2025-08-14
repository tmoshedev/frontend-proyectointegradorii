import '../../scss/theme/_select-search-crm.scss';
import { useEffect, useRef, useState } from 'react';

interface SelectSearchCrmCampaignProps {
  maxHeight: string;
  minWidth: string;
  items: any[];
  open: boolean;
  onChange: (newItems: any[]) => void;
}

export const SelectSearchCrmCampaign = (props: SelectSearchCrmCampaignProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  const toggleSelect = (codigo: string) => {
    const newItems = props.items.map((item) =>
      item.codigo === codigo ? { ...item, selected: !item.selected } : item
    );
    props.onChange(newItems);
  };

  const filteredItems = props.items.filter((item) =>
    item.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (props.open) {
      inputRef.current?.focus();
    }
  }, [props.open]);

  return (
    <div className="dropdown-menu select-search-crm" style={{ minWidth: props.minWidth }}>
      <div className="d-flex flex-column" style={{ maxHeight: props.maxHeight }}>
        
        {/* Barra de búsqueda */}
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
        
        {/* Lista de campañas */}
        <ul className="ssc-items scroll-personalizado">
          {filteredItems.map((item, index) => (
            <li
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                toggleSelect(item.codigo);
              }}
              className={item.selected ? 'selected' : ''}
              style={{ userSelect: 'none' }}
            >
              <div className="ssc-item-name">{item.codigo}-{item.nombre}</div>
              <span
                className="ssc-item-checkbox"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(item.codigo);
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

export default SelectSearchCrmCampaign;
