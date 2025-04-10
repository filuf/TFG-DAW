import { useEffect, useState } from 'react'
import './App.css'
import { socket } from './socket'
import DivPedido from "./DivPedido.tsx"
import { Slide, toast, ToastContainer } from "react-toastify"

function App() {
  //estados de conexión y mensajes
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [mensajeEvents, setMensajeEvents] = useState([]);

  useEffect( () => {
    setIsConnected(socket.connected);

    function onConnect() {
      console.log("conectado");
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log("desconectado");
      setIsConnected(false);
    }

    function onMessageEvents(newMessage) {
      console.log("mensaje recibido");
      
      //crea un nuevo array con el contenido del anterior y el nuevo valor (react requiere que sea inmutable)
      setMensajeEvents(previous => [...previous, newMessage]);
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


  }, []);

  
  //función que se pasa a cada componente para poder eliminarse
  const sendRemoveOrder = (id) => {
    socket.emit("removeOrder", id);
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