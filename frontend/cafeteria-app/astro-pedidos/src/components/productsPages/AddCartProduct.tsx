import "./AddCartProduct.css";
import { useEffect, useState } from "react";

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function AddCartProduct({apiOrdersUrl, idProduct, productPrice} : {apiOrdersUrl: string, idProduct: number, productPrice: number}) {

    const sessionStorageToken = sessionStorage.getItem("token");
    const [errorMessage, setErrorMessage] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState(productPrice);

    useEffect(() => {
        setTotalPrice(productPrice * quantity);
    }, [quantity]);

    const handleQuantityChange = (event: { target: { value: string; }; }) => {
        setQuantity(parseInt(event.target.value));
    }

    const addToCart = async () => {
        setErrorMessage(""); // Reiniciar el mensaje de error antes de intentar añadir al carrito.
        if (!sessionStorageToken) {
            // Si no existe el token de sesión, se muestra un mensaje de error.
            toast.error("No estás autenticado. Por favor, inicia sesión.");
            return;
        }
        if (quantity <= 0) {
            // Si la cantidad es menor o igual a cero, se muestra un mensaje de error.
            toast.error("La cantidad debe ser mayor que cero.");
            return;
        }
        // Intentar ejecutar el fetch.
        try {
            // Se ejecuta el fetch a la API de pedidos usando el token de sesión.
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
            // Si la respuesta es exitosa, se muestra un mensaje de éxito.
            if (response.ok) {
                toast.success("Carrito actualizado correctamente.");
            }
        } catch (error) {
            // Se muestra un mensaje de error en la consola.
            toast.error("Error al añadir el producto al carrito. Por favor, inténtalo de nuevo más tarde.");
            console.error("Error al añadir el producto al carrito:", error);
        }
    
    }

    return (
        <>
            <ToastContainer 
                position="bottom-right"
                autoClose={5000} 
                theme="colored" 
                draggable={true}
                style={{marginBottom: '50px'}}
            />

            <p>{productPrice.toFixed(2)} €</p>
            <div className="quantity-container">
                <label htmlFor="cantidad">Cantidad:</label>
                <select name="cantidad" className="product-quantity" onChange={handleQuantityChange}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            </div>
            <p>precio total: {totalPrice.toFixed(2)} €</p>
            
            <div className="add-cart-container">
                <button className="add-cart-button" onClick={addToCart}>añadir al carrito</button>
            </div>
        </>
    )
}
