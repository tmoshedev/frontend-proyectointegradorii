import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Lead, LeadProject, LeadLabel, User, UserSelect2, Activity } from '../../models';
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
  users: UserSelect2[];
  activities: Activity[];
}

const initialState: LeadState = {
  lead: {} as Lead,
  historial: [],
  count_historial: { notes: 0, state_changes: 0 },
  stateViewHistorial: 'alls',
  projectsAvailable: [],
  labelsAvailable: [],
  users: [],
  activities: [],
};

export const leadSlice = createSlice({
  name: 'lead',
  initialState,
  reducers: {
    setLead(state, action: PayloadAction<Lead>) {
      state.lead = action.payload;
    },
    setLeadAndHistorial(
      state,
      action: PayloadAction<{
        lead: Lead;
        lead_historial: LeadHistorialResponse[];
        count_historial: { notes: number; state_changes: number };
      }>
    ) {
      state.lead = action.payload.lead;
      state.historial = action.payload.lead_historial;
      state.count_historial = action.payload.count_historial;
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
        users: UserSelect2[];
        activities: Activity[];
      }>
    ) {
      state.lead = action.payload.lead;
      state.historial = action.payload.lead_historial;
      state.count_historial = action.payload.count_historial;
      state.projectsAvailable = action.payload.projects_available;
      state.labelsAvailable = action.payload.labels_available;
      state.users = action.payload.users;
      state.activities = action.payload.activities;
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

    //Clear the lead state
    clearLeadState(state) {
      state.lead = {} as Lead;
      state.historial = [];
      state.count_historial = { notes: 0, state_changes: 0 };
      state.stateViewHistorial = 'alls';
      state.projectsAvailable = [];
      state.labelsAvailable = [];
      state.users = [];
      state.activities = [];
    },
  },
});

export const {
  setLead,
  setLeadAndHistorial,
  setHistorial,
  updateLeadProjects,
  updateLeadLabels,
  setLeadFullData,
  setStateViewHistorial,
  updateLeadField,
  setOnlyHistorialData,
  clearLeadState,
} = leadSlice.actions;

export default leadSlice.reducer;
