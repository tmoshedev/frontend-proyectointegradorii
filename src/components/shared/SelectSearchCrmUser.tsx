import '../../scss/theme/_select-search-crm.scss';
import { useEffect, useRef, useState } from 'react';

interface SelectSearchCrmUserProps {
  maxHeight: string;
  minWidth: string;
  items: any[];
  open: boolean;
  onChange: (newItems: any[]) => void;
}

export const SelectSearchCrmUser = (props: SelectSearchCrmUserProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  const userlocal = localStorage.getItem('user');
  const userid = userlocal ? JSON.parse(userlocal).id : null;

  const currentUser = props.items.find((item) => item.id === userid);
  const otherUsers = props.items.filter((item) => item.id !== userid);

  const toggleSelect = (id: any) => {
    const newItems = props.items.map((item) =>
      item.id === id ? { ...item, selected: !item.selected } : item
    );
    props.onChange(newItems);
  };

  const filteredItems = otherUsers.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
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
          {currentUser && (
            <li
              onClick={(e) => {
                e.stopPropagation();
                toggleSelect(currentUser.id);
              }}
              className={currentUser.selected ? 'selected' : ''}
              style={{ userSelect: 'none' }}
            >
              <div className="ssc-item-name">Mis Leads (YO)</div>
              <span
                className="ssc-item-checkbox"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(currentUser.id);
                }}
              >
                <input
                  readOnly
                  className="form-check-input"
                  type="checkbox"
                  checked={currentUser.selected}
                />
              </span>
            </li>
          )}
          {currentUser && filteredItems.length > 0 && <hr className="my-1" />}
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

export default SelectSearchCrmUser;
