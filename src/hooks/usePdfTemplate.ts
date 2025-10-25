import { useDispatch } from 'react-redux';
/**Models */

/**Services */
import * as pdfTemplatesService from '../services/pdf-templates.service';
/**Redux */
import { setLoading } from '../redux/states/loading.slice';
import type { PdfTemplate } from '../models';

export function usePdfTemplates() {
  const dispatch = useDispatch();

  //GET - LISTADO DE PDF TEMPLATE
  const getPdfTemplates = async (type: string, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await pdfTemplatesService.getPdfTemplates(type);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //POST - CREAR PDF TEMPLATE
  const createPdfTemplate = async (pdfTemplate: any, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await pdfTemplatesService.storePdfTemplate(pdfTemplate);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  //PATCH - ACTUALIZAR PDF TEMPLATE
  const updatePdfTemplate = async (pdfTemplate: PdfTemplate, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await pdfTemplatesService.updatePdfTemplate(pdfTemplate);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    getPdfTemplates,
    createPdfTemplate,
    updatePdfTemplate,
  };
}
