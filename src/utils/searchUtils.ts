import { Product } from '../types';

/**
 * Normalizes text for case-insensitive, diacritic-insensitive matching
 */
export function normalizeSearchText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Common bilingual & colloquial synonyms for Indian grocery items
 */
const SYNONYM_DICTIONARY: Record<string, string[]> = {
  milk: ['doodh', 'dudh', 'dairy', 'taaza', 'gold', 'milkmaid', 'whitener', 'lactose'],
  doodh: ['milk', 'dairy', 'taaza', 'cow milk'],
  dudh: ['milk', 'dairy'],
  atta: ['aata', 'flour', 'gehu', 'wheat', 'sharbati', 'chakki'],
  aata: ['atta', 'flour', 'wheat'],
  flour: ['atta', 'aata', 'maida', 'besan', 'wheat'],
  wheat: ['atta', 'aata', 'gehu', 'sharbati'],
  rice: ['chawal', 'basmati', 'pulao', 'biryani', 'grain'],
  chawal: ['rice', 'basmati'],
  oil: ['tel', 'ghee', 'sunflower', 'mustard', 'refined', 'kachi ghani', 'fortune'],
  tel: ['oil', 'mustard', 'sunflower', 'ghee'],
  ghee: ['desi ghee', 'bilona', 'cow ghee', 'butter', 'oil'],
  butter: ['makhan', 'amul butter', 'pasteurised', 'ghee'],
  makhan: ['butter', 'ghee'],
  paneer: ['cottage cheese', 'malai paneer', 'dairy', 'milk'],
  curd: ['dahi', 'yogurt', 'dairy'],
  dahi: ['curd', 'yogurt', 'dairy'],
  egg: ['eggs', 'anda', 'ande', 'poultry'],
  eggs: ['egg', 'anda', 'ande'],
  anda: ['egg', 'eggs'],
  ande: ['egg', 'eggs'],
  tea: ['chai', 'patti', 'tea leaves', 'tata tea', 'gold'],
  chai: ['tea', 'tata tea', 'wagh bakri', 'red label'],
  coffee: ['nescafe', 'bru', 'roast'],
  sugar: ['cheeni', 'shakar', 'gud', 'jaggery', 'sweetener'],
  cheeni: ['sugar', 'shakar'],
  salt: ['namak', 'tata salt', 'iodized'],
  namak: ['salt', 'tata salt'],
  dal: ['daal', 'pulses', 'lentils', 'toor', 'moong', 'chana', 'urad', 'masoor'],
  daal: ['dal', 'pulses', 'lentils'],
  chips: ['namkeen', 'lays', 'kurkure', 'crisps', 'snacks', 'bhujia', 'wafers'],
  namkeen: ['chips', 'bhujia', 'sev', 'snacks', 'munchies', 'mixture'],
  biscuit: ['biscuits', 'cookie', 'cookies', 'parle', 'good day', 'rusk', 'oreo'],
  biscuits: ['biscuit', 'cookies', 'cookie'],
  soap: ['soaps', 'sabun', 'bath bar', 'dettol', 'dove', 'body wash'],
  sabun: ['soap', 'detergent'],
  shampoo: ['hair wash', 'clinic plus', 'head and shoulders', 'dove shampoo'],
  surf: ['detergent', 'washing powder', 'surf excel', 'ariel', 'tide', 'matic'],
  detergent: ['surf', 'washing powder', 'surf excel', 'ariel', 'laundry'],
  noodles: ['maggi', 'instant noodles', 'pasta', 'chowmein', 'yippee'],
  maggi: ['noodles', 'instant food'],
  apple: ['apples', 'seb', 'fruit'],
  mango: ['mangoes', 'aam', 'alphonso'],
  onion: ['onions', 'pyaz', 'kanda'],
  potato: ['potatoes', 'aloo', 'alu'],
  tomato: ['tomatoes', 'tamatar'],
  icecream: ['ice cream', 'kulfi', 'chocobar', 'cornetto', 'amul'],
  kulfi: ['ice cream', 'icecream']
};

/**
 * Calculates a match score for a product against a search query.
 * Returns score > 0 if matched, 0 if not matched.
 */
export function calculateProductSearchScore(product: Product, query: string): { matches: boolean; score: number } {
  const cleanQuery = normalizeSearchText(query);
  if (!cleanQuery) {
    return { matches: true, score: 1 };
  }

  const nameNorm = normalizeSearchText(product.name);
  const catNorm = normalizeSearchText(product.category);
  const subcatNorm = normalizeSearchText(product.subcategory || '');
  const sellerNorm = normalizeSearchText(product.sellerName || '');
  const descNorm = normalizeSearchText(product.description || '');
  const tagsNorm = (product.tags || []).map(t => normalizeSearchText(t)).join(' ');

  const queryTokens = cleanQuery.split(' ').filter(Boolean);

  let score = 0;

  // 1. EXACT PRODUCT NAME MATCH
  if (nameNorm === cleanQuery) {
    score += 10000;
  }

  // 2. PRODUCT NAME STARTS WITH QUERY
  if (nameNorm.startsWith(cleanQuery)) {
    score += 5000;
  }

  // 3. PRODUCT NAME CONTAINS QUERY AS A FULL WORD OR MULTI-WORD SUBSTRING
  // e.g. searching "milk" when name is "Amul Taaza Milk" or "Cadbury Dairy Milk"
  const wordBoundaryRegex = new RegExp(`(^|\\s)${cleanQuery}(\\s|$)`, 'i');
  if (wordBoundaryRegex.test(nameNorm)) {
    score += 4000;
  } else if (nameNorm.includes(cleanQuery)) {
    // Substring match inside product name (e.g. searching "milk" matches "Milkmaid")
    score += 2500;
  }

  // 4. CATEGORY & SUBCATEGORY MATCH
  if (catNorm === cleanQuery || catNorm.startsWith(cleanQuery)) {
    score += 1800;
  } else if (catNorm.includes(cleanQuery)) {
    score += 1200;
  }
  if (subcatNorm.includes(cleanQuery)) {
    score += 800;
  }

  // 5. TAGS MATCH
  if (tagsNorm.includes(cleanQuery)) {
    score += 900;
  }

  // 6. SELLER / STORE NAME MATCH
  if (sellerNorm.includes(cleanQuery)) {
    score += 600;
  }

  // 7. DESCRIPTION MATCH
  if (descNorm.includes(cleanQuery)) {
    score += 400;
  }

  // 8. MULTI-TOKEN / ALL WORDS MATCHING
  if (queryTokens.length > 1) {
    const allInName = queryTokens.every(tok => nameNorm.includes(tok));
    if (allInName) {
      score += 3500;
    }

    const fullBlob = `${nameNorm} ${catNorm} ${subcatNorm} ${tagsNorm} ${descNorm} ${sellerNorm}`;
    const allTokensMatch = queryTokens.every(tok => fullBlob.includes(tok));
    if (allTokensMatch) {
      score += 1500;
    } else {
      // Partial token matches
      let matchedTokensCount = 0;
      queryTokens.forEach(tok => {
        if (fullBlob.includes(tok)) {
          matchedTokensCount++;
          score += 300;
        }
      });
      if (matchedTokensCount === 0 && score === 0) {
        return { matches: false, score: 0 };
      }
    }
  }

  // 9. SYNONYM EXPANSION CHECK
  // e.g. user typed "doodh" -> expands to "milk"
  const synonyms = SYNONYM_DICTIONARY[cleanQuery] || [];
  for (const syn of synonyms) {
    const synNorm = normalizeSearchText(syn);
    if (nameNorm.includes(synNorm)) {
      score += 1200;
      break;
    }
    if (catNorm.includes(synNorm) || tagsNorm.includes(synNorm) || descNorm.includes(synNorm)) {
      score += 600;
      break;
    }
  }

  // Check if any query token has synonyms
  if (queryTokens.length > 1) {
    for (const tok of queryTokens) {
      const tokSyns = SYNONYM_DICTIONARY[tok] || [];
      for (const syn of tokSyns) {
        const synNorm = normalizeSearchText(syn);
        if (nameNorm.includes(synNorm)) {
          score += 400;
          break;
        }
      }
    }
  }

  // Small boosts for in-stock, popular, or deal items
  if (product.isPopular) score += 30;
  if (product.isTodayDeal) score += 40;
  if (product.bargainingAllowed) score += 20;

  return {
    matches: score > 0,
    score
  };
}

/**
 * Filter & Rank products by query
 */
export function searchAndRankProducts(products: Product[], query: string): Product[] {
  const clean = normalizeSearchText(query);
  if (!clean) return products;

  return products
    .map(product => {
      const { matches, score } = calculateProductSearchScore(product, clean);
      return { product, matches, score };
    })
    .filter(item => item.matches && item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
}
