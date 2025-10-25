import type { PdfTemplate } from '../models';
import apiInstance from './api';

export const getPdfTemplates = async (type: string) => {
  const rolActual = localStorage.getItem('rolActual');
  const response = await apiInstance.get(`/pdf-templates?rolActual=${rolActual}&type=${type}`);
  return response;
};

export const storePdfTemplate = async (pdfTemplate: any) => {
  const rolActual = localStorage.getItem('rolActual');
  const response = await apiInstance.post(`/pdf-templates?rolActual=${rolActual}`, {
    pdf_template: pdfTemplate,
  });
  return response;
};

export const updatePdfTemplate = async (pdfTemplate: PdfTemplate) => {
  const rolActual = localStorage.getItem('rolActual');
  const response = await apiInstance.patch(
    `/pdf-templates/${pdfTemplate.uuid}?rolActual=${rolActual}`,
    {
      pdf_template: pdfTemplate,
    }
  );
  return response;
};
