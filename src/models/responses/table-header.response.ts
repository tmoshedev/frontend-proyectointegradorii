export interface TableHeaderResponse {
  name: string;
  value: string;
  visible: boolean;
  class: any[];
  type: 'NORMAL' | 'STATES' | 'ARRAYS' | 'HTML';
  type_value: string;
  tooltip: boolean;
  value_tooltip: string;
}
