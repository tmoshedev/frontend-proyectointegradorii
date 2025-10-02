import { QuestionCategory } from './question-category.model';
import { TypeQuestion } from './type-question.model';

export interface Question {
  id: number;
  code_type: string;
  question: string;
  question_category_id: string;
  options: string[] | string | null;
  state: number;
  order: number;
  type_question_id: string;
  name_type: string;
  

  type_question?: TypeQuestion;
  question_category?: QuestionCategory;
}
