import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import ProtectedRoute from './routes/ProtectedRoute';

/**Reduxs */
import store from './redux/store';
/**Layouts */
import AuthLayout from './layouts/auth.layout';
/**Pages */
import { LoginPage, HomePage, ChangePasswordPage, LeadsPage, FormulariosPage } from './pages';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
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
              </Route>
            </Route>
          </Route>
          {/* Login */}
          <Route path="login" element={<LoginPage />}></Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
