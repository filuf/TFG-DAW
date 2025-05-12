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
      <p className="comprador">{comprador.toUpperCase()}</p>
      <p className={`estado ${pagado ? "pagado" : "pendiente"}`}>
        <strong>
          {pagado ? "✅ PAGADO" : "❌ PENDIENTE DE PAGO"}
        </strong>
      </p>

      <p className="productos-text"><strong>PRODUCTOS</strong></p>
      <div className="productos">
        {productos.map((producto) => { // mapeo de cada producto
          const { nombreProducto, cantidad } = producto;

          return (
            <div className="producto" key={nombreProducto}>
              <p className="nombre"><strong>PRODUCTO:</strong> {nombreProducto}</p>
              <p className="cantidad"><strong>CANTIDAD:</strong> {cantidad}</p>
            </div>
          );
        })}
      </div>

      <p className="descripcion"><strong>DESCRIPCIÓN: </strong> 
          {descripcion.charAt(descripcion.length - 1) == "." ? descripcion.toUpperCase() : descripcion.toUpperCase() + "."}
      </p>

      <div className="button-container">
        <button className="concluido" onClick={openModal}>
          Marcar como concluido
        </button>
      </div>

      <dialog ref={modalRef} closedby="any">
        <p className="pedido-de">PEDIDO DE {comprador.split(" ")[0].toUpperCase()}</p>
        <p>¿Estás seguro?</p>
        <form method="dialog">
            <button className="concluir" onClick={informOrderComplete}>concluir</button>
            <button className="cancelar">cancelar</button>
        </form>
    </dialog>

    </div>
  );
}
