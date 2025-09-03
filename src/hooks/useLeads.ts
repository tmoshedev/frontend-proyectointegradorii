import { useDispatch } from 'react-redux';
/**Models */

/**Services */
import * as leadsService from '../services/leads.service';
/**Redux */
import { setLoading } from '../redux/states/loading.slice';
import { Lead, UserSelect2 } from '../models';

export function useLeads() {
  const dispatch = useDispatch();

  //POST - CHANGE LEAD STATE
  const postChangeEtapa = async (business_id: string, type: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.postChangeEtapa(business_id, type);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //PATCH - UPDATE LEAD
  const updateLead = async (lead_id: string, data: any, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.patchUpdateLead(lead_id, data);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //GET - REQUIREMENTS
  const requirements = async (loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.requirements();
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //POST - IMPORT LEADS
  const importLeads = async (data: any, asignarmeLead: boolean, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.importLeads(data, asignarmeLead);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //POST - STORE LEAD
  const storeLead = async (data: any, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.storeLead(data);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //GET - GET LEAD
  const getLead = async (lead_uuid: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.getLead(lead_uuid);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //GET - GET LEAD HISTORIAL
  const getLeadHistorial = async (lead_uuid: string, type: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.getLeadHistorial(lead_uuid, type);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //POST - UPDATE PROJECTS
  const updateProjects = async (lead_uuid: string, projects: any[], loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.updateProjects(lead_uuid, projects);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //POST - UPDATE LABELS
  const updateLabels = async (lead_uuid: string, labels: any[], loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.updateLabels(lead_uuid, labels);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateChannels = async (lead_uuid: string, channel_ids: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.updateChannels(lead_uuid, channel_ids);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //PATCH - UPDATE LEAD VALUE
  const updateLeadValue = async (
    lead_id: string,
    name: string,
    value: string,
    loading: boolean
  ) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.updateLeadValue(lead_id, name, value);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //GET - LEADS DISTRIBUTION
  const getDistribucion = async (loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.getDistribucion();
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //POST - LEAD DISTRIBUTION
  const postDistribuirLeads = async (
    type: string,
    leads: Lead[],
    usuarios: UserSelect2[],
    typeUsuario: string,
    loading: boolean
  ) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.postDistribuirLeads(type, leads, usuarios, typeUsuario);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //PATCH - UPDATE LEAD ASSIGNED TO
  const updateLeadAsesor = async (lead_uuid: string, assigned_to: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.updateLeadAsesor(lead_uuid, assigned_to);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //PATCH - CHANGE FINAL STATE
  const changeEstadoFinal = async (id: string, estado_final: string, loading: boolean, nota: string) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.changeEstadoFinal(id, estado_final, nota);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //GET - LIST LEADS
  const getLeads = async (
  user_ids: string, channel_ids: string, lead_label_ids: string, stage_ids: string, project_ids: string, activity_expiration_ids: string, lead_campaign_names: string, estado_final: string, text: string, limit: number, page: number, loading: boolean  ) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.getLeads(
        user_ids,
        channel_ids,
        lead_label_ids,
        stage_ids,
        project_ids,
        activity_expiration_ids,
        lead_campaign_names,
        estado_final,
        text,
        limit,
        page
      );
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //PATCH - CHANGE INTEREST LEVEL
  const changeNivelInteres = async (uuid: string, nivel_interes: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.changeNivelInteres(uuid, nivel_interes);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    postChangeEtapa,
    updateLead,
    requirements,
    importLeads,
    storeLead,
    getLead,
    getLeadHistorial,
    updateProjects,
    updateLabels,
    updateLeadValue,
    getDistribucion,
    postDistribuirLeads,
    updateLeadAsesor,
    changeEstadoFinal,
    getLeads,
    updateChannels,
    changeNivelInteres,
  };
}
