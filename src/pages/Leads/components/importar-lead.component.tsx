import { ChangeEvent, useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { ImportarLeadRequest } from '../../../models/requests';
import { useLeads } from '../../../hooks';
import { SweetAlert } from '../../../utilities';
import {
  FIELD_LIMITS,
  sanitizeCellphoneValue,
  normalizeCellphoneForComparison,
} from '../../../constants/validation';

interface ImportarLeadComponentProps {
  handleStateView: (view: string) => void;
}

export const ImportarLeadComponent = (props: ImportarLeadComponentProps) => {
  const { requirements, importLeads } = useLeads();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [data, setData] = useState<ImportarLeadRequest[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [erroresValidacion, setErroresValidacion] = useState<any[]>([]);
  const rolActual = localStorage.getItem('rolActual') || '';
  const [asignarmeLead, setAsignarmeLead] = useState<boolean>(false);
  const [importFeedback, setImportFeedback] = useState<{
    type: 'success' | 'error';
    messages: string[];
  } | null>(null);

  const textFieldLimits: Partial<Record<keyof ImportarLeadRequest, number>> = {
    campaign_code: FIELD_LIMITS.lead.campaignCode,
    document_number: FIELD_LIMITS.lead.documentNumber,
    names: FIELD_LIMITS.lead.names,
    last_names: FIELD_LIMITS.lead.lastNames,
    cellphone: FIELD_LIMITS.lead.cellphone,
    city: FIELD_LIMITS.lead.city,
  };

  const sanitizeValue = (field: keyof ImportarLeadRequest, value: string) => {
    const normalizedValue = value ?? '';
    if (field === 'cellphone') {
      return sanitizeCellphoneValue(normalizedValue);
    }
    const limit = textFieldLimits[field];
    if (!limit) {
      return normalizedValue;
    }
    return normalizedValue.slice(0, limit);
  };

  const sanitizeRow = (row: ImportarLeadRequest): ImportarLeadRequest => {
    const sanitizedRow = { ...row };
    (Object.keys(textFieldLimits) as (keyof ImportarLeadRequest)[]).forEach((key) => {
      const currentValue = row[key] ?? '';
      sanitizedRow[key] = sanitizeValue(key, String(currentValue));
    });
    return sanitizedRow;
  };

  const updateDataField = (
    rowIndex: number,
    field: keyof ImportarLeadRequest,
    value: string
  ) => {
    const sanitized = sanitizeValue(field, value);
    setData((prev) => {
      const newData = [...prev];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [field]: sanitized,
      };
      return newData;
    });
    setImportFeedback(null);
  };

  const removeRow = (rowIndex: number) => {
    setData((prev) => prev.filter((_, index) => index !== rowIndex));
    setErroresValidacion((prev) => prev.filter((_: any, index: number) => index !== rowIndex));
    setImportFeedback(null);
  };

  const addEmptyRow = () => {
    setData((prev) => [
      ...prev,
      {
        campaign_code: '',
        project_id: '',
        channel_id: '',
        document_number: '',
        names: '',
        last_names: '',
        cellphone: '',
        city: '',
      },
    ]);
    setErroresValidacion((prev) => [...prev, {}]);
    setImportFeedback(null);
  };

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
      if (!event.target?.result) {
        return;
      }
      const arrayBuffer = event.target.result as ArrayBuffer;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
        range: 1, // Saltar las dos primeras filas
        header: [
          'campaign_code',
          'project_id',
          'channel_id',
          'document_number',
          'names',
          'last_names',
          'cellphone',
          'city',
        ],
      });
      const sanitizedData = (jsonData as ImportarLeadRequest[]).map(sanitizeRow);
      setData(sanitizedData);
      setErroresValidacion([]);
      setImportFeedback(null);
    };
  };

  const isEmpty = (value: any) => !value || String(value).trim() === '';

  const buildDuplicateDetails = (
    grouped: Map<string, number[]>,
    formatter: (key: string, rows: number[]) => string
  ) => {
    return Array.from(grouped.entries())
      .filter(([, rows]) => rows.length > 1)
      .map(([key, rows]) => ({
        description: formatter(key, rows),
        rowIndexes: rows,
      }));
  };

  const findDuplicatedPhoneCampaign = () => {
    const grouped = new Map<string, number[]>();

    data.forEach((item, index) => {
      if (!item.campaign_code || !item.cellphone) return;
      const normalizedCell = normalizeCellphoneForComparison(item.cellphone);
      if (!normalizedCell) return;
      const key = `${item.campaign_code}|${normalizedCell}`;
      const rows = grouped.get(key) || [];
      rows.push(index);
      grouped.set(key, rows);
    });

    return buildDuplicateDetails(grouped, (key, rows) => {
      const [campaign, normalizedCell] = key.split('|');
      const rowNumbers = rows.map((rowIndex) => rowIndex + 2);
      const displayCell = data[rows[0]]?.cellphone || normalizedCell;
      return `Campaña ${campaign} con celular ${displayCell} repetido en filas ${rowNumbers.join(', ')}`;
    });
  };

  const findDuplicatedCellphone = () => {
    const grouped = new Map<string, number[]>();

    data.forEach((item, index) => {
      if (!item.cellphone) return;
      const key = normalizeCellphoneForComparison(item.cellphone);
      if (!key) return;
      const rows = grouped.get(key) || [];
      rows.push(index);
      grouped.set(key, rows);
    });

    return buildDuplicateDetails(grouped, (normalizedCell, rows) => {
      const rowNumbers = rows.map((rowIndex) => rowIndex + 2);
      const displayCell = data[rows[0]]?.cellphone || normalizedCell;
      return `Celular ${displayCell} repetido en filas ${rowNumbers.join(', ')}`;
    });
  };

  const parseServerErrors = (error: any): string[] => {
    const serverData = error.response?.data;
    if (!serverData) {
      return ['Error al importar los datos.'];
    }

    if (Array.isArray(serverData.errors)) {
      return serverData.errors.map((err: any) => (typeof err === 'string' ? err : JSON.stringify(err)));
    }

    if (serverData.errors && typeof serverData.errors === 'object') {
      return Object.values(serverData.errors)
        .flat()
        .map((err: any) => (typeof err === 'string' ? err : JSON.stringify(err)));
    }

    if (serverData.message) {
      return [serverData.message];
    }

    return ['Ocurrió un error no especificado al importar los leads.'];
  };

  const onImportar = () => {
    if (data.length === 0) {
      return;
    }

    const nuevosErrores = data.map((item) => ({
      channel_id: isEmpty(item.channel_id),
      names: isEmpty(item.names),
      cellphone: isEmpty(item.cellphone),
      duplicatePhoneCampaign: false,
      duplicateMessage: '',
    }));

    const duplicateCampaignDetails = findDuplicatedPhoneCampaign();
    const duplicateCellDetails = findDuplicatedCellphone();

    const applyDuplicateDetails = (details: { description: string; rowIndexes: number[] }[]) => {
      details.forEach((detail) => {
        detail.rowIndexes.forEach((rowIndex) => {
          if (nuevosErrores[rowIndex]) {
            nuevosErrores[rowIndex].duplicatePhoneCampaign = true;
            nuevosErrores[rowIndex].duplicateMessage = [
              nuevosErrores[rowIndex].duplicateMessage,
              detail.description,
            ]
              .filter(Boolean)
              .join(' | ');
          }
        });
      });
    };

    applyDuplicateDetails(duplicateCampaignDetails);
    applyDuplicateDetails(duplicateCellDetails);

    setErroresValidacion(nuevosErrores);

    const hasRequiredErrors = nuevosErrores.some(
      (error) => error.channel_id || error.names || error.cellphone
    );

    const messages: string[] = [];
    if (hasRequiredErrors) {
      messages.push('Completa canal, nombres y celular en las filas resaltadas.');
    }
    if (duplicateCampaignDetails.length > 0) {
      messages.push('Hay filas duplicadas (campaña + celular). Corrige o elimina las filas marcadas.');
      messages.push(...duplicateCampaignDetails.map((detail) => detail.description));
    }
    if (duplicateCellDetails.length > 0) {
      messages.push('Hay filas duplicadas solo por celular. Corrige o elimina las filas marcadas.');
      messages.push(...duplicateCellDetails.map((detail) => detail.description));
    }

    if (messages.length > 0) {
      setImportFeedback({ type: 'error', messages });
      SweetAlert.warning('Validación', messages[0]);
      return;
    }

    importLeads(data, asignarmeLead, true)
      .then((response: any) => {
        SweetAlert.success('Mensaje', response.message);
        setImportFeedback({ type: 'success', messages: [response.message] });
        setData([]);
        setErroresValidacion([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setAsignarmeLead(false);
      })
      .catch((error: any) => {
        const parsedErrors = parseServerErrors(error);
        setImportFeedback({ type: 'error', messages: parsedErrors });
        SweetAlert.error('Mensaje', parsedErrors[0] || 'Error al importar los datos');
      });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAsignarmeLead(event.target.checked);
  };

  useEffect(() => {
    const dataInicial = () => {
      requirements(true).then((response: any) => {
        setCampaigns(response.campaigns);
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
                <div className="tabla-zize-col tabla-zize-col-10 text-center">Campaña</div>
                <div className="tabla-zize-col tabla-zize-col-10 text-center">Proyecto</div>
                <div className="tabla-zize-col tabla-zize-col-15">Canal captación</div>
                <div className="tabla-zize-col tabla-zize-col-5 text-center">Dni</div>
                <div className="tabla-zize-col tabla-zize-col-10 text-center">Nombres</div>
                <div className="tabla-zize-col tabla-zize-col-15 text-center">Apellidos</div>
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
                    isEmpty(item.city);
                  return (
                    <div className="tabla-zize-body-item" key={index}>
                      <div className="tabla-zize-col tabla-zize-col-10">
                        <select
                          className={`form-select form-select-sm ${
                            erroresValidacion[index]?.campaign_code ? 'is-invalid' : ''
                          }`}
                          value={item.campaign_code}
                          onChange={(e) => updateDataField(index, 'campaign_code', e.target.value)}
                          maxLength={FIELD_LIMITS.lead.campaignCode}
                        >
                          <option value="">Seleccionar</option>
                          {campaigns.map((campaign: any) => (
                            <option key={campaign.code} value={campaign.code}>
                              {campaign.code}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="tabla-zize-col tabla-zize-col-10">
                        <select
                          className={`form-select form-select-sm ${
                            erroresValidacion[index]?.project_id ? 'is-invalid' : ''
                          }`}
                          value={item.project_id}
                          onChange={(e) => updateDataField(index, 'project_id', e.target.value)}
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
                        <select
                          className={`form-select form-select-sm ${
                            erroresValidacion[index]?.channel_id ? 'is-invalid' : ''
                          }`}
                          value={item.channel_id}
                          onChange={(e) => updateDataField(index, 'channel_id', e.target.value)}
                        >
                          <option value="">Seleccionar</option>
                          {channels.map((channel: any) => (
                            <option key={channel.id} value={channel.id}>
                              {channel.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="tabla-zize-col tabla-zize-col-5">
                        <input
                          type="text"
                          className={`form-control form-control-sm todo-mayuscula ${
                            erroresValidacion[index]?.document_number ? 'is-invalid' : ''
                          }`}
                          value={item.document_number}
                          onChange={(e) => updateDataField(index, 'document_number', e.target.value)}
                          maxLength={FIELD_LIMITS.lead.documentNumber}
                        />
                      </div>
                      <div className="tabla-zize-col tabla-zize-col-10">
                        <input
                          type="text"
                          className={`form-control form-control-sm todo-mayuscula ${
                            erroresValidacion[index]?.names ? 'is-invalid' : ''
                          }`}
                          value={item.names}
                          onChange={(e) => updateDataField(index, 'names', e.target.value)}
                          maxLength={FIELD_LIMITS.lead.names}
                        />
                      </div>
                      <div className="tabla-zize-col tabla-zize-col-15">
                        <input
                          type="text"
                          className={`form-control form-control-sm todo-mayuscula ${
                            erroresValidacion[index]?.last_names ? 'is-invalid' : ''
                          }`}
                          value={item.last_names}
                          onChange={(e) => updateDataField(index, 'last_names', e.target.value)}
                          maxLength={FIELD_LIMITS.lead.lastNames}
                        />
                      </div>
                      <div className="tabla-zize-col tabla-zize-col-15">
                        <input
                          type="text"
                          className={`form-control form-control-sm todo-mayuscula ${
                            erroresValidacion[index]?.cellphone ||
                            erroresValidacion[index]?.duplicatePhoneCampaign
                              ? 'is-invalid'
                              : ''
                          }`}
                          value={item.cellphone}
                          onChange={(e) => updateDataField(index, 'cellphone', e.target.value)}
                          maxLength={FIELD_LIMITS.lead.cellphone}
                        />
                      </div>
                      <div className="tabla-zize-col tabla-zize-col-10">
                        <input
                          type="text"
                          className={`form-control form-control-sm todo-mayuscula ${
                            erroresValidacion[index]?.city ? 'is-invalid' : ''
                          }`}
                          value={item.city}
                          onChange={(e) => updateDataField(index, 'city', e.target.value)}
                          maxLength={FIELD_LIMITS.lead.city}
                        />
                      </div>
                      <div className="tabla-zize-col tabla-zize-col-10 text-center">
                        {erroresValidacion[index]?.duplicateMessage && (
                          <small className="text-danger d-block mb-1">
                            {erroresValidacion[index].duplicateMessage}
                          </small>
                        )}
                        <button
                          type="button"
                          className="btn btn-light btn-xs text-danger"
                          onClick={() => removeRow(index)}
                          aria-label="Eliminar fila"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
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
          {importFeedback && (
            <div
              className={`alert mt-3 ${
                importFeedback.type === 'error' ? 'alert-danger' : 'alert-success'
              }`}
            >
              <ul className="mb-0 ps-3">
                {importFeedback.messages.map((message, idx) => (
                  <li key={`${message}-${idx}`}>{message}</li>
                ))}
              </ul>
            </div>
          )}
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
            <button onClick={addEmptyRow} className="btn btn-outline-primary me-2">
              <i className="fa-solid fa-plus"></i> Agregar fila
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
