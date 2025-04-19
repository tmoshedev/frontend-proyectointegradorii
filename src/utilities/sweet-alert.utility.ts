/* eslint-disable @typescript-eslint/no-explicit-any */
import Swal, { SweetAlertOptions } from "sweetalert2";

const commonOptions: SweetAlertOptions = {
  confirmButtonColor: "#1abc9c",
  showCancelButton: false,
  confirmButtonText: "Aceptar",
  cancelButtonText: "Cancelar",
};

const deleteConfirmationOptions: SweetAlertOptions = {
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#1abc9c",
  cancelButtonColor: "#ff3d60",
  confirmButtonText: "Sí, eliminarlo",
  cancelButtonText: "Cancelar",
};

const onConfirmationOptions: SweetAlertOptions = {
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#1abc9c",
  cancelButtonColor: "#ff3d60",
  confirmButtonText: "Sí, acepto",
  cancelButtonText: "Cancelar",
};

const handleDeleteConfirmation = (
  onConfirmed: () => void,
  onCancelled?: () => void,
  title?: string,
  customText?: string,
) => {
  const optionsWithText = {
    ...deleteConfirmationOptions,
    title: title || deleteConfirmationOptions.title,
    text: customText || deleteConfirmationOptions.text,
  };

  Swal.fire(optionsWithText).then((result) => {
    if (result.isConfirmed) {
      onConfirmed();
    } else if (result.dismiss == Swal.DismissReason.cancel && onCancelled) {
      onCancelled();
    }
  });
};

const handleOnConfirmation = (
  onConfirmed: () => void,
  onCancelled?: () => void,
  title?: string,
  customText?: string,
) => {
  const optionsWithText = {
    ...onConfirmationOptions,
    title: title || onConfirmationOptions.title,
    text: customText || onConfirmationOptions.text,
  };

  Swal.fire(optionsWithText).then((result) => {
    if (result.isConfirmed) {
      onConfirmed();
    } else if (result.dismiss == Swal.DismissReason.cancel && onCancelled) {
      onCancelled();
    }
  });
};

export const SweetAlert = {
  success: (title: string, message?: string) => {
    return Swal.fire({
      ...commonOptions,
      icon: "success",
      title,
      text: message,
    });
  },
  error: (title: string, message?: string) => {
    return Swal.fire({
      ...commonOptions,
      icon: "error",
      title,
      text: message,
    });
  },
  modeHtml: (icon: any, title: string, message?: string) => {
    return Swal.fire({
      ...commonOptions,
      icon: icon,
      title,
      html: message,
    });
  },
  warning: (title: string, message?: string) => {
    return Swal.fire({
      ...commonOptions,
      icon: "warning",
      title,
      text: message,
    });
  },
  info: (title: string, message?: string) => {
    return Swal.fire({
      ...commonOptions,
      icon: "info",
      title,
      text: message,
    });
  },
  deleteConfirmation: (
    onConfirmed: () => void,
    onCancelled?: () => void,
    title?: string,
    customText?: string,
  ) => {
    handleDeleteConfirmation(onConfirmed, onCancelled, title, customText);
  },
  onConfirmation: (
    onConfirmed: () => void,
    onCancelled?: () => void,
    title?: string,
    customText?: string,
  ) => {
    handleOnConfirmation(onConfirmed, onCancelled, title, customText);
  },
};

export default SweetAlert;
