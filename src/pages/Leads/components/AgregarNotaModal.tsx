import React from 'react';

interface AgregarNotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreLeadNote: () => void;
  stateNote: boolean;
  setNote: (note: string) => void;
  note: string;
}

const AgregarNotaModal: React.FC<AgregarNotaModalProps> = ({
  isOpen,
  onClose,
  onStoreLeadNote,
  stateNote,
  note,
  setNote,
}) => {
  if (!isOpen) return null;

  return (
    
    <div className="modal">
      <div className="modal-content">
        <h4 className="modal-title">Agregar Nota</h4>
        <textarea
          className="editor-lead__content"
          name="note"
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={onStoreLeadNote}>
          Agregar
        </button>
      </div>
    </div>
                
  );
};

export default AgregarNotaModal;