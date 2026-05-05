import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home as HomeIcon, 
  Grid, 
  ShoppingCart, 
  Phone, 
  Search, 
  Menu, 
  X, 
  Plus, 
  Minus, 
  MessageCircle, 
  Mail, 
  MapPin,
  Edit3, 
  Save,
  ArrowRight,
  ChevronRight,
  Info,
  Languages
} from 'lucide-react';
import { INITIAL_CONFIG, CATEGORIES, INITIAL_DEALS, INITIAL_PRODUCTS, TRANSLATIONS } from './constants';
import { AppConfig, Category, Deal, Product, CartItem } from './types';
import { ChatBot } from './components/ChatBot';

// Components
const Navbar = ({ onSearch, isEditMode, toggleEditMode, language, setLanguage, t, logoUrl }: { onSearch: (q: string) => void, isEditMode: boolean, toggleEditMode: () => void, language: 'en' | 'ur', setLanguage: (l: 'en' | 'ur') => void, t: any, logoUrl: string }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div 
          className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden border border-gray-100 shadow-sm ${logoUrl ? 'bg-white' : 'bg-brand-blue text-white font-bold text-xl'}`}
          onDoubleClick={toggleEditMode}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
          ) : (
            'D'
          )}
        </div>
        <div>
          <h1 className="text-xs font-black leading-tight uppercase italic tracking-tight">{language === 'ur' ? 'دہلی مٹن اینڈ بیف' : 'DEHLI MUTTON & BEEF'}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
          className="flex items-center gap-1 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full text-[10px] font-black text-brand-blue hover:bg-blue-50 transition-colors"
        >
          <Languages size={14} className="text-brand-gold" />
          {language === 'en' ? 'اردو' : 'ENGLISH'}
        </button>
        <button className="p-2 text-gray-400 hover:text-brand-gold transition-colors">
          <Search size={20} />
        </button>
        {isEditMode && (
          <div className="flex items-center gap-1 bg-blue-50 text-brand-blue px-2 py-1 rounded text-[10px] font-bold border border-blue-100">
            <Edit3 size={12} />
            {t.admin}
          </div>
        )}
      </div>
    </nav>
  );
};

const BottomNav = ({ activeTab, setActiveTab, cartCount, t }: { activeTab: string, setActiveTab: (t: string) => void, cartCount: number, t: any }) => {
  const tabs = [
    { id: 'home', icon: HomeIcon, label: t.home },
    { id: 'categories', icon: Grid, label: t.categories },
    { id: 'cart', icon: ShoppingCart, label: t.cart, badge: cartCount },
    { id: 'contact', icon: Phone, label: t.contact },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 pb-6 flex justify-between items-center z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`relative flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-brand-gold' : 'text-gray-400'}`}
        >
          <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
          <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-blue text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);

  const t = TRANSLATIONS[language];
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('app_config');
    const savedProducts = localStorage.getItem('app_products');
    const savedDeals = localStorage.getItem('app_deals');
    
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedDeals) setDeals(JSON.parse(savedDeals));
  }, []);

  // Save to LocalStorage
  const saveAll = () => {
    localStorage.setItem('app_config', JSON.stringify(config));
    localStorage.setItem('app_products', JSON.stringify(products));
    localStorage.setItem('app_deals', JSON.stringify(deals));
    setIsEditMode(false);
  };

  const addToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.productId !== productId);
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  }, [cart, products]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.nameUr.includes(searchQuery) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.descriptionUr.includes(searchQuery)
      );
    }
    return result;
  }, [products, selectedCategory, searchQuery]);

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView 
            config={config} 
            deals={deals} 
            products={products.filter(p => p.tag === 'Premium' || p.tag === 'Best Seller')} 
            onProductClick={setSelectedProduct}
            onCategoryClick={(id) => { setSelectedCategory(id); setActiveTab('categories'); }}
            isEditMode={isEditMode}
            onUpdateDeal={(d) => setDeals(prev => prev.map(item => item.id === d.id ? d : item))}
            language={language}
            t={t}
          />
        );
      case 'categories':
        return (
          <CategoriesView 
            products={products} 
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onProductClick={setSelectedProduct}
            onAddToCart={addToCart}
            isEditMode={isEditMode}
            onUpdateProduct={updateProduct}
            config={config}
            language={language}
            t={t}
          />
        );
      case 'cart':
        return (
          <CartView 
            cart={cart} 
            products={products} 
            onAdd={addToCart} 
            onRemove={removeFromCart} 
            total={cartTotal}
            config={config}
            language={language}
            t={t}
          />
        );
      case 'contact':
        return <ContactView config={config} setConfig={setConfig} isEditMode={isEditMode} language={language} t={t} />;
      default:
        return <HomeView config={config} deals={deals} products={products} onProductClick={setSelectedProduct} onCategoryClick={setSelectedCategory} isEditMode={isEditMode} onUpdateDeal={() => {}} language={language} t={t} />;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 pb-24 max-w-md mx-auto relative overflow-x-hidden shadow-2xl ${language === 'ur' ? 'rtl font-urdu' : ''}`} dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <Navbar 
        onSearch={setSearchQuery} 
        isEditMode={isEditMode} 
        toggleEditMode={() => setIsEditMode(!isEditMode)} 
        language={language}
        setLanguage={setLanguage}
        t={t}
        logoUrl={config.logoUrl}
      />
      
      <main className="px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + language}
            initial={{ opacity: 0, x: language === 'ur' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: language === 'ur' ? 20 : -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
        t={t}
      />

      <ChatBot config={config} products={products} language={language} />

      {/* Floating WhatsApp Button */}
      <motion.a 
        href={`https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
          'Salam, I want to order from Dehli Mutton & Beef.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: 1,
          boxShadow: [
            "0 10px 25px -5px rgba(37, 211, 102, 0.4)",
            "0 20px 25px -5px rgba(37, 211, 102, 0.6)",
            "0 10px 25px -5px rgba(37, 211, 102, 0.4)"
          ]
        }}
        transition={{ 
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 0.3 }
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 left-4 bg-[#25D366] w-14 h-14 rounded-full shadow-2xl z-40 border-4 border-white outline outline-green-600/30 flex items-center justify-center overflow-hidden"
      >
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
          alt="WhatsApp" 
          className="w-8 h-8"
        />
      </motion.a>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            onAddToCart={addToCart}
            isEditMode={isEditMode}
            onUpdate={updateProduct}
            config={config}
            language={language}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* Save Button for Admin */}
      {isEditMode && (
        <button 
          onClick={saveAll}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-brand-blue text-white px-6 py-3 rounded-full shadow-2xl z-[60] flex items-center gap-2 font-black text-xs border-4 border-white outline outline-brand-gold/30 active:scale-95 transition-transform"
        >
          <Save size={18} />
          {language === 'ur' ? 'تبدیلیاں محفوظ کریں' : 'SAVE CHANGES'}
        </button>
      )}
    </div>
  );
}

// --- Views ---

const HomeView = ({ config, deals, products, onProductClick, onCategoryClick, isEditMode, onUpdateDeal, language, t }: any) => {
  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gray-900 h-[400px] flex items-center justify-center md:justify-start shadow-2xl border border-white/10 group">
        <img 
          src={config.bannerUrl} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt="Dehli Mutton & Beef Shop Front"
        />
        
        {/* Floating Action Buttons Area */}
        <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center px-4">
          <div className="flex gap-4 p-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-brand-gold text-white px-6 py-3 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg uppercase hover:brightness-110"
            >
              {t.home} <ChevronRight size={14} className={language === 'ur' ? 'rotate-180' : ''} />
            </button>
            <button 
              onClick={() => document.getElementById('deals-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all active:scale-95 uppercase"
            >
              {t.deals}
            </button>
          </div>
        </div>

        {/* Brand Badge - Moved to top corner to avoid blocking the shop front */}
        {config.logoUrl && (
          <div className="absolute top-6 right-6 w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/20 hidden md:flex items-center justify-center animate-float">
            <img src={config.logoUrl} alt="Logo Badge" className="w-full h-full object-contain filter drop-shadow-md" />
          </div>
        )}
      </section>

      {/* Features */}
      <section className="grid grid-cols-3 gap-2">
        {[
          { label: 'Halal Meat', labelUr: 'حلال گوشت', sub: '100% Certified', subUr: '100% مستند', icon: 'ShieldCheck' },
          { label: 'Home Delivery', labelUr: 'ہوم ڈیلیوری', sub: 'Fast & Safe', subUr: 'تیز اور محفوظ', icon: 'Truck' },
          { label: 'Fresh Cuts', labelUr: 'تازہ گوشت', sub: 'Daily Fresh', subUr: 'روزانہ تازہ', icon: 'Sparkles' },
        ].map((feat, i) => (
          <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col items-center text-center gap-1">
            <div className="w-8 h-8 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center mb-1">
              {i === 0 ? <Info size={16} /> : i === 1 ? <ArrowRight size={16} className={language === 'ur' ? 'rotate-180' : ''} /> : <Info size={16} />}
            </div>
            <p className="text-[10px] font-black uppercase tracking-tighter leading-tight">{language === 'ur' ? feat.labelUr : feat.label}</p>
            <p className="text-[8px] text-gray-400 font-medium">{language === 'ur' ? feat.subUr : feat.sub}</p>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{t.categories}</h3>
          <button className="text-brand-blue text-xs font-semibold">{t.viewAll}</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => onCategoryClick(cat.id)}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:border-brand-gold group-hover:bg-blue-50 transition-all overflow-hidden">
                <img src={cat.image} className="w-full h-full object-cover opacity-80" alt={cat.name} />
              </div>
              <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">{language === 'ur' ? cat.nameUr : cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Deals Banner */}
      <section id="deals-section" className="space-y-4 scroll-mt-20">
        <h3 className="font-bold text-gray-900">{t.deals}</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {deals.map((deal: Deal) => (
            <div key={deal.id} className="flex-shrink-0 w-72 h-36 bg-brand-blue rounded-2xl relative overflow-hidden text-white flex flex-col justify-center px-6 border border-brand-gold/30">
              <img src={deal.image} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" alt={deal.title} />
              <div className="relative z-10 space-y-1">
                <span className="bg-brand-gold text-white px-2 py-0.5 rounded text-[10px] font-black">{language === 'ur' ? deal.discountUr : deal.discount}</span>
                <h4 className="text-lg font-bold leading-tight uppercase italic">{language === 'ur' ? deal.titleUr : deal.title}</h4>
                <p className="text-[10px] opacity-80 max-w-[150px]">{language === 'ur' ? deal.descriptionUr : deal.description}</p>
              </div>
              {isEditMode && (
                <button 
                  onClick={() => {
                    const newTitle = prompt('New Title:', deal.title);
                    if (newTitle) onUpdateDeal({ ...deal, title: newTitle });
                  }}
                  className="absolute top-2 right-2 p-1 bg-white/20 rounded backdrop-blur-sm"
                >
                  <Edit3 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-4">
        <h3 className="font-bold text-gray-900">{language === 'ur' ? 'بہترین انتخاب' : 'Top Picks'}</h3>
        <div className="grid grid-cols-2 gap-4">
          {products.map((p: Product) => (
            <ProductCard key={p.id} product={p} onClick={() => onProductClick(p)} isEditMode={isEditMode} currency={config.currency} language={language} t={t} />
          ))}
        </div>
        <p className="text-[10px] text-gray-400 text-center italic py-2">{t.pricingDisclaimer}</p>
      </section>

      {/* Business Rules Banner */}
      <section className="bg-brand-blue rounded-2xl p-6 text-white space-y-4 border border-brand-gold/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-gold rounded-full flex items-center justify-center text-brand-blue">
            <Info size={20} />
          </div>
          <h4 className="font-bold uppercase tracking-tight italic">{t.guidelines}</h4>
        </div>
        <ul className="space-y-2 text-xs">
          <li className="flex items-start gap-2 opacity-80">
            <div className={`w-1.5 h-1.5 rounded-full bg-brand-gold mt-1 ${language === 'ur' ? 'ml-2' : ''}`} />
            <span>{t.minOrderMutton} <strong>{config.minOrderMutton} {language === 'ur' ? 'کلو' : 'kg'}</strong></span>
          </li>
        </ul>
      </section>
    </div>
  );
};

const CategoriesView = ({ products, selectedCategory, setSelectedCategory, onProductClick, onAddToCart, isEditMode, onUpdateProduct, config, language, t }: any) => {
  const filtered = selectedCategory ? products.filter((p: any) => p.category === selectedCategory) : products;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sticky top-16 bg-gray-50 z-20 py-2">
        <button 
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${!selectedCategory ? 'bg-brand-blue text-white shadow-md border border-brand-gold/50' : 'bg-white text-gray-500 border border-gray-100 hover:border-brand-gold'}`}
        >
          {t.all}
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wide ${selectedCategory === cat.id ? 'bg-brand-blue text-white shadow-md border border-brand-gold/50' : 'bg-white text-gray-500 border border-gray-100'}`}
          >
            {language === 'ur' ? cat.nameUr : cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 pb-10">
        {filtered.map((p: Product) => (
          <ProductCard 
            key={p.id} 
            product={p} 
            onClick={() => onProductClick(p)} 
            onAdd={() => onAddToCart(p.id)}
            isEditMode={isEditMode}
            currency={config.currency}
            language={language}
            t={t}
          />
        ))}
      </div>
      <p className="text-[10px] text-gray-400 text-center italic pb-24">{t.pricingDisclaimer}</p>
    </div>
  );
};

const CartView = ({ cart, products, onAdd, onRemove, total, config, language, t }: any) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const cartItems = cart.map((item: any) => ({
    ...products.find((p: any) => p.id === item.productId),
    quantity: item.quantity
  }));

  const handleWhatsAppOrder = () => {
    const paymentText = paymentMethod === 'cash' ? t.cash : t.onlineBanking;
    const bankDetailsShort = paymentMethod === 'online' ? `\n\nBank: ${config.bankName}\nA/C: ${config.accountNumber}\nTitle: ${config.accountTitle}` : '';

    const message = language === 'ur' 
      ? `السلام علیکم! دہلی مٹن اینڈ بیف سینٹر، میں آرڈر دینا چاہتا ہوں:\n\n${cartItems.map((item: any) => `- ${item.nameUr} (${item.quantity} ${item.unitUr})`).join('\n')}\n\nطریقہ ادائیگی: ${paymentText}\nکل قیمت: ${config.currency}${total}${bankDetailsShort}`
      : `Hello Delhi Mutton & Beef Center, I want to order:\n\n${cartItems.map((item: any) => `- ${item.name} (${item.quantity} ${item.unit})`).join('\n')}\n\nPayment Method: ${paymentText}\nTotal: ${config.currency}${total}${bankDetailsShort}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${config.whatsappNumber.replace('+', '')}?text=${encoded}`, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
          <ShoppingCart size={32} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{language === 'ur' ? 'آپ کا کارٹ خالی ہے' : 'Your cart is empty'}</h3>
          <p className="text-xs text-gray-500">{language === 'ur' ? 'ایسا لگتا ہے کہ آپ نے ابھی تک کچھ شامل نہیں کیا۔' : "Looks like you haven't added anything yet."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">{language === 'ur' ? 'آپ کا کارٹ' : 'Your Cart'}</h2>
      
      <div className="space-y-4">
        {cartItems.map((item: any) => (
          <div key={item.id} className="bg-white rounded-2xl p-3 flex gap-4 shadow-sm border border-gray-100">
            <img src={item.image} className="w-20 h-20 rounded-xl object-cover" alt={item.name} />
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{language === 'ur' ? item.nameUr : item.name}</h4>
                <p className="text-[10px] text-gray-500">{config.currency}{item.price} / {language === 'ur' ? item.unitUr : item.unit}</p>
              </div>
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => onRemove(item.id)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-brand-blue"><Minus size={14} /></button>
                  <span className="text-xs font-bold">{item.quantity}</span>
                  <button onClick={() => onAdd(item.id)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-brand-blue"><Plus size={14} /></button>
                </div>
                <span className="font-bold text-brand-blue text-sm">{config.currency}{item.price * item.quantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 space-y-4 shadow-sm border border-gray-100">
        <h3 className="font-bold text-sm text-gray-900 mb-2">{t.paymentMethod}</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setPaymentMethod('cash')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'cash' ? 'bg-blue-50 border-brand-blue text-brand-blue ring-1 ring-brand-blue' : 'bg-white border-gray-100 text-gray-500'}`}
          >
            <HomeIcon size={20} />
            <span className="text-[10px] font-bold uppercase">{t.cash}</span>
          </button>
          <button 
            onClick={() => setPaymentMethod('online')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'online' ? 'bg-blue-50 border-brand-blue text-brand-blue ring-1 ring-brand-blue' : 'bg-white border-gray-100 text-gray-500'}`}
          >
            <Grid size={20} />
            <span className="text-[10px] font-bold uppercase">{t.onlineBanking}</span>
          </button>
        </div>

        {paymentMethod === 'online' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.bankDetails}</h4>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{t.bankName}</span>
              <span className="font-bold text-gray-900">{config.bankName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{t.accountNumber}</span>
              <span className="font-bold text-gray-900">{config.accountNumber}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{t.accountTitle}</span>
              <span className="font-bold text-gray-900">{config.accountTitle}</span>
            </div>
          </div>
        )}

        <div className="h-px bg-gray-100 my-4" />
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{language === 'ur' ? 'ذیلی کل' : 'Subtotal'}</span>
          <span>{config.currency}{total}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{language === 'ur' ? 'ڈیلیوری' : 'Delivery'}</span>
          <span className="text-green-600 font-bold uppercase tracking-tight">{language === 'ur' ? 'مفت' : 'FREE'}</span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-900">{t.totalPrice}</span>
          <span className="font-black text-xl text-brand-blue">{config.currency}{total}</span>
        </div>
      </div>

      <button 
        onClick={handleWhatsAppOrder}
        className="w-full bg-green-600 text-white h-14 rounded-2xl flex items-center justify-center gap-3 font-bold shadow-lg hover:bg-green-700 transition-colors uppercase"
      >
        <MessageCircle size={20} />
        {t.orderWhatsApp}
      </button>
    </div>
  );
};

const ContactView = ({ config, setConfig, isEditMode, language, t }: any) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-gray-900 uppercase italic">{t.contact}</h2>
        <p className="text-xs text-gray-500 font-medium">{language === 'ur' ? 'ہم آپ کے آرڈرز کے لیے حاضر ہیں' : "We're here to help with your orders"}</p>
      </div>

      <div className="space-y-4">
        {[
          { icon: Phone, label: t.callUs, value: config.phone, href: `tel:${config.phone}`, key: 'phone' },
          { icon: MessageCircle, label: 'WhatsApp', value: config.whatsappNumber, href: `https://wa.me/${config.whatsappNumber.replace('+', '')}`, key: 'whatsappNumber' },
          { icon: Mail, label: t.emailUs, value: config.email, href: `mailto:${config.email}`, key: 'email' },
          { icon: MapPin, label: t.visitUs, value: language === 'ur' ? config.addressUr : config.address, href: `https://maps.google.com/?q=${encodeURIComponent(config.address)}`, key: 'address' },
        ].map((item) => (
          <div key={item.key} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:border-brand-gold transition-all">
            <div className="w-12 h-12 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center shrink-0">
              <item.icon size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
              {isEditMode ? (
                <input 
                  value={item.value} 
                  onChange={(e) => setConfig({ ...config, [item.key]: e.target.value })}
                  className="text-sm font-bold text-gray-900 w-full bg-gray-50 p-1 rounded mt-1"
                />
              ) : (
                <a href={item.href} className="text-sm font-bold text-gray-900 block mt-1 hover:text-brand-blue transition-colors leading-relaxed">{item.value}</a>
              )}
            </div>
            {!isEditMode && <ArrowRight size={16} className={`text-gray-300 group-hover:text-brand-gold transition-colors ${language === 'ur' ? 'rotate-180' : ''}`} />}
          </div>
        ))}
      </div>

      {isEditMode && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-900">App Configuration</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Tagline</label>
              <input 
                value={config.tagline} 
                onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                className="text-sm font-bold text-gray-900 w-full bg-gray-50 p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Address</label>
              <textarea 
                value={config.address} 
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                className="text-sm font-bold text-gray-900 w-full bg-gray-50 p-2 rounded mt-1 h-32"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Banner URL</label>
              <input 
                value={config.bannerUrl} 
                onChange={(e) => setConfig({ ...config, bannerUrl: e.target.value })}
                className="text-sm font-bold text-gray-900 w-full bg-gray-50 p-2 rounded mt-1"
                placeholder="https://...image.jpg"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Logo URL</label>
              <input 
                value={config.logoUrl} 
                onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                className="text-sm font-bold text-gray-900 w-full bg-gray-50 p-2 rounded mt-1"
                placeholder="https://...logo.png"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">AI Bot Instruction</label>
              <textarea 
                value={config.botInstruction} 
                onChange={(e) => setConfig({ ...config, botInstruction: e.target.value })}
                className="text-sm font-bold text-gray-900 w-full bg-gray-50 p-2 rounded mt-1 h-32"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Min Mutton Order (kg)</label>
              <input 
                type="number"
                value={config.minOrderMutton} 
                onChange={(e) => setConfig({ ...config, minOrderMutton: Number(e.target.value) })}
                className="text-sm font-bold text-gray-900 w-full bg-gray-50 p-2 rounded mt-1"
              />
            </div>
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 mb-3">Bank Details for Online Payment</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Bank Name</label>
                  <input 
                    value={config.bankName} 
                    onChange={(e) => setConfig({ ...config, bankName: e.target.value })}
                    className="text-sm font-bold text-gray-900 w-full bg-gray-50 p-2 rounded mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Account Number</label>
                  <input 
                    value={config.accountNumber} 
                    onChange={(e) => setConfig({ ...config, accountNumber: e.target.value })}
                    className="text-sm font-bold text-gray-900 w-full bg-gray-50 p-2 rounded mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Account Title</label>
                  <input 
                    value={config.accountTitle} 
                    onChange={(e) => setConfig({ ...config, accountTitle: e.target.value })}
                    className="text-sm font-bold text-gray-900 w-full bg-gray-50 p-2 rounded mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-components ---

const ProductCard = ({ product, onClick, onAdd, isEditMode, currency, language, t }: any) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-shadow relative">
      <div className="h-28 overflow-hidden relative" onClick={onClick}>
        <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.tag && (
            <span className="bg-brand-gold text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-sm w-fit">
              {language === 'ur' ? product.tagUr : product.tag}
            </span>
          )}
          <span className="bg-green-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-sm w-fit">
            {t.netWeight}
          </span>
        </div>
        {product.wholesaleOnly && (
           <span className={`absolute bottom-2 left-2 bg-black text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter opacity-90 shadow-sm ${language === 'ur' ? 'right-2 left-auto' : ''}`}>
            {language === 'ur' ? 'ہول سیل' : 'Wholesale'}
          </span>
        )}
      </div>
      <div className="p-3 space-y-1 flex-1 flex flex-col justify-between text-start" onClick={onClick}>
        <div>
          <h4 className="font-bold text-gray-900 text-xs truncate uppercase tracking-tight">{language === 'ur' ? product.nameUr : product.name}</h4>
          <p className="text-[9px] text-gray-500 line-clamp-1">{language === 'ur' ? product.descriptionUr : product.description}</p>
        </div>
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs font-black text-gray-900 flex flex-col">
            <span className="flex items-center">
              <span className="text-[10px] font-bold text-brand-gold">{currency}</span>
              {product.price}
            </span>
            <span className="text-[7px] text-gray-400 font-bold uppercase tracking-tighter">
              {t.perKg}
            </span>
          </p>
          <button 
            onClick={(e) => { e.stopPropagation(); onAdd && onAdd(); }}
            className="w-7 h-7 bg-brand-blue text-white rounded-lg flex items-center justify-center hover:bg-brand-blue/90 shadow-sm active:scale-95 transition-all outline outline-brand-gold/30"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      {isEditMode && (
        <div className="absolute top-2 right-2 bg-white/80 p-1 rounded-md backdrop-blur-sm shadow-sm pointer-events-none">
          <Edit3 size={10} className="text-brand-blue" />
        </div>
      )}
    </div>
  );
};

const ProductDetailModal = ({ product, onClose, onAddToCart, isEditMode, onUpdate, config, language, t }: any) => {
  const [qty, setQty] = useState(1);
  const [editedProduct, setEditedProduct] = useState(product);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center px-0 sm:px-4 ${language === 'ur' ? 'rtl font-urdu' : ''}`}
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        dir={language === 'ur' ? 'rtl' : 'ltr'}
      >
        <button onClick={onClose} className={`absolute top-4 ${language === 'ur' ? 'left-4' : 'right-4'} z-10 bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors`}>
          <X size={24} />
        </button>

        <div className="overflow-y-auto flex-1">
          <div className="h-64 relative">
            <img src={isEditMode ? editedProduct.image : product.image} className="w-full h-full object-cover" alt={product.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="p-6 space-y-6">
            {isEditMode ? (
              <div className="space-y-4">
                <input 
                  value={editedProduct.name} 
                  onChange={e => setEditedProduct({...editedProduct, name: e.target.value})}
                  className="text-2xl font-black text-gray-900 w-full bg-gray-50 p-2 rounded"
                  placeholder="English Name"
                />
                <input 
                  value={editedProduct.nameUr} 
                  onChange={e => setEditedProduct({...editedProduct, nameUr: e.target.value})}
                  className="text-xl font-bold text-gray-900 w-full bg-gray-50 p-2 rounded"
                  placeholder="Urdu Name"
                />
                <textarea 
                  value={editedProduct.description} 
                  onChange={e => setEditedProduct({...editedProduct, description: e.target.value})}
                  className="text-sm text-gray-500 w-full bg-gray-50 p-2 rounded h-20"
                  placeholder="English Description"
                />
                <textarea 
                  value={editedProduct.descriptionUr} 
                  onChange={e => setEditedProduct({...editedProduct, descriptionUr: e.target.value})}
                  className="text-sm text-gray-500 w-full bg-gray-50 p-2 rounded h-20"
                  placeholder="Urdu Description"
                />
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Price</label>
                    <input 
                      type="number"
                      value={editedProduct.price} 
                      onChange={e => setEditedProduct({...editedProduct, price: Number(e.target.value)})}
                      className="text-sm font-bold text-gray-900 w-full bg-gray-50 p-2 rounded mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Unit (kg/pcs)</label>
                    <input 
                      value={editedProduct.unit} 
                      onChange={e => setEditedProduct({...editedProduct, unit: e.target.value})}
                      className="text-sm font-bold text-gray-900 w-full bg-gray-50 p-2 rounded mt-1"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => { onUpdate(editedProduct); onClose(); }}
                  className="w-full bg-black text-white h-12 rounded-xl flex items-center justify-center gap-2 font-bold"
                >
                  <Save size={18} /> UPDATE PRODUCT
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1 text-start">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">{language === 'ur' ? product.nameUr : product.name}</h2>
                    {(product.tag || product.tagUr) && <span className="bg-brand-gold text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">{language === 'ur' ? product.tagUr : product.tag}</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">{language === 'ur' ? product.descriptionUr : product.description}</p>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-blue-50">
                  <div className="space-y-1 text-start">
                    <p className="text-xs font-bold text-gray-400 uppercase">{t.pricing}</p>
                    <p className="text-xl font-black text-brand-blue flex items-center">
                      <span className={`text-sm border-gray-200 ${language === 'ur' ? 'border-l pl-1.5 ml-1.5' : 'border-r pr-1.5 mr-1.5'}`}>{config.currency}</span>
                      {product.price}
                      <span className="text-xs text-brand-gold font-black mx-1 tracking-tight">/ {t.perKg.toUpperCase()}</span>
                    </p>
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-tight italic">{t.netWeight}</p>
                  </div>
                  <div className="flex items-center gap-4 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100">
                    <button onClick={() => qty > 1 && setQty(qty - 1)} className="p-1 text-gray-400 hover:text-brand-blue"><Minus size={18} /></button>
                    <span className="text-lg font-black w-6 text-center">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="p-1 text-gray-400 hover:text-brand-blue"><Plus size={18} /></button>
                  </div>
                </div>

                <div className="space-y-4">
                   {product.category === 'mutton' && (
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-3">
                      <Info size={16} className="text-brand-blue shrink-0 mt-0.5" />
                      <p className="text-[10px] text-blue-900 font-semibold leading-normal text-start">
                        {t.muttonNote} {config.minOrderMutton}{language === 'ur' ? 'کلو' : 'kg'}.
                      </p>
                    </div>
                  )}
                  {product.wholesaleOnly && (
                    <div className="bg-black text-white p-3 rounded-xl flex items-start gap-3">
                      <Info size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-semibold leading-normal text-start">
                        {language === 'ur' ? 'صرف ہول سیل: یہ آئٹم صرف بلک آرڈرز کے لیے دستیاب ہے۔' : 'WHOLESALE ONLY: This item is only available for bulk orders.'}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {!isEditMode && (
          <div className="p-4 bg-white border-t border-gray-100 flex gap-4">
            <button 
              onClick={() => { onAddToCart(product.id); setQty(1); onClose(); }} 
              className="flex-1 bg-brand-blue text-white h-14 rounded-2xl flex items-center justify-center gap-3 font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all outline outline-brand-gold/30 uppercase"
            >
              <ShoppingCart size={20} />
              {t.addToCart} ({config.currency}{product.price * qty})
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
