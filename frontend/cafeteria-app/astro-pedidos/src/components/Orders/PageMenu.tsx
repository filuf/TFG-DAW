
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
        <div className="page-control-container">
            {!first && 
                <button 
                    className="page-control-button"
                    onClick={ () => newPage(currentPage - 1 + "")}>{"<"}
                </button>}
            <p>Página {currentPage + 1} de {totalPages}</p>
            {!last && 
                <button 
                    className="page-control-button"
                    onClick={ () => newPage(currentPage + 1 + "")}>{">"}
                </button>}
        </div>
    );
}