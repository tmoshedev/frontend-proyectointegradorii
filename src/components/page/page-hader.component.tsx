/* eslint-disable @typescript-eslint/no-explicit-any */
import CanCheck from '../../resources/can';

interface Props {
  state: any;
  onModalResource: (name: string) => void;
}

export const PageHeaderComponent = (props: Props) => {
  return (
    <div className="card-header justify-content-between d-sm-flex d-block">
      <div className="card-title">{props.state.page.title}</div>
      <div className="header-actions">
        {props.state.page.buttons?.create && CanCheck(props.state.page.model + '-store') && (
          <button
            onClick={() => props.onModalResource('store')}
            className="btn btn-primary-light btn-sm"
          >
            <i className="fa-solid fa-plus"></i> Nuevo
          </button>
        )}
        {/*         <button className="btn btn-primary-light btn-sm">
          <i className="fa-solid fa-download"></i> Exportar
        </button> */}
      </div>
    </div>
  );
};
export default PageHeaderComponent;
