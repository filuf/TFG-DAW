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

  const fetchCart = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("No has iniciado sesión. Por favor, inicia sesión para ver tu carrito.");
      setLoading(false);
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
  }, []);

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
    <div>
      <h2>Carrito</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      {!cart || !cart.productList || cart.productList.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          {cart.productList.map((product) => (
            <div key={product.product.idProduct} style={{ display: "flex", alignItems: "center", marginBottom: 16, border: "1px solid #ccc", borderRadius: 8, padding: 8 }}>
              <img src={product.product.urlImage ?? "/astro.png"} alt={product.product.productName} style={{ width: 60, height: 60, borderRadius: 8, marginRight: 16 }} />
              <div style={{ flex: 1 }}>
                <a href={`/products/${product.product.productName}-${product.product.idProduct}`} style={{ fontWeight: "bold", fontSize: 18 }}>{product.product.productName}</a>
                <div>Precio: {product.product.productPrice.toFixed(2)} €</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => handleRemove(product.product.idProduct)} disabled={updating || product.quantity <= 0}>-</button>
                  <span>{product.quantity}</span>
                  <button onClick={() => handleAdd(product.product.idProduct)} disabled={updating}>+</button>
                </div>
              </div>
            </div>
          ))}
          <div style={{ fontWeight: "bold", fontSize: 20, marginTop: 16 }}>
            Total: {cart.totalProductPrice.toFixed(2)} €
          </div>
          <button onClick={handleOrder} disabled={updating} style={{ marginTop: 24, padding: "10px 20px", fontSize: 18, borderRadius: 8, background: "#4caf50", color: "white", border: "none", cursor: "pointer" }}>
            Realizar pedido
          </button>
        </>
      )}
    </div>
  );
} 