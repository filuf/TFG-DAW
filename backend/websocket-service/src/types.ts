import { z } from 'zod';

// Esquema de validación con Zod
const ProductoSchema = z.object({
  nombreProducto: z.string(),
  cantidad: z.number().int().positive(),
});

const PedidoSchema = z.object({
  id: z.number(),
  comprador: z.string(),
  descripcion: z.string(),
  pagado: z.boolean(),
  productos: z.array(ProductoSchema),
});

type Result = {
  success: boolean;
  error?: string;
};

type JwtUserDetailsAuthorities = {
  authorities: authority[];
};

type authority = 'SYSTEM' | 'USER' | 'ADMIN';

// Tipos inferidos de los esquemas
type Pedido = z.infer<typeof PedidoSchema>;
type Producto = z.infer<typeof ProductoSchema>;

export {
  Pedido,
  Producto,
  ProductoSchema,
  PedidoSchema,
  Result,
  JwtUserDetailsAuthorities,
  authority,
};
