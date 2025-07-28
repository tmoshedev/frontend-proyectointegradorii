import React from 'react';

interface Props {
  columnCount: number; // CAMBIO: Ahora recibe un número
  rows?: number;
}

export const TableCRMSkeleton = ({ columnCount, rows = 50 }: Props) => {
  // Si no tenemos columnas, no dibujamos nada para evitar errores.
  if (columnCount === 0) {
    return null;
  }

  // La lógica de las columnas ahora se basa en el número recibido
  const gridTemplateColumns = `repeat(${columnCount}, 200px) 60px`;

  return (
    <div className="table-crm-grid skeleton-shimmer" style={{ gridTemplateColumns }}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <React.Fragment key={rowIndex}>
          {/* Celdas de datos: creamos un número de celdas igual a columnCount */}
          {Array.from({ length: columnCount }).map((__, colIndex) => (
            <div className="table-cell" key={colIndex}>
              <div
                className="skeleton skeleton-text-sm"
                style={{ width: `${Math.random() * (80 - 50) + 50}%` }}
              ></div>
            </div>
          ))}

          {/* Celda de acción */}
          <div className="table-cell action-cell">
            <div
              className="skeleton skeleton-button"
              style={{ width: '24px', height: '24px' }}
            ></div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default TableCRMSkeleton;
