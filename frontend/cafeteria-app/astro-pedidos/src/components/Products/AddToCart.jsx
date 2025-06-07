import "./AddToCart.css";
import { toast } from 'react-toastify';

export default function AddToCart({apiOrdersUrl, productId}) { 

    const postProductToCart = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const sessionStorageToken = sessionStorage.getItem("token");
        if (!sessionStorageToken) {
            // Si no existe el token de sesión, se muestra un mensaje de error.
            toast.error("No estás autenticado. Por favor, inicia sesión.");
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
                    idProduct: Number(productId),
                    quantity: 1,
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
        <button className="product-button" onClick={postProductToCart}>+</button>
    ) 
}