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
            if (sessionStorageToken) {
                setLoading(true);
                try {
                    //añadir pagina al fetch
                    const response = await fetch(apiOrdersUrl + "/order/history" + "?page=" + page, {
                        headers: {
                            authorization: `Bearer ${sessionStorageToken}`,
                        },
                    });

                    if (response.status === 403) { //forbidden
                        sessionStorage.removeItem("token");
                        console.error("Token eliminado debido a un error de autenticación.");
                        return;
                    }

                    const data = await response.json();
                    console.log(data);
                    setOrders(data);
                } catch (error) {
                    console.error("Error fetching orders:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchOrders();
    }, [page, apiOrdersUrl, sessionStorageToken]);

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
