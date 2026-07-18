import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu as MenuIcon, X, ShoppingCart, MapPin, Lock, Sun, Flame
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Components
import OutletSelector from "./components/OutletSelector";
import OrderTracker from "./components/OrderTracker";

// Pages
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import LocationsPage from "./pages/LocationsPage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import AdminPage from "./pages/AdminPage";

// Types & Utils
import { MenuItem, CartEntry, HeroBanner, Branch } from "./types";
import { getOptimizedUnitPrice } from "./lib/priceUtils";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");

  // Global Theme Selection
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("pizza_city_theme") === "midnight_oven";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const root = window.document.documentElement;
      if (isDarkMode) {
        root.classList.add("midnight-oven");
        localStorage.setItem("pizza_city_theme", "midnight_oven");
      } else {
        root.classList.remove("midnight-oven");
        localStorage.setItem("pizza_city_theme", "light");
      }
    } catch (e) {
      console.warn("Theme persistence safe blocked.", e);
    }
  }, [isDarkMode]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);

  // Global Cart
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [isOutletSelectorOpen, setIsOutletSelectorOpen] = useState(false);

  const [selectedConfigureItem, setSelectedConfigureItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<"Small" | "Medium" | "Large">("Medium");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  // Filter state for MenuPage (kept global so it persists when returning)
  const [menuFilter, setMenuFilter] = useState<string>("all");

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const refreshMenu = async () => {
    try {
      const res = await fetch("/api/menu");
      if (res.ok) {
        setMenuItems(await res.json());
      }
    } catch (err) {
      console.warn("Live menu sync failure", err);
    }
  };

  useEffect(() => {
    async function loadData() {
      setIsLoadingMenu(true);
      setIsLoadingBanners(true);
      setIsLoadingBranches(true);
      try {
        const [menuRes, bannersRes, branchesRes] = await Promise.all([
          fetch("/api/menu"), fetch("/api/banners"), fetch("/api/branches")
        ]);
        if (menuRes.ok) setMenuItems(await menuRes.json());
        if (bannersRes.ok) setBanners(await bannersRes.json());
        if (branchesRes.ok) setBranches(await branchesRes.json());
      } catch (err) {
        console.warn("Error loading data from server", err);
      } finally {
        setIsLoadingMenu(false);
        setIsLoadingBanners(false);
        setIsLoadingBranches(false);
      }
    }
    loadData();
  }, []);

  // Smooth scroll logic
  const scrollToSection = (sectionId: string) => {
    setDrawerOpen(false);
    if (currentPath !== "/") {
      navigate(`/#${sectionId}`);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveSection(sectionId);
      }
    }
  };

  // Scroll Spy to detect active section
  useEffect(() => {
    if (currentPath !== "/") return;

    const sections = ["home", "menu", "track", "locations", "contact", "faq"];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160; // offset for fixed header
      
      let currentSection = "home";
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            currentSection = section;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPath]);

  // Handle hash scrolling on path changes / page load
  useEffect(() => {
    if (currentPath === "/") {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        const timer = setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveSection(id);
          }
        }, 150);
        return () => clearTimeout(timer);
      } else {
        // Default to home if no hash
        setActiveSection("home");
      }
    }
  }, [currentPath, location.hash]);

  // Redirect legacy routes to anchor links
  useEffect(() => {
    const pathMap: Record<string, string> = {
      "/menu": "menu",
      "/track": "track",
      "/locations": "locations",
      "/contact": "contact",
      "/faq": "faq",
    };
    const targetSection = pathMap[currentPath];
    if (targetSection) {
      navigate(`/#${targetSection}`, { replace: true });
    }
  }, [currentPath, navigate]);

  const addToCart = (product: MenuItem) => {
    setSelectedConfigureItem(product);
    setSelectedSize("Medium");
    setSelectedQuantity(1);
  };

  const confirmAddToCart = () => {
    if (!selectedConfigureItem) return;
    
    const basePrice = (selectedConfigureItem.discountPrice && selectedConfigureItem.discountPrice < selectedConfigureItem.price)
      ? selectedConfigureItem.discountPrice : selectedConfigureItem.price;

    const optimizedPrice = getOptimizedUnitPrice(basePrice, selectedSize, selectedQuantity, selectedConfigureItem.category);

    setCart((prev) => {
      const exists = prev.find((entry) => entry.item._id === selectedConfigureItem._id && entry.size === selectedSize);
      if (exists) {
        const newQty = exists.quantity + selectedQuantity;
        const reOptimizedPrice = getOptimizedUnitPrice(basePrice, selectedSize, newQty, selectedConfigureItem.category);
        return prev.map((entry) =>
          entry.item._id === selectedConfigureItem._id && entry.size === selectedSize
            ? { ...entry, quantity: newQty, unitPrice: reOptimizedPrice } : entry
        );
      }
      return [...prev, { item: selectedConfigureItem, quantity: selectedQuantity, size: selectedSize, unitPrice: optimizedPrice }];
    });

    displayToast(`🛒 Added ${selectedQuantity}x ${selectedConfigureItem.name} to cart.`);
    setSelectedConfigureItem(null);
    setIsOutletSelectorOpen(true);
  };

  const updateCartItem = (index: number, newQty: number, newSize: "Small" | "Medium" | "Large") => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((_, idx) => idx !== index));
      displayToast("🛒 Item removed from cart.");
      return;
    }

    setCart((prev) =>
      prev.map((entry, idx) => {
        if (idx !== index) return entry;
        const basePrice = (entry.item.discountPrice && entry.item.discountPrice < entry.item.price)
          ? entry.item.discountPrice : entry.item.price;
        const optimizedPrice = getOptimizedUnitPrice(basePrice, newSize, newQty, entry.item.category);
        return {
          ...entry,
          quantity: newQty,
          size: newSize,
          unitPrice: optimizedPrice
        };
      })
    );
  };

  const cartTotalQty = cart.reduce((sum, entry) => sum + entry.quantity, 0);

  const NavItem = ({ sectionId, label, isActive }: { sectionId: string, label: string, isActive: boolean }) => (
    <li>
      <button 
        onClick={() => scrollToSection(sectionId)} 
        className={`relative py-1.5 transition-colors hover:text-[#D72B2B] font-extrabold text-sm cursor-pointer ${isActive ? "text-[#D72B2B]" : "text-inherit"}`}
      >
        {label}
        {isActive && <motion.div layoutId="navline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D72B2B] rounded-full" />}
      </button>
    </li>
  );

  const closeDrawerAndNav = (to: string) => {
    setDrawerOpen(false);
    navigate(to);
  };

  return (
    <div className={`min-h-screen font-sans antialiased selection:bg-[#D72B2B]/20 selection:text-[#D72B2B] flex flex-col transition-colors duration-300 ${isDarkMode ? "midnight-oven bg-[#090302] text-[#ffedd4]" : "bg-[#FFF8F2] text-[#3D1F00]"}`}>
      
      {/* Navbar */}
      <nav id="navbar" className="fixed top-0 left-0 right-0 z-40 h-16 md:h-20 bg-[rgba(13,5,0,0.95)] md:bg-white/95 backdrop-blur-md border-b border-[rgba(215,43,43,0.15)] md:border-[#D72B2B]/10 flex items-center shadow-xs">
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between w-full">
          <div className="flex items-center cursor-pointer" onClick={() => scrollToSection("home")}>
            <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/dfZWWj1nq2KWjIwX/ei_1771693328794-removebg-preview-H1gq480p6x8lYS4E.png" alt="Pizza City" className="h-10 md:h-12 object-contain" />
          </div>

          <ul className="hidden md:flex items-center gap-8 font-extrabold text-sm text-[#3D1F00]">
            <NavItem sectionId="home" label="Home" isActive={currentPath === "/" && activeSection === "home"} />
            <NavItem sectionId="menu" label="Menu" isActive={currentPath === "/" && activeSection === "menu"} />
            <NavItem sectionId="track" label="Track Order" isActive={currentPath === "/" && activeSection === "track"} />
            <NavItem sectionId="locations" label="Locations" isActive={currentPath === "/" && activeSection === "locations"} />
            <NavItem sectionId="contact" label="Contact" isActive={currentPath === "/" && activeSection === "contact"} />
            <NavItem sectionId="faq" label="FAQs" isActive={currentPath === "/" && activeSection === "faq"} />
            <li>
              <Link to="/admin" className={`px-4 py-2 bg-[#D72B2B]/10 hover:bg-[#D72B2B]/20 text-[#D72B2B] rounded-xl flex items-center gap-1.5 transition-all font-bold ${currentPath === "/admin" ? "bg-[#D72B2B]! text-white" : ""}`}>
                <Lock size={13} />
                Staff Portal
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <button onClick={() => { setIsDarkMode(!isDarkMode); displayToast(!isDarkMode ? "🔥 Entered 'Midnight Oven' High-Contrast Dark Mode." : "☀️ Switched to Day Light Baking Mode."); }} className="p-2 rounded-full border bg-[rgba(255,255,255,0.08)] md:bg-[#F5EDE3] hover:bg-[#FFF8F2] border-[#D72B2B]/10 text-white md:text-[#3D1F00] hover:text-[#D72B2B] transition-all flex items-center justify-center shadow-xs active:scale-95">
              {isDarkMode ? <Sun size={18} className="text-amber-400 fill-amber-400/20" /> : <Flame size={18} className="text-[#F26522] md:animate-pulse" />}
            </button>

            <button onClick={() => { if (cart.length === 0) displayToast("🛒 Your cart is empty. Pick a pizza from the menu!"); else setIsOutletSelectorOpen(true); }} className="relative p-2 rounded-full bg-[rgba(255,255,255,0.08)] md:bg-[#F5EDE3] hover:bg-[#FFF8F2] border border-[#D72B2B]/10 text-white md:text-[#3D1F00] transition-colors">
              <ShoppingCart size={18} />
              {cartTotalQty > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#D72B2B] text-white font-extrabold text-[10px] rounded-full flex items-center justify-center animate-bounce">{cartTotalQty}</span>}
            </button>
            
            <button onClick={() => setDrawerOpen(!drawerOpen)} className="md:hidden p-2 rounded-full bg-[rgba(255,255,255,0.08)] text-white transition-colors">
              <MenuIcon size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setDrawerOpen(false)} className="fixed inset-0 z-40 bg-black md:hidden" />
            <motion.div initial={{ translateX: "100%" }} animate={{ translateX: 0 }} exit={{ translateX: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed right-0 top-16 bottom-0 w-64 z-50 bg-white shadow-2xl p-6 flex flex-col gap-4 border-l border-gray-100 md:hidden text-[#3D1F00]">
              <button onClick={() => scrollToSection("home")} className={`py-3 px-4 font-bold rounded-xl text-left ${currentPath === "/" && activeSection === "home" ? "bg-[#D72B2B]/10 text-[#D72B2B]" : "hover:bg-gray-50"}`}>🏠 Home</button>
              <button onClick={() => scrollToSection("menu")} className={`py-3 px-4 font-bold rounded-xl text-left ${currentPath === "/" && activeSection === "menu" ? "bg-[#D72B2B]/10 text-[#D72B2B]" : "hover:bg-gray-50"}`}>🍕 Menu Catalog</button>
              <button onClick={() => scrollToSection("track")} className={`py-3 px-4 font-bold rounded-xl text-left ${currentPath === "/" && activeSection === "track" ? "bg-[#D72B2B]/10 text-[#D72B2B]" : "hover:bg-gray-50"}`}>🚀 Track Order</button>
              <button onClick={() => scrollToSection("locations")} className={`py-3 px-4 font-bold rounded-xl text-left ${currentPath === "/" && activeSection === "locations" ? "bg-[#D72B2B]/10 text-[#D72B2B]" : "hover:bg-gray-50"}`}>📍 Locations</button>
              <button onClick={() => scrollToSection("contact")} className={`py-3 px-4 font-bold rounded-xl text-left ${currentPath === "/" && activeSection === "contact" ? "bg-[#D72B2B]/10 text-[#D72B2B]" : "hover:bg-gray-50"}`}>📞 Contact</button>
              <button onClick={() => scrollToSection("faq")} className={`py-3 px-4 font-bold rounded-xl text-left ${currentPath === "/" && activeSection === "faq" ? "bg-[#D72B2B]/10 text-[#D72B2B]" : "hover:bg-gray-50"}`}>❓ FAQs</button>
              <div className="h-px bg-gray-100 my-2" />
              <button onClick={() => closeDrawerAndNav("/admin")} className={`py-3 px-4 font-extrabold rounded-xl text-left flex items-center gap-2 ${currentPath === "/admin" ? "bg-[#D72B2B] text-white" : "text-[#D72B2B] bg-[#D72B2B]/10 hover:bg-[#D72B2B]/20"}`}><Lock size={14} /> Outlet Admin Portal</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Pages Router */}
      <div className="pt-0 md:pt-24 flex-1">
        <Routes>
          <Route path="/" element={
            <div className="flex flex-col gap-0 md:gap-16">
              <section id="home">
                <HomePage banners={banners} isLoadingBanners={isLoadingBanners} setActiveTab={(tab) => scrollToSection(tab === 'loc' ? 'locations' : tab)} displayToast={displayToast} onOpenOutletSelector={() => setIsOutletSelectorOpen(true)} />
              </section>
              <section id="menu" className="scroll-mt-24 mt-12 md:mt-0">
                <MenuPage menuItems={menuItems} isLoadingMenu={isLoadingMenu} menuFilter={menuFilter} setMenuFilter={setMenuFilter} addToCart={addToCart} />
              </section>
              <section id="track" className="scroll-mt-24 mt-12 md:mt-0">
                <TrackOrderPage trackOrderId="" displayToast={displayToast} isDarkMode={isDarkMode} />
              </section>
              <section id="locations" className="scroll-mt-24 mt-12 md:mt-0">
                <LocationsPage branches={branches} />
              </section>
              <section id="contact" className="scroll-mt-24 mt-12 md:mt-0">
                <ContactPage displayToast={displayToast} />
              </section>
              <section id="faq" className="scroll-mt-24 mt-12 md:mt-0 pb-16">
                <FaqPage />
              </section>

              {/* Restored Footer */}
              <footer className="bg-[#1A0A00] text-[#9A7B5E] py-12 md:py-16 mt-8 rounded-t-[40px] shadow-2xl">
                <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="space-y-4">
                    <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/dfZWWj1nq2KWjIwX/ei_1771693328794-removebg-preview-H1gq480p6x8lYS4E.png" alt="Pizza City" className="h-10 md:h-12 object-contain brightness-0 invert opacity-90" />
                    <p className="text-sm leading-relaxed">Authentic wood-fired pizzas, hand-kneaded signature sourdough bases, and premium Omani ingredients.</p>
                  </div>
                  <div>
                    <h4 className="text-white font-playfair font-black text-lg mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm font-bold">
                      <li><button onClick={() => scrollToSection("home")} className="hover:text-[#F26522] transition-colors">Home</button></li>
                      <li><button onClick={() => scrollToSection("menu")} className="hover:text-[#F26522] transition-colors">Menu Catalog</button></li>
                      <li><button onClick={() => scrollToSection("track")} className="hover:text-[#F26522] transition-colors">Track Order</button></li>
                      <li><button onClick={() => scrollToSection("locations")} className="hover:text-[#F26522] transition-colors">Locations</button></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-playfair font-black text-lg mb-4">Contact Info</h4>
                    <ul className="space-y-2 text-sm font-bold">
                      <li>Muscat, Oman</li>
                      <li>Phone: +968 1234 5678</li>
                      <li>Email: hello@pizzacity.om</li>
                      <li>Open Daily: 11 AM - 2 AM</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-playfair font-black text-lg mb-4">Newsletter</h4>
                    <p className="text-sm mb-4">Subscribe for exclusive offers and secret menu drops.</p>
                    <div className="flex bg-white/5 rounded-xl overflow-hidden p-1 focus-within:ring-2 ring-[#F26522]/50 border border-white/10">
                      <input type="email" placeholder="Your email address" className="bg-transparent border-none outline-none px-4 py-2 text-white text-sm w-full" />
                      <button className="bg-[#F26522] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#D72B2B] transition-colors">Join</button>
                    </div>
                  </div>
                </div>
                <div className="container mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold tracking-wider">
                  <p>&copy; {new Date().getFullYear()} Pizza City Oman. All rights reserved.</p>
                  <div className="flex gap-4">
                    <span className="hover:text-white cursor-pointer">Privacy Policy</span>
                    <span className="hover:text-white cursor-pointer">Terms of Service</span>
                  </div>
                </div>
              </footer>
            </div>
          } />
          <Route path="/admin" element={<AdminPage displayToast={displayToast} refreshMenu={refreshMenu} />} />
        </Routes>
      </div>

      {/* Overlays & Modals */}
      <OutletSelector 
        isOpen={isOutletSelectorOpen} 
        onClose={() => setIsOutletSelectorOpen(false)} 
        cart={cart} 
        onClearCart={() => setCart([])} 
        onShowToast={displayToast} 
        branches={branches} 
        onUpdateCartItem={updateCartItem}
      />
      
      <AnimatePresence>
        {selectedConfigureItem && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setSelectedConfigureItem(null)} className="fixed inset-0 z-[60] bg-black" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[90%] max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-black text-xl text-[#1A0A00]">Configure Size</h3>
                <button onClick={() => setSelectedConfigureItem(null)} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"><X size={16} /></button>
              </div>
              <div className="flex justify-between gap-2 mb-6">
                {(["Small", "Medium", "Large"] as const).map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`flex-1 py-2 text-sm font-bold rounded-xl border ${selectedSize === size ? "bg-[#D72B2B] text-white border-transparent" : "bg-white text-gray-500 border-gray-200 hover:border-[#D72B2B]"}`}>{size}</button>
                ))}
              </div>
              <div className="flex items-center justify-between mb-6 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <button onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))} className="w-10 h-10 rounded-xl bg-white shadow-sm font-bold">-</button>
                <span className="font-black text-lg">{selectedQuantity}</span>
                <button onClick={() => setSelectedQuantity(selectedQuantity + 1)} className="w-10 h-10 rounded-xl bg-white shadow-sm font-bold">+</button>
              </div>
              <button onClick={confirmAddToCart} className="w-full py-4 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform">Confirm Add to Cart</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-[#1A0A00] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-gray-800">
            <span className="text-sm font-bold tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


