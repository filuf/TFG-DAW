import styles from "./OrderElement.module.css";

interface PageMenuProps {
    totalPages: number;
    first: boolean;
    last: boolean;
    currentPage: number;
}

export default function PageMenu({ totalPages, first, last, currentPage }: PageMenuProps) {

    const url = new URL(window.location.href);

    const newPage = (page: string) => {
        url.searchParams.set("page", page);
        window.location.href = url.toString();
    }

    return (
        <div className={styles.pageControlContainer}>
            {!first && 
                <button 
                    className={styles.pageControlButton}
                    onClick={ () => newPage(currentPage - 1 + "")}>{"<"}
                </button>}
            <p>Página {currentPage + 1} de {totalPages}</p>
            {!last && 
                <button 
                    className={styles.pageControlButton}
                    onClick={ () => newPage(currentPage + 1 + "")}>{">"}
                </button>}
        </div>
    );
}