export interface Product {
  id: number;
  name: string;
  code: string;
  category: string;
  unit_price: number;
  unit: string;
  description: string;
  min_order_qty: number;
  in_stock: boolean;
  stock_qty: number;
  image_placeholder_color: string;
}

export const mockProducts: Product[] = [
  { id: 1,  name: 'Bonite Water 500ml',         code: 'BNT-W-500',    category: 'Water',   unit_price: 1500,  unit: 'Bottle', description: 'Pure natural spring water – 500ml bottle', min_order_qty: 24, in_stock: true,  stock_qty: 5000, image_placeholder_color: '#DBEAFE' },
  { id: 2,  name: 'Bonite Water 1.5L',           code: 'BNT-W-1500',   category: 'Water',   unit_price: 3000,  unit: 'Bottle', description: 'Pure natural spring water – 1.5L bottle',   min_order_qty: 12, in_stock: true,  stock_qty: 3200, image_placeholder_color: '#DBEAFE' },
  { id: 3,  name: 'Bonite Water 5L',             code: 'BNT-W-5000',   category: 'Water',   unit_price: 8500,  unit: 'Bottle', description: 'Pure natural spring water – 5L bottle',      min_order_qty: 6,  in_stock: true,  stock_qty: 1400, image_placeholder_color: '#DBEAFE' },
  { id: 4,  name: 'Bonite Water 20L',            code: 'BNT-W-20000',  category: 'Water',   unit_price: 25000, unit: 'Bottle', description: 'Dispensable spring water – 20L gallon',      min_order_qty: 3,  in_stock: false, stock_qty: 0,    image_placeholder_color: '#DBEAFE' },
  { id: 5,  name: 'Bonite Soda Orange 500ml',    code: 'BNT-S-OR-500', category: 'Soda',    unit_price: 1800,  unit: 'Can',    description: 'Carbonated orange flavored soda – 500ml',   min_order_qty: 24, in_stock: true,  stock_qty: 4200, image_placeholder_color: '#FED7AA' },
  { id: 6,  name: 'Bonite Soda Lemon 500ml',     code: 'BNT-S-LM-500', category: 'Soda',    unit_price: 1750,  unit: 'Can',    description: 'Carbonated lemon flavored soda – 500ml',    min_order_qty: 24, in_stock: true,  stock_qty: 3100, image_placeholder_color: '#FEF08A' },
  { id: 7,  name: 'Bonite Juice Mango 1L',       code: 'BNT-J-MG-1L',  category: 'Juice',   unit_price: 4200,  unit: 'Pack',   description: 'Fresh mango juice – 1L Tetra pak',          min_order_qty: 12, in_stock: true,  stock_qty: 2800, image_placeholder_color: '#FDE68A' },
  { id: 8,  name: 'Bonite Juice Passion 1L',     code: 'BNT-J-PS-1L',  category: 'Juice',   unit_price: 4200,  unit: 'Pack',   description: 'Fresh passion fruit juice – 1L Tetra pak', min_order_qty: 12, in_stock: true,  stock_qty: 1900, image_placeholder_color: '#F9A8D4' },
  { id: 9,  name: 'Bonite Energy Drink 250ml',   code: 'BNT-E-250',    category: 'Energy',  unit_price: 2800,  unit: 'Can',    description: 'High-energy taurine drink – 250ml can',     min_order_qty: 24, in_stock: true,  stock_qty: 3600, image_placeholder_color: '#6EE7B7' },
  { id: 10, name: 'Bonite Energy Drink 500ml',   code: 'BNT-E-500',    category: 'Energy',  unit_price: 4500,  unit: 'Can',    description: 'High-energy taurine drink – 500ml can',     min_order_qty: 12, in_stock: true,  stock_qty: 2100, image_placeholder_color: '#6EE7B7' },
  { id: 11, name: 'Bonite Tonic Water 300ml',    code: 'BNT-T-300',    category: 'Tonic',   unit_price: 3200,  unit: 'Bottle', description: 'Premium tonic water with quinine – 300ml',  min_order_qty: 24, in_stock: true,  stock_qty: 1500, image_placeholder_color: '#C7D2FE' },
  { id: 12, name: 'Bonite Sparkling Water 750ml', code: 'BNT-SP-750',  category: 'Water',   unit_price: 5500,  unit: 'Bottle', description: 'Naturally sparkling mineral water – 750ml', min_order_qty: 12, in_stock: false, stock_qty: 0,    image_placeholder_color: '#DBEAFE' },
];

export const productCategories = ['All', 'Water', 'Soda', 'Juice', 'Energy', 'Tonic'];
