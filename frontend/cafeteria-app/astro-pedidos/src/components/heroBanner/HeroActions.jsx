import React, { useEffect, useState } from "react";
import styles from "./Home.module.css";

export default function HeroActions() {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const updateLogin = () => setIsLogged(!!sessionStorage.getItem("token"));
    updateLogin();
    window.addEventListener("user-login", updateLogin);
    window.addEventListener("user-logout", updateLogin);
    return () => {
      window.removeEventListener("user-login", updateLogin);
      window.removeEventListener("user-logout", updateLogin);
    };
  }, []);

  return (
    <div className={styles.heroActions}>
      {!isLogged && (
        <>
          <a href="/login" className={styles.heroButton}>Iniciar sesión</a>
          <a href="/register" className={styles.heroButtonSec}>Registrarse</a>
        </>
      )}
    </div>
  );
}