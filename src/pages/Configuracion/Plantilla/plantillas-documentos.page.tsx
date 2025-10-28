import { useEffect, useState } from 'react';
import { usePdfTemplates } from '../../../hooks';
import ContentPlantillaComponent from './components/content-plantilla.page';
import type { PdfTemplate } from '../../../models';
import PlantillasDocumentosSkeleton from './components/PlantillasDocumentosSkeleton';
import ModalComponent from '../../../components/shared/modal.component';
import PlantillaViewComponent from './components/plantilla-view.component';
import { SweetAlert } from '../../../utilities';
import PlantillaCrearComponent from './components/plantilla-crear.component';
import { Palette } from 'lucide-react';

interface DataModalState {
  type: string;
  buttonSubmit: string | null;
  row: any | null;
  title: string | null;
  requirements: any[];
  onCloseModalForm: any;
}

export const PlantillasDocumentosPage = () => {
  const { getPdfTemplates, updatePdfTemplate } = usePdfTemplates();
  const [pdfTemplates, setPdfTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfTemplate, setPdfTemplate] = useState<PdfTemplate>({
    id: '',
    name: '',
    type: '',
    description: '',
    header: '',
    content: '',
    footer: '',
    uuid: '',
  });
  //Modal vista
  const [isOpenModalVista, setIsOpenModalVista] = useState(false);
  const [isStateModalVista, setIsStateModalVista] = useState(false);
  const [dataModalResourceState, setDataModalResourceState] = useState<DataModalState>({
    type: '',
    buttonSubmit: null,
    row: null,
    title: null,
    requirements: [],
    onCloseModalForm: () => {},
  });
  //Modal agregar
  const [isOpenModalCrear, setIsOpenModalCrear] = useState(false);
  const [isStateModalCrear, setIsStateModalCrear] = useState(false);

  const handleContenido = (content: string) => {
    setPdfTemplate((prev) => ({ ...prev, content }));
  };

  const guardarPlantilla = () => {
    updatePdfTemplate(pdfTemplate, true).then((response: any) => {
      SweetAlert.success('Mensaje', response.message);
    });
  };

  const onCloseModalVistaForm = () => {
    setIsStateModalVista(false);
  };

  const handleCloseModalVista = () => {
    setIsOpenModalVista(false);
  };

  const onCloseModalCrearForm = () => {
    setIsStateModalCrear(false);
  };

  const handleCloseModalCrear = () => {
    setIsOpenModalCrear(false);
  };

  const onVistaPrevia = (pdfTemplate: PdfTemplate) => {
    setPdfTemplate(pdfTemplate);
    setIsOpenModalVista(true);
    setIsStateModalVista(true);
    setDataModalResourceState({
      type: 'view',
      buttonSubmit: null,
      row: pdfTemplate,
      title: 'VISTA PREVIA: ' + pdfTemplate.name,
      requirements: [],
      onCloseModalForm: onCloseModalVistaForm,
    });
  };

  const onCerrarPlantilla = () => {
    setPdfTemplate({
      id: '',
      name: '',
      type: '',
      description: '',
      header: '',
      content: '',
      footer: '',
      //templatable_type: '',
     // templatable_id: '',
      uuid: '',
    });
  };

  const onCrearPlantilla = () => {
    setIsOpenModalCrear(true);
    setIsStateModalCrear(true);
    setDataModalResourceState({
      type: 'store',
      buttonSubmit: 'Crear',
      row: null,
      title: 'CREAR PLANTILLA PDF',
      requirements: [],
      onCloseModalForm: onCloseModalCrearForm,
    });
  };

  const clonarPlantillaPdf = (e: React.MouseEvent, template: PdfTemplate) => {
    e.stopPropagation();
    setIsOpenModalCrear(true);
    setIsStateModalCrear(true);
    const formData = {
      type_project_name: '',
      name: '',
      type: template.type,
      project_id: '',
      stage_block_id: '',
      state: 'PUBLICADO',
      header: template.header,
      content: template.content,
      footer: template.footer,
    };
    setDataModalResourceState({
      type: 'store',
      buttonSubmit: 'Crear',
      row: formData,
      title: 'CREAR PLANTILLA PDF',
      requirements: [],
      onCloseModalForm: onCloseModalCrearForm,
    });
  };

  const addItem = (item: any) => {
    setPdfTemplates((prev) => [...prev, item]);
  };

  const handleSelectTemplate = (template: PdfTemplate) => {
    setPdfTemplate({ ...template });
  };

  useEffect(() => {
    const dataInicial = () => {
      getPdfTemplates('get', false)
        .then((response: any) => {
          setPdfTemplates(response.data);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    dataInicial();
  }, []);

  if (isLoading) {
    return <PlantillasDocumentosSkeleton />;
  }

  return (
      <div className="card">
          <div className="app-pdf-templates">
            <div className="app-pdf-template-header">
              <h1 className="m-0 p-0">
                <i className="fa-regular fa-file-pdf"></i> Editor de Plantillas PDF
            </h1>
            <p className="m-0 p-0">
              Crea y personaliza plantillas con variables dinámicas para generar PDFs
            </p>
          </div>
          <div className="app-pdf-template-content">
            <div className="app-pdf-template-content-left">
              <div
                className="d-flex justify-content-between align-items-center"
                style={{ paddingRight: '1rem' }}
              >
                <h4 className="m-0 p-0">Plantillas</h4>
                <button
                  data-tooltip-id="tooltip-component"
                  data-tooltip-content={'Crear nueva plantilla PDF'}
                  onClick={onCrearPlantilla}
                  className="btn btn-primary btn-xs"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
              <div className="app-pdf-template-list">
                {pdfTemplates.map((template) => (
                  <div
                    onClick={() => handleSelectTemplate(template)}
                    className={`app-pdf-template-item d-flex justify-content-between align-items-center ${
                      pdfTemplate.id == template.id ? 'active' : ''
                    }`}
                    key={template.id}
                  >
                    <div>
                      <h6 className="m-0 p-0">{template.name}</h6>
                      <p className="m-0 p-0 text-muted">{template.type}</p>
                    </div>
                    <button
                      onClick={(e) => clonarPlantillaPdf(e, template)}
                      data-tooltip-id="tooltip-component"
                      data-tooltip-content={'Clonar plantilla PDF'}
                      className="btn btn-light btn-xs"
                    >
                      <i className="fa-regular fa-copy"></i>
                    </button>
                  </div>
                ))}
                {pdfTemplates.length === 0 && (
                  <div className="d-flex flex-column align-items-center justify-content-center">
                    <Palette />
                    <h4 className="text-center mt-2">
                      No hay plantillas creadas, crea tu primera plantilla.
                    </h4>
                  </div>
                )}
              </div>
            </div>
            <div className="app-pdf-template-content-right d-flex flex-column">
              {pdfTemplate.id != '' ? (
                <ContentPlantillaComponent
                  pdfTemplate={pdfTemplate}
                  handleContenido={handleContenido}
                  guardarPlantilla={guardarPlantilla}
                  onVistaPrevia={onVistaPrevia}
                  onCerrarPlantilla={onCerrarPlantilla}
                />
              ) : (
                <div className="d-flex flex-column flex-grow-1 align-items-center justify-content-center">
                  <img className="img-fluid w-50" src="/images/svg/pdf_template.svg" alt="" />
                  <h4>Selecciona una plantilla</h4>
                </div>
              )}
            </div>
          </div>
      </div>
      {isOpenModalVista && (
        <ModalComponent
          vHactive={true}
          stateModal={isStateModalVista}
          typeModal={'static'}
          onClose={handleCloseModalVista}
          title={dataModalResourceState.title || ''}
          size="modal-lg"
          content={<PlantillaViewComponent data={dataModalResourceState} />}
        />
      )}
      {/**Modal crear pdf plantilla */}
      {isOpenModalCrear && (
        <ModalComponent
          stateModal={isStateModalCrear}
          typeModal={'static'}
          onClose={handleCloseModalCrear}
          title={dataModalResourceState.title || ''}
          size="modal-md"
          content={<PlantillaCrearComponent data={dataModalResourceState} addItem={addItem} />}
        />
      )}
    

    </div>
  );
};

export default PlantillasDocumentosPage;
