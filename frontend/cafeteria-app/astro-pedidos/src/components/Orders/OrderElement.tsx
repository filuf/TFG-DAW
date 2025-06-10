import Skeleton from "react-loading-skeleton";
import type { Order, Product } from "./PageObjectsTypes";
import "react-loading-skeleton/dist/skeleton.css";
import styles from "./OrderElement.module.css";

export default function OrderElement({ id, description, paid, products, dateTime, loading }: Order & { loading?: boolean }) {

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
        <article className={styles.orderElementContainer} key={id}>
            <div className={styles.orderDetailsContainer}>
                <div className={styles.orderDate}>
                    <p className={styles.orderDetailsField}>IDENTIFICADOR: {loading ? <Skeleton width={100} /> : id}</p>
                    <span>{loading ? <Skeleton width={100} /> : dateTime}</span>
                </div>
            </div>
            <div className={styles.productsContainer}>
                {productsToRender.map(({ productId, imageUrl, name, price, quantity }) => 
                    <a href={`/products/${name}-${productId}`} key={productId} className={styles.productContainer}>
                        <div className={styles.imageProductContainer}>
                            {loading ?
                                <Skeleton width={50} height={50} style={{borderRadius: "8px"}}/>
                            : 
                                <img className={styles.imageProduct} src={imageUrl || "/astro.png"} alt={`imagen ${name}`} />
                            }
                        </div>
                        
                        <div className={styles.productDetailsContainer}>
                            <span className={styles.productName}><b>{loading ? <Skeleton width={80} /> : name}</b></span>
                            <span className={styles.productPrice}>{loading ? <Skeleton width={50} /> : `${price.toFixed(2)}€`}</span>
                            <span className={styles.productQuantity}>{loading ? <Skeleton width={60} /> : `${quantity} ${quantity > 1 ? "unidades" : "unidad"}`}</span>
                        </div>
                    </a>
                )}
            </div>
            <p className={styles.orderDetailsField}>DESCRIPCIÓN: {loading ? <Skeleton width={180} /> : description}</p>
            <p className={styles.orderDetailsField}>PRECIO TOTAL: {loading ? <Skeleton width={80} /> : `${totalPrice(products)}€`}</p>
            <p className={styles.orderDetailsField}>PAGADO: {loading ? <Skeleton width={30} /> : paid ? "sí" : "no"}</p>

        </article>
    )
}