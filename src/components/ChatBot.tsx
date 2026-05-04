import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Utensils, Heart, ShoppingBag, HelpCircle, ChevronRight, Flame, Trash2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { AppConfig, Product } from '../types';
import { TRANSLATIONS } from '../constants';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatBotProps {
  config: AppConfig;
  products: Product[];
  language: 'en' | 'ur';
}

export const ChatBot: React.FC<ChatBotProps> = ({ config, products, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const t = TRANSLATIONS[language];

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    return [{ 
      role: 'model', 
      text: language === 'ur' 
        ? 'اسلام علیکم! میں دہلی مٹن اینڈ بیف سینٹر کا اے آئی اسسٹنٹ ہوں۔ میں آپ کی کیسے مدد کر سکتا ہوں؟' 
        : 'Assalam-o-Alaikum! I am the AI assistant for Dehli Mutton & Beef Center. How can I help you today?' 
    }];
  });

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If language changes and messages is only the initial one, update it
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'model') {
      setMessages([{ 
        role: 'model', 
        text: language === 'ur' 
          ? 'اسلام علیکم! میں دہلی مٹن اینڈ بیف سینٹر کا اے آئی اسسٹنٹ ہوں۔ میں آپ کی کیسے مدد کر سکتا ہوں؟' 
          : 'Assalam-o-Alaikum! I am the AI assistant for Dehli Mutton & Beef Center. How can I help you today?' 
      }]);
    }
  }, [language]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await geminiService.getChatResponse(text, history, config, products, language);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText || 'System error.' }]);
    setIsLoading(false);
  };

  const clearChat = () => {
    if (window.confirm(language === 'ur' ? 'کیا آپ واقعی چیٹ کی سرگزشت صاف کرنا چاہتے ہیں؟' : 'Are you sure you want to clear your chat history?')) {
      const initialMessage: Message[] = [
        { 
          role: 'model', 
          text: language === 'ur' 
            ? 'اسلام علیکم! میں دہلی مٹن اینڈ بیف سینٹر کا اے آئی اسسٹنٹ ہوں۔ میں آپ کی کیسے مدد کر سکتا ہوں؟' 
            : 'Assalam-o-Alaikum! I am the AI assistant for Dehli Mutton & Beef Center. How can I help you today?' 
        }
      ];
      setMessages(initialMessage);
      localStorage.setItem('chat_history', JSON.stringify(initialMessage));
    }
  };

  const quickActions = [
    { label: t.recipe, icon: Utensils, prompt: language === 'ur' ? 'مٹن کڑاہی کی ترکیب بتائیں' : 'Mutton Karahi ki recipe batayein' },
    { label: t.meatSuggestion, icon: HelpCircle, prompt: language === 'ur' ? 'بریانی کے لیے کون سا گوشت بہتر ہے؟' : 'Biryani ke liye kaunsa gosht best hai?' },
    { label: t.cookingMethods, icon: Flame, prompt: language === 'ur' ? 'گرلنگ یا روسٹنگ کے لیے کون سا گوشت بہترین ہے؟' : 'Grilling ya roasting ke liye kaunsa gosht best hai?' },
    { label: t.healthAdvice, icon: Heart, prompt: language === 'ur' ? 'بیمار شخص کے لیے ہلکا گوشت؟' : 'Light meat for sick person?' },
    { label: t.orderNow, icon: ShoppingBag, prompt: language === 'ur' ? 'مجھے آرڈر کرنا ہے' : 'Mujhe order karna hai' },
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 bg-brand-blue text-white p-4 rounded-full shadow-2xl z-40 border-4 border-white outline outline-brand-gold/30"
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className={`fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-4 sm:w-[400px] bg-white z-50 shadow-2xl sm:rounded-3xl flex flex-col overflow-hidden border border-gray-100 ${language === 'ur' ? 'rtl font-urdu' : ''}`}
            dir={language === 'ur' ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="bg-brand-blue p-4 text-white flex items-center justify-between border-b border-brand-gold/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-gold/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-brand-gold/30">
                  <Utensils size={20} className="text-brand-gold" />
                </div>
                <div className="text-start">
                  <h3 className="font-black italic text-sm tracking-tight uppercase leading-none text-white">{t.assistant}</h3>
                  <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest mt-1">Delhi Mutton & Beef</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 1 && (
                  <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-full transition-colors" title={t.clearChat}>
                    <Trash2 size={18} />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, x: m.role === 'user' ? (language === 'ur' ? -20 : 20) : (language === 'ur' ? 20 : -20) }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm text-start ${
                      m.role === 'user' 
                        ? 'bg-brand-blue text-white rounded-tr-none border border-brand-gold/20' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    } ${m.role === 'user' && language === 'ur' ? 'rounded-tr-2xl rounded-tl-none' : ''} ${m.role === 'model' && language === 'ur' ? 'rounded-tl-2xl rounded-tr-none' : ''}`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-400 p-3 rounded-2xl rounded-tl-none border border-gray-100 flex gap-1">
                    <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce delay-75" />
                    <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
              
              {/* WhatsApp Order Button (Contextual) */}
              {!isLoading && messages.length > 2 && messages[messages.length-1].role === 'model' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start px-2"
                >
                  <a 
                    href={`https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      language === 'ur'
                      ? `اسلام علیکم!\n\nمیں آپ کے اے آئی اسسٹنٹ سے بات کر رہا ہوں۔ مجھے یہ مشورہ ملا ہے:\n\n"${messages[messages.length-1].text}"\n\nمیں یہ آرڈر کرنا چاہتا ہوں۔ براہ کرم میری رہنمائی کریں۔`
                      : `Assalam-o-Alaikum!\n\nI am talking to your AI assistant. I got this suggestion:\n\n"${messages[messages.length-1].text}"\n\nI want to order this. Please guide me.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-green-600 transition-all shadow-md active:scale-95 flex-1 justify-center whitespace-nowrap"
                  >
                    <MessageCircle size={16} />
                    {language === 'ur' ? 'واٹس ایپ پر آرڈر کریں' : 'Order This on WhatsApp'}
                  </a>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions (Always visible at start or empty state) */}
            {messages.length < 3 && (
               <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
               {quickActions.map((action, i) => (
                 <button
                   key={i}
                   onClick={() => handleSend(action.prompt)}
                   className="flex-shrink-0 bg-white border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold text-gray-600 hover:border-brand-gold hover:text-brand-gold transition-all shadow-sm whitespace-nowrap"
                 >
                   <action.icon size={12} />
                   {action.label}
                 </button>
               ))}
             </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2 bg-gray-50 rounded-2xl p-2 border border-gray-100 focus-within:border-brand-gold/50 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t.placeholder}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-2 py-1 outline-none text-start"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="bg-brand-blue text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-brand-blue/90 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-200 border border-brand-gold/30 shrink-0"
                >
                  <Send size={18} className={language === 'ur' ? 'rotate-180' : ''} />
                </button>
              </div>
              <p className="text-[8px] text-center text-gray-400 mt-2 font-bold uppercase tracking-widest opacity-60">AI Assistant powered by Delhi Mutton</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
