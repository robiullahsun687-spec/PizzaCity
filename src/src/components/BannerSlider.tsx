import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, ArrowRight, Flame, Shield, Truck } from "lucide-react";
import { HeroBanner } from "../types";

interface BannerSliderProps {
  onOrderNow: () => void;
  banners: HeroBanner[];
  isLoading: boolean;
}

export default function BannerSlider({ onOrderNow, banners, isLoading }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  // Auto slide effect
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 8000);
    return () => clearInterval(timer);
  }, [currentIndex, banners.length]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  if (isLoading) {
    return (
      <div className="w-full h-[520px] bg-neutral-900 rounded-[40px] flex items-center justify-center border border-red-500/10">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-gray-400 animate-pulse">Pre-heating Oven & Loading Banners...</span>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const handleBannerClick = () => {
    if (!currentBanner.buttonLink) return;
    if (currentBanner.buttonLink === "#menu") {
      onOrderNow();
    } else {
      const el = document.querySelector(currentBanner.buttonLink);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        if (currentBanner.buttonLink.startsWith("http")) {
          window.location.href = currentBanner.buttonLink;
        } else {
          onOrderNow();
        }
      }
    }
  };

  // Slide transition variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const isFullImage = currentBanner?.stylePattern === "fullImage";
  const sliderHeightClass = isFullImage 
    ? "h-[180px] xs:h-[240px] sm:h-[300px] md:h-[400px] lg:h-[480px] xl:h-[550px]"
    : "h-[440px] xs:h-[460px] sm:h-[500px] md:h-[480px] lg:h-[520px] xl:h-[550px]";

  return (
    <div className="relative w-full max-w-7xl mx-auto rounded-[24px] sm:rounded-[32px] md:rounded-[40px] overflow-hidden group shadow-2xl bg-[#090302] border border-[#F26522]/15">
      
      {/* Slides Area */}
      <div className={`relative ${sliderHeightClass} w-full select-none overflow-hidden transition-all duration-300`}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentBanner._id || currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.25 },
            }}
            className="absolute inset-0 w-full h-full"
          >
            {currentBanner.stylePattern === "fullImage" ? (
              <div 
                onClick={handleBannerClick}
                className="absolute inset-0 w-full h-full cursor-pointer overflow-hidden group/fullimage"
                title={currentBanner.title}
              >
                <img
                  src={currentBanner.image}
                  alt={currentBanner.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover/fullimage:scale-[1.015] transition-transform duration-700 ease-out"
                />
              </div>
            ) : (
              <>
                {/* Ambient Background Glow Layer */}
                <div className="absolute inset-0 bg-radial-gradient from-[#2A0F0A]/40 to-[#090302] pointer-events-none" />

                {/* If there's an image, render it as background cover with dark overlay */}
                {currentBanner.image && (
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={currentBanner.image}
                      alt={currentBanner.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-25 scale-105 transition-transform duration-[8000ms]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#090302]/95 via-[#090302]/90 to-transparent" />
                  </div>
                )}

                {/* Slider Content Layer */}
                <div className="absolute inset-0 container mx-auto px-4 sm:px-12 md:px-16 flex flex-col justify-center">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full">
                    
                    {/* Text Content Block (Left column) */}
                    <div className="lg:col-span-7 flex flex-col justify-center space-y-3 sm:space-y-4 lg:space-y-5 text-left z-10 pt-6 pb-8 md:pt-4 md:pb-6 px-2 sm:px-0">
                      
                      {/* Category / Badge overlay */}
                      {currentBanner.badge && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="inline-flex self-start items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 font-black text-[9px] sm:text-xs uppercase tracking-widest px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-yellow-500/30"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                          {currentBanner.badge}
                        </motion.div>
                      )}

                      {/* Big Promotional Title */}
                      <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-playfair font-black text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[54px] text-white leading-[1.1] tracking-tight uppercase"
                      >
                        {/* Recreations style with colored highlights */}
                        {currentBanner.title.split(/(Moments\.|Perfect|Sourdough|BOLD|Difference)/gi).map((part, index) => {
                          const matchWords = ["Moments.", "Perfect", "Sourdough", "BOLD", "Difference"];
                          const isMatch = matchWords.some(w => w.toLowerCase() === part.toLowerCase());
                          return isMatch ? (
                            <span key={index} className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-[#F26522]">
                              {" "}{part}{" "}
                            </span>
                          ) : part;
                        })}
                      </motion.h1>

                      {/* Subtitle description */}
                      <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-orange-100/80 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl font-normal"
                      >
                        {currentBanner.subtitle}
                      </motion.p>

                      {/* App badges & Highlight tags for user Attached flyer style - HIDDEN on small screens */}
                      {currentBanner.stylePattern === "attached" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="hidden sm:block space-y-4 pt-1"
                        >
                          {/* App download icons */}
                          <div className="flex flex-wrap gap-2.5 items-center">
                            <a
                              href="#"
                              onClick={(e) => e.preventDefault()}
                              className="flex items-center gap-2 px-3.5 py-1.5 bg-black/50 hover:bg-black/80 border border-white/10 rounded-xl text-white transition-colors"
                            >
                              <span className="text-[10px] uppercase font-bold tracking-wider">App Store</span>
                            </a>
                            <a
                              href="#"
                              onClick={(e) => e.preventDefault()}
                              className="flex items-center gap-2 px-3.5 py-1.5 bg-black/50 hover:bg-black/80 border border-white/10 rounded-xl text-white transition-colors"
                            >
                              <span className="text-[10px] uppercase font-bold tracking-wider">Google Play</span>
                            </a>
                          </div>

                          {/* Highlight feature grid */}
                          <div className="grid grid-cols-3 gap-3 border-t border-orange-500/10 pt-4 max-w-lg">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400 text-xs">
                                🥦
                              </span>
                              <span className="text-[10px] sm:text-xs font-black uppercase text-gray-300 leading-tight">Fresh Ingredients</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 text-xs text-center">
                                🔥
                              </span>
                              <span className="text-[10px] sm:text-xs font-black uppercase text-gray-300 leading-tight">Oven Baked</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 text-xs">
                                🛵
                              </span>
                              <span className="text-[10px] sm:text-xs font-black uppercase text-gray-300 leading-tight">Fast Delivery</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Standard features tags for classic/modern styles - HIDDEN on small screens */}
                      {currentBanner.stylePattern !== "attached" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="hidden sm:flex flex-wrap gap-4 pt-1"
                        >
                          <div className="flex items-center gap-1.5 text-xs text-orange-200/60 font-bold">
                            <Flame size={14} className="text-orange-400 animate-pulse" />
                            Wood-fired Bake
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-orange-200/60 font-bold">
                            <Shield size={14} className="text-amber-400" />
                            Premium Base
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-orange-200/60 font-bold">
                            <Truck size={14} className="text-red-400" />
                            Fastest Routing
                          </div>
                        </motion.div>
                      )}

                      {/* Call To Action triggers */}
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="pt-2 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                      >
                        <button
                          onClick={() => {
                            if (currentBanner.buttonLink === "#menu") {
                              onOrderNow();
                            } else {
                              // Standard internal anchor support
                              const el = document.querySelector(currentBanner.buttonLink);
                              if (el) {
                                el.scrollIntoView({ behavior: "smooth" });
                              } else {
                                onOrderNow();
                              }
                            }
                          }}
                          className="px-5 py-2.5 sm:px-8 sm:py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-white font-black text-xs sm:text-sm uppercase rounded-full shadow-lg shadow-red-950/20 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group/btn"
                        >
                          <span className="absolute inset-0 bg-white/20 scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left duration-300" />
                          <span className="relative z-10 flex items-center gap-2">
                            {currentBanner.buttonText || "Order Now"}
                            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                          </span>
                        </button>
                        
                        {currentBanner.stylePattern === "attached" && (
                          <span className="text-[10px] sm:text-[11px] font-black text-yellow-400 uppercase tracking-widest pt-2 sm:pt-0 sm:border-l sm:border-orange-500/20 sm:pl-4 font-mono">
                            TASTE THE DIFFERENCE!
                          </span>
                        )}
                      </motion.div>

                    </div>

                    {/* Flying Topping Graphic Showcase (Right column) */}
                    <div className="hidden lg:col-span-5 h-full relative items-center justify-center lg:flex">
                      
                      {/* Flying Basils & Tomatoes floating around the main Pizza */}
                      <motion.div
                        animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-12 left-6 text-3xl pointer-events-none"
                      >
                        🌿
                      </motion.div>
                      <motion.div
                        animate={{ y: [0, -15, 0], rotate: [0, -8, 8, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-16 right-10 text-2xl pointer-events-none"
                      >
                        🍅
                      </motion.div>
                      <motion.div
                        animate={{ y: [0, -8, 0], scale: [1, 1.05, 0.95, 1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                        className="absolute top-1/2 right-4 text-3xl pointer-events-none"
                      >
                        🍃
                      </motion.div>

                      {/* Main Rotating / Hovering Pizza Dish Cutout */}
                      <div className="relative w-72 h-72 xl:w-80 xl:h-80 flex items-center justify-center">
                        
                        {/* Shadow underlay */}
                        <div className="absolute w-64 h-64 bg-red-950/20 blur-3xl rounded-full" />

                        {/* Gourmet Pizza spinning or hovering */}
                        <motion.img
                          animate={{ rotate: 360 }}
                          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover rounded-full border-4 border-yellow-500/20 shadow-2xl scale-100"
                        />

                        {/* Circular insignia badge */}
                        <div className="absolute -top-4 -left-4 bg-yellow-400 text-black text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border-2 border-[#090302] shadow-lg rotate-[-12deg]">
                          🍕 Fresh Out Oven!
                        </div>

                        {/* Elegant Diagonal Calligraphy Banner */}
                        <div className="absolute -bottom-6 -right-6 px-4 py-2 bg-[#D72B2B] text-white border-2 border-yellow-500/30 rounded-2xl shadow-xl rotate-[12deg] font-playfair font-black text-xs leading-none text-center">
                          <span className="block text-[8px] tracking-widest text-yellow-300 font-bold uppercase mb-0.5">La Margherita</span>
                          OMR 2.500 Only
                        </div>

                      </div>

                    </div>

                  </div>
                </div>
              </>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation Buttons (Only visible on hover) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-xs ml-0"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-xs mr-0"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Slide Indicator Dots (Bottom center navigation) */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-12 right-12 flex justify-center gap-2 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                index === currentIndex 
                  ? "w-8 bg-gradient-to-r from-yellow-400 to-[#F26522]" 
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              title={`Go to banner slide ${index + 1}`}
            />
          ))}
        </div>
      )}

    </div>
  );
}
