import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface NavigationBackBarProps {
  canGoBack: boolean;
  onGoBack: () => void;
  previousLabel?: string;
  historyLength?: number;
}

export const NavigationBackBar: React.FC<NavigationBackBarProps> = () => {
  // Back button is strictly at the top navbar only, as requested
  return null;
};
