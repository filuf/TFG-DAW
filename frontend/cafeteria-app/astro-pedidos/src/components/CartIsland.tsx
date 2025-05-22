import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Product {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartSummaryResponse {
  productList: Product[];
  totalProductPrice: number;
  totalUnlimitedProductPrice: number;
}

export default function CartIsland({ apiCartUrl }: { apiCartUrl: string }) {
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartSummaryResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
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
    fetchCart();
  }, []);

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

  if (error) {
    return <p>{error}</p>;
  }

  if (!cart || !cart.productList || cart.productList.length === 0) {
    return <p>Tu carrito está vacío.</p>;
  }

  return (
    <div>
      <h2>Carrito</h2>
      {cart.productList.map((product) => (
        <div key={product.productId} style={{ display: "flex", alignItems: "center", marginBottom: 16, border: "1px solid #ccc", borderRadius: 8, padding: 8 }}>
          <img src={product.imageUrl || "/astro.png"} alt={product.name} style={{ width: 60, height: 60, borderRadius: 8, marginRight: 16 }} />
          <div style={{ flex: 1 }}>
            <a href={`/products/${product.productId}`} style={{ fontWeight: "bold", fontSize: 18 }}>{product.name}</a>
            <div>Precio: {product.price.toFixed(2)} €</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button disabled>-</button>
              <span>{product.quantity}</span>
              <button disabled>+</button>
            </div>
          </div>
        </div>
      ))}
      <div style={{ fontWeight: "bold", fontSize: 20, marginTop: 16 }}>
        Total: {cart.totalProductPrice.toFixed(2)} €
      </div>
    </div>
  );
} 