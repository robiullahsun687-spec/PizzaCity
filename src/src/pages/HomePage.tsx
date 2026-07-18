import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import BannerSlider from "../components/BannerSlider";
import { HeroBanner } from "../types";

interface HomePageProps {
  banners: HeroBanner[];
  isLoadingBanners: boolean;
  setActiveTab: (tab: "home" | "menu" | "track" | "loc" | "contact" | "faq" | "admin") => void;
  displayToast: (msg: string) => void;
  onOpenOutletSelector?: () => void;
}

const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

const HERO_DETAILS = {
  crust: {
    title: "🌾 48-Hour Signature Sourdough",
    description: "Our signature crust undergoes a slow cold fermentation for 48 hours for maximum bubble structure, crisp wood-fired leopard crown, and perfect light digestibility.",
    stats: [{ label: "Crispiness Factor", value: 96 }, { label: "Fermentation Depth", value: 98 }, { label: "Wood-fired Char", value: 92 }],
    emoji: "🌾",
    colorClass: "text-[#D72B2B] bg-[#D72B2B]/5 border-[#D72B2B]/10"
  },
  sauce: {
    title: "🍅 Orchard-Sweet San Marzano",
    description: "Crushed imported low-acidity sun-drenched Italian San Marzano tomatoes, premium sea salt, and a pinch of cold-pressed virgin olive oil.",
    stats: [{ label: "Natural Sweetness", value: 94 }, { label: "Umami Power", value: 90 }, { label: "Basil Infusion", value: 88 }],
    emoji: "🍅",
    colorClass: "text-[#F26522] bg-[#F26522]/5 border-[#F26522]/10"
  },
  cheese: {
    title: "🧀 Premium Stretch Omani Milk Mozzarella",
    description: "High-moisture whole milk fior di latte, hand-shaped daily by Omani cheese-smiths for the absolute ultimate golden melt pull.",
    stats: [{ label: "Melt & Stretch Pull", value: 99 }, { label: "Buttery Dairy Depth", value: 94 }, { label: "Toasty Crust Bubble", value: 91 }],
    emoji: "🧀",
    colorClass: "text-amber-600 bg-amber-500/5 border-amber-500/10"
  }
};

export default function HomePage({ banners, isLoadingBanners, setActiveTab, displayToast, onOpenOutletSelector }: HomePageProps) {
  const [activeHeroTab, setActiveHeroTab] = useState<"crust" | "sauce" | "cheese">("crust");
  const [pizzaRotation, setPizzaRotation] = useState(0);
  const specialOffersSliderRef = React.useRef<HTMLDivElement>(null);

  const handleOfferClick = (offer: HeroBanner) => {
    if (offer.buttonLink) {
      if (offer.buttonLink === "#menu") {
        setActiveTab("menu");
      } else {
        const el = document.querySelector(offer.buttonLink);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          if (offer.buttonLink.startsWith("http")) {
            window.location.href = offer.buttonLink;
          } else {
            setActiveTab("menu");
          }
        }
      }
    } else {
      setActiveTab("menu");
    }
  };

  const scrollSpecialOffers = (dir: "left" | "right") => {
    if (specialOffersSliderRef.current) {
      const { scrollLeft, clientWidth } = specialOffersSliderRef.current;
      const scrollAmount = clientWidth * 0.8;
      specialOffersSliderRef.current.scrollTo({
        left: dir === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="pb-3">
      {/* Dynamic Web Banners Hero Gallery */}
      {/* Mobile: full-bleed behind dark translucent navbar; Desktop: contained with rounded corners */}
      <div className="bg-[#0D0500] pt-20 md:pt-0 md:bg-transparent md:container md:mx-auto md:px-0 md:pt-auto">
        <div className="w-full md:rounded-3xl overflow-hidden">
          <BannerSlider 
            banners={banners.filter(b => b.type === "hero" || b.type === "all" || !b.type)}
            isLoading={isLoadingBanners}
            onOrderNow={() => setActiveTab("menu")}
          />
        </div>
      </div>

      {/* Hero section (Legacy fallback) */}
      <section className="hidden container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-6 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
          <motion.div animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-12 left-10 text-3xl opacity-20">🌿</motion.div>
          <motion.div animate={{ y: [0, -20, 0], rotate: [0, -15, 15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-24 left-1/3 text-3xl opacity-20">🍅</motion.div>
          <motion.div animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-1/2 left-2/3 text-3xl opacity-20">🫒</motion.div>
          <motion.div animate={{ y: [0, -25, 0], rotate: [0, 12, -12, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-24 left-1/2 text-2xl opacity-15">🍄</motion.div>
        </div>

        <motion.div variants={heroContainerVariants} initial="hidden" animate="visible" className="md:col-span-7 space-y-6">
          <motion.div variants={heroItemVariants} className="inline-flex items-center gap-2 text-xs font-black uppercase text-[#F26522] bg-[#F26522]/10 px-3.5 py-1.5 rounded-full">
            🍕 Handcrafted · Premium · Delivered Fast
          </motion.div>
          <motion.h1 variants={heroItemVariants} className="font-playfair font-black text-4xl sm:text-5xl lg:text-6xl text-[#1A0A00] leading-tight">
            The Art of the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D72B2B] to-[#F26522] hover:brightness-110 transition-all duration-300">Perfect Slice</span> <br />
            Starts Here.
          </motion.h1>
          <motion.p variants={heroItemVariants} className="text-[#9A7B5E] text-base md:text-lg leading-relaxed max-w-xl">
            Authentic wood-fired pizzas, hand-kneaded signature sourdough bases, and premium Omani ingredients. Place an order directly onto the database with instant WhatsApp notification routing!
          </motion.p>

          <motion.div variants={heroItemVariants} className="bg-white rounded-3xl border border-[#D72B2B]/10 p-5 shadow-sm max-w-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#9A7B5E]">Ingredient Spotlight</span>
              <div className="flex gap-1">
                {(["crust", "sauce", "cheese"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveHeroTab(tab);
                      displayToast(`✨ Spotlight updated: ${HERO_DETAILS[tab].title}`);
                    }}
                    className={`text-xs font-black capitalize px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      activeHeroTab === tab ? "bg-[#D72B2B] text-white border-transparent shadow-xs" : "bg-gray-50 text-[#9A7B5E] border-gray-100 hover:bg-gray-100"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeHeroTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div className="space-y-1">
                  <h4 className="font-playfair font-black text-base text-[#1A0A00] flex items-center gap-1.5">{HERO_DETAILS[activeHeroTab].title}</h4>
                  <p className="text-xs text-[#9A7B5E] leading-relaxed">{HERO_DETAILS[activeHeroTab].description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {HERO_DETAILS[activeHeroTab].stats.map((stat, sIdx) => (
                    <div key={sIdx} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-[#1A0A00]">
                        <span className="truncate">{stat.label}</span>
                        <span className="text-[#D72B2B]">{stat.value}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${stat.value}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full bg-gradient-to-r from-[#D72B2B] to-[#F26522] rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div variants={heroItemVariants} className="flex flex-col sm:flex-row gap-4 pt-2">
            <button onClick={() => setActiveTab("menu")} className="px-8 py-4 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white rounded-full font-bold shadow-lg shadow-[#D72B2B]/30 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base cursor-pointer">
              <ShoppingCart size={18} /> View Full Menu
            </button>
            <button onClick={() => setActiveTab("loc")} className="px-8 py-4 border-2 border-[#D72B2B] text-[#D72B2B] rounded-full font-bold hover:bg-[#D72B2B] hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base cursor-pointer">
              <MapPin size={18} /> Select Outlet Location
            </button>
          </motion.div>
        </motion.div>

        <div className="md:col-span-5 relative w-full aspect-square max-w-md mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#D72B2B]/20 to-[#F26522]/20 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" style={{ animationDuration: "4s" }} />
          <div className="absolute inset-0 z-10 pointer-events-none">
            <motion.div animate={{ y: [0, -8, 0], x: [0, 4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-6 right-6 text-3xl bg-white/90 p-2 rounded-full border border-[#D72B2B]/10 shadow-sm flex items-center justify-center">🌶️</motion.div>
            <motion.div animate={{ y: [0, 8, 0], x: [0, -4, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-1/3 -left-2 text-2xl bg-white/90 p-2 rounded-full border border-[#D72B2B]/10 shadow-sm flex items-center justify-center">🌿</motion.div>
            <motion.div animate={{ y: [0, -6, 0], x: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-10 right-2 text-2xl bg-white/90 p-2 rounded-full border border-[#D72B2B]/10 shadow-sm flex items-center justify-center">🧀</motion.div>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} className="relative w-[90%] h-[90%] p-3 bg-white rounded-[48px] border border-[#D72B2B]/10 shadow-2xl overflow-hidden cursor-pointer group" onClick={() => { setPizzaRotation(prev => prev + 90); displayToast("🍕 Smooth rotational spin activated!"); }}>
            <motion.img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85" alt="Tasty Italian Margherita Pizza" animate={{ rotate: pizzaRotation }} whileHover={{ rotate: pizzaRotation + 45 }} transition={{ type: "spring", stiffness: 80, damping: 14 }} className="w-full h-full object-cover rounded-[38px] select-none" />
            <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#1A0A00] bg-white/95 px-3 py-1.5 rounded-full shadow-sm border border-gray-100">👆 Click to spin oven base</span>
            </div>
          </motion.div>
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-2 -left-2 bg-white p-4 rounded-2xl flex items-center gap-3 border border-[#D72B2B]/10 shadow-xl max-w-xs z-20">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-xs font-black text-[#1A0A00]">Continuous Hot Oven</p>
              <p className="text-[10px] text-[#9A7B5E]">Fresh &amp; stone-fired @ 450°C</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Teaser bar — redesigned */}
      <section style={{ background: "#0D0500" }} className="text-white">
        {/* Gradient divider line */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(215,43,43,0.3), rgba(242,101,34,0.3), transparent)", marginBottom: 0 }} />

        {/* Inner wrapper with radial glow */}
        <div style={{ background: "radial-gradient(ellipse at center, rgba(215,43,43,0.08) 0%, transparent 70%)", padding: "24px 16px" }}>

          {/* Outlet chips row — replaces redundant Order Now button */}
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              padding: "0 0 12px",
              scrollbarWidth: "none",
              marginBottom: 8,
            }}
          >
          </div>

          {/* 2×2 stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { icon: "🚀", number: "30", suffix: "Min", label: "Delivery Guarantee" },
              { icon: "📍", number: "6",  suffix: "",    label: "Outlets Across Oman" },
              { icon: "⭐", number: "150", suffix: "+",  label: "5-Star Reviews" },
              { icon: "🍕", number: "30", suffix: "+",   label: "Menu Items" },
            ].map(({ icon, number, suffix, label }) => (
              <div
                key={label}
                style={{
                  background: "rgba(57, 2, 2, 0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 18,
                  padding: "18px 12px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Icon */}
                <span style={{ fontSize: 26, marginBottom: 8 }}>{icon}</span>

                {/* Number + suffix */}
                <span style={{ display: "inline-flex", alignItems: "baseline", gap: 1 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 36, color: "#ffffff", lineHeight: 1 }}>
                    {number}
                  </span>
                  {suffix && (
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 22, color: "#F26522", lineHeight: 1 }}>
                      {suffix}
                    </span>
                  )}
                </span>

                {/* Label */}
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", marginTop: 6 }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Outlet location chips */}
          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 8,
              overflowX: "auto",
              padding: "0 0 4px",
              scrollbarWidth: "none",
            }}
          >
            {["📍 Nizwa", "📍 Samail", "📍 Sur", "📍 Quriyat", "📍 Fanja", "📍 Al Khoud"].map((chip) => (
              <span
                key={chip}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 50,
                  padding: "5px 12px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.55)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  cursor: "default",
                }}
              >
                {chip}
              </span>
            ))}
          </div>

          {/* Bottom micro strip */}
          <div
            style={{
              marginTop: 16,
              padding: "12px 0",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>🌿 100% Fresh Ingredients</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Order via WhatsApp 💬</span>
          </div>

        </div>
      </section>

      {/* Special Offers Horizontal Banner Slider Section */}
      <section className="container mx-auto px-4 md:px-8 space-y-6 mt-12 md:mt-16">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#F26522] uppercase tracking-widest block">Limited-Time Deals</span>
            <h3 className="font-playfair font-black text-2xl md:text-3xl text-[#1A0A00] flex items-center gap-2">
              <span className="text-yellow-500 animate-pulse">🏷️</span>
              <span>Special Offers &amp; Hot Combos</span>
              <span className="text-[10px] bg-[#D72B2B]/10 text-[#D72B2B] font-bold px-2 py-0.5 rounded-full ml-1">Promo codes</span>
            </h3>
            <p className="text-[11px] text-[#9A7B5E] max-w-xl font-medium">Crafted for groups, families, and solo cravings. Tap any offer card below to load those categories instantly!</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={() => scrollSpecialOffers("left")} className="w-8 h-8 rounded-full border border-gray-150 bg-white text-gray-500 hover:text-[#D72B2B] hover:border-[#D72B2B]/20 flex items-center justify-center cursor-pointer shadow-xs active:scale-90 transition-all select-none"><ChevronLeft size={15} /></button>
            <button onClick={() => scrollSpecialOffers("right")} className="w-8 h-8 rounded-full border border-gray-150 bg-white text-gray-500 hover:text-[#D72B2B] hover:border-[#D72B2B]/20 flex items-center justify-center cursor-pointer shadow-xs active:scale-90 transition-all select-none"><ChevronRight size={15} /></button>
          </div>
        </div>

        <div ref={specialOffersSliderRef} className="flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory">
          {isLoadingBanners ? (
            <div className="w-full text-center py-8 space-y-3 bg-white rounded-3xl border border-gray-100 p-8 my-4">
              <div className="w-6 h-6 rounded-full border-2 border-t-[#D72B2B] border-gray-200 animate-spin mx-auto" />
              <p className="text-xs text-[#9A7B5E] font-bold">Retrieving special promotion campaigns...</p>
            </div>
          ) : banners.filter(b => b.type === "offer" || b.type === "all" || !b.type).length === 0 ? (
            <div className="w-full text-center py-8 bg-white rounded-3xl border border-gray-100 p-8 my-4 space-y-2">
              <p className="text-sm font-black text-[#1A0A00]">No active offers</p>
              <p className="text-xs text-[#9A7B5E]">Check our Instagram for daily flash sales!</p>
            </div>
          ) : (
            banners.filter(b => b.type === "offer" || b.type === "all" || !b.type).map((offer, oIdx) => {
              const isFullOfferImage = offer.stylePattern === "fullImage";
              
              if (isFullOfferImage) {
                return (
                  <motion.div 
                    key={oIdx} 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ delay: oIdx * 0.1 }} 
                    onClick={() => handleOfferClick(offer)} 
                    className="min-w-[80vw] sm:min-w-[280px] md:min-w-[340px] h-48 sm:h-56 flex-shrink-0 rounded-[28px] overflow-hidden cursor-pointer group hover:-translate-y-1.5 transition-all shadow-sm hover:shadow-xl border border-transparent hover:border-[#F26522]/30 snap-start relative bg-[#090302] select-none"
                  >
                    {offer.badge && (
                      <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                        {offer.badge}
                      </div>
                    )}
                    <img 
                      src={offer.image} 
                      alt={offer.title} 
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" 
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                );
              }

              return (
                <motion.div 
                  key={oIdx} 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: oIdx * 0.1 }} 
                  onClick={() => handleOfferClick(offer)} 
                  className="min-w-[80vw] sm:min-w-[280px] md:min-w-[340px] h-48 sm:h-56 flex-shrink-0 bg-white dark:bg-[#140805] rounded-[28px] border border-orange-100/50 dark:border-orange-950/40 overflow-hidden cursor-pointer group hover:-translate-y-1.5 transition-all shadow-sm hover:shadow-xl hover:shadow-[#D72B2B]/5 snap-start relative flex flex-col justify-between select-none"
                >
                  {offer.badge && (
                    <div className="absolute top-4 right-4 z-10 bg-yellow-400 text-yellow-950 text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                      {offer.badge}
                    </div>
                  )}
                  
                  {/* Image Container with Top-half style */}
                  <div className="h-32 w-full overflow-hidden relative shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10" />
                    <img 
                      src={offer.image} 
                      alt={offer.title} 
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-3 left-4 right-4 z-20 space-y-0.5 text-left">
                      <h4 className="text-white font-playfair font-black text-base md:text-lg leading-tight uppercase tracking-tight drop-shadow-md">
                        {offer.title}
                      </h4>
                    </div>
                  </div>

                  {/* Body description & CTA Row */}
                  <div className="p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-orange-50/20 dark:from-[#140805] dark:to-[#1a0a06] text-left">
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-bold leading-relaxed line-clamp-2">
                      {offer.subtitle || "Claim this special deal at check out."}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-orange-100/30 dark:border-orange-950/20">
                      <span className="text-[10px] font-black uppercase text-[#F26522] tracking-wider">
                        {offer.buttonText || "Order Now"}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-orange-100/30 dark:bg-orange-950/20 text-[#D72B2B] dark:text-[#ff7733] group-hover:bg-[#D72B2B] group-hover:text-white flex items-center justify-center transition-colors">
                        <ShoppingCart size={13} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
