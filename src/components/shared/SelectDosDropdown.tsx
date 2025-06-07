import { CircleUser } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Option {
  id: string | number;
  name: string;
}

interface SelectDosDropdownProps {
  items: Option[];
  itemsSelected: Option[];
  setItemSelected: (usuarios: Option[]) => void;
  textNoResult: string;
  multipleSelect: boolean;
}
export const SelectDosDropdown = (props: SelectDosDropdownProps) => {
  const isSelected = (item: Option) => props.itemsSelected.some((s) => s.id === item.id);
  const [alls, setAlls] = useState<Boolean>(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isMultiple = !!props.multipleSelect;

  const filteredItems = props.items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const toggleOption = (item: Option) => {
    if (!isMultiple) {
      // Si no es múltiple, solo permite seleccionar uno
      if (isSelected(item)) {
        props.setItemSelected([]);
      } else {
        props.setItemSelected([item]);
      }
    } else {
      // Selección múltiple
      const updated = isSelected(item)
        ? props.itemsSelected.filter((s) => s.id !== item.id)
        : [...props.itemsSelected, item];
      props.setItemSelected(updated);
    }
  };

  const onSelectedAlls = () => {
    if (alls) {
      props.setItemSelected([]);
      setAlls(false);
    } else {
      props.setItemSelected(props.items);
      setAlls(true);
    }
  };

  useEffect(() => {
    if (
      props.items.length > 0 &&
      props.itemsSelected.length === props.items.length &&
      props.items.every((item) => props.itemsSelected.some((sel) => sel.id === item.id))
    ) {
      setAlls(true);
    } else {
      setAlls(false);
    }
  }, [props.itemsSelected, props.items]);

  return (
    <div className="select-dos-dropdown">
      <div className="select-dos-dropdown_search">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar..."
          type="text"
          className="form-control form-control-sm todo-mayuscula"
          ref={inputRef}
        />
      </div>
      <ul className="select-dos-dropdown_options">
        {filteredItems.length > 0 ? (
          <>
            {isMultiple && (
              <li
                onClick={onSelectedAlls}
                className={`select-dos-dropdown_option ${alls ? 'selected' : ''}`}
                style={{ borderBottom: '1px solid #e9ecef' }}
              >
                <span className="select-dos-dropdown_option_avatar"></span>
                <div className="select-dos-dropdown_option_name">
                  <p className="m-0 p-0">Seleccionar todos</p>
                </div>
                <span className="select-dos-dropdown_option_checkbox">
                  {alls ? <i className="fa-solid fa-check"></i> : ''}
                </span>
              </li>
            )}
            {filteredItems.map((item) => (
              <li
                onClick={() => toggleOption(item)}
                key={item.id}
                className={`select-dos-dropdown_option ${isSelected(item) ? 'selected' : ''}`}
              >
                <span className="select-dos-dropdown_option_avatar">
                  <img src="/images/user-default.png" />
                </span>
                <div className="select-dos-dropdown_option_name">
                  <p className="m-0 p-0">{item.name}</p>
                </div>
                <span className="select-dos-dropdown_option_checkbox">
                  {isSelected(item) ? <i className="fa-solid fa-check"></i> : ''}
                </span>
              </li>
            ))}
          </>
        ) : (
          <li className="select-dos-dropdown_option">
            <span className="select-dos-dropdown_option_avatar"></span>
            <div className="select-dos-dropdown_option_name">
              <p className="m-0 p-0">{props.textNoResult}</p>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
};

export default SelectDosDropdown;
