import { TableHeaderResponse } from '.';

export interface TableCrmResponse {
  success: boolean;
  table_header: TableHeaderResponse[];
  data: any[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    showing: number;
  };
}
