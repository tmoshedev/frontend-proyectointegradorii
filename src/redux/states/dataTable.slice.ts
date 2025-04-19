import { createSlice } from '@reduxjs/toolkit';
import { DataTable } from '../../models';

export const dataTableEmptyState: DataTable = {
  data: [],
  links: [],
  meta: [],
};

export const dataTableSlice = createSlice({
  name: 'dataTable',
  initialState: dataTableEmptyState,
  reducers: {
    dataTable_setAlls: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    dataTable_addResource: (state, action) => {
      state.data.push(action.payload);
    },
    dataTable_updateResource: (state, action) => {
      const { id } = action.payload;
      const index = state.data.findIndex((item) => item.id == id);
      state.data[index] = action.payload;
    },
    dataTable_deleteResource: (state, action) => {
      const id = action.payload;
      const index = state.data.findIndex((item) => item.id == id);
      state.data.splice(index, 1);
    },
    dataTable_clearAll: () => dataTableEmptyState,
  },
});

export const { dataTable_setAlls, dataTable_addResource, dataTable_updateResource, dataTable_deleteResource, dataTable_clearAll } =
  dataTableSlice.actions;
export default dataTableSlice.reducer;
