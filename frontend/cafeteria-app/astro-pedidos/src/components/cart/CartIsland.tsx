import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Product {
  idProduct: number;
  productName: string;
  productPrice: number;
  urlImage: string;
  isUnlimited: boolean;
}

interface ProductItem {
  product: Product;
  quantity: number;
}

interface CartSummaryResponse {
  productList: ProductItem[];
  totalProductPrice: number;
  totalUnlimitedProductPrice: number;
}

export default function CartIsland({ apiCartUrl }: { apiCartUrl: string }) {
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartSummaryResponse | null>(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState("");
  const [loggedIn, setLoggedIn] = useState(sessionStorage.getItem("token") !== null);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = sessionStorage.getItem("token");
      setLoggedIn(token !== null);
    }, 1000)
  },[]);

  const fetchCart = async () => {
    setError("");
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("No has iniciado sesión. Por favor, inicia sesión para ver tu carrito.");
      setLoading(false);
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiCartUrl + "/cart/getAllProducts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 204) {
        setCart(null);
      } else if (res.ok) {
        const data = await res.json();
        setCart(data);
      } else if (res.status === 403) {
        setError("Sesión expirada. Vuelve a iniciar sesión.");
      } else {
        setError("Error al cargar el carrito.");
      }
    } catch (e) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, [loggedIn]);

  const handleAdd = async (productId: number) => {
    setUpdating(true);
    setSuccess("");
    setError("");
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(apiCartUrl + "/cart/addProduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ idProduct: productId, quantity: 1 }),
      });
      if (res.ok) {
        await fetchCart();
      } else {
        setError("No se pudo añadir el producto.");
      }
    } catch {
      setError("Error de conexión al añadir producto.");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async (productId: number) => {
    setUpdating(true);
    setSuccess("");
    setError("");
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(apiCartUrl + "/cart/deleteOneProduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ idProduct: productId }),
      });
      if (res.ok) {
        await fetchCart();
      } else {
        setError("No se pudo eliminar el producto.");
      }
    } catch {
      setError("Error de conexión al eliminar producto.");
    } finally {
      setUpdating(false);
    }
  };

  const handleOrder = async () => {
    setUpdating(true);
    setSuccess("");
    setError("");
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(apiCartUrl + "/order/newOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: "" }),
      });
      if (res.ok) {
        setSuccess("¡Pedido realizado con éxito!");
        setCart(null);
      } else if (res.status === 400) {
        setError("No puedes realizar un pedido con el carrito vacío.");
      } else {
        setError("No se pudo realizar el pedido.");
      }
    } catch {
      setError("Error de conexión al realizar el pedido.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <Skeleton height={80} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Quicksand', 'Open Sans', sans-serif", textAlign: "center" }}>
      <h2 style={{ fontFamily: "'Pacifico', cursive", fontSize: "1.8rem", color: "var(--bistre)", marginBottom: "1.5rem" }}>Resumen del carrito</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      {!cart || !cart.productList || cart.productList.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          {cart.productList.map(({ product: { idProduct, productName, productPrice, urlImage }, quantity }) => (
            <div
              key={idProduct}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1rem",
                padding: "1rem",
                borderRadius: "12px",
                boxShadow: "0 2px 12px rgba(65, 39, 34, 0.08)",
                background: "var(--white)",
                border: "1px solid var(--lemon-chiffon)",
                maxWidth: 700,
                margin: "0 auto 1rem auto",
                gap: "1rem",
                flexWrap: "wrap"
              }}
            >
              {/* Imagen */}
              <img
                src={urlImage ?? "/favicon.png"}
                alt={productName}
                style={{ width: 60, height: 60, borderRadius: 8, flexShrink: 0 }}
              />
              {/* Info: nombre y precio */}
              <div style={{ flex: 2, minWidth: 120 }}>
                <a
                  href={`/products/${productName}-${idProduct}`}
                  style={{ fontWeight: "bold", fontSize: "1.1rem", color: "var(--bistre)", textDecoration: "none" }}
                >
                  {productName}
                </a>
                <div style={{ color: "var(--yellow-green)", fontWeight: "bold", fontSize: "0.98rem" }}>
                  Precio: {productPrice.toFixed(2)} €
                </div>
              </div>
              {/* Cantidad */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flex: 1, minWidth: 90, justifyContent: "center" }}>
                <button
                  onClick={() => handleRemove(idProduct)}
                  disabled={updating || quantity <= 0}
                  style={{ background: "var(--lemon-chiffon)", border: "1px solid var(--buff)", borderRadius: 6, padding: "0.3rem 0.6rem", cursor: "pointer" }}
                  title="Quitar uno"
                >
                  -
                </button>
                <span style={{ fontWeight: "bold", minWidth: 18, textAlign: "center" }}>{quantity}</span>
                <button
                  onClick={() => handleAdd(idProduct)}
                  disabled={updating}
                  style={{ background: "var(--lemon-chiffon)", border: "1px solid var(--buff)", borderRadius: 6, padding: "0.3rem 0.6rem", cursor: "pointer" }}
                  title="Añadir uno"
                >
                  +
                </button>
              </div>
              {/* Subtotal */}
              <div style={{ flex: 1, minWidth: 90, textAlign: "center", color: "var(--bistre)", fontWeight: 600 }}>
                { (productPrice * quantity).toFixed(2) } €
              </div>
              {/* Botón eliminar */}
              <div style={{ flex: 0, minWidth: 60, textAlign: "center" }}>
                <button
                  onClick={async () => { setUpdating(true); setError(""); setSuccess("");
                    const token = sessionStorage.getItem("token");
                    try {
                      const res = await fetch(apiCartUrl + "/cart/deleteAllQuantityProduct", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ idProduct: idProduct }),
                      });
                      if (res.ok) {
                        await fetchCart();
                      } else {
                        setError("No se pudo eliminar el producto.");
                      }
                    } catch {
                      setError("Error de conexión al eliminar producto.");
                    } finally {
                      setUpdating(false);
                    }
                  }}
                  style={{ background: "#fff0f0", border: "1px solid #e57373", borderRadius: 6, padding: "0.3rem 0.7rem", color: "#c62828", fontWeight: 700, cursor: "pointer" }}
                  title="Eliminar producto"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))}
          <div style={{ fontWeight: "bold", fontSize: "1.5rem", marginTop: "1.5rem", color: "var(--bistre)" }}>
            Total: {cart.totalProductPrice.toFixed(2)} €
          </div>
          <button onClick={handleOrder} disabled={updating} style={{ margin: "1.5rem auto 0", padding: "0.8rem 1.5rem", fontSize: "1.2rem", borderRadius: "8px", background: "var(--yellow-green)", color: "var(--black)", border: "none", cursor: "pointer", boxShadow: "0 1px 6px rgba(65, 39, 34, 0.10)", display: "block" }}>
            Realizar pedido
          </button>
        </>
      )}
    </div>
  );
} 