import { Question } from './question.model';

export interface Answer {
  id: number;
  question_id: number | null;
  lead_id: number | null;
  user_id: number | null;
  respuesta: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  question?: Question;
}
