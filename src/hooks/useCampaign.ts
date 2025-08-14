import { useDispatch } from 'react-redux';
/** Services */
import * as campaignsService from '../services/campaign.service';
/** Redux */
import { setLoading } from '../redux/states/loading.slice';
import {
  dataTable_addResource,
  dataTable_clearAll,
  dataTable_setAlls,
  dataTable_updateResource,
} from '../redux/states/dataTable.slice';
import { useEffect } from 'react';
import { Campaign } from '../models';

export function useCampaigns() {
  const dispatch = useDispatch();

  const getCampaigns = async (
    channel_id: string,
    text: string,
    type: string,
    page: number,
    limit: string,
    orderBy: string,
    order: string,
    loading: boolean,
    updateTable: boolean = false
  ) => {
    dispatch(setLoading(loading));
    try {
      const response = await campaignsService.getCampaigns(
        channel_id,
        text,
        type,
        page,
        limit,
        orderBy,
        order
        
      );

      if (updateTable) {
        dispatch(dataTable_setAlls(response));
      }

      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

//STORE
  const storeCampaign = async (campaign: Campaign) => {
    dispatch(setLoading(true));
    try {
      const response = await campaignsService.storeCampaign(campaign);
      dispatch(dataTable_addResource(response.campaign));
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //UPDATE
  const updateCampaign = async (campaign: Campaign) => {
    dispatch(setLoading(true));
    try {
      const response = await campaignsService.updateCampaign(campaign);
      dispatch(dataTable_updateResource(response.campaign));
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const stateCampaign = async (campaign: Campaign) => {
    dispatch(setLoading(true));
    try {
      const response = await campaignsService.stateCampaign(campaign);
      dispatch(dataTable_updateResource(response.campaign));
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getRequirements = async (loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await campaignsService.getRequirements();
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

useEffect(() => {
    const resetData = () => {
      dispatch(dataTable_clearAll());
    };

    return () => {
      resetData(); // Esto se ejecutará cuando el componente se desmonte
    };
  }, []);

  return {
    getCampaigns,
    storeCampaign,
    updateCampaign,
    stateCampaign,
    getRequirements,
  };
}
