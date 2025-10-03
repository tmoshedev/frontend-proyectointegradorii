/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ErrorBackend, SweetAlert } from '../../utilities';
import PageHeaderComponent from '../../components/page/page-hader.component';
import { useChangePassword } from '../../hooks';
import { AppStore } from '../../redux/store';
import { PasswordCodeRequestPayload } from '../../services/auth.service';

const maskEmail = (email: string) => {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const visible = user.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(user.length - 2, 3))}@${domain}`;
};

const maskPhone = (phone?: string) => {
  if (!phone) return '';
  if (phone.length <= 4) return phone;
  const visible = phone.slice(-4);
  return `${'*'.repeat(Math.max(phone.length - 4, 4))}${visible}`;
};

const formatSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remaining = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
};

export type VerificationMethod = 'primary_email' | 'phone' | 'alternate_email';

interface ContactOption {
  id: VerificationMethod;
  label: string;
  helper: string;
}

export const ChangePasswordPage = () => {
  const { sendVerificationCode, updatePassword } = useChangePassword();
  const authUser = useSelector((store: AppStore) => store.auth.user);

  const primaryEmail = authUser?.email ?? '';
  const phone = (authUser as any)?.cellphone || (authUser as any)?.phone || '';

  const defaultMethod: VerificationMethod = useMemo(() => {
    if (primaryEmail) return 'primary_email';
    if (phone) return 'phone';
    return 'alternate_email';
  }, [primaryEmail, phone]);

  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod>(defaultMethod);
  const [alternateEmail, setAlternateEmail] = useState('');
  const [verificationStep, setVerificationStep] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [challengeId, setChallengeId] = useState('');
  const [destinationMask, setDestinationMask] = useState('');
  const [secondsToResend, setSecondsToResend] = useState(0);
  const [lastRequest, setLastRequest] = useState<PasswordCodeRequestPayload | null>(null);

  const [code, setCode] = useState('');
  const [formData, setFormData] = useState({
    password_current: '',
    password: '',
    password_confirmation: '',
    logout_others: true,
  });

  useEffect(() => {
    setSelectedMethod(defaultMethod);
  }, [defaultMethod]);

  useEffect(() => {
    if (secondsToResend <= 0) return;
    const timer = setTimeout(() => {
      setSecondsToResend((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [secondsToResend]);

  const contactOptions: ContactOption[] = useMemo(() => {
    const options: ContactOption[] = [];
    if (primaryEmail) {
      options.push({
        id: 'primary_email',
        label: 'Correo principal',
        helper: `Enviaremos el código a ${maskEmail(primaryEmail)}`,
      });
    }

    if (phone) {
      options.push({
        id: 'phone',
        label: 'Número registrado',
        helper: `Recibirás un SMS o WhatsApp en ${maskPhone(phone)}`,
      });
    }

    options.push({
      id: 'alternate_email',
      label: 'Usar otro correo temporal',
      helper: 'Enviaremos el código solo por esta vez a un correo diferente.',
    });

    return options;
  }, [primaryEmail, phone]);

  const handleInputPasswords = (event: ChangeEvent<HTMLInputElement>) => {
    setErrors((prev: any) => ({ ...prev, [event.target.name]: undefined }));
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleAlternateEmail = (event: ChangeEvent<HTMLInputElement>) => {
    setErrors((prev: any) => ({ ...prev, alternate_email: undefined }));
    setAlternateEmail(event.target.value);
  };

  const handleToggleLogoutOthers = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, logout_others: event.target.checked });
  };

  const validateAlternateEmail = () => {
    if (selectedMethod !== 'alternate_email') return true;
    const emailRegex = /^(?:[a-zA-Z0-9_'^&/+-])+(?:\.(?:[a-zA-Z0-9_'^&/+-])+)*@(?:(?:[a-zA-Z0-9-])+\.)+[a-zA-Z]{2,}$/;
    if (!alternateEmail || !emailRegex.test(alternateEmail)) {
      setErrors({ alternate_email: ['Ingresa un correo electrónico válido.'] });
      return false;
    }
    return true;
  };

  const handleSendCode = async () => {
    setErrors({});

    if (selectedMethod === 'primary_email' && !primaryEmail) {
      SweetAlert.warning('Seguridad', 'No encontramos un correo principal registrado.');
      return;
    }

    if (selectedMethod === 'phone' && !phone) {
      SweetAlert.warning('Seguridad', 'No encontramos un número registrado.');
      return;
    }

    if (!validateAlternateEmail()) {
      return;
    }

    const payload: PasswordCodeRequestPayload = {
      channel: selectedMethod,
      ...(selectedMethod === 'alternate_email' ? { alternate_email: alternateEmail } : {}),
    };

    const response = await sendVerificationCode(payload);
    if (response.ok && response.data) {
      setVerificationStep(true);
      setChallengeId(response.data.challenge_id);
      setDestinationMask(response.data.destination_mask ?? response.data.masked_destination ?? '');
      setSecondsToResend(response.data.expires_in || 60);
      setLastRequest(payload);
      setCode('');
    } else if (response.errors) {
      setErrors(response.errors);
    }
  };

  const handleResendCode = async () => {
    if (!lastRequest || secondsToResend > 0) return;
    const response = await sendVerificationCode(lastRequest);
    if (response.ok && response.data) {
      setChallengeId(response.data.challenge_id);
      setDestinationMask(response.data.destination_mask ?? response.data.masked_destination ?? '');
      setSecondsToResend(response.data.expires_in || 60);
      setCode('');
    } else if (response.errors) {
      setErrors(response.errors);
    }
  };

  const handleBackToMethods = () => {
    setVerificationStep(false);
    setChallengeId('');
    setDestinationMask('');
    setSecondsToResend(0);
    setLastRequest(null);
    setCode('');
    setFormData({
      password_current: '',
      password: '',
      password_confirmation: '',
      logout_others: true,
    });
  };

  const handleSubmitChange = async () => {
    setErrors({});

    if (!challengeId) {
      SweetAlert.warning('Validación', 'Primero solicita el código de seguridad.');
      return;
    }

    if (!code) {
      setErrors({ code: ['Ingresa el código recibido.'] });
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: ['Las contraseñas no coinciden.'] });
      return;
    }

    const payload = {
      challenge_id: challengeId,
      code,
      password_current: formData.password_current,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
      logout_others: formData.logout_others,
    };

    const response = await updatePassword(payload);
    if (!response.ok && response.errors) {
      setErrors(response.errors);
    }
  };

  const hasError = (field: string) => errors && errors[field];

  return (
    <div className="main-content app-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <PageHeaderComponent
                state={{
                  page: {
                    title: 'Cambiar contraseña',
                    model: 'classrooms',
                    buttons: {
                      create: false,
                      edit: false,
                      destroy: false,
                      import: false,
                      export: false,
                    },
                  },
                }}
                onModalResource={() => null}
              />
              <div className="card-body pt-1">
                {!verificationStep && (
                  <div className="row g-4">
                    <div className="col-12">
                      <p className="text-muted mb-3">
                        Por seguridad, antes de cambiar tu contraseña debemos confirmar que eres tú.
                        Elige dónde quieres recibir tu código temporal.
                      </p>
                    </div>
                    {contactOptions.map((option) => (
                      <div className="col-md-4" key={option.id}>
                        <div className={`custom-option ${selectedMethod === option.id ? 'active' : ''}`}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="verification-method"
                              id={`method-${option.id}`}
                              value={option.id}
                              checked={selectedMethod === option.id}
                              onChange={() => setSelectedMethod(option.id)}
                            />
                            <label className="form-check-label fw-semibold" htmlFor={`method-${option.id}`}>
                              {option.label}
                            </label>
                          </div>
                          <small className="text-muted d-block mt-2">{option.helper}</small>
                          {option.id === 'alternate_email' && selectedMethod === 'alternate_email' && (
                            <div className="mt-3">
                              <label className="form-label" htmlFor="alternate_email">
                                Correo alternativo
                              </label>
                              <input
                                id="alternate_email"
                                type="email"
                                className={`form-control form-control-sm${
                                  hasError('alternate_email') ? ' is-invalid' : ''
                                }`}
                                autoComplete="off"
                                value={alternateEmail}
                                onChange={handleAlternateEmail}
                                placeholder="tucorreo@ejemplo.com"
                              />
                              <ErrorBackend errorsBackend={errors} name="alternate_email" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="col-12 text-end">
                      <button className="btn btn-primary" type="button" onClick={handleSendCode}>
                        Enviar código de seguridad
                      </button>
                    </div>
                  </div>
                )}

                {verificationStep && (
                  <div className="row g-4">
                    <div className="col-lg-4">
                      <div className="alert alert-info">
                        <h6 className="alert-heading mb-2">Revisa tu bandeja</h6>
                        <p className="mb-0">
                          Enviamos un código temporal a <strong>{destinationMask}</strong>.
                          <br />
                          Ingresa el código a continuación para continuar.
                        </p>
                      </div>
                      <button className="btn btn-link px-0" type="button" onClick={handleBackToMethods}>
                        Usar otro método de verificación
                      </button>
                    </div>
                    <div className="col-lg-8">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label" htmlFor="verification_code">
                            Código de seguridad
                          </label>
                          <input
                            id="verification_code"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            className={`form-control form-control-sm${
                              hasError('code') ? ' is-invalid' : ''
                            }`}
                            placeholder="Ingresa el código"
                            value={code}
                            onChange={(event) => {
                              const sanitized = event.target.value.replace(/[^0-9A-Za-z]/g, '');
                              setCode(sanitized);
                              setErrors((prev: any) => ({ ...prev, code: undefined }));
                            }}
                          />
                          <ErrorBackend errorsBackend={errors} name="code" />
                          <div className="d-flex align-items-center mt-2 gap-2">
                            <button
                              className="btn btn-link px-0"
                              type="button"
                              onClick={handleResendCode}
                              disabled={secondsToResend > 0}
                            >
                              Reenviar código
                            </button>
                            {secondsToResend > 0 && (
                              <small className="text-muted">
                                Podrás reenviar en {formatSeconds(secondsToResend)}
                              </small>
                            )}
                          </div>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label" htmlFor="password_current">
                            Contraseña actual
                          </label>
                          <input
                            id="password_current"
                            name="password_current"
                            type="password"
                            autoComplete="off"
                            className={`form-control form-control-sm${
                              hasError('password_current') ? ' is-invalid' : ''
                            }`}
                            value={formData.password_current}
                            onChange={handleInputPasswords}
                          />
                          <ErrorBackend errorsBackend={errors} name="password_current" />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label" htmlFor="password">
                            Contraseña nueva
                          </label>
                          <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="off"
                            className={`form-control form-control-sm${
                              hasError('password') ? ' is-invalid' : ''
                            }`}
                            value={formData.password}
                            onChange={handleInputPasswords}
                          />
                          <ErrorBackend errorsBackend={errors} name="password" />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label" htmlFor="password_confirmation">
                            Confirmar contraseña nueva
                          </label>
                          <input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            autoComplete="off"
                            className={`form-control form-control-sm${
                              hasError('password_confirmation') ? ' is-invalid' : ''
                            }`}
                            value={formData.password_confirmation}
                            onChange={handleInputPasswords}
                          />
                          <ErrorBackend errorsBackend={errors} name="password_confirmation" />
                        </div>
                        <div className="col-md-12">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="logout_others"
                              checked={formData.logout_others}
                              onChange={handleToggleLogoutOthers}
                            />
                            <label className="form-check-label" htmlFor="logout_others">
                              Cerrar sesión en todos mis dispositivos
                            </label>
                          </div>
                          <small className="text-muted d-block mt-1">
                            Recomendado si usaste tu cuenta en computadoras compartidas.
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="card-footer text-center">
                {!verificationStep ? (
                  <p className="mb-0 text-muted">
                    Después de enviar el código, podrás definir una nueva contraseña segura.
                  </p>
                ) : (
                  <button onClick={handleSubmitChange} className="btn btn-primary">
                    Actualizar contraseña
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
