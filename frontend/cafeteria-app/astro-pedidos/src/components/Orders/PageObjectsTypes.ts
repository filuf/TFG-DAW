export interface Product {
    productId: number;
    name: string;
    price: number;
    imageUrl: string;
    quantity: number;
}
  
export interface Order {
    id: number;
    description: string;
    products: Product[];
    paid: boolean;
    dateTime: string;
}
  
export interface Sort {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
}
  
export interface Pageable {
    pageNumber: number;
    pageSize: number;
    sort: Sort;
    offset: number;
    unpaged: boolean;
    paged: boolean;
}
  
export interface OrdersResponse {
    content: Order[];
    pageable: Pageable;
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    sort: Sort;
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}