/* eslint-disable @typescript-eslint/no-explicit-any */
import { configureStore } from '@reduxjs/toolkit';
import { loadingSlice } from './states/loading.slice';
import { authSlice } from './states/auth.slice';
import { dataTableSlice } from './states/dataTable.slice';

export interface AppStore {
  loading: any;
  auth: any;
  dataTable: any;
}

export default configureStore<AppStore>({
  reducer: {
    loading: loadingSlice.reducer,
    auth: authSlice.reducer,
    dataTable: dataTableSlice.reducer,
  },
});
