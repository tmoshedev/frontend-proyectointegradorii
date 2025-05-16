import { Person } from '../models';
/**Models */
import api from './api';

export const personSearch = async (document: string) => {
  const response = await api.get<Person>(`/apis/persons/find?document_number=${document}`);
  return response;
};

export const ubigeoSearch = async (text: string) => {
  const response = await api.get('/apis/ubigeos?text=' + text);
  return response;
};
