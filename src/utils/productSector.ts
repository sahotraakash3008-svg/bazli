import { Product, Seller, Order, SellerType } from '../types';

export type ProductSector = 'grocery' | 'restaurant' | 'stationery';

export const GROCERY_CATEGORIES = [
  'Atta, Rice & Dal',
  'Oil & Ghee',
  'Masala & Spices',
  'Vegetables & Fruits',
  'Dairy & Bakery',
  'Snacks & Munchies',
  'Beverages & Drinks',
  'Cleaning & Household',
  'Personal Care'
];

export const RESTAURANT_CATEGORIES = [
  'Biryani & Rice Bowls',
  'North Indian Curries',
  'Tandoori & Starters',
  'Breads & Rotis',
  'Pizzas & Burgers',
  'Chinese & Momos',
  'Kolkata Rolls & Fast Bites',
  'South Indian Tiffins',
  'Desserts & Beverages'
];

export const STATIONERY_CATEGORIES = [
  'Art & Craft Supplies',
  'Notebooks & Registers',
  'Pens & Writing',
  'School & Geometry Sets',
  'Adhesives, Tapes & Tools',
  'Paper, Files & Folders',
  'Office & Desk Essentials',
  'Document Printing & Xerox'
];

/**
 * Checks if a category string belongs to the restaurant domain
 */
export function isRestaurantCategory(category: string): boolean {
  if (!category) return false;
  const c = category.toLowerCase();
  return (
    c.includes('restaurant') ||
    c.includes('biryani') ||
    c.includes('curry') ||
    c.includes('tandoor') ||
    c.includes('thali') ||
    c.includes('pizza') ||
    c.includes('burger') ||
    c.includes('dosa') ||
    c.includes('momo') ||
    c.includes('breads & rotis') ||
    c.includes('fast bites') ||
    c.includes('chinese') ||
    c.includes('north indian') ||
    c.includes('desserts & beverages')
  );
}

/**
 * Checks if a category string belongs to the stationery domain
 */
export function isStationeryCategory(category: string): boolean {
  if (!category) return false;
  const c = category.toLowerCase();
  return (
    c.includes('stationery') ||
    c.includes('pen') ||
    c.includes('notebook') ||
    c.includes('register') ||
    c.includes('xerox') ||
    c.includes('art & craft') ||
    c.includes('school & geometry') ||
    c.includes('office & desk') ||
    c.includes('paper, files') ||
    c.includes('adhesives, tapes') ||
    c.includes('craft supplies')
  );
}

/**
 * Determines whether a product strictly belongs to the Restaurant portal
 */
export function isRestaurantProduct(product: Partial<Product>): boolean {
    if (product?.sellerType === 'restaurant') return true;
    if (product?.sellerType === 'grocery' || product?.sellerType === 'stationery') return false;
    return isRestaurantCategory(product?.category || '');
}

/**
 * Determines whether a product strictly belongs to the Stationery portal
 */
export function isStationeryProduct(product: Partial<Product>): boolean {
    if (product?.sellerType === 'stationery') return true;
    if (product?.sellerType === 'grocery' || product?.sellerType === 'restaurant') return false;
    return isStationeryCategory(product?.category || '');
}

/**
 * Determines whether a product strictly belongs to the Grocery portal
 */
export function isGroceryProduct(product: Partial<Product>): boolean {
  if (product.sellerType === 'grocery') return true;
  if (product.sellerType === 'restaurant' || product.sellerType === 'stationery') return false;
  return !isRestaurantProduct(product) && !isStationeryProduct(product);
}

/**
 * Resolves the definite sector of any product
 */
export function getProductSector(product: Partial<Product>): ProductSector {
  if (isRestaurantProduct(product)) return 'restaurant';
  if (isStationeryProduct(product)) return 'stationery';
  return 'grocery';
}

/**
 * Get category options based on portal sector
 */
export function getCategoriesForSector(sector: ProductSector): string[] {
  switch (sector) {
    case 'restaurant':
      return RESTAURANT_CATEGORIES;
    case 'stationery':
      return STATIONERY_CATEGORIES;
    case 'grocery':
    default:
      return GROCERY_CATEGORIES;
  }
}

/**
 * Checks if a seller belongs to restaurant domain
 */
export function isRestaurantSeller(s: Seller): boolean {
  if (s.sellerType === 'restaurant') return true;
  if (s.sellerType === 'grocery' || s.sellerType === 'stationery') return false;
  const name = (s.businessName || '').toLowerCase();
  const cat = (s.category || '').toLowerCase();
  return (
    cat.includes('restaurant') ||
    cat.includes('kitchen') ||
    cat.includes('dining') ||
    cat.includes('dhaba') ||
    cat.includes('cafe') ||
    name.includes('restaurant') ||
    name.includes('kitchen') ||
    name.includes('dhaba') ||
    name.includes('cafe') ||
    name.includes('biryani') ||
    name.includes('bhojnalaya') ||
    name.includes('food')
  );
}

/**
 * Checks if a seller belongs to stationery domain
 */
export function isStationerySeller(s: Seller): boolean {
  if (s.sellerType === 'stationery') return true;
  if (s.sellerType === 'grocery' || s.sellerType === 'restaurant') return false;
  const id = (s.id || '').toLowerCase();
  const name = (s.businessName || '').toLowerCase();
  const cat = (s.category || '').toLowerCase();
  return (
    id.startsWith('stat-') ||
    cat.includes('stationery') ||
    cat.includes('book') ||
    cat.includes('xerox') ||
    name.includes('stationery') ||
    name.includes('book') ||
    name.includes('pen') ||
    name.includes('print')
  );
}

/**
 * Checks if a seller belongs to grocery domain
 */
export function isGrocerySeller(s: Seller): boolean {
  if (s.sellerType === 'grocery') return true;
  if (s.sellerType === 'restaurant' || s.sellerType === 'stationery') return false;
  return !isRestaurantSeller(s) && !isStationerySeller(s);
}

/**
 * Resolves the sector of any seller
 */
export function getSellerSector(s: Seller): ProductSector {
  if (isRestaurantSeller(s)) return 'restaurant';
  if (isStationerySeller(s)) return 'stationery';
  return 'grocery';
}

/**
 * Checks if an order belongs to restaurant domain
 */
export function isRestaurantOrder(o: Order): boolean {
  if (o.orderType === 'restaurant' || o.sellerType === 'restaurant') return true;
  if (o.orderType === 'grocery' || o.orderType === 'stationery' || o.sellerType === 'grocery' || o.sellerType === 'stationery') return false;
  if (Boolean(o.kitchenStatus)) return true;
  return o.items.some(item => isRestaurantProduct(item.product));
}

/**
 * Checks if an order belongs to stationery domain
 */
export function isStationeryOrder(o: Order): boolean {
  if (o.orderType === 'stationery' || o.sellerType === 'stationery') return true;
  if (o.orderType === 'grocery' || o.orderType === 'restaurant' || o.sellerType === 'grocery' || o.sellerType === 'restaurant') return false;
  const sId = (o.sellerId || '').toLowerCase();
  const sName = (o.sellerName || '').toLowerCase();
  if (sId.startsWith('stat-') || sName.includes('stationery') || sName.includes('book')) return true;
  return o.items.some(item => isStationeryProduct(item.product));
}

/**
 * Checks if an order belongs to grocery domain
 */
export function isGroceryOrder(o: Order): boolean {
  if (o.orderType === 'grocery' || o.sellerType === 'grocery') return true;
  if (o.orderType === 'restaurant' || o.orderType === 'stationery' || o.sellerType === 'restaurant' || o.sellerType === 'stationery') return false;
  return !isRestaurantOrder(o) && !isStationeryOrder(o);
}

