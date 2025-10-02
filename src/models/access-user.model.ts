/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AccessUser {
  id?: string;
  document_number: string;
  names: string;
  father_last_name: string;
  mother_last_name: string;
  cellphone: string;
  role_id?: string;
  email?: string;
  state?: string;
  roles: any[];
  ubigeo_domicilio?: string;
  address?: string;
  birth_date?: string;
  gender?: string;
  selectedUbigeoDomilicio?: any;
  superior_id?: string;
}
