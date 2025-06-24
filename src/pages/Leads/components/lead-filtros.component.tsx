import FiltrosCrmComponent from '../../../components/filtros-crm.component';

interface Props {
  data: any;
  todosLosFiltros: any;
  filtrosActivos: any[];
  onAdd: () => void;
  onDelete: (id: number) => void;
  onTipoChange: (id: number, nuevoTipo: string) => void;
  onValoresChange: (id: number, nuevosValores: any[]) => void;
}

export const LeadFiltrosComponent = (props: Props) => {
  const tiposDeFiltroYaSeleccionados = props.filtrosActivos.map((f) => f.tipo).filter(Boolean);

  return (
    <div className="form-scrollable">
      <div className="modal-body">
        <div className="row">
          <div className="col-md-12">
            <div className="filtrosBody">
              {props.filtrosActivos.map((filtro) => {
                // Opciones de TIPO disponibles para esta fila
                const opcionesDeTipoDisponibles = Object.keys(props.todosLosFiltros).filter(
                  (tipo) => !tiposDeFiltroYaSeleccionados.includes(tipo) || tipo === filtro.tipo
                );

                // Opciones de VALOR para el tipo seleccionado en esta fila
                const opcionesDeValor = filtro.tipo
                  ? props.todosLosFiltros[filtro.tipo].opciones
                  : [];

                return (
                  <FiltrosCrmComponent
                    key={filtro.id}
                    tipoSeleccionado={filtro.tipo}
                    valoresSeleccionados={filtro.valoresSeleccionados}
                    opcionesDeTipo={opcionesDeTipoDisponibles.map((label) => ({ label }))}
                    opcionesDeValor={opcionesDeValor}
                    onTipoChange={(nuevoTipo: string) => props.onTipoChange(filtro.id, nuevoTipo)}
                    onDelete={() => props.onDelete(filtro.id)}
                    onValoresChange={(nuevosValores: any[]) =>
                      props.onValoresChange(filtro.id, nuevosValores)
                    }
                  />
                );
              })}
            </div>
          </div>
          <div className="col-md-12 mt-2">
            <button onClick={props.onAdd} className="btn-add-filtros">
              <i className="fa-solid fa-plus"></i> Añadir filtros
            </button>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-light btn-sm"
          data-bs-dismiss="modal"
          onClick={props.data.onCloseModalForm}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default LeadFiltrosComponent;
