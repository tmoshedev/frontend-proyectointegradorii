import ReactDOM from 'react-dom/client';
import './scss/styles.scss';
import App from './App';
import 'bootstrap';

// 1. Importar Axios
import axios from 'axios';

// 2. Leer las variables de entorno de Vite (.env)
// Como estás en la rama luma/prod, tu .env debería tener VITE_COMPANY=luma
const companyName = import.meta.env.VITE_COMPANY;
const apiUrl = import.meta.env.VITE_URL_API;

// 3. Configurar los valores por defecto de Axios para TODA la aplicación
// Esto se debe hacer ANTES de renderizar el componente <App />
axios.defaults.baseURL = apiUrl;
axios.defaults.headers.common['X-Tenant'] = companyName;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);