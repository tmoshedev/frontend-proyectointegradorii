import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks';
import { SweetAlert } from '../../utilities';

const TwoFactorAuthPage = () => {
  const [code, setCode] = useState('');
  const [tokenTimer, setTokenTimer] = useState(300); // 5 minutos para la validez del token
  const [resendCooldown, setResendCooldown] = useState(60); // 60 segundos de cooldown para reenviar
  const [canResend, setCanResend] = useState(false);
  const [showNewEmailInput, setShowNewEmailInput] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [resendAttempts, setResendAttempts] = useState(0);
  const MAX_RESEND_ATTEMPTS = 5;
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyTwoFactor, resendTwoFactor, changeEmailAndResend } = useLogin();

  const userId = location.state?.userId;
  const [currentEmail, setCurrentEmail] = useState(location.state?.email || '');

  useEffect(() => {
    // Temporizador para la validez del token (5 minutos)
    if (tokenTimer > 0) {
      const interval = setInterval(() => {
        setTokenTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      // Cuando el token expira, el usuario debería poder reenviar.
      setCanResend(true);
    }
  }, [tokenTimer]);

  useEffect(() => {
    // Temporizador para el cooldown del botón de reenvío (60 segundos)
    if (resendCooldown > 0) {
      const interval = setInterval(() => {
        setResendCooldown((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      // Permite reenviar cuando el cooldown ha terminado
      setCanResend(true);
    }
  }, [resendCooldown]);

  if (!userId) {
    // Si no hay userId, redirigir al login porque no se puede verificar
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length === 6) {
      const success = await verifyTwoFactor(userId, code);
      if (success) {
        navigate('/');
      }
    } else {
      SweetAlert.error('Código inválido', 'El código debe tener 6 dígitos.');
    }
  };

  const handleResendCode = async () => {
    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
      SweetAlert.error('Límite alcanzado', 'Has superado el número máximo de intentos. Contacta a soporte.');
      return;
    }
    if (!userId) return;

    const success = await resendTwoFactor(userId);
    if (success) {
      setTokenTimer(300);
      setResendCooldown(60);
      setCanResend(false);
      setResendAttempts(resendAttempts + 1);
    }
  };

  const handleSendToNewEmail = async () => {
    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
      SweetAlert.error('Límite alcanzado', 'Has superado el número máximo de intentos. Contacta a soporte.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      SweetAlert.error('Correo inválido', 'Por favor, ingresa una dirección de correo electrónico válida.');
      return;
    }

    if (!userId) return;

    const result = await changeEmailAndResend(userId, newEmail);

    if (result.success) {
      setTokenTimer(300);
      setResendCooldown(60);
      setCanResend(false);
      setShowNewEmailInput(false);
      setCurrentEmail(result.newEmail || newEmail);
      setNewEmail('');
      setResendAttempts(resendAttempts + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="layout__auth">
      <div className="container-fluid">
        <div className="row">
          <div
            className="col-xl-7 login_bs_validation b-center bg-size login-page"
            style={{ backgroundColor: '#fff' }}
          ></div>
          <div className="col-xl-5 p-0">
            <div className="login-card login-dark login-bg">
              <div style={{ width: '100%' }}>
                <div>
                  <a className="logo text-center" href="/">
                    <img className="for-dark" src="/images/logo.png" alt="logo" />
                  </a>
                </div>
                <div className="login-main">
                  <form className="theme-form" onSubmit={handleSubmit}>
                    <h2 className="text-center">Verificación de dos factores</h2>
                    <p className="text-center">
                      Hemos enviado un código a tu correo electrónico: <strong>{currentEmail}</strong>. Por favor, ingrésalo a continuación.
                    </p>
                    <div className="form-group">
                      <label className="col-form-label">Código de Verificación</label>
                      <input
                        onChange={(e) => setCode(e.target.value)}
                        value={code}
                        autoComplete="off"
                        name="code"
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group mb-0 checkbox-checked">
                      <div className="text-end mt-3">
                        <button className="btn btn-primary btn-block w-100" type="submit">
                          Verificar
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      {tokenTimer > 0 ? (
                        <p className="text-muted">
                          El código expira en <strong>{formatTime(tokenTimer)}</strong>.
                        </p>
                      ) : (
                        <p className="text-danger">
                          El código ha expirado. Por favor, solicita uno nuevo.
                        </p>
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={handleResendCode}
                        disabled={!canResend || resendCooldown > 0 || resendAttempts >= MAX_RESEND_ATTEMPTS}
                      >
                        Reenviar código
                      </button>
                      {resendCooldown > 0 && resendAttempts < MAX_RESEND_ATTEMPTS && (
                        <p className="text-muted" style={{ fontSize: '0.9em', marginTop: '5px' }}>
                          Puedes reenviar en {resendCooldown} segundos.
                        </p>
                      )}
                    </div>

                    <div className="mt-2 text-center">
                      {!showNewEmailInput ? (
                        <button
                          type="button"
                          className="btn btn-link"
                          onClick={() => setShowNewEmailInput(true)}
                          disabled={resendAttempts >= MAX_RESEND_ATTEMPTS}
                        >
                          Enviar a otro correo electrónico
                        </button>
                      ) : (
                        <div className="form-group mt-3">
                          <label className="col-form-label">Nuevo Correo Electrónico</label>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="ejemplo@correo.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                          />
                          <button
                            type="button"
                            className="btn btn-secondary btn-block w-100 mt-2"
                            onClick={handleSendToNewEmail}
                            disabled={!newEmail}
                          >
                            Enviar código al nuevo correo
                          </button>
                          <button
                            type="button"
                            className="btn btn-link text-danger"
                            onClick={() => setShowNewEmailInput(false)}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                    {resendAttempts >= MAX_RESEND_ATTEMPTS ? (
                      <p className="text-danger text-center mt-3">
                        Has alcanzado el límite de reintentos.
                      </p>
                    ) : (
                      <p className="text-muted text-center mt-3">
                        Intentos restantes: {MAX_RESEND_ATTEMPTS - resendAttempts}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthPage;
