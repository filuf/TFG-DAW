import { useEffect, useState } from "react";
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

const paymentMethods = [
  { id: "efectivo", name: "Efectivo", icon: "💵" },
  { id: "tarjeta", name: "Tarjeta", icon: "💳" },
  { id: "bizum", name: "Bizum", icon: "📱" },
  { id: "transferencia", name: "Transferencia", icon: "🏦" }
];

export default function CartIsland({ apiCartUrl }: { apiCartUrl: string }) {
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartSummaryResponse | null>(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState("");
  const [loggedIn, setLoggedIn] = useState(sessionStorage.getItem("token") !== null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("Procesando pago...");
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
    phoneNumber: "",
    iban: "",
    accountHolder: ""
  });
  const [paymentErrors, setPaymentErrors] = useState<{[key: string]: string}>({});
  const [currentPaymentStep, setCurrentPaymentStep] = useState("select"); // select, form, processing
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

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
    setError("");
    setSuccess("");
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

  const handlePaymentMethodSelect = async (methodId: string) => {
    setCurrentPaymentStep("form");
    setPaymentErrors({});
    setPaymentData({
      cardNumber: "",
      cardHolder: "",
      expiry: "",
      cvv: "",
      phoneNumber: "",
      iban: "",
      accountHolder: ""
    });
    setSelectedPaymentMethod(methodId);
  };

  const validatePaymentData = (methodId: string) => {
    const errors: {[key: string]: string} = {};
    
    switch (methodId) {
      case "tarjeta":
        if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
          errors.cardNumber = "Número de tarjeta inválido (16 dígitos)";
        }
        if (!paymentData.cardHolder || paymentData.cardHolder.length < 3) {
          errors.cardHolder = "Nombre del titular requerido";
        }
        if (!paymentData.expiry || !/^\d{2}\/\d{2}$/.test(paymentData.expiry)) {
          errors.expiry = "Fecha de vencimiento inválida (MM/YY)";
        }
        if (!paymentData.cvv || paymentData.cvv.length !== 3) {
          errors.cvv = "CVV inválido (3 dígitos)";
        }
        break;
      case "bizum":
        if (!paymentData.phoneNumber || !/^\d{9}$/.test(paymentData.phoneNumber)) {
          errors.phoneNumber = "Número de teléfono inválido (9 dígitos)";
        }
        break;
      case "transferencia":
        if (!paymentData.iban || paymentData.iban.length < 20) {
          errors.iban = "IBAN inválido";
        }
        if (!paymentData.accountHolder || paymentData.accountHolder.length < 3) {
          errors.accountHolder = "Nombre del titular requerido";
        }
        break;
    }
    
    return errors;
  };

  const handlePaymentSubmit = async (methodId: string) => {
    // Para efectivo, no necesitamos validar datos
    if (methodId !== "efectivo") {
      const errors = validatePaymentData(methodId);
      
      if (Object.keys(errors).length > 0) {
        setPaymentErrors(errors);
        return;
      }
    }

    setCurrentPaymentStep("processing");
    setPaymentErrors({});
    setError("");
    setSuccess("");

    // Simular tiempo de procesamiento según el método de pago
    let processingTime = 1500;
    let message = "Procesando pago...";
    
    switch (methodId) {
      case "efectivo":
        processingTime = 800;
        message = "Confirmando pedido...";
        break;
      case "tarjeta":
        processingTime = 3000;
        message = "Verificando tarjeta...";
        break;
      case "bizum":
        processingTime = 2000;
        message = "Conectando con Bizum...";
        break;
      case "transferencia":
        processingTime = 2500;
        message = "Generando transferencia...";
        break;
    }

    setProcessingMessage(message);

    // Simular pasos intermedios para métodos de pago electrónico
    if (methodId !== "efectivo") {
      await new Promise(resolve => setTimeout(resolve, processingTime * 0.3));
      setProcessingMessage("Conectando con el servidor de pagos...");
      
      await new Promise(resolve => setTimeout(resolve, processingTime * 0.4));
      setProcessingMessage("Verificando datos de pago...");
      
      await new Promise(resolve => setTimeout(resolve, processingTime * 0.3));
      setProcessingMessage("Confirmando transacción...");
    } else {
      await new Promise(resolve => setTimeout(resolve, processingTime));
    }

    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(apiCartUrl + "/order/newOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: "" }),
      });
      
      if (res.ok) {
        if (methodId === "efectivo") {
          setSuccess("Pedido realizado. Deberás pagar en caja al recoger tu pedido.");
        } else {
          setSuccess(`¡Pago exitoso con ${methodId}! Tu pedido ha sido confirmado.`);
        }
        setCart(null);
        setShowPaymentModal(false);
        setCurrentPaymentStep("select");
      } else if (res.status === 400) {
        setError("No puedes realizar un pedido con el carrito vacío.");
      } else {
        setError("No se pudo realizar el pedido.");
      }
    } catch (error) {
      setError("Error de conexión al procesar el pago.");
    } finally {
      setCurrentPaymentStep("select");
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
        <div style={{
          textAlign: "center",
          padding: "3rem 1rem",
          background: "var(--lemon-chiffon)",
          borderRadius: "16px",
          border: "2px solid var(--yellow-green)",
          maxWidth: "500px",
          margin: "0 auto"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem", color: "var(--bistre)" }}>
            🛒
          </div>
          <h3 style={{ 
            fontFamily: "'Pacifico', cursive", 
            fontSize: "1.8rem", 
            color: "var(--bistre)", 
            marginBottom: "1rem"
          }}>
            Tu carrito está vacío
          </h3>
          <p style={{ 
            fontSize: "1.1rem", 
            color: "#666", 
            marginBottom: "2rem",
            lineHeight: "1.5"
          }}>
            ¡No hay productos en tu carrito! Añade algunos productos deliciosos para continuar.
          </p>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => window.location.href = "/"}
              style={{
                padding: "0.8rem 1.5rem",
                borderRadius: "8px",
                background: "var(--yellow-green)",
                color: "var(--black)",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              🍽️ Seguir comprando
            </button>
            
            <button
              onClick={() => window.location.href = "/orders"}
              style={{
                padding: "0.8rem 1.5rem",
                borderRadius: "8px",
                background: "var(--bistre)",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              📋 Ver pedidos
            </button>
          </div>
        </div>
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
          <button 
            onClick={() => setShowPaymentModal(true)} 
            disabled={updating} 
            style={{ 
              margin: "1.5rem auto 0", 
              padding: "0.8rem 1.5rem", 
              fontSize: "1.2rem", 
              borderRadius: "8px", 
              background: "var(--yellow-green)", 
              color: "var(--black)", 
              border: "none", 
              cursor: "pointer", 
              boxShadow: "0 1px 6px rgba(65, 39, 34, 0.10)", 
              display: "block" 
            }}
          >
            Realizar pedido
          </button>
        </>
      )}

      {/* Modal simple de selección de pago */}
      {showPaymentModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            padding: "2rem",
            borderRadius: "16px",
            maxWidth: "500px",
            width: "90%",
            textAlign: "center"
          }}>
            {currentPaymentStep === "select" && (
              <>
                <h3 style={{ 
                  fontFamily: "'Pacifico', cursive", 
                  fontSize: "1.5rem", 
                  color: "var(--bistre)", 
                  marginBottom: "1.5rem"
                }}>
                  Selecciona método de pago
                </h3>
                
                <div style={{ marginBottom: "2rem" }}>
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        marginBottom: "0.5rem",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        background: "white",
                        cursor: "pointer",
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem"
                      }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>{method.icon}</span>
                      {method.name}
                    </button>
                  ))}
                </div>
              </>
            )}

            {currentPaymentStep === "form" && (
              <div style={{ textAlign: "left" }}>
                <h3 style={{ 
                  fontFamily: "'Pacifico', cursive", 
                  fontSize: "1.5rem", 
                  color: "var(--bistre)", 
                  marginBottom: "1.5rem",
                  textAlign: "center"
                }}>
                  Datos de pago
                </h3>
                
                {/* Formulario para tarjeta */}
                {selectedPaymentMethod === "tarjeta" && (
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                      Número de tarjeta:
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.8rem",
                        border: paymentErrors.cardNumber ? "1px solid red" : "1px solid #ddd",
                        borderRadius: "4px",
                        marginBottom: "0.5rem"
                      }}
                    />
                    {paymentErrors.cardNumber && (
                      <p style={{ color: "red", fontSize: "0.9rem", marginBottom: "1rem" }}>
                        {paymentErrors.cardNumber}
                      </p>
                    )}
                    
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                      Titular:
                    </label>
                    <input
                      type="text"
                      placeholder="Juan Pérez"
                      value={paymentData.cardHolder}
                      onChange={(e) => setPaymentData({...paymentData, cardHolder: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.8rem",
                        border: paymentErrors.cardHolder ? "1px solid red" : "1px solid #ddd",
                        borderRadius: "4px",
                        marginBottom: "0.5rem"
                      }}
                    />
                    {paymentErrors.cardHolder && (
                      <p style={{ color: "red", fontSize: "0.9rem", marginBottom: "1rem" }}>
                        {paymentErrors.cardHolder}
                      </p>
                    )}
                    
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                          Vencimiento:
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={paymentData.expiry}
                          onChange={(e) => setPaymentData({...paymentData, expiry: e.target.value})}
                          style={{
                            width: "100%",
                            padding: "0.8rem",
                            border: paymentErrors.expiry ? "1px solid red" : "1px solid #ddd",
                            borderRadius: "4px"
                          }}
                        />
                        {paymentErrors.expiry && (
                          <p style={{ color: "red", fontSize: "0.9rem" }}>
                            {paymentErrors.expiry}
                          </p>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                          CVV:
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                          style={{
                            width: "100%",
                            padding: "0.8rem",
                            border: paymentErrors.cvv ? "1px solid red" : "1px solid #ddd",
                            borderRadius: "4px"
                          }}
                        />
                        {paymentErrors.cvv && (
                          <p style={{ color: "red", fontSize: "0.9rem" }}>
                            {paymentErrors.cvv}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Formulario para Bizum */}
                {selectedPaymentMethod === "bizum" && (
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                      Número de teléfono:
                    </label>
                    <input
                      type="text"
                      placeholder="612345678"
                      value={paymentData.phoneNumber}
                      onChange={(e) => setPaymentData({...paymentData, phoneNumber: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.8rem",
                        border: paymentErrors.phoneNumber ? "1px solid red" : "1px solid #ddd",
                        borderRadius: "4px"
                      }}
                    />
                    {paymentErrors.phoneNumber && (
                      <p style={{ color: "red", fontSize: "0.9rem" }}>
                        {paymentErrors.phoneNumber}
                      </p>
                    )}
                  </div>
                )}

                {/* Formulario para transferencia */}
                {selectedPaymentMethod === "transferencia" && (
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                      IBAN:
                    </label>
                    <input
                      type="text"
                      placeholder="ES91 2100 0418 4502 0005 1332"
                      value={paymentData.iban}
                      onChange={(e) => setPaymentData({...paymentData, iban: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.8rem",
                        border: paymentErrors.iban ? "1px solid red" : "1px solid #ddd",
                        borderRadius: "4px",
                        marginBottom: "1rem"
                      }}
                    />
                    {paymentErrors.iban && (
                      <p style={{ color: "red", fontSize: "0.9rem", marginBottom: "1rem" }}>
                        {paymentErrors.iban}
                      </p>
                    )}
                    
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                      Titular de la cuenta:
                    </label>
                    <input
                      type="text"
                      placeholder="Juan Pérez"
                      value={paymentData.accountHolder}
                      onChange={(e) => setPaymentData({...paymentData, accountHolder: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.8rem",
                        border: paymentErrors.accountHolder ? "1px solid red" : "1px solid #ddd",
                        borderRadius: "4px"
                      }}
                    />
                    {paymentErrors.accountHolder && (
                      <p style={{ color: "red", fontSize: "0.9rem" }}>
                        {paymentErrors.accountHolder}
                      </p>
                    )}
                  </div>
                )}

                {/* Confirmación para efectivo */}
                {selectedPaymentMethod === "efectivo" && (
                  <div style={{ marginBottom: "1rem", textAlign: "center" }}>
                    <p style={{ fontSize: "1.1rem", color: "#666", marginBottom: "1rem" }}>
                      Pagarás en caja al recoger tu pedido
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                  <button
                    onClick={() => setCurrentPaymentStep("select")}
                    style={{
                      flex: 1,
                      padding: "0.8rem",
                      borderRadius: "8px",
                      background: "#f5f5f5",
                      color: "#666",
                      border: "1px solid #ddd",
                      cursor: "pointer",
                      fontSize: "1rem"
                    }}
                  >
                    Atrás
                  </button>
                  <button
                    onClick={() => handlePaymentSubmit(selectedPaymentMethod)}
                    style={{
                      flex: 1,
                      padding: "0.8rem",
                      borderRadius: "8px",
                      background: "var(--yellow-green)",
                      color: "var(--black)",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1rem"
                    }}
                  >
                    Pagar
                  </button>
                </div>
              </div>
            )}

            {currentPaymentStep === "select" && (
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  padding: "0.8rem 1.5rem",
                  borderRadius: "8px",
                  background: "#f5f5f5",
                  color: "#666",
                  border: "1px solid #ddd",
                  cursor: "pointer",
                  fontSize: "1rem"
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pantalla de procesamiento simple */}
      {currentPaymentStep === "processing" && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            padding: "2.5rem",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            maxWidth: "400px",
            width: "90%"
          }}>
            <div style={{ 
              fontSize: "4rem", 
              marginBottom: "1.5rem"
            }}>⏳</div>
            <h3 style={{ 
              fontFamily: "'Pacifico', cursive", 
              fontSize: "1.8rem", 
              color: "var(--bistre)", 
              marginBottom: "1rem"
            }}>
              Procesando pago
            </h3>
            <p style={{
              fontSize: "1.1rem",
              color: "#666",
              marginBottom: "1.5rem",
              minHeight: "1.5rem"
            }}>
              {processingMessage}
            </p>
            <div style={{
              width: "100%",
              height: "4px",
              background: "#f0f0f0",
              borderRadius: "2px",
              overflow: "hidden"
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                background: "var(--yellow-green)",
                borderRadius: "2px"
              }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 