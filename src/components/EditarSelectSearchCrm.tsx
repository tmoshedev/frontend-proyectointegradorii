import React, { useEffect, useRef, useState } from 'react';
import '../scss/theme/_multiselect.scss';
import SelectSearchCrm from './shared/SelectSearchCrm';

interface Option {
  id: number | string;
  name: string;
  selected: boolean;
}

interface MultiSelectProps {
  options: Option[];
  selected: Option[];
  onChange: (newSelected: Option[]) => void;
  placeholder: string;
  onCancel: () => void;
  onGuardar: (selected: Option[]) => void;
  onCrearNuevaEtiqueta: () => void;
}

const EditarSelectSearchCrm = (props: MultiSelectProps) => {
  const [items, setItems] = useState<Option[]>(
    props.options.map((label) => ({
      ...label,
      selected: props.selected.some((sel) => sel.id === label.id),
    }))
  );
  const [openDropdown, setOpenDropdown] = useState(false);

  const onChangeItem = (items: any[]) => {
    setItems(items);
  };

  useEffect(() => {
    setItems(
      props.options.map((label) => ({
        ...label,
        selected: props.selected.some((sel) => sel.id === label.id),
      }))
    );
  }, [props.options, props.selected]);

  return (
    <div className="container-multi-select">
      <div
        className="dropdown"
        onClick={() => setOpenDropdown(true)}
        onBlur={() => setOpenDropdown(false)}
        tabIndex={0}
      >
        <div className="multi-select" data-bs-toggle="dropdown" aria-expanded={openDropdown}>
          <div className="multi-select__control">
            <div className="multi-select__tags">
              {items
                .filter((item) => item.selected)
                .map((item) => (
                  <span className="multi-select__tag" key={item.id}>
                    <button type="button" className="multi-select__tag-close">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                    {item.name}
                  </span>
                ))}
              {items.filter((item) => item.selected).length === 0 && (
                <span className="multi-select__placeholder">{props.placeholder}</span>
              )}
            </div>
            <span className="multi-select__arrow">▾</span>
          </div>
        </div>
        <SelectSearchCrm
          maxHeight="250px"
          minWidth="100%"
          items={items}
          icon={`fa-solid fa-tag`}
          open={openDropdown}
          onChange={onChangeItem}
          store={props.onCrearNuevaEtiqueta}
        />
      </div>

      <div className="multi-select__footer">
        <button onClick={props.onCancel} className="btn btn-xs btn-outline-cancel me-2">
          Cancelar
        </button>
        <button
          onClick={() => props.onGuardar(items.filter((item) => item.selected))}
          className="btn btn-xs btn-primary"
        >
          Guardar
        </button>
      </div>
    </div>
  );
};

export default EditarSelectSearchCrm;
