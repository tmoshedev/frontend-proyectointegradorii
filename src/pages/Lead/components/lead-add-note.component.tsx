import { useEffect, useRef, useState } from 'react';
import { useLeadNotes } from '../../../hooks/useLeadNotes';
import { SweetAlert } from '../../../utilities';
import { LeadNoteRequest } from '../../../models/requests';
import { Lead } from '../../../models';

interface Props {
  lead: Lead;
  changeHistorialView: (view: string) => void;
}
export const LeadAddNoteComponent = (props: Props) => {
  const { storeLeadNote } = useLeadNotes();
  const [stateNote, setStateNote] = useState(false);
  const [note, setNote] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onActivarNota = () => {
    setStateNote(!stateNote);
    setNote('');
  };

  const onStoreLeadNote = async () => {
    if (note.trim() === '') {
      SweetAlert.warning('Mensaje', 'El campo de nota no puede estar vacío.');
      return;
    }

    const formData: LeadNoteRequest = {
      note: note,
      lead_id: props.lead.id,
    };

    storeLeadNote(formData, true)
      .then(() => {
        setStateNote(false);
        setNote('');
        SweetAlert.success('Éxito', 'Nota guardada correctamente.');
        props.changeHistorialView('');
      })
      .catch(() => {
        SweetAlert.error('Error', 'No se pudo guardar la nota. Inténtalo de nuevo más tarde.');
      });
  };

  useEffect(() => {
    if (stateNote && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [stateNote]);

  return (
    <>
      {!stateNote && (
        <div className="content-tabs-app" onClick={onActivarNota}>
          <div>Escribe una nota...</div>
        </div>
      )}
      {stateNote && (
        <div className="editor-wrapper">
          <div className="editor-lead">
            <textarea
              ref={textareaRef}
              className="editor-lead__content"
              name="note"
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></textarea>
            <div className="editor-lead__footer">
              <div className="d-block w-100">
                <div className="editor-lead__footer__buttons">
                  <div className="editor-lead__footer__button">
                    <button onClick={() => onActivarNota()} className="btn btn-light btn-xs me-2">
                      Cancelar
                    </button>
                    <button onClick={onStoreLeadNote} className="btn btn-primary btn-xs">
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeadAddNoteComponent;
