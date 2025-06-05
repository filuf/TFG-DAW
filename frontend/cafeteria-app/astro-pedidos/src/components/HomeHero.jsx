import React, { useEffect, useState } from "react";
import styles from "./Home.module.css";
import ProductCard from "./productsPages/ProductCard.jsx";

export default function HomeHero({ products }) {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setIsLogged(!!sessionStorage.getItem("token"));
    // Escuchar cambios de login/logout
    const handler = () => setIsLogged(!!sessionStorage.getItem("token"));
    window.addEventListener("user-login", handler);
    window.addEventListener("user-logout", handler);
    return () => {
      window.removeEventListener("user-login", handler);
      window.removeEventListener("user-logout", handler);
    };
  }, []);

  return (
    <>
      <section className={styles.heroSection}>
        <img src="/logo_instituto.png" alt="Logo cafetería" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>¡Bienvenido a la Cafetería Ventura Rodríguez!</h1>
        <p className={styles.heroSubtitle}>Disfruta de los mejores cafés, bollería y snacks en tu centro.</p>
        <div className={styles.heroActions}>
          <a href="/products" className={styles.heroButton}>Ver productos</a>
          {!isLogged && <a href="/login" className={styles.heroButtonSec}>Iniciar sesión</a>}
          {!isLogged && <a href="/register" className={styles.heroButtonSec}>Registrarse</a>}
        </div>
      </section>

      <section className={styles.featuredSection}>
        <h2 className={styles.featuredTitle}>Productos destacados</h2>
        <div className={styles.featuredGrid}>
          {products && products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id_product} product={product} apiOrdersUrl={import.meta.env.VITE_API_ORDERS_URL} />
            ))
          ) : (
            <p>No hay productos destacados.</p>
          )}
        </div>
      </section>
    </>
  );
} 