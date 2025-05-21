import React, { useEffect, useState } from "react";
import type { Order, OrdersResponse, Pageable, Product, Sort } from "./PageObjectsTypes";
import OrderElement from "./OrderElement";
import PageMenu from "./PageMenu";

export default function OrdersFetch({ apiOrdersUrl }: { apiOrdersUrl: string }) {
    const sessionStorageToken = sessionStorage.getItem("token");
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = React.useState<OrdersResponse | null>(null);
    const [page, setPage] = useState("");

    useEffect(() => {
        //extrae el parámetro de la url
        const urlParamas = new URLSearchParams(window.location.search);
        setPage(urlParamas.get("page") || "");
        console.log(page);
    }, [])

    useEffect(() => {
        const fetchOrders = async () => {
            // ¿Existe el token de sesión? Si existe, se ejecuta el fetch.
            if (sessionStorageToken) {
                // Se establece el estado de carga a true para mostrar un loading.
                setLoading(true);
                // Intentar ejecutar el fetch.
                try {
                    // Se ejecuta el fetch a la API de pedidos usando el token de sesión.
                    const response = await fetch(apiOrdersUrl + "/order/history" + "?page=" + page, {
                        headers: {
                            authorization: `Bearer ${sessionStorageToken}`,
                        },
                    });
                    // Si el fetch devuelve un error 403, se elimina el token de sesión.
                    if (response.status === 403) {
                        // Se elimina el token de sesión.
                        sessionStorage.removeItem("token");
                        // Se muestra un mensaje de error.
                        console.error("Token eliminado debido a un error de autenticación.");
                        return;
                    }
                    // Se convierte la respuesta a un objeto JSON.
                    const data = await response.json();
                    // Se muestra el objeto JSON en la consola.
                    console.log(data);
                    // Se establece el estado de los pedidos.
                    setOrders(data);
                } catch (error) {
                    // Se muestra un mensaje de error en la consola.
                    console.error("Error fetching orders:", error);
                } finally {
                    // Se establece el estado de carga a false para ocultar el loading.
                    setLoading(false);
                }
            }
        };
        // Se ejecuta el fetch.
        fetchOrders();
    }, 
    // Si "page", la "url" o el "token" cambian, se ejecuta el fetch otra vez.
    [page, apiOrdersUrl, sessionStorageToken]);

    return (
        <>
            {sessionStorageToken == null && (
                <p>Ha ocurrido un error, por favor, inicia sesión de nuevo</p>
            )}

            {loading && (
                <>
                    {Array.from({ length: 3}).map( (_, i) => (
                        <OrderElement
                            key={i}
                            loading={true}
                            id={1}
                            description=""
                            paid={false}
                            products={[]}
                        />
                    ))}
                </>
            )}

            {!loading && orders != null && orders.empty && (
                <p>Todavía no has hecho ningún pedido</p>
            )}

            {!loading && orders != null && !orders.empty && (
                <>
                {orders.content.map(order => (
                    <OrderElement key={order.id} {...order} loading={false} />
                ))}
                    <PageMenu 
                        currentPage={orders.number}
                        first={orders.first}
                        last={orders.last}
                        totalPages={orders.totalPages}
                    />
                </>
            )}
        </>
    );
}
