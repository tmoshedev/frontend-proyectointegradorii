/* eslint-disable @typescript-eslint/no-explicit-any */

import { AccessUser, Person } from '../../../../models';
/**Validations */
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ErrorBackend, ErrorValidate, SweetAlert } from '../../../../utilities';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  sendContactVerificationCode,
  verifyContactVerificationCode,
} from '../../../../services/access-users.service';
/**Select */
import Select from 'react-select';
/**Moment */
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/l10n/es';

interface Props {
  data: any;
  storeAccessUser: any;
  updateAccessUser: any;
  findPerson: (document_number: string, loanding: boolean) => any;
  findUbigeo: (text: string, loanding: boolean) => any;
}
interface OptionSelect {
  label: string;
  value: string;
}

const formatSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remaining = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
};

const sanitizePhone = (phone?: string) => (phone ? phone.replace(/[^0-9]/g, '') : '');

const DEFAULT_COUNTRY_CODE = '+51';
const LOCAL_PHONE_LENGTH = 9;

const splitPhoneValue = (phone?: string) => {
  const digits = sanitizePhone(phone);
  if (!digits) {
    return { countryCode: DEFAULT_COUNTRY_CODE, localNumber: '' };
  }

  if (digits.length > LOCAL_PHONE_LENGTH) {
    const localNumber = digits.slice(-LOCAL_PHONE_LENGTH);
    const countryCodeDigits = digits.slice(0, digits.length - LOCAL_PHONE_LENGTH);
    const countryCode = countryCodeDigits ? `+${countryCodeDigits}` : DEFAULT_COUNTRY_CODE;
    return { countryCode, localNumber };
  }

  return { countryCode: DEFAULT_COUNTRY_CODE, localNumber: digits };
};

const buildPhoneWithCountry = (countryCode: string, localNumber: string) => {
  const codeDigits = sanitizePhone(countryCode);
  const localDigits = sanitizePhone(localNumber);
  return `${codeDigits}${localDigits}`;
};

const COUNTRY_CODE_OPTIONS = [
  { value: '+51', label: 'Perú (+51)' },
  { value: '+52', label: 'México (+52)' },
  { value: '+54', label: 'Argentina (+54)' },
  { value: '+56', label: 'Chile (+56)' },
  { value: '+57', label: 'Colombia (+57)' },
  { value: '+58', label: 'Venezuela (+58)' },
  { value: '+1', label: 'Estados Unidos (+1)' },
  { value: '+34', label: 'España (+34)' },
];

interface VerificationState {
  sent: boolean;
  verified: boolean;
  seconds: number;
  verificationId?: string;
}

export const AccessUserFormComponent = (props: Props) => {
  const [isLoadingDomilicio, setIsLoadingDomilicio] = useState(false);
  const [optionsDomilicio, setOptionsDominilio] = useState<OptionSelect[]>([]);
  const [errors, setErrors] = useState<any>({});

  const phoneFromRow = props.data.row?.cellphone;
  const countryCodeFromRow = props.data.row?.cellphone_country_code;
  const splitPhone = useMemo(() => splitPhoneValue(phoneFromRow), [phoneFromRow]);
  const derivedLocalPhone = splitPhone.localNumber;
  const derivedCountryCode = countryCodeFromRow
    ? countryCodeFromRow.startsWith('+')
      ? countryCodeFromRow
      : `+${sanitizePhone(countryCodeFromRow)}`
    : splitPhone.countryCode;

  const initialFormData = useMemo<AccessUser>(() => {
    if (props.data.row) {
      const normalizedEmail = (props.data.row.email ?? '').trim().toLowerCase();

      return {
        ...props.data.row,
        email: normalizedEmail,
        cellphone: derivedLocalPhone,
        cellphone_country_code:
          props.data.row.cellphone_country_code ?? derivedCountryCode,
        email_verified: Boolean(props.data.row.email_verified),
        cellphone_verified: Boolean(props.data.row.cellphone_verified),
        selectedUbigeoDomilicio:
          props.data.row.selectedUbigeoDomilicio ?? { label: 'Buscar city...', value: '' },
        roles: props.data.row.roles ?? [],
      };
    }

    return {
      document_number: '',
      names: '',
      father_last_name: '',
      mother_last_name: '',
      cellphone: '',
      cellphone_country_code: DEFAULT_COUNTRY_CODE,
      role_id: '',
      email: '',
      email_verified: false,
      cellphone_verified: false,
      ubigeo_domicilio: '',
      address: '',
      birth_date: '',
      gender: '',
      selectedUbigeoDomilicio: { label: 'Buscar city...', value: '' },
      roles: [],
    };
  }, [props.data.row, props.data.type, derivedLocalPhone]);

  const initialEmail = (initialFormData.email ?? '').trim().toLowerCase();
  const initialEmailVerified = props.data.type === 'edit' && Boolean(initialFormData.email_verified);
  const [emailVerification, setEmailVerification] = useState<VerificationState>({
    sent: false,
    verified: initialEmailVerified,
    seconds: 0,
    verificationId: undefined,
  });
  const [emailCode, setEmailCode] = useState('');
  const [lastVerifiedEmail, setLastVerifiedEmail] = useState(
    initialEmailVerified ? initialEmail : ''
  );

  const [phoneCountryCode, setPhoneCountryCode] = useState(derivedCountryCode);
  const initialPhoneDigits = buildPhoneWithCountry(derivedCountryCode, derivedLocalPhone);
  const initialPhoneVerified = props.data.type === 'edit' && Boolean(initialFormData.cellphone_verified);
  const [phoneVerification, setPhoneVerification] = useState<VerificationState>({
    sent: false,
    verified: initialPhoneVerified,
    seconds: 0,
    verificationId: undefined,
  });
  const [phoneCode, setPhoneCode] = useState('');
  const [lastVerifiedPhone, setLastVerifiedPhone] = useState(
    initialPhoneVerified ? initialPhoneDigits : ''
  );

  const getValidationSchema = (type: string) => {
    return Yup.object({
      document_number: Yup.string().required('El número de documento es obligatorio'),
      names: Yup.string().required('El nombre es obligatorio'),
      father_last_name: Yup.string().required('El apellido paterno es obligatorio'),
      mother_last_name: Yup.string().required('El apellido materno es obligatorio'),
      email: Yup.string().email('Ingresa un correo válido').required('El correo es obligatorio'),
      role_id: type === 'store' ? Yup.string().required('El rol es obligatorio') : Yup.string(),
    });
  };

  const formik = useFormik<AccessUser>({
    initialValues: initialFormData,
    enableReinitialize: true,
    validationSchema: getValidationSchema(props.data.type),
    onSubmit: async () => {
      const normalizedEmail = (formik.values.email ?? '').trim().toLowerCase();
      const localPhone = sanitizePhone(formik.values.cellphone);
      const fullPhoneWithCountry = buildPhoneWithCountry(phoneCountryCode, formik.values.cellphone ?? '');

      const emailVerifiedForSubmit =
        emailVerification.verified && normalizedEmail === lastVerifiedEmail;
      if (!emailVerifiedForSubmit) {
        SweetAlert.warning(
          'Validación',
          'Debes verificar el correo electrónico antes de continuar.'
        );
        return;
      }

      const phoneVerifiedForSubmit =
        !localPhone ||
        (phoneVerification.verified && fullPhoneWithCountry === lastVerifiedPhone);
      if (!phoneVerifiedForSubmit) {
        SweetAlert.warning(
          'Validación',
          'Debes verificar el número de celular antes de continuar.'
        );
        return;
      }

      const payload: AccessUser = {
        ...formik.values,
        email: normalizedEmail,
        cellphone: fullPhoneWithCountry,
        email_verified: emailVerifiedForSubmit,
        cellphone_verified:
          Boolean(localPhone) &&
          phoneVerification.verified &&
          fullPhoneWithCountry === lastVerifiedPhone,
        email_verification_id: emailVerifiedForSubmit
          ? emailVerification.verificationId
          : undefined,
        cellphone_verification_id:
          Boolean(localPhone) &&
          phoneVerification.verified &&
          fullPhoneWithCountry === lastVerifiedPhone
            ? phoneVerification.verificationId
            : undefined,
        // Este campo adicional permite conservar el prefijo elegido en el backend si está soportado.
        cellphone_country_code: phoneCountryCode,
      };

      setErrors({});

      try {
        if (props.data.type === 'store') {
          await props.storeAccessUser(payload);
          SweetAlert.success('Mensaje', 'Usuario creado correctamente.');
        } else {
          await props.updateAccessUser(payload);
          SweetAlert.success('Mensaje', 'Usuario actualizado correctamente.');
        }
        props.data.onCloseModalForm();
      } catch (error: any) {
        setErrors(error?.response?.data?.errors ?? {});
      }
    },
  });

  const normalizedEmailCurrent = (formik.values.email ?? '').trim().toLowerCase();
  const currentLocalPhone = sanitizePhone(formik.values.cellphone);
  const currentFullPhone = buildPhoneWithCountry(phoneCountryCode, formik.values.cellphone ?? '');

  const emailIsVerified =
    emailVerification.verified && normalizedEmailCurrent === lastVerifiedEmail;
  const phoneIsVerified =
    !currentLocalPhone ||
    (phoneVerification.verified && currentFullPhone === lastVerifiedPhone);

  const submitTooltip =
    props.data.type === 'store' && !emailIsVerified
      ? 'Verifica el correo del usuario para continuar'
      : props.data.type === 'store' && Boolean(currentLocalPhone) && !phoneIsVerified
      ? 'Verifica el número de celular del usuario para continuar'
      : undefined;

  const isSubmitDisabled =
    props.data.type === 'store' && (!emailIsVerified || (Boolean(currentLocalPhone) && !phoneIsVerified));

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue(event.target.name, event.target.value);
  };

  const handleInputChangeSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    formik.setFieldValue(event.target.name, event.target.value);
  };

  const onKeyUpSearchPerson = () => {
    if (formik.values.document_number.length == 8) {
      props.findPerson(formik.values.document_number, true).then((response: Person) => {
        if (response) {
          formik.setFieldValue('names', response.names);
          formik.setFieldValue('father_last_name', response.father_last_name);
          formik.setFieldValue('mother_last_name', response.mother_last_name);
          formik.setFieldValue('address', response.address);
          formik.setFieldValue('ubigeo_domicilio', response.ubigeo_id);
          formik.setFieldValue('selectedUbigeoDomilicio', response.selectedUbigeo);
          formik.setFieldValue('birth_date', response.birth_date);
          formik.setFieldValue('gender', response.sexo);
        }
      });
    }
  };

  const handleDomicilioSelectChange = (selectedOption: OptionSelect) => {
    setOptionsDominilio([]);
    formik.setFieldValue('ubigeo_domicilio', selectedOption.value);
    formik.setFieldValue('selectedUbigeoDomilicio', selectedOption);
  };

  const handleSearchDomicilio = (value: string) => {
    if (value.length >= 3) {
      props
        .findUbigeo(value, false)
        .then((response: any) => {
          setIsLoadingDomilicio(true);
          setOptionsDominilio(response.data);
        })
        .finally(() => {
          setIsLoadingDomilicio(false);
        });
    }
  };

  const handleDateChange = (date: Date[]) => {
    const birth_date = moment(date[0]).format('YYYY-MM-DD');
    formik.setFieldValue('birth_date', birth_date);
  };

  const handleSendEmailVerification = async () => {
    if (!formik.values.email) {
      SweetAlert.warning('Validación', 'Ingresa un correo electrónico.');
      return;
    }

    if (formik.errors.email) {
      SweetAlert.warning('Validación', 'Corrige el correo electrónico antes de verificar.');
      return;
    }

    try {
      const emailValue = (formik.values.email as string).trim().toLowerCase();
      formik.setFieldValue('email', emailValue, false);
      const response = await sendContactVerificationCode('email', emailValue);
      SweetAlert.success('Verificación enviada', response.message);
      setEmailVerification({
        sent: true,
        verified: false,
        seconds: response.expires_in || 60,
        verificationId: response.verification_id,
      });
      setEmailCode('');
    } catch (error: any) {
      SweetAlert.error(
        'Error',
        error.response?.data?.message || 'No se pudo enviar el código de verificación.'
      );
    }
  };

  const handleConfirmEmailVerification = async () => {
    if (!emailVerification.sent) {
      SweetAlert.warning('Validación', 'Primero solicita el código de verificación.');
      return;
    }

    if (!emailCode) {
      SweetAlert.warning('Validación', 'Ingresa el código de verificación.');
      return;
    }

    if (!emailVerification.verificationId) {
      SweetAlert.warning('Validación', 'Solicita un nuevo código antes de validar.');
      return;
    }

    try {
      const emailValue = (formik.values.email as string).trim().toLowerCase();
      formik.setFieldValue('email', emailValue, false);
      const response = await verifyContactVerificationCode(
        'email',
        emailValue,
        emailCode,
        emailVerification.verificationId
      );
      if (response.verified) {
        SweetAlert.success('Correo verificado', response.message);
        setEmailVerification({
          sent: true,
          verified: true,
          seconds: 0,
          verificationId: emailVerification.verificationId,
        });
        setLastVerifiedEmail(emailValue);
      } else {
        SweetAlert.error(
          'Verificación',
          response.message || 'El código ingresado no es válido o ha expirado.'
        );
      }
    } catch (error: any) {
      SweetAlert.error(
        'Error',
        error.response?.data?.message || 'No se pudo validar el código proporcionado.'
      );
    }
  };

  const handleSendPhoneVerification = async () => {
    const rawPhone = formik.values.cellphone?.toString().trim();
    if (!rawPhone) {
      SweetAlert.warning('Validación', 'Ingresa un número de celular.');
      return;
    }

    const sanitizedPhone = sanitizePhone(rawPhone);
    if (sanitizedPhone.length < LOCAL_PHONE_LENGTH) {
      SweetAlert.warning('Validación', 'Ingresa un número de celular válido.');
      return;
    }

    formik.setFieldValue('cellphone', sanitizedPhone, false);

    try {
      const fullPhone = buildPhoneWithCountry(phoneCountryCode, sanitizedPhone);
      const response = await sendContactVerificationCode('cellphone', fullPhone);
      SweetAlert.success('Verificación enviada', response.message);
      setPhoneVerification({
        sent: true,
        verified: false,
        seconds: response.expires_in || 60,
        verificationId: response.verification_id,
      });
      setPhoneCode('');
    } catch (error: any) {
      SweetAlert.error(
        'Error',
        error.response?.data?.message || 'No se pudo enviar el código al número proporcionado.'
      );
    }
  };

  const handleConfirmPhoneVerification = async () => {
    if (!phoneVerification.sent) {
      SweetAlert.warning('Validación', 'Primero solicita el código para el celular.');
      return;
    }

    if (!phoneCode) {
      SweetAlert.warning('Validación', 'Ingresa el código enviado al celular.');
      return;
    }

    const localPhone = sanitizePhone(formik.values.cellphone);
    if (!localPhone) {
      SweetAlert.warning('Validación', 'Ingresa un número de celular válido.');
      return;
    }

    if (!phoneVerification.verificationId) {
      SweetAlert.warning('Validación', 'Solicita un nuevo código antes de validar.');
      return;
    }

    try {
      const fullPhone = buildPhoneWithCountry(phoneCountryCode, localPhone);
      const response = await verifyContactVerificationCode(
        'cellphone',
        fullPhone,
        phoneCode,
        phoneVerification.verificationId
      );
      if (response.verified) {
        SweetAlert.success('Celular verificado', response.message);
        setPhoneVerification({
          sent: true,
          verified: true,
          seconds: 0,
          verificationId: phoneVerification.verificationId,
        });
        setLastVerifiedPhone(fullPhone);
      } else {
        SweetAlert.error(
          'Verificación',
          response.message || 'El código ingresado no es válido o ha expirado.'
        );
      }
    } catch (error: any) {
      SweetAlert.error(
        'Error',
        error.response?.data?.message || 'No se pudo validar el código del celular.'
      );
    }
  };

  useEffect(() => {
    if (!emailVerification.sent || emailVerification.seconds <= 0) return;
    const timer = setTimeout(() => {
      setEmailVerification((prev) => ({ ...prev, seconds: prev.seconds - 1 }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [emailVerification.sent, emailVerification.seconds]);

  useEffect(() => {
    const normalizedEmail = (initialFormData.email ?? '').trim().toLowerCase();
    const verified = props.data.type === 'edit' && Boolean(initialFormData.email_verified);
    setLastVerifiedEmail(verified ? normalizedEmail : '');
    setEmailVerification({ sent: false, verified, seconds: 0, verificationId: undefined });
    setEmailCode('');
  }, [
    props.data.type,
    initialFormData.email,
    initialFormData.email_verified,
  ]);

  useEffect(() => {
    if (!emailVerification.verified) return;
    const normalizedEmail = (formik.values.email ?? '').trim().toLowerCase();
    if (normalizedEmail !== lastVerifiedEmail) {
      setEmailVerification({ sent: false, verified: false, seconds: 0, verificationId: undefined });
      setEmailCode('');
    }
  }, [formik.values.email, emailVerification.verified, lastVerifiedEmail]);

  useEffect(() => {
    if (!phoneVerification.sent || phoneVerification.seconds <= 0) return;
    const timer = setTimeout(() => {
      setPhoneVerification((prev) => ({ ...prev, seconds: prev.seconds - 1 }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [phoneVerification.sent, phoneVerification.seconds]);

  useEffect(() => {
    setPhoneCountryCode(derivedCountryCode);
    const existingFullPhone = buildPhoneWithCountry(derivedCountryCode, initialFormData.cellphone ?? '');
    const verified = props.data.type === 'edit' && Boolean(initialFormData.cellphone_verified);
    setLastVerifiedPhone(verified ? existingFullPhone : '');
    setPhoneVerification({ sent: false, verified, seconds: 0, verificationId: undefined });
    setPhoneCode('');
  }, [
    props.data.type,
    derivedCountryCode,
    initialFormData.cellphone,
    initialFormData.cellphone_verified,
  ]);

  useEffect(() => {
    if (!phoneVerification.verified) return;
    const currentFullPhone = buildPhoneWithCountry(phoneCountryCode, formik.values.cellphone ?? '');
    if (currentFullPhone !== lastVerifiedPhone) {
      setPhoneVerification({ sent: false, verified: false, seconds: 0, verificationId: undefined });
      setPhoneCode('');
    }
  }, [formik.values.cellphone, phoneVerification.verified, lastVerifiedPhone, phoneCountryCode]);

  return (
    <form className="form-scrollable" onSubmit={formik.handleSubmit}>
      <div className="modal-body">
        <div className="row">
          {/* Rol */}
          {props.data.type == 'store' && (
            <div className="col-md-4 mb-3">
              <label className="form-label" htmlFor="role_id">
                Rol<span className="text-danger">*</span>
              </label>
              <select
                onChange={handleInputChangeSelect}
                value={formik.values.role_id ?? ''}
                name="role_id"
                id="role_id"
                className={
                  'form-select form-select-sm' +
                  (formik.errors.role_id && formik.touched.role_id ? ' is-invalid' : '')
                }
              >
                <option value="">Seleccionar</option>
                {props.data.requirements?.roles?.map((role: any) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <ErrorValidate state={formik.errors.role_id} />
            </div>
          )}
          {/* Número de documento */}
          <div className="col-md-4 mb-3">
            <label className="form-label" htmlFor="document_number">
              Número de documento<span className="text-danger">*</span>
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              onKeyUp={onKeyUpSearchPerson}
              value={formik.values.document_number ?? ''}
              name="document_number"
              id="document_number"
              type="text"
              className={
                'todo-mayuscula form-control form-control-sm' +
                (formik.errors.document_number && formik.touched.document_number
                  ? ' is-invalid'
                  : '')
              }
            />
            <ErrorValidate state={formik.errors.document_number} />
          </div>
          {/* Nombres */}
          <div className="col-md-4 mb-3">
            <label className="form-label" htmlFor="names">
              Nombres<span className="text-danger">*</span>
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.names ?? ''}
              name="names"
              id="names"
              type="text"
              className={
                'todo-mayuscula form-control form-control-sm' +
                (formik.errors.names && formik.touched.names ? ' is-invalid' : '')
              }
            />
            <ErrorValidate state={formik.errors.names} />
            <ErrorBackend errorsBackend={errors} name="user" />
          </div>
          {/* Correo electrónico */}
          <div className="col-md-4 mb-3">
            <label className="form-label" htmlFor="email">
              Correo electrónico<span className="text-danger">*</span>
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.email ?? ''}
              name="email"
              id="email"
              type="email"
              className={
                'form-control form-control-sm' +
                (formik.errors.email && formik.touched.email ? ' is-invalid' : '')
              }
            />
            <ErrorValidate state={formik.errors.email} />
            <ErrorBackend errorsBackend={errors} name="email" />
            <div className="d-flex align-items-center gap-2 mt-2 flex-wrap">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={handleSendEmailVerification}
                disabled={
                  emailVerification.sent && emailVerification.seconds > 0 && !emailVerification.verified
                }
              >
                {emailVerification.sent ? 'Reenviar código' : 'Enviar código'}
              </button>
              {emailVerification.sent && !emailVerification.verified && (
                <small className="text-muted">
                  Podrás reenviar en {formatSeconds(emailVerification.seconds)}
                </small>
              )}
              {emailIsVerified && <span className="badge bg-success">Correo verificado</span>}
            </div>
            {emailVerification.sent && !emailVerification.verified && (
              <div className="mt-2">
                <label className="form-label" htmlFor="email_code">
                  Código de verificación
                </label>
                <div className="input-group input-group-sm">
                  <input
                    id="email_code"
                    type="text"
                    className="form-control"
                    value={emailCode}
                    maxLength={6}
                    onChange={(event) =>
                      setEmailCode(event.target.value.replace(/[^0-9A-Za-z]/g, ''))
                    }
                    placeholder="Código recibido"
                  />
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleConfirmEmailVerification}
                  >
                    Validar
                  </button>
                </div>
              </div>
            )}
            {props.data.type === 'store' && !emailIsVerified && (
              <small className="text-muted d-block mt-2">
                Necesitamos confirmar el correo antes de crear la cuenta.
              </small>
            )}
          </div>
          {/* Apellido paterno */}
          <div className="col-md-4 mb-3">
            <label className="form-label" htmlFor="father_last_name">
              Apellido paterno<span className="text-danger">*</span>
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.father_last_name ?? ''}
              name="father_last_name"
              id="father_last_name"
              type="text"
              className={
                'todo-mayuscula form-control form-control-sm' +
                (formik.errors.father_last_name && formik.touched.father_last_name
                  ? ' is-invalid'
                  : '')
              }
            />
            <ErrorValidate state={formik.errors.father_last_name} />
          </div>
          {/* Apellido materno */}
          <div className="col-md-4 mb-3">
            <label className="form-label" htmlFor="mother_last_name">
              Apellido materno<span className="text-danger">*</span>
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.mother_last_name ?? ''}
              name="mother_last_name"
              id="mother_last_name"
              type="text"
              className={
                'todo-mayuscula form-control form-control-sm' +
                (formik.errors.mother_last_name && formik.touched.mother_last_name
                  ? ' is-invalid'
                  : '')
              }
            />
            <ErrorValidate state={formik.errors.mother_last_name} />
          </div>
          {/* Celular */}
          <div className="col-md-4 mb-3">
            <label className="form-label" htmlFor="cellphone">
              Celular
            </label>
            <div className="input-group input-group-sm">
              <select
                className="form-select form-select-sm flex-shrink-0"
                style={{ maxWidth: '120px' }}
                value={phoneCountryCode}
                onChange={(event) => {
                  const value = event.target.value;
                  setPhoneCountryCode(value);
                  formik.setFieldValue('cellphone_country_code', value, false);
                }}
              >
                {COUNTRY_CODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                autoComplete="off"
                onChange={handleInputChange}
                value={formik.values.cellphone ?? ''}
                name="cellphone"
                id="cellphone"
                type="text"
                className="form-control"
                placeholder="Número sin prefijo"
              />
            </div>
            <ErrorBackend errorsBackend={errors} name="cellphone" />
            <div className="d-flex align-items-center gap-2 mt-2 flex-wrap">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={handleSendPhoneVerification}
                disabled={
                  !formik.values.cellphone ||
                  (phoneVerification.sent && phoneVerification.seconds > 0 && !phoneVerification.verified)
                }
              >
                {phoneVerification.sent ? 'Reenviar código' : 'Enviar código'}
              </button>
              {phoneVerification.sent && !phoneVerification.verified && (
                <small className="text-muted">
                  Podrás reenviar en {formatSeconds(phoneVerification.seconds)}
                </small>
              )}
              {phoneIsVerified && <span className="badge bg-success">Celular verificado</span>}
            </div>
            {phoneVerification.sent && !phoneVerification.verified && (
              <div className="mt-2">
                <label className="form-label" htmlFor="cellphone_code">
                  Código de verificación
                </label>
                <div className="input-group input-group-sm">
                  <input
                    id="cellphone_code"
                    type="text"
                    className="form-control"
                    value={phoneCode}
                    maxLength={6}
                    onChange={(event) =>
                      setPhoneCode(event.target.value.replace(/[^0-9A-Za-z]/g, ''))
                    }
                    placeholder="Código recibido"
                  />
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleConfirmPhoneVerification}
                  >
                    Validar
                  </button>
                </div>
              </div>
            )}
            {props.data.type === 'store' && Boolean(currentLocalPhone) && !phoneIsVerified && (
              <small className="text-muted d-block mt-2">
                Verifica el celular para habilitar la creación del usuario.
              </small>
            )}
          </div>
          {/* city de domicilio [city / Provincia / Departamento] */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="student_ubigeo_domicilio">
              city de domicilio [city / Provincia / Departamento]
            </label>
            <Select
              name="student_ubigeo_domicilio"
              id="student_ubigeo_domicilio"
              isLoading={isLoadingDomilicio}
              placeholder={'Buscar city...'}
              options={optionsDomilicio}
              noOptionsMessage={() => 'No se encontraron resultados'}
              value={formik.values.selectedUbigeoDomilicio}
              onChange={(selectedOption) => handleDomicilioSelectChange(selectedOption)}
              onInputChange={handleSearchDomicilio}
            />
          </div>
          {/* Domicilio */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="address">
              Domicilio
            </label>
            <input
              autoComplete="off"
              onChange={handleInputChange}
              value={formik.values.address ?? ''}
              name="address"
              id="address"
              type="text"
              className="todo-mayuscula form-control form-control-sm"
            />
          </div>
          {/* Fecha de nacimiento */}
          <div className="col-md-4 mb-3">
            <label className="form-label" htmlFor="birth_date">
              Fecha de nacimiento
            </label>
            <Flatpickr
              name="student_birth_date"
              id="student_birth_date"
              value={formik.values.birth_date}
              onChange={handleDateChange}
              className="form-control form-control-sm"
              options={{
                dateFormat: 'Y-m-d',
                locale: 'es',
              }}
            />
          </div>
          {/* Género */}
          <div className="col-md-4 mb-3">
            <label className="form-label" htmlFor="gender">
              Género
            </label>
            <select
              onChange={handleInputChangeSelect}
              value={formik.values.gender ?? ''}
              name="gender"
              id="gender"
              className="form-select form-select-sm"
            >
              <option value="">Seleccionar</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
            </select>
          </div>
          <div className="col-md-12 mt-2" style={{ fontSize: '10px' }}>
            <span className="text-danger">*</span>
            <span>Campos obligatorios</span>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-light btn-sm"
          data-bs-dismiss="modal"
          onClick={props.data.onCloseModalForm}
        >
          Cerrar
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={isSubmitDisabled}
          title={submitTooltip}
        >
          {props.data.buttonSubmit}
        </button>
      </div>
    </form>
  );
};

export default AccessUserFormComponent;
