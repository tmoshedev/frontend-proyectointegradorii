import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Esta interfaz contendrá la estructura de nuestros filtros tal como se utilizan en la UI
export interface LeadUIFilters {
  filtros?: any[];
  nivelesInteres?: string[];
  labels?: any[];
  campaigns?: any[];
  users?: any[];
  terminoBusqueda?: string;
}

interface LeadFiltersState {
  uiFilters: LeadUIFilters;
}

const initialState: LeadFiltersState = {
  uiFilters: {
    filtros: [],
    nivelesInteres: ['CALIENTE', 'TIBIO', 'FRIO'],
    labels: [],
    campaigns: [],
    users: [],
    terminoBusqueda: '',
  },
};

const leadFiltersSlice = createSlice({
  name: 'leadFilters',
  initialState,
  reducers: {
    setLeadFilters(state, action: PayloadAction<Partial<LeadUIFilters>>) {
      state.uiFilters = { ...state.uiFilters, ...action.payload };
    },
    clearLeadFilters(state) {
      state.uiFilters = initialState.uiFilters;
    },
  },
});

export const { setLeadFilters, clearLeadFilters } = leadFiltersSlice.actions;
export default leadFiltersSlice.reducer;
