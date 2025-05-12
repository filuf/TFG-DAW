import Skeleton from "react-loading-skeleton";
import type { Order, Product } from "./PageObjectsTypes";
import "react-loading-skeleton/dist/skeleton.css";
import "./OrderElement.css";

export default function OrderElement({ id, description, paid, products, loading }: Order & { loading?: boolean }) {

    function totalPrice (products: Product[]): string {
        return products.reduce((total, product) => total + (product.price * product.quantity), 0).toFixed(2);
    }

    const productsToRender = loading
    ? Array.from({ length: 2 }).map((_, i) => ({
        productId: `skeleton-${i}`,
        imageUrl: "",
        name: "",
        price: 0,
        quantity: 0,
    }))
    : products;

    return(
        <article className="order-element-container" key={id}>
            <div className="order-details">
                <div className="order-date">
                    <span><b>fecha</b></span>
                    <span>{loading ? <Skeleton width={100} /> : "ejemplo"/* poner fecha */}</span>
                </div>
            </div>
            <div className="products-container">
                {productsToRender.map(({ productId, imageUrl, name, price, quantity }) => 
                    <div key={productId} className="product-container">
                        <div className="image-product-container">
                            {loading ?
                                <Skeleton width={50} height={50} style={{borderRadius: "8px"}}/>
                            : 
                                <img className="image-product" src={imageUrl || "/astro.png"} alt={"imagen " + name} />
                            }
                        </div>
                        
                        <div className="product-details-container">
                            <span><b>{loading ? <Skeleton width={80} /> : name}</b></span>
                            <span>{loading ? <Skeleton width={50} /> : `${price.toFixed(2)}€`}</span>
                            <span>{loading ? <Skeleton width={60} /> : `${quantity} ${quantity > 1 ? "unidades" : "unidad"}`}</span>
                        </div>
                    </div>
                )}
            </div>
            <p>DESCRIPCIÓN: {loading ? <Skeleton width={180} /> : description}</p>
            <p>PRECIO TOTAL: {loading ? <Skeleton width={80} /> : `${totalPrice(products)}€`}</p>
            <p>PAGADO: {loading ? <Skeleton width={30} /> : paid ? "sí" : "no"}</p>
            <p>IDENTIFICADOR: {loading ? <Skeleton width={100} /> : id}</p>
        </article>
    )
}