import { useState, useEffect } from 'react';
import TinyEditorComponent from '../../../../components/shared/tiny-editor.component';
import { useQuestionCategories, useQuestions } from '../../../../hooks';
import { Lead } from '../../../../models/lead.model';
import { getLeads } from '../../../../services/leads.service';

interface Props {
  pdfTemplate: any;
  handleContenido: (content: string) => void;
  guardarPlantilla: () => void;
  onVistaPrevia: (pdfTemplate: any) => void;
  onCerrarPlantilla: () => void;
  lead?: Lead; // Opcional, para mostrar variables del lead
}

export const ContentPlantillaBuyerComponent = (props: Props) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const { getQuestionCategory } = useQuestionCategories();
  const { getQuestion } = useQuestions();
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    // Cargar categorías y preguntas
    getQuestionCategory('', '', 1, '100', 'orden', 'asc', false).then((catRes: any) => {
      setCategories(catRes.data || []);
      if (catRes.data && catRes.data.length > 0) {
        // Cargar todas las preguntas de todas las categorías
        Promise.all(
          catRes.data.map((cat: any) =>
            getQuestion(String(cat.id), '', '', 1, '100', 'orden', 'asc', false, false, 'type_question')
          )
        ).then((questionResArr: any[]) => {
          const allQuestions = questionResArr.flatMap((qRes: any) => qRes.data || []);
          setQuestions(allQuestions);
        });
      }
    });
    getLeads('', '', '', '', '', '', '', '', '', 100, 1).then((response: any) => {
      setLeads(response.data || []);
    });
  }, []);

  // Variables del lead: solo los atributos del modelo Lead
  const leadAttributes = [
    'reason',
    'id',
    'lead_state_id',
    'document_number',
    'names',
    'last_names',
    'cellphone',
    'channel_name',
    'channel_icon_html',
    'prediccion_ia',
    'interes',
    'estado_final',
    'user_id',
    'user_names',
    'user_father_last_name',
    'user_mother_last_name',
    'user_rol_name',
    'uuid',
    'ciudad',
    'precio',
    'info',
    'email',
    'asesor_estado',
    'supervisor_names',
    'fecha_creacion',
    'campaign_codigo',
    'conteo_actividad',
    // ...agrega los que quieras mostrar
  ];

 const leadVariables = leadAttributes.map((key) => ({
  label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  variable: `{{lead_${key}}}`,
  group: 'lead'
}));

const questionVariables = questions.map((q: any) => ({
  label: `${q.question} (Pregunta)`,
  variable: `{{respuesta_${q.id}}}`,
  group: 'question'
}));

  // Función para insertar variable en el editor
  const insertVariable = (variable: string) => {
    // TinyMCE permite insertar contenido con su API
    const editor = window.tinymce?.activeEditor;
    if (editor) {
      editor.insertContent(variable);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <h3 className="m-0 p-0">{props.pdfTemplate.name}</h3>
        <div className="d-flex align-items-center justify-content-between gap-2">
          <button
            onClick={() => props.onVistaPrevia(props.pdfTemplate)}
            type="button"
            className="btn btn-info btn-sm"
          >
            <i className="fa-solid fa-eye"></i> Vista previa
          </button>
          <button onClick={props.guardarPlantilla} type="button" className="btn btn-success btn-sm">
            <i className="fa-solid fa-eye"></i> Guardar
          </button>
          <button onClick={props.onCerrarPlantilla} type="button" className="btn btn-light btn-sm">
            <i className="fa-solid fa-xmark"></i> Cerrar
          </button>
        </div>
      </div>

            <div className="flex-grow-1 mt-4">

      {questions.length === 0 ? (
        <div>Cargando preguntas...</div>
      ) : (
      <TinyEditorComponent
        key={props.pdfTemplate.id}
        plugins={['lists', 'table', 'wordcount', 'template', 'image']}
        initialContent={props.pdfTemplate.content || ''}
        onContentChange={props.handleContenido}
        content_style={`@page { size: A4; margin: 18mm; }
                                    p {margin: 0;padding: 0}
                                    body { font-family: Calibri, Arial, Helvetica, sans-serif; font-size:10pt; }
                                    table { border-collapse: collapse; }
                                    th, td { border:1px solid #c9d7e6; padding:6px; }
                                    .pagebreak { page-break-before: always; }
            `}
          variables={[...leadVariables, ...questionVariables]} // Aquí van todas las variables

      />
      )}
    </div>
        </>

  );
};

export default ContentPlantillaBuyerComponent;