import { Product } from '../types';

export type UnitType = 'weight' | 'volume' | 'count';

export interface WeightPreset {
  label: string;
  gramsOrUnits: number; // in grams, ml, or pcs count
  isPopular?: boolean;
}

export interface ParsedQuantity {
  baseAmount: number;
  unit: string;
  unitType: UnitType;
  normalizedGramsOrUnits: number; // base weight in grams/ml/count
}

/**
 * Parse strings like "1 kg", "500 g", "100 g", "1 L", "750 ml", "6 pcs Pack", "10 kg", "200 g Jar"
 */
export function parseProductQuantity(quantityStr: string = ''): ParsedQuantity {
  const clean = quantityStr.toLowerCase().trim();

  // 1. Kilograms (kg)
  const kgMatch = clean.match(/([\d.]+)\s*kg/);
  if (kgMatch) {
    const num = parseFloat(kgMatch[1]);
    return {
      baseAmount: num,
      unit: 'kg',
      unitType: 'weight',
      normalizedGramsOrUnits: num * 1000
    };
  }

  // 2. Grams (g / gm / gms)
  const gMatch = clean.match(/([\d.]+)\s*(?:g|gm|gms)\b/);
  if (gMatch) {
    const num = parseFloat(gMatch[1]);
    return {
      baseAmount: num,
      unit: 'g',
      unitType: 'weight',
      normalizedGramsOrUnits: num
    };
  }

  // 3. Liters (L / ltr / litre / litres)
  const literMatch = clean.match(/([\d.]+)\s*(?:l|ltr|litre|litres)\b/);
  if (literMatch) {
    const num = parseFloat(literMatch[1]);
    return {
      baseAmount: num,
      unit: 'L',
      unitType: 'volume',
      normalizedGramsOrUnits: num * 1000
    };
  }

  // 4. Milliliters (ml)
  const mlMatch = clean.match(/([\d.]+)\s*ml\b/);
  if (mlMatch) {
    const num = parseFloat(mlMatch[1]);
    return {
      baseAmount: num,
      unit: 'ml',
      unitType: 'volume',
      normalizedGramsOrUnits: num
    };
  }

  // 5. Pieces / Count (pcs / pc / pack / eggs)
  const pcsMatch = clean.match(/([\d.]+)\s*(?:pcs|pc|piece|pieces|pack)\b/);
  if (pcsMatch) {
    const num = parseFloat(pcsMatch[1]);
    return {
      baseAmount: num,
      unit: 'pcs',
      unitType: 'count',
      normalizedGramsOrUnits: num
    };
  }

  // Default fallback: 1000 grams
  return {
    baseAmount: 1,
    unit: 'kg',
    unitType: 'weight',
    normalizedGramsOrUnits: 1000
  };
}

/**
 * Checks if a product is suitable for local market weight/quantity custom adjustment.
 * STRICTLY respects the Admin's explicit configuration (weightType / isWeightFlexible / allowCustomWeight).
 */
export function isWeightAdjustableProduct(product: Product): boolean {
  if (!product) return false;

  // 1. If Admin explicitly configured weightType or isWeightFlexible
  if (product.weightType === 'fixed') return false;
  if (product.weightType === 'flexible') return true;
  if (product.isWeightFlexible === false || product.allowCustomWeight === false) return false;
  if (product.isWeightFlexible === true || product.allowCustomWeight === true) return true;

  // 2. Restaurant, Bakery items and Stationery are strictly fixed-unit
  if (product.sellerType === 'restaurant' || product.sellerType === 'stationery') return false;

  const cat = (product.category || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const qty = (product.quantity || '').toLowerCase();

  // Fixed Packaged FMCG (Biscuits, Snacks, Instant Noodles, Sodas, Chocolates, Cleaning, Personal Care)
  if (
    cat.includes('snack') ||
    cat.includes('munchies') ||
    cat.includes('biscuit') ||
    cat.includes('beverage') ||
    cat.includes('drink') ||
    cat.includes('cleaning') ||
    cat.includes('personal') ||
    cat.includes('household') ||
    cat.includes('stationery') ||
    name.includes('maggi') ||
    name.includes('parle') ||
    name.includes('biscuit') ||
    name.includes('lays') ||
    name.includes('kurkure') ||
    name.includes('coke') ||
    name.includes('pepsi') ||
    name.includes('thums up') ||
    name.includes('sprite') ||
    name.includes('surf excel') ||
    name.includes('tide') ||
    name.includes('vim') ||
    name.includes('dettol') ||
    name.includes('soap') ||
    name.includes('shampoo') ||
    name.includes('colgate') ||
    name.includes('toothbrush') ||
    name.includes('packet') ||
    name.includes('pouch') ||
    qty.includes('pack of') ||
    qty.includes('bottle') ||
    qty.includes('can') ||
    qty.includes('box') ||
    qty.includes('strip') ||
    qty.includes('jar')
  ) {
    return false;
  }

  // Fresh Mandi Staples & Produce (Fruits, Veggies, Loose Grains, Loose Spices, Mandi Dairy/Paneer)
  if (cat.includes('fruit') || cat.includes('veg') || cat.includes('vegetable')) {
    return true;
  }

  if (cat.includes('masala') || cat.includes('spice') || name.includes('mirch') || name.includes('haldi') || name.includes('jeera') || name.includes('elaichi') || name.includes('clove') || name.includes('laung')) {
    return true;
  }

  if (cat.includes('atta') || cat.includes('rice') || cat.includes('dal') || name.includes('atta') || name.includes('rice') || name.includes('dal') || name.includes('cheeni') || name.includes('sugar')) {
    return true;
  }

  if (name.includes('paneer') || name.includes('loose milk') || name.includes('khoya') || name.includes('ghee')) {
    return true;
  }

  return false;
}

/**
 * Returns tailored preset weight options for a given product
 */
export function getWeightPresetsForProduct(product: Product): WeightPreset[] {
  const cat = (product.category || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const parsed = parseProductQuantity(product.quantity);

  // 1. Small items / premium spices (Cardamom, Elaichi, Cloves, Saffron, Chillies, Garlic, Ginger)
  if (name.includes('elaichi') || name.includes('cardamom') || name.includes('clove') || name.includes('laung') || name.includes('saffron') || name.includes('kesar') || name.includes('black pepper') || name.includes('kali mirch') || name.includes('green chill') || name.includes('ginger') || name.includes('garlic') || name.includes('adrak') || name.includes('lehsun') || name.includes('hari mirch')) {
    return [
      { label: '50 g', gramsOrUnits: 50 },
      { label: '100 g', gramsOrUnits: 100, isPopular: true },
      { label: '250 g', gramsOrUnits: 250 },
      { label: '500 g', gramsOrUnits: 500 },
      { label: '1 kg', gramsOrUnits: 1000 }
    ];
  }

  // 2. Standard Spices / Masalas (Turmeric, Red Chilli, Garam Masala, Salt, Jeera, Dhaniya Powder)
  if (cat.includes('masala') || cat.includes('spice') || name.includes('masala') || name.includes('salt') || name.includes('powder')) {
    return [
      { label: '50 g', gramsOrUnits: 50 },
      { label: '100 g', gramsOrUnits: 100, isPopular: true },
      { label: '250 g', gramsOrUnits: 250 },
      { label: '500 g', gramsOrUnits: 500 },
      { label: '1 kg', gramsOrUnits: 1000 }
    ];
  }

  // 3. Fruits & Vegetables (Tomatoes, Potatoes, Onions, Apples, Mangoes, Bhindi, etc.)
  if (cat.includes('fruit') || cat.includes('veg')) {
    return [
      { label: '250 g', gramsOrUnits: 250 },
      { label: '500 g', gramsOrUnits: 500, isPopular: true },
      { label: '1 kg', gramsOrUnits: 1000, isPopular: true },
      { label: '2 kg', gramsOrUnits: 2000 },
      { label: '3 kg', gramsOrUnits: 3000 },
      { label: '5 kg', gramsOrUnits: 5000 }
    ];
  }

  // 4. Atta, Rice, Dal & Grains (Heavy Staples)
  if (cat.includes('atta') || cat.includes('rice') || cat.includes('dal') || name.includes('atta') || name.includes('rice') || name.includes('dal') || name.includes('sugar')) {
    if (parsed.normalizedGramsOrUnits >= 5000) {
      return [
        { label: '1 kg', gramsOrUnits: 1000 },
        { label: '2 kg', gramsOrUnits: 2000 },
        { label: '5 kg', gramsOrUnits: 5000, isPopular: true },
        { label: '10 kg', gramsOrUnits: 10000, isPopular: true },
        { label: '25 kg', gramsOrUnits: 25000 }
      ];
    }
    return [
      { label: '500 g', gramsOrUnits: 500 },
      { label: '1 kg', gramsOrUnits: 1000, isPopular: true },
      { label: '2 kg', gramsOrUnits: 2000 },
      { label: '5 kg', gramsOrUnits: 5000 },
      { label: '10 kg', gramsOrUnits: 10000 }
    ];
  }

  // 5. Oils & Liquids
  if (parsed.unitType === 'volume' || cat.includes('oil') || cat.includes('beverage')) {
    return [
      { label: '250 ml', gramsOrUnits: 250 },
      { label: '500 ml', gramsOrUnits: 500, isPopular: true },
      { label: '1 L', gramsOrUnits: 1000, isPopular: true },
      { label: '2 L', gramsOrUnits: 2000 },
      { label: '5 L', gramsOrUnits: 5000 }
    ];
  }

  // 6. Dairy & Loose Cottage Cheese / Paneer / Butter
  if (cat.includes('dairy') || name.includes('paneer') || name.includes('butter')) {
    return [
      { label: '100 g', gramsOrUnits: 100 },
      { label: '200 g', gramsOrUnits: 200, isPopular: true },
      { label: '500 g', gramsOrUnits: 500 },
      { label: '1 kg', gramsOrUnits: 1000 },
      { label: '2 kg', gramsOrUnits: 2000 }
    ];
  }

  // 7. Count / Pcs items (Eggs, Lemons)
  if (parsed.unitType === 'count') {
    return [
      { label: '2 pcs', gramsOrUnits: 2 },
      { label: '4 pcs', gramsOrUnits: 4 },
      { label: '6 pcs', gramsOrUnits: 6, isPopular: true },
      { label: '12 pcs', gramsOrUnits: 12, isPopular: true },
      { label: '24 pcs', gramsOrUnits: 24 }
    ];
  }

  // General fallback
  return [
    { label: '250 g', gramsOrUnits: 250 },
    { label: '500 g', gramsOrUnits: 500, isPopular: true },
    { label: '1 kg', gramsOrUnits: 1000, isPopular: true },
    { label: '2 kg', gramsOrUnits: 2000 },
    { label: '5 kg', gramsOrUnits: 5000 }
  ];
}

/**
 * Calculate dynamic price for a specific weight/quantity
 */
export function calculatePriceForVariant(
  product: Product,
  targetGramsOrUnits: number,
  overrideBasePrice?: number
): { sellingPrice: number; mrp: number; discountPercent: number; label: string } {
  const parsed = parseProductQuantity(product.quantity);
  const baseNormalized = parsed.normalizedGramsOrUnits || 1000;
  const baseSellingPrice = overrideBasePrice ?? product.sellingPrice;
  const baseMrp = product.mrp ?? baseSellingPrice;

  // Ratio of target quantity to base package quantity
  const ratio = targetGramsOrUnits / baseNormalized;

  // Calculate rounded whole rupee prices (clean Indian grocery mandi pricing)
  let calculatedSelling = Math.max(1, Math.round(baseSellingPrice * ratio));
  let calculatedMrp = Math.max(calculatedSelling, Math.round(baseMrp * ratio));

  // If discount percentage is configured
  let discountPercent = 0;
  if (calculatedMrp > calculatedSelling) {
    discountPercent = Math.round(((calculatedMrp - calculatedSelling) / calculatedMrp) * 100);
  } else if (product.discountPercentage && product.discountPercentage > 0) {
    discountPercent = product.discountPercentage;
  }

  const label = formatWeightLabel(targetGramsOrUnits, parsed.unitType);

  return {
    sellingPrice: calculatedSelling,
    mrp: calculatedMrp,
    discountPercent,
    label
  };
}

/**
 * Format weight / volume / count label nicely
 */
export function formatWeightLabel(amount: number, unitType: UnitType = 'weight'): string {
  if (unitType === 'volume') {
    if (amount >= 1000) {
      const liters = amount / 1000;
      return Number.isInteger(liters) ? `${liters} L` : `${liters.toFixed(1)} L`;
    }
    return `${Math.round(amount)} ml`;
  }

  if (unitType === 'count') {
    return `${Math.round(amount)} pcs`;
  }

  // Weight (grams / kg)
  if (amount >= 1000) {
    const kgs = amount / 1000;
    return Number.isInteger(kgs) ? `${kgs} kg` : `${kgs.toFixed(2).replace(/\.?0+$/, '')} kg`;
  }
  return `${Math.round(amount)} g`;
}

/**
 * Format mandi benchmark rate (e.g. ₹40 / 1 kg • ₹4.00 per 100g)
 */
export function getMandiRateDescription(product: Product): string {
  const parsed = parseProductQuantity(product.quantity);
  const baseNormalized = parsed.normalizedGramsOrUnits || 1000;
  const pricePerUnit = product.sellingPrice;

  if (parsed.unitType === 'weight') {
    const ratePer100g = ((pricePerUnit / baseNormalized) * 100).toFixed(1);
    const ratePerKg = Math.round((pricePerUnit / baseNormalized) * 1000);
    return `Mandi Rate: ₹${ratePerKg}/kg (₹${ratePer100g} per 100g)`;
  }

  if (parsed.unitType === 'volume') {
    const ratePer100ml = ((pricePerUnit / baseNormalized) * 100).toFixed(1);
    const ratePerL = Math.round((pricePerUnit / baseNormalized) * 1000);
    return `Rate: ₹${ratePerL}/L (₹${ratePer100ml} per 100ml)`;
  }

  const perPiece = (pricePerUnit / baseNormalized).toFixed(1);
  return `Rate: ₹${perPiece} per pc`;
}
