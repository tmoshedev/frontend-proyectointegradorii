import { QuestionCategory } from './question-category.model';
import { TypeQuestion } from './type-question.model';

export interface Question {
  id: number;
  type_question_id: number;
  texto: string;
  question_category_id: number;
  opciones: string | null;
  state: number;
  orden: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  type_question?: TypeQuestion;
  question_category?: QuestionCategory;
}
