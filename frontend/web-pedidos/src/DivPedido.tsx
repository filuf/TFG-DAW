import React, { useRef } from "react";
import { Pedido } from "./types.ts";

interface DivPedidoProps {
  pedido: Pedido;
  removeOrderFunction: (id: string) => void;
  isFading: boolean;
}

/**
 * 
 * @param pedido Extrae el pedido directamente de las props y utiliza sus datos para generar el componente
 * @returns instancia de DivPedido
 */
export default function DivPedido({ pedido, removeOrderFunction, isFading }: DivPedidoProps) {
  const { id, comprador, descripcion, pagado, productos } = pedido;
  const modalRef = useRef<HTMLDialogElement>(null);

  const openModal = () => modalRef.current?.showModal();
  const closeModal = () => modalRef.current?.close();
  const handleComplete = () => {
    removeOrderFunction(id);
    closeModal();
  };

  console.log(id);
  return (
    <div className={`pedido ${isFading ? 'fading' : ''}`}>
      <header className="pedido-header">
        <h2 className="comprador">{comprador.toUpperCase()}</h2>
        <div className="estado">
          <span className={`estado-badge ${pagado ? 'pagado' : 'pendiente'}`}>
            {pagado ? "✅ PAGADO" : "❌ PENDIENTE DE PAGO"}
          </span>
        </div>
      </header>

      <section className="pedido-content">
        <h3 className="productos-text">Productos</h3>
        <div className="productos">
          {productos.map((producto, index) => (
            <div className="producto" key={`${producto.nombreProducto}-${index}`}>
              <div className="producto-info">
                <span className="producto-nombre">{producto.nombreProducto}</span>
                <span className="producto-cantidad">x{producto.cantidad}</span>
              </div>
            </div>
          ))}
        </div>

        {descripcion && (
          <div className="descripcion-container">
            <p className="descripcion">
              {descripcion.endsWith('.') ? descripcion : `${descripcion}.`}
            </p>
          </div>
        )}
      </section>

      <footer className="pedido-footer">
        <div className="button-container">
          <button 
            className="concluido" 
            onClick={openModal}
            aria-label="Marcar pedido como concluido"
          >
            Marcar como concluido
          </button>
        </div>
      </footer>

      <dialog 
        ref={modalRef} 
        className="confirm-dialog"
        aria-labelledby="dialog-title"
      >
        <h3 id="dialog-title" className="pedido-de">
          Pedido de {comprador.split(" ")[0].toUpperCase()}
        </h3>
        
        <p className="dialog-message">
          ¿Estás seguro de que deseas marcar este pedido como concluido?
        </p>

        <form method="dialog" className="dialog-actions">
          <button 
            type="button"
            className="concluir" 
            onClick={handleComplete}
            aria-label="Confirmar conclusión del pedido"
          >
            Confirmar
          </button>
          <button 
            type="button"
            className="cancelar" 
            onClick={closeModal}
            aria-label="Cancelar operación"
          >
            Cancelar
          </button>
        </form>
      </dialog>
    </div>
  );
}
