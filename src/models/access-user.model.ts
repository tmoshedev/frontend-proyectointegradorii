/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AccessUser {
  email: string;
  personal_email: string;
  id?: string;
  uuid?: string;
  document_number: string;
  names: string;
  father_last_name: string;
  mother_last_name: string;
  cellphone: string;
  role_id?: string;
  state?: string;
  roles: any[];
  ubigeo_domicilio?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  genero?: string;
  selectedUbigeoDomilicio?: any;
  superior_id?: string;
  status?: string;
  last_login: Date;
  last_logout: Date;

}
