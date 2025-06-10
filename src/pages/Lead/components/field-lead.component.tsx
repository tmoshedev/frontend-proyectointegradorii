import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useLeads } from '../../../hooks';
import { Bounce, toast } from 'react-toastify';

interface Props {
  uuid: string;
  name: string;
  label: string;
  value: string;
  onUpdateRest: (name: string, value: string) => void;
}
export const FieldLeadComponent = (props: Props) => {
  const { updateLeadValue } = useLeads();
  const [editMode, setEditMode] = useState(false);
  const [inputValue, setInputValue] = useState(props.value ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  const onChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const onUpdate = () => {
    if (inputValue.trim() === '') {
      return;
    }
    updateLeadValue(props.uuid, props.name, inputValue, false).then(() => {
      toast.success('Datos actualizados correctamente.', {
        position: 'top-center',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
      });
      props.onUpdateRest(props.name, inputValue);
      setEditMode(false);
    });
  };

  useEffect(() => {
    if (editMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editMode]);

  useEffect(() => {
    setInputValue(props.value);
  }, [props.value]);

  return (
    <div className="fields-list-row">
      <div className="fields-list__label">{props.label}:</div>
      <div className="fields-list__components">
        {editMode ? (
          <>
            <div className="fields-list__input">
              <input
                ref={inputRef}
                type="text"
                name={props.name}
                autoComplete="off"
                className="form-control form-control-sm todo-mayuscula"
                value={inputValue}
                onChange={onChangeValue}
              />
            </div>
            <div className="list-fields-actions">
              <button
                onClick={() => setEditMode(false)}
                className="btn btn-xs btn-outline-cancel me-2"
              >
                Cancelar
              </button>
              <button onClick={onUpdate} className="btn btn-xs btn-primary">
                Guardar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="fields-list__value">{props.value}</div>
            <div className="list-fields-edit">
              <button onClick={() => setEditMode(true)} className="btn btn-outline-cancel btn-xs">
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FieldLeadComponent;
