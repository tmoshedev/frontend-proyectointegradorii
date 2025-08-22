/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tooltip } from 'react-tooltip';
import CanCheck from '../../resources/can';
import { useSelector } from 'react-redux';
import { AppStore } from '../../redux/store';
import { Pagination } from '../../utilities';

interface Props {
  state: any;
  tableCss?: string;
  onClickButtonPersonalizado: (row: any, name: string) => void;
  onChangeEdit: (row: any) => void;
  onChangeDelete: (row: any) => void;
  onChangePage: (page: any, type: any) => void;
}

export const PageBodyComponent = (props: Props) => {
  const dataTableState = useSelector((store: AppStore) => store.dataTable);

  const mtd_showHeader = (col: any) => {
    const type = col.type ?? '';
    switch (type) {
      case 'roles':
        return CanCheck(col.roles);
      case 'text': {
        const keyCurrent = col.playBody.value;
        return col.playBody.values[keyCurrent];
      }
      default:
        return true;
    }
  };

  const mtd_showTd = (row: any, col: any) => {
  if (col.play) {
    let html = null;
    switch (col.play.type) {
      case 'states':
        html = (
          <span className={`${col.play.values[row[col.name]]} me-1 badge bg-secondary`}>
            {col.play.names[row[col.name]]}
          </span>
        );
        break;

      case 'color':
        html = (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                backgroundColor: row[col.name],
                width: '30px',
                height: '15px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            ></div>
            <span>{row[col.name]}</span> {/* si quieres mostrar el código HEX */}
          </div>
        );
        break;

      default:
        break;
    }
    return html;
  } else {
    const verificaArray = row[col.name] instanceof Array;
    if (verificaArray) {
      return row[col.name].map((item: any, index: number) => (
        <span key={index} className="badge bg-light text-dark me-1">
          {item}
        </span>
      ));
    } else {
      const data = row[col.name];
      return data == '' || data == null ? '---' : data;
    }
  }
};

  const mtd_showButton = (row: any, play: any) => {
    if (play) {
      switch (play.type) {
        case 'states':
          return play.values[row[play.name]];
        default:
          return true;
      }
    } else {
      return true;
    }
  };

  const mtd_showDropdown = (row: any, item: any) => {
    switch (item.mode) {
      case 'states':
        return item.values[row[item.key]];
      default:
        return true;
    }
  };

  return (
    <>
      <Tooltip id="tooltip-page-body" />
      <div className="table-responsive">
        <table className={'table text-nowrap table-bordered ' + props.tableCss}>
          <thead className="table-primary">
            <tr>
              {props.state.table.body.cols.map(
                (item: any, index: number) =>
                  mtd_showHeader(item) && (
                    <th style={{ width: item.width ?? '' }} scope="col" role="button" key={index}>
                      {item.alias}
                    </th>
                  )
              )}
              <th
                style={{
                  width: props.state.table.body.widthAccion ?? '',
                }}
                role="button"
              >
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="font-size-11">
            {dataTableState.data.length == 0 && (
              <tr>
                <td colSpan={props.state.table.body.cols.length + 1}>
                  <div className="text-center">No hay registros para esta consulta</div>
                </td>
              </tr>
            )}
            {dataTableState.data.map((row: any, index: number) => (
              <tr key={'row_' + index}>
                {props.state.table.body.cols.map(
                  (col: any, index: number) =>
                    mtd_showHeader(col) && <td key={'col_' + index}>{mtd_showTd(row, col)}</td>
                )}
                <td className="text-center">
                  {props.state.table.body.buttons &&
                    props.state.table.body.buttons.map(
                      (button: any, index: number) =>
                        button.play &&
                        mtd_showButton(row, button.play) &&
                        (button.play.type == 'dropdowns' ? (
                          <div className="dropdown d-inline" key={'button_drpdown_' + index}>
                            <button
                              data-tooltip-id="tooltip-page-body"
                              data-tooltip-content={button.tooltip}
                              className={`dropdown-toggle btn btn-xs ${button.css}`}
                              type="button"
                              id="dropdownMenuButton1"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              <i className={button.icon}></i>
                              {button.text ?? ''}
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                              {button.play.items.map(
                                (item: any, index: number) =>
                                  mtd_showDropdown(row, item) && (
                                    <li key={'button_drpdown_item_' + index}>
                                      <a
                                        role="button"
                                        className="dropdown-item"
                                        onClick={() =>
                                          props.onClickButtonPersonalizado(row, item.name)
                                        }
                                      >
                                        {item.text}
                                      </a>
                                    </li>
                                  )
                              )}
                            </ul>
                          </div>
                        ) : (
                          <a
                            data-tooltip-id="tooltip-page-body"
                            data-tooltip-content={button.tooltip}
                            key={'button_' + index}
                            onClick={() => props.onClickButtonPersonalizado(row, button.name)}
                            className={button.css}
                            role="button"
                          >
                            <i className={button.icon}></i>
                            {button.text ?? ''}
                          </a>
                        ))
                    )}
                  {props.state.page.buttons?.edit && CanCheck(props.state.page.model + '-edit') && (
                    <a
                      data-tooltip-id="tooltip-page-body"
                      data-tooltip-content="Editar"
                      onClick={() => props.onChangeEdit(row)}
                      className="me-2 btn btn-icon btn-sm btn-info-transparent rounded-pill"
                      role="button"
                    >
                      <i className="fa-regular fa-pen-to-square"></i>
                    </a>
                  )}
                  {props.state.page.buttons?.destroy &&
                    CanCheck(props.state.page.model + '-delete') && (
                      <a
                        onClick={() => props.onChangeDelete(row)}
                        data-tooltip-id="tooltip-page-body"
                        data-tooltip-content="Eliminar"
                        className="btn btn-icon btn-sm btn-danger-transparent rounded-pill"
                        role="button"
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </a>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row justify-content-center align-items-center mt-4">
        <div className="col-sm-12 col-md-5">
          Mostrando {dataTableState.meta.from} a {dataTableState.meta.to} de{' '}
          {dataTableState.meta.total} registros
        </div>
        <div className="col-sm-12 col-md-7">
          <div className="d-flex justify-content-end">
            <Pagination
              onChangePage={props.onChangePage}
              links={dataTableState.links}
              currentPage={dataTableState.meta.current_page}
              lastPage={dataTableState.meta.last_page}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default PageBodyComponent;
