/* eslint-disable @typescript-eslint/no-explicit-any */
interface FilterLabelsProps {
  filterState: any;
  handleFilterSearch: (filters: any, state: boolean) => void;
  onClearFilters: () => void;
}

const FilterLabelsComponent = ({
  filterState,
  handleFilterSearch,
  onClearFilters,
}: FilterLabelsProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleFilterSearch({ ...filterState, [name]: value }, false);
  };

  return (
    <div className="row">
      <div className="col-md-4">
        <div className="form-group">
          <input
            type="text"
            name="text"
            className="form-control"
            placeholder="Buscar por nombre..."
            value={filterState.text}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="col-md-4">
        <button
          className="btn btn-primary"
          onClick={() => handleFilterSearch(filterState, true)}
        >
          Buscar
        </button>
        <button className="btn btn-secondary ms-2" onClick={onClearFilters}>
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default FilterLabelsComponent;
