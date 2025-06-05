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
export default function ProductCard({ product, apiOrdersUrl }) {
  const [showMore, setShowMore] = useState(false);

  // Usar favicon si no hay imagen disponible
  const imageSrc = product.url_image && product.url_image.trim() !== '' ? product.url_image : '/favicon.png';

  const handleAddToCart = async () => {
    const sessionStorageToken = sessionStorage.getItem('token');
    if (!sessionStorageToken) {
      toast.error('No estás autenticado. Por favor, inicia sesión.');
      return;
    }
    if (!apiOrdersUrl) {
      toast.error('No se ha configurado la URL de la API de pedidos.');
      return;
    }
    try {
      const url = apiOrdersUrl + '/cart/addProduct';
      console.log('Añadiendo producto al carrito. URL:', url);
      const response = await fetch(url, {
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
      console.error('Error al añadir producto:', error);
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
          <i class="fa-solid fa-cart-plus"></i> Añadir
        </button>
        <button
          className={styles.toggleButton}
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
          aria-controls={`product-details-${product.id_product}`}
        >
          {showMore ? (<span>Ver menos <i class="fa-solid fa-chevron-up"></i></span>) : (<span>Ver más <i class="fa-solid fa-chevron-down"></i></span>)}
        </button>
        {showMore && (
          <div className={styles.moreInfo} id={`product-details-${product.id_product}`}>
            {product.product_description && (
              <p className={styles.description}>{product.product_description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 