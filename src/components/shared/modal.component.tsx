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
      className="modal fade"
      ref={modalRef}
      tabIndex={-1}
      aria-labelledby="modalResource"
      aria-hidden={!props.stateModal}
    >
      <div
        className={`modal-dialog modal-dialog-scrollable ${props.size ? props.size : ''}`}
        role="document"
      >
        <div className="modal-content" style={{ height: props.vHactive ? '100vh' : 'auto' }}>
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
