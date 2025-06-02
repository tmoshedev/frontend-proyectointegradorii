import { useDispatch } from 'react-redux';
/**Models */

/**Services */
import * as leadsService from '../services/leads.service';
/**Redux */
import { setLoading } from '../redux/states/loading.slice';

export function useLeads() {
  const dispatch = useDispatch();

  //POST - CHANGE LEAD STATE
  const changeState = async (business_id: string, type: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.postChangeState(business_id, type);
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
  const importLeads = async (data: any, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadsService.importLeads(data);
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

  return {
    changeState,
    updateLead,
    requirements,
    importLeads,
    storeLead,
    getLead,
    getLeadHistorial,
  };
}
