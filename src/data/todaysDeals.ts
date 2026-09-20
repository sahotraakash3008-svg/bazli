import { Product } from '../types';

export interface DealScheduleItem {
  id: string;
  category: string;
  categoryAliases: string[];
  icon: string;
  badge: string;
  title: string;
  description: string;
  discountPercent: number; // 30% OFF
  gradient: string;
  image: string;
}

export const ALTERNATE_DEAL_SCHEDULE: DealScheduleItem[] = [
  {
    id: 'dairy-bakery',
    category: 'Dairy & Eggs',
    categoryAliases: ['Dairy & Eggs', 'Dairy & Bakery', 'Biscuits & Bakery'],
    icon: '🥛',
    badge: "30% OFF TODAY'S DEAL",
    title: 'Fresh Dairy & Bakery Day',
    description: 'Special Alternate-Day Offer: Flat 30% OFF on Milk, Paneer, Butter, Curd & Bakery fresh daily!',
    discountPercent: 30,
    gradient: 'from-blue-600 via-sky-500 to-indigo-600',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'fruits-veg',
    category: 'Fruits & Vegetables',
    categoryAliases: ['Fruits & Vegetables'],
    icon: '🥦',
    badge: "30% OFF TODAY'S DEAL",
    title: 'Farm-Fresh Veggies & Fruits Harvest',
    description: 'Special Alternate-Day Offer: Flat 30% OFF on Fresh Organic Veggies, Onions, Potatoes & Fruits!',
    discountPercent: 30,
    gradient: 'from-emerald-600 via-teal-500 to-green-600',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'atta-rice-dal',
    category: 'Atta, Rice & Dal',
    categoryAliases: ['Atta, Rice & Dal'],
    icon: '🌾',
    badge: "30% OFF TODAY'S DEAL",
    title: 'Chakki Atta, Basmati Rice & Pulses',
    description: 'Special Alternate-Day Offer: Flat 30% OFF on 5kg/10kg Atta, Basmati Rice, Toor Dal & Chana!',
    discountPercent: 30,
    gradient: 'from-amber-600 via-orange-500 to-yellow-600',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'oil-ghee',
    category: 'Oil & Ghee',
    categoryAliases: ['Oil & Ghee', 'Edible Oils & Ghee'],
    icon: '🛢️',
    badge: "30% OFF TODAY'S DEAL",
    title: 'Pure Desi Ghee & Healthy Oils',
    description: 'Special Alternate-Day Offer: Flat 30% OFF on Refined Oils, Mustard Oil & Pure Cow Ghee!',
    discountPercent: 30,
    gradient: 'from-yellow-600 via-amber-500 to-orange-600',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'snacks-beverages',
    category: 'Snacks & Namkeen',
    categoryAliases: ['Snacks & Namkeen', 'Beverages', 'Snacks & Beverages'],
    icon: '🥤',
    badge: "30% OFF TODAY'S DEAL",
    title: 'Snacks, Namkeen, Tea & Soft Drinks',
    description: 'Special Alternate-Day Offer: Flat 30% OFF on Chips, Namkeens, Premium Tea, Coffee & Cold Drinks!',
    discountPercent: 30,
    gradient: 'from-purple-600 via-fuchsia-500 to-pink-600',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'household-cleaning',
    category: 'Household Cleaning',
    categoryAliases: ['Household Cleaning', 'Laundry', 'Cleaning & Household'],
    icon: '🧹',
    badge: "30% OFF TODAY'S DEAL",
    title: 'Cleaning, Detergents & Home Care',
    description: 'Special Alternate-Day Offer: Flat 30% OFF on Laundry Detergents, Dishwash & Cleaning Liquids!',
    discountPercent: 30,
    gradient: 'from-cyan-600 via-blue-500 to-teal-600',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=800'
  }
];

export function getTodaysDealSchedule() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - startOfYear.getTime()) + ((startOfYear.getTimezoneOffset() - now.getTimezoneOffset()) * 60000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const todayIndex = dayOfYear % ALTERNATE_DEAL_SCHEDULE.length;
  const tomorrowIndex = (dayOfYear + 1) % ALTERNATE_DEAL_SCHEDULE.length;

  return {
    today: ALTERNATE_DEAL_SCHEDULE[todayIndex],
    tomorrow: ALTERNATE_DEAL_SCHEDULE[tomorrowIndex],
    dayOfYear,
    todayIndex,
    tomorrowIndex
  };
}

export function isProductInTodaysDeal(product: Product, _dealCategory?: string): boolean {
  // Only consider as deal if explicitly flagged and has an actual discount set by Admin/Seller
  return Boolean(product.isTodayDeal && ((product.discountPercentage || 0) > 0 || (product.mrp && product.mrp > product.sellingPrice)));
}

export function getProductDealPrice(product: Product, _dealCategory?: string): number {
  // Respect the product's actual selling price set by Admin or the selling merchant
  return product.sellingPrice;
}
