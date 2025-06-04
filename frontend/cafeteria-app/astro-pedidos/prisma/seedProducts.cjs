const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const products = [
  {
    product_name: 'Café espresso',
    product_price: 1.20,
    is_unlimited: true,
    url_image: '/images/cafe_expresso.jpeg',
    product_description: 'Intenso, aromático y recién hecho.'
  },
  {
    product_name: 'Café con leche',
    product_price: 1.50,
    is_unlimited: true,
    url_image: '/images/cafe_leche.jpeg',
    product_description: 'Café suave con leche cremosa.'
  },
  {
    product_name: 'Café americano',
    product_price: 1.30,
    is_unlimited: true,
    url_image: '/images/cafe_americano.jpeg',
    product_description: 'Café largo, suave y ligero.'
  },
  {
    product_name: 'Café descafeinado',
    product_price: 1.30,
    is_unlimited: true,
    url_image: '/images/cafe_descafeinado.jpeg',
    product_description: 'Todo el sabor, sin cafeína.'
  },
  {
    product_name: 'Café capuchino',
    product_price: 1.80,
    is_unlimited: true,
    url_image: '/images/cafe_capuchino.jpeg',
    product_description: 'Café con espuma de leche y cacao.'
  },
  {
    product_name: 'Croissant',
    product_price: 1.10,
    is_unlimited: false,
    url_image: '/images/croissant.jpeg',
    product_description: 'Hojaldre crujiente y mantecoso.'
  },
  {
    product_name: 'Napolitana de crema',
    product_price: 1.30,
    is_unlimited: false,
    url_image: '/images/napolitana_crema.jpeg',
    product_description: 'Bollería rellena de crema pastelera.'
  },
  {
    product_name: 'Napolitana de chocolate',
    product_price: 1.30,
    is_unlimited: false,
    url_image: '/images/napolitana_choco.jpeg',
    product_description: 'Bollería rellena de chocolate.'
  },
  {
    product_name: 'Donut glaseado',
    product_price: 1.20,
    is_unlimited: false,
    url_image: '/images/donut.jpeg',
    product_description: 'Rosquilla dulce y esponjosa.'
  },
  {
    product_name: 'Muffin de arándanos',
    product_price: 1.50,
    is_unlimited: false,
    url_image: '/images/muffin_arandanos.jpeg',
    product_description: 'Bizcocho tierno con arándanos.'
  },
  {
    product_name: 'Zumo natural',
    product_price: 1.80,
    is_unlimited: false,
    url_image: '/images/zumo.jpeg',
    product_description: 'Refrescante y lleno de vitaminas.'
  },
  {
    product_name: 'Agua mineral',
    product_price: 1.00,
    is_unlimited: true,
    url_image: '/images/agua.jpeg',
    product_description: 'Botella de agua mineral natural.'
  },
  {
    product_name: 'Té verde',
    product_price: 1.40,
    is_unlimited: true,
    url_image: '/images/te_verde.jpeg',
    product_description: 'Infusión antioxidante y saludable.'
  },
  {
    product_name: 'Té negro',
    product_price: 1.40,
    is_unlimited: true,
    url_image: '/images/te_negro.jpeg',
    product_description: 'Infusión intensa y aromática.'
  },
  {
    product_name: 'Bocadillo de jamón',
    product_price: 2.50,
    is_unlimited: false,
    url_image: '/images/bocadillo_jamon.jpeg',
    product_description: 'Pan crujiente con jamón serrano.'
  },
  {
    product_name: 'Bocadillo de queso',
    product_price: 2.30,
    is_unlimited: false,
    url_image: '/images/bocadillo_queso.jpeg',
    product_description: 'Pan crujiente con queso manchego.'
  },
  {
    product_name: 'Empanada de atún',
    product_price: 2.00,
    is_unlimited: false,
    url_image: '/images/empanada_atun.jpeg',
    product_description: 'Empanada rellena de atún y tomate.'
  },
  {
    product_name: 'Empanada de carne',
    product_price: 2.00,
    is_unlimited: false,
    url_image: '/images/empanada_carne.jpeg',
    product_description: 'Empanada rellena de carne y especias.'
  },
  {
    product_name: 'Snack de patatas',
    product_price: 1.00,
    is_unlimited: false,
    url_image: '/images/snack_patatas.jpeg',
    product_description: 'Bolsa de patatas fritas.'
  },
  {
    product_name: 'Barrita de cereales',
    product_price: 1.20,
    is_unlimited: false,
    url_image: '/images/barrita_cereales.jpeg',
    product_description: 'Barrita energética de cereales.'
  },
  {
    product_name: 'Yogur natural',
    product_price: 1.10,
    is_unlimited: false,
    url_image: '/images/yogur.jpeg',
    product_description: 'Yogur cremoso y saludable.'
  },
  {
    product_name: 'Fruta fresca',
    product_price: 1.00,
    is_unlimited: false,
    url_image: '/images/fruta.jpeg',
    product_description: 'Pieza de fruta de temporada.'
  },
  {
    product_name: 'Tarta de queso',
    product_price: 2.20,
    is_unlimited: false,
    url_image: '/images/tarta_queso.jpeg',
    product_description: 'Porción de tarta de queso casera.'
  },
  {
    product_name: 'Brownie de chocolate',
    product_price: 2.00,
    is_unlimited: false,
    url_image: '/images/brownie.jpeg',
    product_description: 'Brownie tierno y jugoso.'
  },
  {
    product_name: 'Ensalada fresca',
    product_price: 2.50,
    is_unlimited: false,
    url_image: '/images/ensalada.jpeg',
    product_description: 'Ensalada variada y saludable.'
  },
  {
    product_name: 'Sandwich vegetal',
    product_price: 2.20,
    is_unlimited: false,
    url_image: '/images/sandwich_vegetal.jpeg',
    product_description: 'Sandwich con vegetales frescos.'
  }
];

async function main() {
  for (const product of products) {
    await prisma.products.create({ data: product });
  }
  console.log('Productos de prueba insertados correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 