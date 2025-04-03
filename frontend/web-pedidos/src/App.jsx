import { useEffect, useState } from 'react'
import './App.css'
import { socket } from './socket'
import DivPedido from "./DivPedido.tsx"

function App() {
  //estados de conexión y mensajes
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [mensajeEvents, setMensajeEvents] = useState([]);

  useEffect( () => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onMessageEvents(newMessage) {
      console.log("mensaje recibido");
      
      //crea un nuevo array con el contenido del anterior y el nuevo valor (react requiere que sea inmutable)
      setMensajeEvents(previous => [...previous, newMessage])
    }

    //registra en cada evento cada función
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("mensajeServer", onMessageEvents); //evento mensajeServer

    //limpia los eventos al desmontarse
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("mensajeServer", onMessageEvents);
    }
  }, []);

  return (
    <>
      <div className='contenedor-conexion'>
        {isConnected 
          ?  <p className='estado-websocket conectado'>CONECTADO</p>
          :  <p className='estado-websocket desconectado'>DESCONECTADO</p>
        }
      </div>

      {mensajeEvents.map( (mensaje, index) => (
        <DivPedido key={index} pedido={mensaje}></DivPedido>
      ))}
    </>
  )
}

export default App