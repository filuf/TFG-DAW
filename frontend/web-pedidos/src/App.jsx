import { useEffect, useState } from 'react'
import './App.css'
import { getSocket } from './socket'
import DivLogin from './DivLogin.tsx'
import DivPedido from "./DivPedido.tsx"
import ThemeToggle from './components/ThemeToggle'
import { Slide, toast, ToastContainer } from "react-toastify"

function App() {

  // estado de login
  const [isLoged, setIsLoged] = useState(false);

  //estados de conexión y mensajes
  const [isConnected, setIsConnected] = useState(false);
  const [mensajeEvents, setMensajeEvents] = useState([]);

  useEffect( () => {
    // no monta el socket si no está logueado
    if (!isLoged) {
      return;
    }

    const socket = getSocket();

    setIsConnected(socket.connected);

    function onConnect() {
      toast.info("Conexión establecida");
      setIsConnected(true);
    }

    function onDisconnect() {
      toast.error("Conexión perdida");
      setIsConnected(false);
    }

    function onMessageEvents(newMessage) {      
      //crea un nuevo array con el contenido del anterior y el nuevo valor (react requiere que sea inmutable)
      setMensajeEvents(previous => [...previous, newMessage]);
      toast.success("Pedido recibido correctamente");
    }

    // elimina el pedido correspondiente a id de la visualización
    function onRemoveOrderServer(id) {

        //setea fading=true en el elemento a eliminar
        setMensajeEvents( (prevOrders) => {
          return prevOrders.map( (order) => order.id === id ? { ...order, fading: true} : order);
        });
  
        //espera un segundo y elimina el elemento del array
        setTimeout( () => {
          setMensajeEvents(previousOrders => previousOrders.filter(order => order.id != id));
        }, 1000);
  
        // muestra una alerta exitosa
        toast.success("Pedido concluido correctamente");

    }

    //registra en cada evento cada función
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("mensajeServer", onMessageEvents); //evento mensajeServer crear elemento
    socket.on("removeOrderServer", onRemoveOrderServer); // evento concluir pedido

    //limpia los eventos al desmontarse
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("mensajeServer", onMessageEvents);
      socket.off("removeOrderServer", onRemoveOrderServer); // evento concluir pedido
    }


  }, [isLoged]);

  
  //función que se pasa a cada componente para poder eliminarse
  const sendRemoveOrder = (id) => {
    const socket = getSocket();
    //envía el id del pedido a eliminar al servidor
    socket.emit("removeOrder", id);
  }

  if (!isLoged) {
    return <DivLogin setIsLoged={setIsLoged} />
  }

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Slide}
      />
      <ThemeToggle />
      <div className='contenedor-conexion'>
        {isConnected 
          ?  <p className='estado-websocket conectado'>CONECTADO</p>
          :  <p className='estado-websocket desconectado'>DESCONECTADO</p>
        }
      </div>

      {mensajeEvents.map( (mensaje) => (
        <DivPedido 
          key={mensaje.id}
          pedido={mensaje} 
          removeOrderFunction={sendRemoveOrder} 
          isFading={mensaje.fading ?? false}>  
        </DivPedido>
      ))}
    </>
  )
}

export default App