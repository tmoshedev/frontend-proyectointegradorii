import { useDispatch } from 'react-redux';
/**Models */
/**Services */
import * as calendarioActividadesService from '../services/calendario-actividades.service';
/**Redux */
import { setLoading } from '../redux/states/loading.slice';
import { FormLeadActividadRequest } from '../models/requests';

export function useCalendarioActividades() {
  const dispatch = useDispatch();

  //GET - Agenda Diaria
  const getAgendaDiaria = async (fecha: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await calendarioActividadesService.getAgendaDiaria(fecha);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //POST - Lead Actividad
  const postLeadActividad = async (actividad: FormLeadActividadRequest, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await calendarioActividadesService.postLeadActividad(actividad);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //POST - Actividad Completada
  const postActividadCompletada = async (uuid: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await calendarioActividadesService.postActividadCompletada(uuid);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //POST - Cancelar Actividad
  const postCancelarActividad = async (
    lead_activity_uuid: string,
    motive: string,
    loading: boolean
  ) => {
    dispatch(setLoading(loading));
    try {
      const response = await calendarioActividadesService.postCancelarActividad(
        lead_activity_uuid,
        motive
      );
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //GET - Mi Calendario
  const getMiCalendario = async (date_start: string, date_end: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await calendarioActividadesService.getMiCalendario(date_start, date_end);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    getAgendaDiaria,
    postLeadActividad,
    postActividadCompletada,
    postCancelarActividad,
    getMiCalendario,
  };
}
