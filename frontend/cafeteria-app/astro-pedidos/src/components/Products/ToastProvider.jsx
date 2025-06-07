import 'react-toastify/dist/ReactToastify.css';  // importa los estilos globales
import { ToastContainer } from 'react-toastify';

/**
 * Componente provider para montar el contenedor fuera de los contenedores relative
 * 
 */
export default function ToastProvider() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      theme="colored"
      draggable={true}
      style={{ marginBottom: '50px' }}
    />
  );
}