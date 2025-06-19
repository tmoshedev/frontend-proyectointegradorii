import {
  AlarmClockCheck,
  BookCheck,
  MailCheck,
  MapPinHouse,
  PhoneCall,
  Users,
  Warehouse,
} from 'lucide-react';
import { JSX } from 'react';

export const iconsActividades = (size: number = 18): Record<string, JSX.Element> => ({
  LLAMADA: <PhoneCall height={size} />,
  REUNIÓN: <Users height={size} />,
  TAREA: <AlarmClockCheck height={size} />,
  'CORREO ELECTRÓNICO': <MailCheck height={size} />,
  'VISITA A PROYECTO': <MapPinHouse height={size} />,
  'ENVIAR INFORMACIÓN': <BookCheck height={size} />,
  'VISITA A OFICINA': <Warehouse height={size} />,
});
