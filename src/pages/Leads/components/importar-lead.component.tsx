import { ChangeEvent, useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { ImportarLeadRequest } from '../../../models/requests';
import { useLeads } from '../../../hooks';
import { SweetAlert } from '../../../utilities';

interface ImportarLeadComponentProps {
  handleStateView: (view: string) => void;
}

export const ImportarLeadComponent = (props: ImportarLeadComponentProps) => {
  const { requirements, importLeads } = useLeads();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [data, setData] = useState<ImportarLeadRequest[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [erroresValidacion, setErroresValidacion] = useState<any[]>([]);
  const rolActual = localStorage.getItem('rolActual') || '';
  const [asignarmeLead, setAsignarmeLead] = useState<boolean>(false);

  const onDescargarPlantilla = () => {
    window.open(`${import.meta.env.VITE_URL_WEB}/exports/leads-template`, '_blank');
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file); // Usar ArrayBuffer es la alternativa recomendada

    reader.onload = (event) => {
      if (!event.target?.result) return;
      const arrayBuffer = event.target.result as ArrayBuffer;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
        range: 1, // Saltar las dos primeras filas
        header: ['project_id', 'channel_id', 'document_number','names', 'last_names', 'cellphone', 'ciudad'],
      });
      setData(jsonData as ImportarLeadRequest[]);
    };
  };

  const isEmpty = (value: any) => !value || String(value).trim() === '';

  const onImportar = () => {
    const nuevosErrores = data.map((item) => ({
      //project_id: isEmpty(item.project_id),
      names: isEmpty(item.names),
      cellphone: isEmpty(item.cellphone),
    }));

    setErroresValidacion(nuevosErrores);

    if (nuevosErrores.some((error) => Object.values(error).some((val) => val))) {
      SweetAlert.warning('Mensaje', 'Por favor completa todos los campos obligatorios');
      return;
    }

    // Aquí puedes realizar la lógica de importación con los datos validados
    importLeads(data, asignarmeLead, true)
      .then((response: any) => {
        SweetAlert.success('Mensaje', response.message);
        setData([]);
        setErroresValidacion([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Limpiar el input de archivo
        }
        setAsignarmeLead(false);
      })
      .catch((error: any) => {
        SweetAlert.error('Mensaje', 'Error al importar los datos');
      });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAsignarmeLead(event.target.checked);
  };

  useEffect(() => {
    const dataInicial = () => {
      requirements(true).then((response: any) => {
        setProjects(response.projects);
        setChannels(response.channels);
      });
    };

    dataInicial();
  }, []);

  return (
    <div
      className="main-content app-content main-content--page"
      style={{ paddingLeft: '0rem', paddingRight: '0rem' }}
    >
      <div className="container-fluid">
        <div className="importar-data">
          <div className="importa-data-header">
            <h4 className="text-center mt-3">
              Importar leads
              <button
                onClick={onDescargarPlantilla}
                type="button"
                className="btn btn-info-light btn-xs ms-2"
              >
                <i className="fa-solid fa-download"></i> Descargar plantilla
              </button>
            </h4>
          </div>
          <div className="importa-data-body">
            <div className="tabla-zize-resource">
              <div className="tabla-zize-header">
                <div className="tabla-zize-col tabla-zize-col-15 text-center">Proyecto</div>
                <div className="tabla-zize-col tabla-zize-col-15">Canal captación</div>
                <div className="tabla-zize-col tabla-zize-col-10 text-center">Dni</div>
                <div className="tabla-zize-col tabla-zize-col-15 text-center">Nombres</div>
                <div className="tabla-zize-col tabla-zize-col-20 text-center">Apellidos</div>
                <div className="tabla-zize-col tabla-zize-col-10 text-center">Celular</div>
                <div className="tabla-zize-col tabla-zize-col-10 text-center">Ciudad</div>
                <div className="tabla-zize-col tabla-zize-col-15 text-center">Acción</div>
              </div>
              <div className="tabla-zize-body" style={{ height: 'calc(100vh)' }}>
                {data.map((item, index) => {
                  // Chequeo para esta fila
                  const isEmpty = (value: any) => !value || String(value).trim() === '';
                  const isRowIncomplete =
                    //isEmpty(item.project_id) ||
                    isEmpty(item.document_number) ||
                    isEmpty(item.names) ||
                    isEmpty(item.last_names) ||
                    isEmpty(item.cellphone) ||
                    isEmpty(item.ciudad);
                  return (
                    <div className="tabla-zize-body-item" key={index}>
                      <div className="tabla-zize-col tabla-zize-col-15">
                        <select
                          className={`form-select form-select-sm ${
                            erroresValidacion[index]?.project_id ? 'is-invalid' : ''
                          }`}
                          value={item.project_id}
                          onChange={(e) => {
                            const value = e.target.value;
                            setData((prev) => {
                              const newData = [...prev];
                              newData[index].project_id = value;
                              return newData;
                            });
                          }}
                        >
                          <option value="">Seleccionar</option>
                          {projects.map((project: any) => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="tabla-zize-col tabla-zize-col-15">
                        <input
                          type="text"
                          className={`form-control form-control-sm todo-mayuscula ${
                            erroresValidacion[index]?.document_number ? 'is-invalid' : ''
                          }`}
                          value={item.document_number}
                          onChange={(e) => {
                            const value = e.target.value;
                            setData((prev) => {
                              const newData = [...prev];
                              newData[index].document_number = value;
                              return newData;
                            });
                          }}
                        />
                      </div>
                      <div className="tabla-zize-col tabla-zize-col-15">
                        <input
                          type="text"
                          className={`form-control form-control-sm todo-mayuscula ${
                            erroresValidacion[index]?.names ? 'is-invalid' : ''
                          }`}
                          value={item.names}
                          onChange={(e) => {
                            const value = e.target.value;
                            setData((prev) => {
                              const newData = [...prev];
                              newData[index].names = value;
                              return newData;
                            });
                          }}
                        />
                      </div>
                      <div className="tabla-zize-col tabla-zize-col-20">
                        <input
                          type="text"
                          className="form-control form-control-sm todo-mayuscula"
                          value={item.last_names}
                          onChange={(e) => {
                            const value = e.target.value;
                            setData((prev) => {
                              const newData = [...prev];
                              newData[index].last_names = value;
                              return newData;
                            });
                          }}
                        />
                      </div>
                      <div className="tabla-zize-col tabla-zize-col-15">
                        <input
                          type="text"
                          className={`form-control form-control-sm todo-mayuscula ${
                            erroresValidacion[index]?.cellphone ? 'is-invalid' : ''
                          }`}
                          value={item.cellphone}
                          onChange={(e) => {
                            const value = e.target.value;
                            setData((prev) => {
                              const newData = [...prev];
                              newData[index].cellphone = value;
                              return newData;
                            });
                          }}
                        />
                      </div>
                      <div className="tabla-zize-col tabla-zize-col-10">
                        <input
                          type="text"
                          className="form-control form-control-sm todo-mayuscula"
                          value={item.ciudad}
                          onChange={(e) => {
                            const value = e.target.value;
                            setData((prev) => {
                              const newData = [...prev];
                              newData[index].ciudad = value;
                              return newData;
                            });
                          }}
                        />
                      </div>
                      <div className="tabla-zize-col tabla-zize-col-10"></div>
                    </div>
                  );
                })}
                {data.length === 0 && (
                  <div className="tabla-zize-body-item">
                    <div className="tabla-zize-col tabla-zize-col-100 text-center">
                      <b>No hay datos para importar.</b>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="importa-data-footer">
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button onClick={() => props.handleStateView('KANBAN')} className="btn btn-light me-2">
              <i className="fa-solid fa-xmark"></i> Cancelar
            </button>
            <button onClick={handleButtonClick} className="btn btn-success">
              <i className="fa-solid fa-upload"></i> Importar excel
            </button>
            <button
              disabled={data.length == 0}
              onClick={onImportar}
              className="btn btn-primary ms-2"
            >
              <i className="fa-solid fa-floppy-disk"></i> Guardar
            </button>
            {(rolActual == 'COMMERCIAL_LEADER' || rolActual == 'SALES_SUPERVISOR') && (
              <div className="form-check ms-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="asignarme_lead"
                  name="asignarme_lead"
                  checked={asignarmeLead}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="asignarme_lead">
                  Asignarme lead a mi usuario
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportarLeadComponent;
