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

  const stateCampaign = async (id: string) => {
    dispatch(setLoading(true));
    try {
      const response = await campaignsService.stateCampaign(id);
      dispatch(dataTable_updateResource(response.campaign));
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getRequirements = async (loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await campaignsService.getCampaignRequirements();
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    return () => {
      dispatch(dataTable_clearAll());
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
