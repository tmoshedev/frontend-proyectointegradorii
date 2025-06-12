export interface TableHeaderResponse {
  name: string;
  value: string;
  visible: boolean;
  class: any[];
  type: 'NORMAL' | 'STATES';
}
