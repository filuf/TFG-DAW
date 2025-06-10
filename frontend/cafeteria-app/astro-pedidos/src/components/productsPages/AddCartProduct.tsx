import "./AddCartProduct.css";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddCartProduct({apiOrdersUrl, idProduct, productPrice} : {apiOrdersUrl: string, idProduct: number, productPrice: number}) {
    const [quantity, setQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState(productPrice);

    useEffect(() => {
        setTotalPrice(productPrice * quantity);
    }, [quantity, productPrice]);

    const handleQuantityChange = (event: { target: { value: string; }; }) => {
        setQuantity(parseInt(event.target.value));
    }

    const addToCart = async () => {
        const sessionStorageToken = sessionStorage.getItem("token");

        if (!sessionStorageToken) {
            toast.error("No estás autenticado. Por favor, inicia sesión.");
            return;
        }
        if (quantity <= 0) {
            toast.error("La cantidad debe ser mayor que cero.");
            return;
        }

        try {
            const response = await fetch(apiOrdersUrl + "/cart/addProduct", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${sessionStorageToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    idProduct: Number(idProduct),
                    quantity: Number(quantity),
                }),
            });

            if (response.ok) {
                toast.success("Producto añadido al carrito correctamente.");
            } else {
                throw new Error("Error en la respuesta del servidor");
            }
        } catch (error) {
            toast.error("Error al añadir el producto al carrito. Por favor, inténtalo de nuevo más tarde.");
            console.error("Error al añadir el producto al carrito:", error);
        }
    }

    return (
        <div className="add-cart-wrapper">
            <ToastContainer 
                position="bottom-right"
                autoClose={3000}
                theme="colored"
                draggable={true}
                style={{marginBottom: '50px'}}
            />

            <div className="quantity-container">
                <label htmlFor="cantidad">Cantidad:</label>
                <select 
                    id="cantidad"
                    name="cantidad" 
                    className="product-quantity" 
                    value={quantity}
                    onChange={handleQuantityChange}
                >
                    {[1,2,3,4,5].map(num => (
                        <option key={num} value={num}>{num}</option>
                    ))}
                </select>
            </div>

            <p className="total-price">Total: {totalPrice.toFixed(2)} €</p>
            
            <div className="add-cart-container">
                <button 
                    className="add-cart-button" 
                    onClick={addToCart}
                    aria-label="Añadir al carrito"
                >
                    Añadir al carrito
                </button>
            </div>
        </div>
    )
}
