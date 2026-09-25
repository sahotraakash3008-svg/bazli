import React, { useState } from 'react';
import { ChefHat, Sparkles, Plus, Check, ShoppingBag, Clock, Flame, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface RecipeKitItem {
  id: string;
  name: string;
  qty: string;
  approxPrice: number;
}

interface RecipeKit {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  cookingTime: string;
  serves: string;
  difficulty: 'Easy' | 'Medium' | 'Quick 5m';
  image: string;
  bundlePrice: number;
  originalPrice: number;
  ingredients: RecipeKitItem[];
  category: string;
}

interface SmartRecipeKitsProps {
  products: Product[];
  onAddRecipeKitToCart: (kit: RecipeKit) => void;
  onOpenProductDetail?: (product: Product) => void;
}

export const SMART_RECIPE_KITS: RecipeKit[] = [];
 