import React, { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MenuItem } from "../types";

interface MenuPageProps {
  menuItems: MenuItem[];
  isLoadingMenu: boolean;
  menuFilter: string;
  setMenuFilter: (f: string) => void;
  addToCart: (item: MenuItem) => void;
}

export default function MenuPage({ menuItems, isLoadingMenu, menuFilter, setMenuFilter, addToCart }: MenuPageProps) {
  const categoryRefs = {
    pizza: useRef<HTMLDivElement>(null),
    sides: useRef<HTMLDivElement>(null),
    drinks: useRef<HTMLDivElement>(null),
    dessert: useRef<HTMLDivElement>(null),
  };

  const scrollCategory = (catId: "pizza" | "sides" | "drinks" | "dessert", dir: "left" | "right") => {
    const ref = categoryRefs[catId];
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollAmount = clientWidth * 0.8;
      ref.current.scrollTo({
        left: dir === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 pb-3 space-y-8 animate-fadeIn">
      {/* Hero menu intro banner */}
      <div className="text-center space-y-2 py-8 bg-gradient-to-tr from-[#1A0A00] to-[#331100] rounded-[30px] text-white p-6 md:p-12 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#F26522]/10 rounded-full blur-3xl pointer-events-none" />
        <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#D72B2B]/20 to-[#F26522]/20 border border-[#F26522]/30 rounded-full text-[10px] font-black text-[#FF8C42] uppercase tracking-widest">
          🔥 Fresh from the Stone Oven
        </span>
        <h1 className="font-playfair font-black text-3xl md:text-5xl mt-2">Our Gourmet Menu</h1>
        <p className="text-xs md:text-sm text-gray-350 max-w-md mx-auto">
          Hand-made recipes with premium components, wood-fired hot and delivered instantly. Scroll or click horizontally to browse.
        </p>
      </div>

      {/* Filter Selector tabs */}
      <div className="flex gap-2 pb-2 justify-center overflow-x-auto scrollbar-none border-b border-gray-100">
        {[
          { id: "all", label: "🍽️ All Categories" },
          { id: "pizza", label: "🍕 Pizzas" },
          { id: "sides", label: "🥗 Sides & Appeticers" },
          { id: "drinks", label: "🥤 Cold Drinks" },
          { id: "dessert", label: "🍰 Desserts" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setMenuFilter(cat.id)}
            className={`py-2.5 px-6 font-bold text-xs rounded-full border transition-all flex items-center gap-1.5 shrink-0 ${
              menuFilter === cat.id
                ? "bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white border-transparent shadow-lg shadow-[#D72B2B]/20"
                : "bg-white text-[#9A7B5E] border-gray-100 hover:bg-[#D72B2B]/5"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Categorized Horizontal Sliders */}
      {isLoadingMenu ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-[#D72B2B] border-gray-200 animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#9A7B5E]">Retrieving menu card list from database...</p>
        </div>
      ) : (
        <div className="space-y-12">
          <AnimatePresence mode="popLayout">
            {[
              { id: "pizza" as const, label: "Wood-Fired Pizzas", icon: "🍕", tagline: "48H slow ferment sourdough base, handstretched, leopard blistered." },
              { id: "sides" as const, label: "Savoury Sides & Appetizers", icon: "🥗", tagline: "Fired appetizers, hand-spiced fries & garlic crusts to start." },
              { id: "drinks" as const, label: "Ice Cold Drinks & Revivers", icon: "🥤", tagline: "Artisan minted lemonades, ginger extracts, and sodas." },
              { id: "dessert" as const, label: "Heavenly Sweet Finishes", icon: "🍰", tagline: "Warm Nutella pies, sweet desserts and double creams." },
            ]
              .filter((cat) => menuFilter === "all" || cat.id === menuFilter)
              .map((cat) => {
                const items = menuItems.filter((it) => it.category === cat.id);
                if (items.length === 0) return null;

                return (
                  <motion.div
                    key={cat.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="space-y-4 text-left"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="space-y-1">
                        <h4 className="font-playfair font-black text-xl sm:text-2xl text-[#1A0A00] flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                          <span className="text-[10px] bg-[#D72B2B]/10 text-[#D72B2B] font-bold px-2 py-0.5 rounded-full ml-1 font-sans">
                            {items.length} choices
                          </span>
                        </h4>
                        <p className="text-[11px] text-[#9A7B5E] max-w-xl font-medium">{cat.tagline}</p>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => scrollCategory(cat.id, "left")}
                          className="w-8 h-8 rounded-full border border-gray-150 bg-white text-gray-500 hover:text-[#D72B2B] hover:border-[#D72B2B]/20 flex items-center justify-center cursor-pointer shadow-xs active:scale-90 transition-all select-none"
                        >
                          <ChevronLeft size={15} />
                        </button>
                        <button
                          onClick={() => scrollCategory(cat.id, "right")}
                          className="w-8 h-8 rounded-full border border-gray-150 bg-white text-gray-500 hover:text-[#D72B2B] hover:border-[#D72B2B]/20 flex items-center justify-center cursor-pointer shadow-xs active:scale-90 transition-all select-none"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>

                    <div
                      ref={categoryRefs[cat.id]}
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 pb-4 font-sans"
                    >
                      <AnimatePresence mode="popLayout">
                        {items.map((item, idx) => (
                          <motion.div
                            key={item._id}
                            layout
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.3, delay: idx * 0.04 }}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                          >
                            <div className="relative aspect-[3/2] bg-gray-100 overflow-hidden group">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full max-h-36 md:max-h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                              {item.category === "pizza" && (
                                <span className="absolute top-3 left-3 bg-[#D72B2B] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full select-none">
                                  Clay fired
                                </span>
                              )}
                            </div>

                            <div className="p-3 md:p-4 flex-1 flex flex-col justify-between space-y-4">
                              <div className="space-y-1">
                                <span className="text-[9px] tracking-wide font-black text-[#F26522] uppercase">{item.category}</span>
                                <h4 className="font-playfair font-black text-sm md:text-base xl:text-xs text-[#1A0A00] leading-tight group-hover:text-[#D72B2B] transition-colors">{item.name}</h4>
                                <p className="text-[#9A7B5E] text-[11px] leading-relaxed line-clamp-1 hidden sm:block">{item.description}</p>
                              </div>

                              <div className="flex items-center justify-between pt-1.5 border-t border-gray-50 mt-1">
                                <span className="font-Nunito font-black text-sm text-[#D72B2B]">OMR {item.price.toFixed(2)}</span>
                                <button
                                  onClick={() => addToCart(item)}
                                  className="px-2.5 py-1.5 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white rounded-full font-bold text-[11px] shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer xl:w-8 xl:h-8 xl:p-0 xl:flex xl:items-center xl:justify-center"
                                >
                                  <span className="xl:hidden">Add item</span>
                                  <span className="hidden xl:inline">+</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
