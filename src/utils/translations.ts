import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

export interface Translations {
  // Common Navigation
  grocery: string;
  food: string;
  restaurants: string;
  stationery: string;
  schoolArt: string;
  deals: string;
  bargain: string;
  xerox: string;
  cart: string;
  wishlist: string;
  orders: string;
  account: string;
  searchPlaceholder: string;
  searchBtn: string;
  expressDelivery: string;
  tenMinDelivery: string;
  backToStore: string;
  
  // Portals & Modes
  groceryPortalDesc: string;
  foodPortalDesc: string;
  stationeryPortalDesc: string;
  
  // Product Card & Actions
  addToCart: string;
  bargainAndSave: string;
  outOfStock: string;
  inStock: string;
  freeDelivery: string;
  viewDetails: string;
  qty: string;
  save: string;
  mrp: string;
  price: string;
  
  // Cart & Checkout
  myCart: string;
  cartEmpty: string;
  cartEmptyDesc: string;
  subtotal: string;
  deliveryFee: string;
  platformFee: string;
  totalAmount: string;
  proceedToCheckout: string;
  placeOrder: string;
  payOnline: string;
  cashOnDelivery: string;
  doorstepOtpNotice: string;
  
  // Live Tracking
  trackOrder: string;
  liveGpsTracking: string;
  orderStatus: string;
  confirmed: string;
  preparing: string;
  outForDelivery: string;
  delivered: string;
  callRider: string;
  chatWithRider: string;
  deliveryOtp: string;
  shareOtpWithRider: string;
  satelliteGpsActive: string;
  minsAway: string;
  
  // Parchhi Scanner
  parchhiScannerTitle: string;
  parchhiScannerDesc: string;
  uploadParchhi: string;
  scanHandwrittenList: string;
  processingAI: string;
  geminiPowered: string;
  addAllToCart: string;
  
  // PWA & Notifications
  installApp: string;
  installAppDesc: string;
  installNow: string;
  enableAlerts: string;
  orderTwoMinsAway: string;
  
  // Language Switch
  switchLang: string;
  currentLangName: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    grocery: 'Grocery & Mandi',
    food: 'Food & Meals',
    restaurants: 'Restaurants & Cafe',
    stationery: 'Stationery & Xerox',
    schoolArt: 'School & Art Kit',
    deals: "Today's Deals",
    bargain: 'Bargain & Save',
    xerox: '10-Min Xerox Print',
    cart: 'Cart',
    wishlist: 'Wishlist',
    orders: 'My Orders',
    account: 'Account',
    searchPlaceholder: 'Search fresh vegetables, dairy, momos, notebooks...',
    searchBtn: 'Search',
    expressDelivery: '⚡ 10-Minute Express Delivery',
    tenMinDelivery: 'Delivered in 10-15 Minutes to your doorstep',
    backToStore: 'Back to Store',
    
    groceryPortalDesc: 'Farm-fresh Mandi veggies, fruits, dairy, and household essentials at wholesale prices.',
    foodPortalDesc: 'Hot & fresh restaurant meals, biryani, pizzas, rolls delivered straight to your door.',
    stationeryPortalDesc: 'School notebooks, exam kits, art supplies, and instant 10-minute document printing.',
    
    addToCart: 'Add to Cart',
    bargainAndSave: '💬 Bargain & Save',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    freeDelivery: 'FREE Delivery',
    viewDetails: 'Quick View',
    qty: 'Qty',
    save: 'Save',
    mrp: 'MRP',
    price: 'Price',
    
    myCart: 'Your Shopping Cart',
    cartEmpty: 'Your Cart is Empty',
    cartEmptyDesc: 'Discover thousands of fresh items and deals waiting for you.',
    subtotal: 'Item Subtotal',
    deliveryFee: 'Delivery Fee',
    platformFee: 'Platform Convenience Fee',
    totalAmount: 'Final Payable Amount',
    proceedToCheckout: 'Proceed to Checkout',
    placeOrder: 'Place Order Now',
    payOnline: 'Pay Online (UPI / Card / NetBanking)',
    cashOnDelivery: 'Cash on Delivery (Pay at Doorstep)',
    doorstepOtpNotice: 'Secure OTP will be shared once order is confirmed.',
    
    trackOrder: 'Track Live Order',
    liveGpsTracking: 'Live GPS Delivery Radar',
    orderStatus: 'Order Status',
    confirmed: 'Order Confirmed',
    preparing: 'Packing at Dark Store',
    outForDelivery: 'Out for Delivery on Bike',
    delivered: 'Delivered at Doorstep',
    callRider: 'Call Delivery Partner',
    chatWithRider: 'Live Rider Chat',
    deliveryOtp: 'Doorstep Delivery OTP',
    shareOtpWithRider: 'Share this 4-digit OTP only with your rider at delivery',
    satelliteGpsActive: '🛰️ Real-Time Mobile GPS Active',
    minsAway: 'mins away',
    
    parchhiScannerTitle: 'AI Handwritten Parchhi Scanner',
    parchhiScannerDesc: 'Upload a photo of your handwritten grocery list or school note. Gemini 2.5 Flash Vision extracts every item instantly with 99% accuracy!',
    uploadParchhi: 'Take Photo / Upload Slip',
    scanHandwrittenList: 'Scan Handwritten List',
    processingAI: 'Gemini Vision parsing handwriting...',
    geminiPowered: 'Powered by Gemini 2.5 Flash Multimodal AI',
    addAllToCart: 'Add All Detected Items to Cart',
    
    installApp: 'Install Bazli App',
    installAppDesc: 'Fastest 10-min grocery & food delivery on your phone home screen',
    installNow: 'Install App',
    enableAlerts: 'Get WhatsApp & Push Alerts',
    orderTwoMinsAway: 'Rider is 2 minutes away from your doorstep!',
    
    switchLang: 'हिंदी में बदलें',
    currentLangName: 'English'
  },
  hi: {
    grocery: 'किराना एवं मंडी',
    food: 'रेस्टोरेंट भोजन',
    restaurants: 'रेस्टोरेंट एवं कैफे',
    stationery: 'स्टेशनरी एवं ज़ेरॉक्स',
    schoolArt: 'स्कूल एवं आर्ट किट',
    deals: 'आज के महाऑफर',
    bargain: 'मोल-भाव (Bargain)',
    xerox: '10-मिनट ज़ेरॉक्स प्रिंट',
    cart: 'थैला (कार्ट)',
    wishlist: 'पसंदीदा सूची',
    orders: 'मेरे ऑर्डर्स',
    account: 'खाता (प्रोफाइल)',
    searchPlaceholder: 'ताज़ी सब्ज़ियाँ, दूध, मोमोज़, कॉपियाँ खोजें...',
    searchBtn: 'खोजें',
    expressDelivery: '⚡ 10-मिनट सुपरफास्ट डिलीवरी',
    tenMinDelivery: '10 से 15 मिनट में आपके घर के दरवाज़े पर',
    backToStore: 'दुकान पर वापस जाएं',
    
    groceryPortalDesc: 'मंडी के ताज़ा फल-सब्जियां, राशन और डेयरी उत्पाद सबसे किफ़ायती दाम पर।',
    foodPortalDesc: 'गरमा-गरम रेस्टोरेंट का खाना, बिरयानी, पिज़्ज़ा, रोल मिनटों में आपके घर।',
    stationeryPortalDesc: 'स्कूल कॉपियां, स्टेशनरी, पेन, आर्ट सामान और 10 मिनट में तुरंत डॉक्युमेंट प्रिंट।',
    
    addToCart: 'कार्ट में जोड़ें',
    bargainAndSave: '💬 मोल-भाव करें (Bargain)',
    outOfStock: 'स्टॉक समाप्त',
    inStock: 'उपलब्ध है',
    freeDelivery: 'मुफ़्त डिलीवरी',
    viewDetails: 'विवरण देखें',
    qty: 'मात्रा',
    save: 'बचत',
    mrp: 'एमआरपी',
    price: 'मूल्य',
    
    myCart: 'आपका शॉपिंग कार्ट',
    cartEmpty: 'आपकी कार्ट अभी खाली है',
    cartEmptyDesc: 'ताज़ी सब्ज़ियां, राशन और स्वादिष्ट भोजन एक्सप्लोर करें।',
    subtotal: 'सामान का कुल मूल्य',
    deliveryFee: 'डिलीवरी शुल्क',
    platformFee: 'प्लेटफॉर्म सुविधा शुल्क',
    totalAmount: 'कुल भुगतान राशि',
    proceedToCheckout: 'चेकआउट के लिए आगे बढ़ें',
    placeOrder: 'ऑर्डर कन्फर्म करें',
    payOnline: 'ऑनलाइन भुगतान (UPI / कार्ड / नेटबैंकिंग)',
    cashOnDelivery: 'कैश ऑन डिलीवरी (घर पर नकद दें)',
    doorstepOtpNotice: 'ऑर्डर कन्फर्म होने पर सुरक्षित 4-अंकों का OTP मिलेगा।',
    
    trackOrder: 'लाइव ऑर्डर ट्रैक करें',
    liveGpsTracking: 'लाइव GPS डिलीवरी रडार',
    orderStatus: 'ऑर्डर की स्थिति',
    confirmed: 'ऑर्डर कन्फर्म हो गया',
    preparing: 'स्टोर में पैक हो रहा है',
    outForDelivery: 'डिलीवरी बॉय बाइक से निकल चुका है',
    delivered: 'घर पर सफलतापूर्वक पहुंच गया',
    callRider: 'डिलीवरी पार्टनर को कॉल करें',
    chatWithRider: 'राइडर से लाइव चैट करें',
    deliveryOtp: 'डिलीवरी सत्यापन OTP',
    shareOtpWithRider: 'यह 4-अंकों का OTP सिर्फ सामान मिलने पर राइडर को बताएं',
    satelliteGpsActive: '🛰️ लाइव सैटेलाइट मोबाइल GPS सक्रिय',
    minsAway: 'मिनट दूर',
    
    parchhiScannerTitle: 'AI हस्तलिखित पर्ची स्कैनर',
    parchhiScannerDesc: 'दुकान की हस्तलिखित पर्ची या कागज़ की फोटो खींचें। Gemini 2.5 Flash Vision हर एक सामान और मात्रा को 99% सटीकता से तुरंत पहचान लेगा!',
    uploadParchhi: 'फोटो खींचें / पर्ची अपलोड करें',
    scanHandwrittenList: 'हस्तलिखित पर्ची स्कैन करें',
    processingAI: 'Gemini AI लिखावट पढ़ रहा है...',
    geminiPowered: 'Gemini 2.5 Flash Multimodal AI द्वारा संचालित',
    addAllToCart: 'पहचाने गए सभी सामान कार्ट में जोड़ें',
    
    installApp: 'बज़ली ऐप इंस्टॉल करें',
    installAppDesc: 'अपने फोन की होम स्क्रीन पर सबसे तेज़ 10-मिनट डिलीवरी ऐप पाएं',
    installNow: 'ऐप इंस्टॉल करें',
    enableAlerts: 'व्हाट्सएप एवं पुश अलर्ट पाएं',
    orderTwoMinsAway: 'डिलीवरी राइडर आपके घर से सिर्फ 2 मिनट की दूरी पर है!',
    
    switchLang: 'Switch to English',
    currentLangName: 'हिंदी'
  }
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.en
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('bazli_language') as Language;
      return saved === 'hi' ? 'hi' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('bazli_language', lang);
      document.documentElement.lang = lang;
    } catch (e) {
      console.warn('Could not persist language preference:', e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage, toggleLanguage, t: translations[language] } },
    children
  );
};

export const useLanguage = () => useContext(LanguageContext);
