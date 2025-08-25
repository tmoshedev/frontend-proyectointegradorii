import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Filtro {
  id: number;
  tipo: string;
  valoresSeleccionados: any[];
}

interface LeadFiltersState {
  filtros: Filtro[];
  nivelesInteres: string[];
}

const initialState: LeadFiltersState = {
  filtros: [],
  nivelesInteres: ['CALIENTE', 'TIBIO', 'FRIO'],
};

const leadFiltersSlice = createSlice({
  name: 'leadFilters',
  initialState,
  reducers: {
    setLeadFilters(state, action: PayloadAction<Partial<LeadFiltersState>>) {
      if (action.payload.filtros !== undefined) {
        state.filtros = action.payload.filtros;
      }
      if (action.payload.nivelesInteres !== undefined) {
        state.nivelesInteres = action.payload.nivelesInteres;
      }
    },
    resetLeadFilters(state) {
      state.filtros = initialState.filtros;
      state.nivelesInteres = initialState.nivelesInteres;
    },
  },
});

export const { setLeadFilters, resetLeadFilters } = leadFiltersSlice.actions;
export default leadFiltersSlice.reducer;
