// src/components/shared/ColorPicker.tsx

import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

// Props que el componente recibirá
interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

// Una paleta de colores predefinidos
const PRESET_COLORS = [
  // Rojos y Rosados
  '#EF4444', // Rojo
  '#F43F5E', // Rosa
  '#EC4899', // Fucsia

  // Naranjas y Amarillos
  '#F97316', // Naranja
  '#F59E0B', // Ámbar
  '#EAB308', // Amarillo

  // Verdes
  '#84CC16', // Lima
  '#22C55E', // Verde
  '#10B981', // Esmeralda

  // Azules y Turquesas
  '#14B8A6', // Turquesa
  '#06B6D4', // Cian
  '#0EA5E9', // Azul Cielo
  '#3B82F6', // Azul

  // Morados e Índigos
  '#6366F1', // Índigo
  '#8B5CF6', // Violeta
  '#A855F7', // Púrpura

  // Neutros y Oscuros
  '#64748B', // Gris Pizarra
  '#6B7280', // Gris
  '#1F2937', // Gris Oscuro
  '#78350F', // Marrón
];

export const ColorPicker = (props: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="input-select" style={{ position: 'relative', width: '100%' }} ref={pickerRef}>
      <div className="dropdown">
        <span
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: props.color,
            border: '1px solid #ddd',
            pointerEvents: 'none',
          }}
        ></span>
        <input
          value={props.color}
          onChange={(e) => props.onChange(e.target.value)}
          type="text"
          className="form-control form-control-sm form-select"
          style={{ paddingLeft: '30px' }}
          onFocus={() => setIsOpen(true)}
        />
        {isOpen && (
          <div className="dropdown-menu p-2 show" style={{ display: 'block' }}>
            <div className="d-flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  style={{
                    background: color,
                    border: 'none',
                    width: '30px',
                    height: '30px',
                    borderRadius: '0.375rem',
                  }}
                  onClick={() => {
                    props.onChange(color);
                    setIsOpen(false);
                  }}
                ></button>
              ))}
            </div>
            <hr />
            <p className="text-muted p-0 m-0 ps-2 pe-2" style={{ fontSize: '0.8rem' }}>
              Color personalizado
            </p>
            <div className="input-select" style={{ position: 'relative', width: '100%' }}>
              <div className="drop">
                <span
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: props.color,
                    border: '1px solid #ddd',
                    pointerEvents: 'none',
                  }}
                ></span>
                <input
                  value={props.color}
                  onChange={(e) => props.onChange(e.target.value)}
                  type="text"
                  className="form-control form-control-sm form-select"
                  style={{ paddingLeft: '30px' }}
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                />
                <div className="dropdown-menu p-2">
                  <HexColorPicker
                    color={props.color}
                    onClick={(e) => e.stopPropagation()}
                    onChange={props.onChange}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
