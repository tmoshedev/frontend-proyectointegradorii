/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect, useState } from 'react';
import { Modal } from 'bootstrap';

interface Props {
  title: string | null;
  content: React.ReactNode;
  onClose: () => void;
  typeModal: any;
  stateModal: boolean;
  size?: string;
  vHactive?: boolean;
  className?: string;
  vHactiveHeight?: string;
}

const ModalComponent = (props: Props) => {
  const modalRef = useRef(null);
  const [modalInstance, setModalInstance] = useState<Modal | null>(null);

  useEffect(() => {
    if (modalRef.current) {
      setModalInstance(new Modal(modalRef.current, { keyboard: false, backdrop: props.typeModal }));
    }
  }, [props.typeModal]);

  useEffect(() => {
    if (modalInstance) {
      if (props.stateModal) {
        modalInstance.show();
      } else {
        modalInstance.hide();
        props.onClose();
      }
    }
  }, [modalInstance, props.stateModal]);

  const handleClose = () => {
    if (modalInstance) {
      modalInstance.hide();
    }
    props.onClose();
  };

  return (
    <div
      data-bs-focus="false"
      className={`modal fade ${props.className ?? ''}`}
      ref={modalRef}
      tabIndex={-1}
      aria-labelledby="modalResource"
      aria-hidden={!props.stateModal}
    >
      <div
        className={`modal-dialog ${props.size ? props.size : ''}`}
        role="document"
        style={{ height: props.vHactive ? 'calc(100vh - 3.5rem)' : '' }}
      >
        <div
          className={`modal-content ${props.vHactive ? '' : 'modal-no-scroll'}`}
          style={{ height: props.vHactive ? 'calc(100vh - 3.5rem)' : 'auto' }}
        >
          <div className="modal-header">
            <h5 className="modal-title">{props.title}</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          {props.content}
        </div>
      </div>
    </div>
  );
};

export default ModalComponent;
