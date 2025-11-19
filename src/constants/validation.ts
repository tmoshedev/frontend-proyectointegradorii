export const FIELD_LIMITS = {
  label: {
    name: 20,
  },
  project: {
    name: 40,
  },
  lead: {
    documentNumber: 8,
    names: 50,
    lastNames: 50,
    cellphone: 15,
    city: 40,
    campaignCode: 20,
  },
};

export const getMaxLengthMessage = (label: string, limit: number) =>
  `Máximo ${limit} caracteres para ${label}.`;

export const sanitizeCellphoneValue = (value: string, maxLength = FIELD_LIMITS.lead.cellphone) => {
  if (!value) return '';
  const allowedChars = value.replace(/[^0-9+]/g, '');
  let sanitized = '';
  for (const char of allowedChars) {
    if (char === '+') {
      if (sanitized.length === 0) {
        sanitized += char;
      }
    } else {
      sanitized += char;
    }
  }
  return sanitized.slice(0, maxLength);
};

export const normalizeCellphoneForComparison = (value: string) => {
  if (!value) return '';
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.startsWith('51') && digitsOnly.length > 9) {
    return digitsOnly.slice(2);
  }
  return digitsOnly;
};
