import React from "react";
import { useRef } from "react";
import { Pedido } from "./types.ts";

export default function DivPedido({ pedido }: { pedido: Pedido }) {
  const { comprador, descripcion, pagado, productos } = pedido;

  const modalRef = useRef<HTMLDialogElement>(null);

  const openModal = () => {
    modalRef.current?.showModal();
  };

  return (
    <div className="pedido">
      <p className="comprador">{comprador}</p>
      <p className={`estado ${pagado ? "pagado" : "pendiente"}`}>
        {pagado ? "✅ Pagado" : "❌ Pendiente"}
      </p>

      <p>Productos</p>
      <div className="productos">
        {productos.map((producto) => { //mapeo de cada producto
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
            <button className="concluir">concluir</button>
            <button className="cancelar">cancelar</button>
        </form>
    </dialog>

    </div>
  );
}
