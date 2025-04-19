export interface Person {
  success: boolean;
  document_number: string;
  names: string;
  father_last_name: string;
  mother_last_name: string;
  address: string | null;
  ubigeo_id: string | null;
  selectedUbigeo: {
    label: string;
    value: string;
  };
  fecha_nacimiento: string;
  sexo: string;
}
