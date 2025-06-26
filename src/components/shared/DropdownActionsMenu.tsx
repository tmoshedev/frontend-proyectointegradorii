import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface DropdownActionsMenuProps {
  isOpen: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  buttonsAcctions: any[];
  row: any;
  onClickButtonPersonalizado: (row: any, id: string) => void;
}

const DropdownActionsMenu: React.FC<DropdownActionsMenuProps> = ({
  isOpen,
  anchorRect,
  onClose,
  buttonsAcctions = [],
  row,
  onClickButtonPersonalizado,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyles, setMenuStyles] = useState<CSSProperties>({});

  const onclick = (ow: any, id: string) => {
    onClickButtonPersonalizado(ow, id);
    onClose();
  };

  useEffect(() => {
    if (anchorRect) {
      const menuWidth = 180; // Ancho aproximado del menú
      // Alinea el menú a la derecha del botón de acción
      const left = anchorRect.right + window.scrollX - menuWidth;

      setMenuStyles({
        position: 'absolute',
        top: anchorRect.bottom + window.scrollY - 6,
        left: left,
        width: menuWidth,
        zIndex: 2000,
      });
    }
  }, [anchorRect]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handler);
    }

    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const viewBotton = (
    row: any,
    type: string,
    type_value: string,
    values: { [key: string]: boolean }[]
  ) => {
    switch (type) {
      case 'states':
        if (row[type_value] !== undefined && row[type_value] !== null) {
          // Busca el objeto en values cuyo key coincida con el valor de row[type_value]
          const valueObj = values.find((obj) => obj.hasOwnProperty(row[type_value]));
          if (valueObj) {
            return valueObj[row[type_value]];
          }
          return false; // Si no encuentra el valor, retorna false
        }
        return false;
      default:
        return true;
    }
  };

  return createPortal(
    <div ref={menuRef} className="dropdown-actions-table" style={menuStyles}>
      {buttonsAcctions.map(
        (action, index) =>
          viewBotton(row, action.type, action.type_value, action.values) && (
            <button onClick={() => onclick(row, action.id)} key={index} className="dropdown-item">
              {action.icon != '' && (
                <span
                  className={`${action.name_class} me-1`}
                  dangerouslySetInnerHTML={{ __html: action.icon }}
                />
              )}
              <span className={`${action.name_class}`}>{action.name}</span>
            </button>
          )
      )}
    </div>,
    document.body
  );
};

export default DropdownActionsMenu;
