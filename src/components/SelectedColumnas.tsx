import { useEffect, useRef, useState } from 'react';
import { TableHeaderResponse } from '../models/responses';

interface Props {
  tableHeader: TableHeaderResponse[];
  onChange: (updatedHeader: TableHeaderResponse[]) => void;
  onCancel: () => void;
  onGuardar: () => void;
  autoFocus?: boolean;
}

export const SelectedColumnas = (props: Props) => {
  const [tableHeaderLocal, setTableHeaderLocal] = useState<TableHeaderResponse[]>(
    props.tableHeader
  );
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const toggleOption = (item: TableHeaderResponse) => {
    //Aqui debemos buscar el item en el array y cambiar su propiedad visible
    const updatedHeader = tableHeaderLocal.map((header) => {
      if (header.name === item.name) {
        return { ...header, visible: !header.visible };
      }
      return header;
    });
    setTableHeaderLocal(updatedHeader);
  };

  const onCancelar = () => {
    setTableHeaderLocal(props.tableHeader);
    props.onCancel();
  };

  const onGuardar = () => {
    props.onChange(tableHeaderLocal);
    props.onGuardar();
  };

  const filteredHeaders = tableHeaderLocal.filter((header) =>
    header.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setTableHeaderLocal(props.tableHeader);
  }, [props.tableHeader]);

  useEffect(() => {
    if (props.autoFocus) {
      inputRef.current?.focus();
    }
  }, [props.autoFocus]);

  return (
    <div className="dropdown-menu columnas-dropdown" onClick={handleClick}>
      <div className="d-flex flex-column" style={{ maxHeight: '250px' }}>
        <div className="multi-select__search-wrapper">
          <input
            className="form-control form-control-sm multi-select__search"
            placeholder="Buscar..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            ref={inputRef}
          />
        </div>
        <ul className="multi-select__options drop-up scroll-personalizado">
          {filteredHeaders.map((header, index) => (
            <li
              className={`multi-select__option ${header.visible ? 'selected' : ''}`}
              onClick={() => toggleOption(header)}
              key={index}
            >
              <span className="multi-select__label">{header.name}</span>
              <span className="multi-select__checkbox">
                {header.visible ? <i className="fa-solid fa-check"></i> : ''}
              </span>
            </li>
          ))}
        </ul>
        <div className="columnas-dropdown-footer">
          <button onClick={onCancelar} className="btn btn-xs btn-outline-cancel me-2">
            Cancelar
          </button>
          <button onClick={onGuardar} className="btn btn-xs btn-primary">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectedColumnas;
