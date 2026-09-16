import { Product } from '../types';

/**
 * Returns an array of 3-4 distinct high-resolution photography angles for a product:
 * 1. Primary Front View
 * 2. Macro Texture / Fresh Cross-section
 * 3. Mandi Packaging / Quantity Measurement
 * 4. Culinary / Usage / Quality Inspection
 */
export function getProductImageGallery(product: Product): string[] {
  // If product already has explicit multiple images defined
  if (product.images && product.images.length >= 2) {
    return product.images;
  }

  const primary = product.image;
  const nameLower = (product.name || '').toLowerCase();
  const catLower = (product.category || '').toLowerCase();

  // Curated category and product specific angles
  if (nameLower.includes('atta') || nameLower.includes('wheat') || nameLower.includes('flour')) {
    return [
      primary,
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?auto=format&fit=crop&w=800&q=80'
    ];
  }

  if (nameLower.includes('rice') || nameLower.includes('basmati')) {
    return [
      primary,
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?auto=format&fit=crop&w=800&q=80'
    ];
  }

  if (nameLower.includes('ghee') || nameLower.includes('butter') || nameLower.includes('oil') || nameLower.includes('mustard')) {
    return [
      primary,
      'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597262-838150493864?auto=format&fit=crop&w=800&q=80'
    ];
  }

  if (nameLower.includes('milk') || nameLower.includes('paneer') || nameLower.includes('curd') || nameLower.includes('dahi') || nameLower.includes('cheese')) {
    return [
      primary,
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=800&q=80'
    ];
  }

  if (nameLower.includes('apple') || nameLower.includes('banana') || nameLower.includes('mango') || nameLower.includes('fruit') || nameLower.includes('orange') || nameLower.includes('grape')) {
    return [
      primary,
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80'
    ];
  }

  if (nameLower.includes('potato') || nameLower.includes('onion') || nameLower.includes('tomato') || nameLower.includes('vegetable') || nameLower.includes('bhindi') || nameLower.includes('palak') || nameLower.includes('ginger')) {
    return [
      primary,
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'
    ];
  }

  if (nameLower.includes('dal') || nameLower.includes('pulse') || nameLower.includes('chana') || nameLower.includes('moong') || nameLower.includes('rajma') || nameLower.includes('besan')) {
    return [
      primary,
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
    ];
  }

  if (nameLower.includes('masala') || nameLower.includes('turmeric') || nameLower.includes('chilli') || nameLower.includes('spice') || nameLower.includes('jeera') || nameLower.includes('clove')) {
    return [
      primary,
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80'
    ];
  }

  if (nameLower.includes('tea') || nameLower.includes('coffee') || nameLower.includes('chai') || nameLower.includes('drink') || nameLower.includes('juice') || nameLower.includes('soda')) {
    return [
      primary,
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
    ];
  }

  if (nameLower.includes('biscuit') || nameLower.includes('cookie') || nameLower.includes('bread') || nameLower.includes('cake') || nameLower.includes('toast') || nameLower.includes('rusk')) {
    return [
      primary,
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80'
    ];
  }

  if (nameLower.includes('biryani') || nameLower.includes('thali') || nameLower.includes('paneer butter') || nameLower.includes('roti') || nameLower.includes('curry') || nameLower.includes('pizza') || nameLower.includes('burger') || nameLower.includes('dosa') || nameLower.includes('chole') || catLower.includes('restaurant') || catLower.includes('dining')) {
    return [
      primary,
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80'
    ];
  }

  if (catLower.includes('stationery') || nameLower.includes('notebook') || nameLower.includes('pen') || nameLower.includes('register') || nameLower.includes('folder') || nameLower.includes('book')) {
    return [
      primary,
      'https://images.unsplash.com/photo-1585336261026-675768e7a6f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=800&q=80'
    ];
  }

  if (catLower.includes('personal') || catLower.includes('bath') || catLower.includes('hair') || catLower.includes('soap') || catLower.includes('shampoo')) {
    return [
      primary,
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597262-838150493864?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80'
    ];
  }

  // General reliable 4-photo multi-angle fallback
  return [
    primary,
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80'
  ];
}
