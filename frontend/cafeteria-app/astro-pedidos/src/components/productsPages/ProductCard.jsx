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

  return (
    <div className={styles.card}>
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
        <button className={styles.cartButton} title="Añadir al carrito">
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