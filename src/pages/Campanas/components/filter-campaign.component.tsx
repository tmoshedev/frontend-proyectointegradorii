/* eslint-disable @typescript-eslint/no-explicit-any */

import { ChangeEvent } from 'react';

interface Props {
  onClearFilters: () => void;
  handleFilterSearch: (filters: any, state: boolean) => void;
  filterState: any;
  requirements: any;
}

export const FilterAccessUserComponent = (props: Props) => {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updatedFilters = { ...props.filterState, text: event.target.value };
    props.handleFilterSearch(updatedFilters, false);
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const updatedFilters = { ...props.filterState, [event.target.name]: event.target.value };
    props.handleFilterSearch(updatedFilters, true);
  };

  return (
    <div className="mt-1 mb-3 row">
      <div className="col-md-3">
        <label className="form-label" htmlFor="role_id">
          <i className="fa-solid fa-filter"></i> Rol
        </label>
        <select
          name="role_id"
          id="role_id"
          value={props.filterState.role_id}
          onChange={handleSelectChange}
          className="form-select form-select-sm"
        >
          <option value="">Todos</option>
          {props.requirements?.roles?.map((role: any) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
      {/* Buscar */}
      <div className="col-md-6">
        <label htmlFor="text" className="form-label">
          <i className="fa-solid fa-magnifying-glass"></i> Buscar usuario
        </label>
        <div role="group" className="btn-group w-100">
          <input
            autoComplete="off"
            name="text"
            value={props.filterState.text}
            onChange={handleInputChange}
            type="text"
            className="todo-mayuscula form-control form-control-sm"
            id="text"
            placeholder="Buscar por DNI oApellidos y Nombres o Apellidos..."
          />
          <button onClick={() => props.onClearFilters()} className="btn btn-primary btn-xs">
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterAccessUserComponent;
