import { QuestionCategory } from './question-category.model';
import { TypeQuestion } from './type-question.model';

export interface Question {
  id: number;
  codigo_type: string;
  texto: string;
  question_category_id: string;
  opciones: string[] | string | null;
  state: number;
  orden: number;
  type_question_id: string;
  name_type: string;
  

  type_question?: TypeQuestion;
  question_category?: QuestionCategory;
}
