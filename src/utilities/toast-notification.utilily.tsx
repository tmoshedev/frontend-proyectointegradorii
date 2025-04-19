import { toast } from 'react-toastify';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  autoClose?: number;
}

const ToastNotification = ({
  type,
  message,
  position = 'top-right',
  autoClose = 3000,
}: ToastProps) => {
  switch (type) {
    case 'success':
      toast.success(message, { position, autoClose });
      break;
    case 'error':
      toast.error(message, { position, autoClose });
      break;
    case 'warning':
      toast.warning(message, { position, autoClose });
      break;
    case 'info':
      toast.info(message, { position, autoClose });
      break;
    default:
      console.warn(`Tipo de toast desconocido: ${type}`);
  }

  return null;
};

export default ToastNotification;
