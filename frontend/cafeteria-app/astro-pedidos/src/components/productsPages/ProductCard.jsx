/***************************************************
COMPONENTE PRODUCT CARD
Autores: Aitor y Agustín
Fecha: 04/06/2025
Version: 1.0

El objetivo de este componente es crear un card para
cada producto existente en la base de datos sacando
los productos de la base de datos.
***************************************************/

import { useState } from 'react';
import styles from './ProductCard.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Función que permite mostrar los productos en la página de productos.
 * funciona con react, recibe un producto y muestra sus datos.
 * @param {*} product 
 * @returns un componente de react.
 */
export default function ProductCard({ product }) {
  const [showMore, setShowMore] = useState(false);

  // Usar favicon si no hay imagen disponible
  const imageSrc = product.url_image && product.url_image.trim() !== '' ? product.url_image : '/favicon.png';

  // Obtener la URL de la API de pedidos desde variable de entorno
  const apiOrdersUrl = import.meta.env.VITE_API_ORDERS_URL || '/api';

  const handleAddToCart = async () => {
    const sessionStorageToken = sessionStorage.getItem('token');
    if (!sessionStorageToken) {
      toast.error('No estás autenticado. Por favor, inicia sesión.');
      return;
    }
    try {
      const response = await fetch(apiOrdersUrl + '/cart/addProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorageToken}`,
        },
        body: JSON.stringify({
          idProduct: Number(product.id_product),
          quantity: 1,
        }),
      });
      if (response.ok) {
        toast.success('Producto añadido al carrito.');
      } else {
        toast.error('No se pudo añadir el producto al carrito.');
      }
    } catch (error) {
      toast.error('Error al añadir el producto al carrito.');
    }
  };

  return (
    <div className={styles.card}>
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
      <div className={styles.imageContainer}>
        <img
          src={imageSrc}
          alt={product.product_name}
          className={styles.image}
          onError={e => {
            e.target.onerror = null;
            e.target.src = '/favicon.png';
          }}
        />
      </div>
      <div className={styles.infoRow}>
        <span className={styles.name}>{product.product_name}</span>
        <span className={styles.price}>{product.product_price.toFixed(2)} €</span>
      </div>
      <div className={styles.cardActions}>
        <button className={styles.cartButton} title="Añadir al carrito" onClick={handleAddToCart}>
          🛒 Añadir
        </button>
        <button
          className={styles.toggleButton}
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
          aria-controls={`product-details-${product.id_product}`}
        >
          {showMore ? 'Ver menos ▲' : 'Ver más ▼'}
        </button>
        {showMore && (
          <div className={styles.moreInfo} id={`product-details-${product.id_product}`}>
            {product.product_description && (
              <p className={styles.description}>{product.product_description}</p>
            )}
            {product.is_unlimited && (
              <span className={styles.unlimited}>☕ Producto ilimitado</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 