import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import ProtectedRoute from './routes/ProtectedRoute';

/**Reduxs */
import store from './redux/store';
/**Layouts */
import AuthLayout from './layouts/auth.layout';
/**Pages */
import {
  LoginPage,
  HomePage,
  ChangePasswordPage,
  LeadsPage,
  FormulariosPage,
  UsuariosPage,
  LeadPage,
  MiEquipoPage,
  CalendarioPage,
  CampanaPage,
  ConfiguracionPage,
  BuyerConfigPage,
} from './pages';
import TwoFactorAuthPage from './pages/Login/TwoFactorAuth.page';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-2fa" element={<TwoFactorAuthPage />} />
          <Route path="/" element={<AuthLayout />}>
            <Route element={<ProtectedRoute permission="home-index" />}>
              <Route path="/" element={<HomePage />} />
              {/*ChangePasswordPage*/}
              <Route element={<ProtectedRoute permission="change-password" />}>
                <Route path="change-password" element={<ChangePasswordPage />} />
                {/*LeadsPage*/}
                <Route element={<ProtectedRoute permission="leads-index" />}>
                  <Route path="leads" element={<LeadsPage />} />
                </Route>
                {/*FormulariosPage*/}
                <Route element={<ProtectedRoute permission="leads-index" />}>
                  <Route path="forms" element={<FormulariosPage />} />
                </Route>
                {/*UsuariosPage*/}
                <Route element={<ProtectedRoute permission="access-users-index" />}>
                  <Route path="access-users" element={<UsuariosPage />} />
                </Route>
                {/*LeadPage*/}
                <Route element={<ProtectedRoute permission="leads-index" />}>
                  <Route path="leads/:uuid" element={<LeadPage />} />
                </Route>
                {/*MiEquipoPage*/}
                <Route element={<ProtectedRoute permission="teams-index" />}>
                  <Route path="my-teams" element={<MiEquipoPage />} />
                </Route>
                {/*CalendarioPage*/}
                <Route element={<ProtectedRoute permission="home-index" />}>
                  <Route path="calendar" element={<CalendarioPage />} />
                </Route>
                {/*CampanaPage*/}
                <Route element={<ProtectedRoute permission="campaigns-index" />}>
                  <Route path="campaigns" element={<CampanaPage />} />
                </Route>
                {/*ConfiguracionPage*/}
                <Route element={<ProtectedRoute permission="settings-index" />}>
                  <Route path="settings" element={<ConfiguracionPage />} />
                </Route>
                {/*BuyerConfigPage*/}
                <Route element={<ProtectedRoute permission="settings-index" />}>
                  <Route path="settings/buyer" element={<BuyerConfigPage />} />
                </Route>
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
