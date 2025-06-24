import { Ellipsis } from 'lucide-react';
import { TableHeaderResponse } from '../../models/responses';
import React, { CSSProperties, use, useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import DropdownActionsMenu from '../shared/DropdownActionsMenu';

interface TableCRMProps {
  tableHeader: any[];
  tableData: any[];
  activateCheckBoot: boolean;
  metaData: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  cargarData: (page: number) => void;
  buttonsAcctions: any[];
  onClickButtonPersonalizado: (row: any, id: string) => void;
}
export const TableCRM = (props: TableCRMProps) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const metaDataRef = useRef(props.metaData);
  const [isLoading, setIsLoading] = useState(false);
  const typeToggleRef = useRef<HTMLButtonElement>(null);
  const [openActionRow, setOpenActionRow] = useState<number | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  //
  const visibleHeadersCount = props.tableHeader.filter(
    (header: TableHeaderResponse) => header.visible
  ).length;

  const gridTemplateColumns = props.activateCheckBoot
    ? `50px repeat(${visibleHeadersCount}, 200px) 60px`
    : `repeat(${visibleHeadersCount}, 200px) 60px`;

  const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>, rowIndex: number) => {
    if (openActionRow === rowIndex) {
      setOpenActionRow(null);
      setAnchorRect(null);
      return;
    }
    setOpenActionRow(rowIndex);
    setAnchorRect(event.currentTarget.getBoundingClientRect());
  };

  useEffect(() => {
    metaDataRef.current = props.metaData;
  }, [props.metaData]);

  useEffect(() => {
    const handleScroll = () => {
      const container = tableContainerRef.current;
      if (!container) return;

      if (
        container.scrollTop + container.clientHeight >= container.scrollHeight - 5 &&
        metaDataRef.current.current_page < metaDataRef.current.last_page &&
        !isLoading
      ) {
        setIsLoading(true);
        props.cargarData(metaDataRef.current.current_page + 1);
      }
    };

    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [props.cargarData, isLoading]);

  return (
    <div
      className="table-crm-grid scroll-personalizado"
      ref={tableContainerRef}
      style={
        {
          '--columns': visibleHeadersCount,
          gridTemplateColumns: gridTemplateColumns,
        } as React.CSSProperties
      }
    >
      {/* HEADER ROW */}
      {props.activateCheckBoot && (
        <div className="table-cell header-cell sticky-col-first checkbox-cell">
          <input type="checkbox" />
        </div>
      )}
      {props.tableHeader.map(
        (header: TableHeaderResponse, index: number) =>
          header.visible && (
            <div key={`header_${index}`} className="table-cell header-cell">
              <div className="header-cell-content">{header.name}</div>
            </div>
          )
      )}
      <div className="table-cell header-cell sticky-col-last action-cell">
        <span>Acción</span>
      </div>

      {/* DATA ROWS */}
      {props.tableData.map((row, rowIndex) => (
        <React.Fragment key={rowIndex}>
          {/* Checkbox cell */}
          {props.activateCheckBoot && (
            <div key={`check-${rowIndex}`} className="table-cell sticky-col-first checkbox-cell">
              <input type="checkbox" />
            </div>
          )}
          {/* Data cells from the row object */}
          {props.tableHeader.map(
            (header: TableHeaderResponse, index: number) =>
              header.visible && (
                <div className="table-cell" key={`${rowIndex}-${index}`}>
                  <div className="header-cell-content">
                    {header.type === 'HTML' && (
                      <span
                        className="me-1"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(row[header.type_value] || ''),
                        }}
                      />
                    )}
                    {header.type !== 'ARRAYS' && (
                      <span
                        className={
                          header.class && header.type === 'STATES' && (header.class as any).classes
                            ? (header.class as any).classes?.[row[(header.class as any).value]] ||
                              ''
                            : ''
                        }
                      >
                        {row[header.value] !== null &&
                        row[header.value] !== undefined &&
                        row[header.value] !== ''
                          ? row[header.value]
                          : '-'}
                      </span>
                    )}
                    {header.type === 'ARRAYS' &&
                      Array.isArray(row[header.type_value]) &&
                      row[header.type_value].map((item: any, itemIndex: number) => (
                        <span
                          key={`${rowIndex}-${index}-${itemIndex}`}
                          className={`badge bg-light text-dark${
                            itemIndex !== row[header.type_value].length - 1 ? ' me-1' : ''
                          }`}
                        >
                          {item.name}
                        </span>
                      ))}
                  </div>
                </div>
              )
          )}
          {/* Action cell */}
          <div key={`action-${rowIndex}`} className="table-cell sticky-col-last action-cell">
            <button
              ref={typeToggleRef}
              className="action-button text-primary"
              onClick={(e) => handleActionClick(e, rowIndex)}
            >
              <Ellipsis height={15} />
            </button>
            <DropdownActionsMenu
              isOpen={openActionRow === rowIndex}
              anchorRect={anchorRect}
              onClose={() => setOpenActionRow(null)}
              buttonsAcctions={props.buttonsAcctions}
              row={row}
              onClickButtonPersonalizado={props.onClickButtonPersonalizado}
            />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default TableCRM;
