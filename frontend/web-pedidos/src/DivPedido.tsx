import React from "react";
import { useRef } from "react";
import { Pedido } from "./types.ts";

/**
 * 
 * @param pedido Extrae el pedido directamente de las props y utiliza sus datos para generar el componente
 * @returns instancia de DivPedido
 */
export default function DivPedido({ pedido, removeOrderFunction, isFading }: { pedido: Pedido, removeOrderFunction: any, isFading: boolean }) {
  const { id, comprador, descripcion, pagado, productos } = pedido;

  const modalRef = useRef<HTMLDialogElement>(null);

  const openModal = () => {
    modalRef.current?.showModal();
  };

  const informOrderComplete = () => {
    removeOrderFunction(id);
  };

  console.log(id);
  return (
    <div className="pedido"
      style={{
        opacity: isFading ? 0 : 1, // Cambia la opacidad si se está desvaneciendo
        transition: "opacity 1s", // Animación de 1 segundo
      }}>
      <p className="comprador">{comprador}</p>
      <p className={`estado ${pagado ? "pagado" : "pendiente"}`}>
        {pagado ? "✅ Pagado" : "❌ Pendiente"}
      </p>

      <p>Productos</p>
      <div className="productos">
        {productos.map((producto) => { // mapeo de cada producto
          const { nombreProducto, cantidad } = producto;

          return (
            <div className="producto" key={nombreProducto}>
              <p className="nombre">{nombreProducto}</p>
              <p className="cantidad">Cantidad: {cantidad}</p>
            </div>
          );
        })}
      </div>

      <p className="descripcion"><strong>Descripción: </strong> 
        {descripcion.charAt(descripcion.length - 1) == "." ? descripcion : descripcion + "."}
      </p>

      <button className="concluido" onClick={openModal}>
        Marcar como concluido
      </button>

      <dialog ref={modalRef} closedby="any">
        <p className="pedido-de">pedido de {comprador.split(" ")[0]}</p>
        <p>¿Estás seguro?</p>
        <form method="dialog">
            <button className="concluir" onClick={informOrderComplete}>concluir</button>
            <button className="cancelar">cancelar</button>
        </form>
    </dialog>

    </div>
  );
}
