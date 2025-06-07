import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Lead, LeadProject, LeadLabel } from '../../models';
import { LeadHistorialResponse } from '../../models/responses';

interface LeadState {
  lead: Lead;
  historial: LeadHistorialResponse[];
  count_historial: {
    notes: number;
    state_changes: number;
  };
  stateViewHistorial: string;
  projectsAvailable: LeadProject[];
  labelsAvailable: LeadLabel[];
}

const initialState: LeadState = {
  lead: {} as Lead,
  historial: [],
  count_historial: { notes: 0, state_changes: 0 },
  stateViewHistorial: 'alls',
  projectsAvailable: [],
  labelsAvailable: [],
};

export const leadSlice = createSlice({
  name: 'lead',
  initialState,
  reducers: {
    setLead(state, action: PayloadAction<Lead>) {
      state.lead = action.payload;
    },
    setHistorial(state, action: PayloadAction<LeadHistorialResponse[]>) {
      state.historial = action.payload;
    },
    updateLeadProjects(state, action: PayloadAction<LeadProject[]>) {
      state.lead.lead_projects = action.payload;
    },
    updateLeadLabels(state, action: PayloadAction<LeadLabel[]>) {
      state.lead.lead_labels = action.payload;
    },
    // ✅ Actualiza el estado de vista del historial
    setStateViewHistorial(state, action: PayloadAction<string>) {
      state.stateViewHistorial = action.payload;
    },

    // ✅ Actualiza un campo específico del lead
    updateLeadField(state, action: PayloadAction<{ name: string; value: string }>) {
      state.lead = {
        ...state.lead,
        [action.payload.name]: action.payload.value,
      };
    },

    // ✅ Carga completa desde LeadResponse
    setLeadFullData(
      state,
      action: PayloadAction<{
        lead: Lead;
        lead_historial: LeadHistorialResponse[];
        count_historial: { notes: number; state_changes: number };
        projects_available: LeadProject[];
        labels_available: LeadLabel[];
      }>
    ) {
      state.lead = action.payload.lead;
      state.historial = action.payload.lead_historial;
      state.count_historial = action.payload.count_historial;
      state.projectsAvailable = action.payload.projects_available;
      state.labelsAvailable = action.payload.labels_available;
    },

    // ✅ Actualiza los datos de historial del lead
    setOnlyHistorialData(
      state,
      action: PayloadAction<{
        lead_historial: LeadHistorialResponse[];
        count_historial: { notes: number; state_changes: number };
      }>
    ) {
      state.historial = action.payload.lead_historial;
      state.count_historial = action.payload.count_historial;
    },
  },
});

export const {
  setLead,
  setHistorial,
  updateLeadProjects,
  updateLeadLabels,
  setLeadFullData,
  setStateViewHistorial,
  updateLeadField,
  setOnlyHistorialData,
} = leadSlice.actions;

export default leadSlice.reducer;
