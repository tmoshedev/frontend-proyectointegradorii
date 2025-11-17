//import { Document, Page, pdfjs } from 'react-pdf';
//import 'react-pdf/dist/Page/AnnotationLayer.css';
//import 'react-pdf/dist/Page/TextLayer.css';

// Configuración del worker para pdf.js
//import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
//pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface Props {
  data: any;
}
export const PlantillaViewComponent = (props: Props) => {
  const pdfUrl = `https://alitorres-backend.quantaxperia.com.pe/pdf-templates/${props.data.row.uuid}/preview`;

  return (
    <div className="form-scrollable" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <div className="modal-body">
        <object
          data={pdfUrl}
          type="application/pdf"
          style={{ width: '100%', height: '100%' }}
          aria-label="Vista previa de la plantilla"
        >
          <p>
            Tu navegador no es compatible con la vista previa de PDF. Puedes descargar la vista
            previa <a href={pdfUrl}>aquí</a>.
          </p>
        </object>
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

export default PlantillaViewComponent;
