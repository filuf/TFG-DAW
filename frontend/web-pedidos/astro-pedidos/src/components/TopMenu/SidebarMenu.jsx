import React, { useEffect, useState } from "react";
import "./sidebarSlide.css";

const SidebarMenu = ({ onClose }) => {
    const [isClosing, setIsClosing] = useState(false);

    // Al cerrar, primero activa animación y luego desmonta
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
        onClose();
        }, 300); // Tiempo debe coincidir con la duración de la animación en CSS
    };

    // Cierra también al hacer clic fuera
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("sidebar-overlay")) {
        handleClose();
        }
    };

  return (
    <div className="sidebar-overlay" onClick={handleOverlayClick}>
        <div className={`sidebar-container ${isClosing ? "slide-out" : "slide-in"}`} onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
                <h2>Mi Cuenta</h2>
                <button className="close-button" onClick={handleClose}>×</button>
            </div>

            <div className="sidebar-content">
                <a className="sidebar-link" href="/cart">Carrito <img src="/cart.png" className="sidebar-icon" alt="icono carrito" /></a>
                <a className="sidebar-link" href="/orders">Mis pedidos</a>
            </div>

            <div className="sidebar-footer">
                <button className="logout-button" onClick={() => console.log("Cerrar sesión")}>
                    Cerrar sesión
                </button>
            </div>
        </div>
    </div>
  );
};

export default SidebarMenu;