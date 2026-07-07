import React, { useState, useEffect } from "react";
import { 
  Menu as MenuIcon, 
  X, 
  ShoppingCart, 
  MapPin, 
  Phone, 
  Mail, 
  Search, 
  Star, 
  ChevronDown, 
  Send, 
  Lock, 
  CheckCircle, 
  Clock, 
  HelpCircle,
  Clock3,
  Sun,
  Flame,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Tag,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import OutletSelector from "./components/OutletSelector";
import AdminDashboard from "./components/AdminDashboard";
import BannerSlider from "./components/BannerSlider";
import OrderTracker from "./components/OrderTracker";
import { MenuItem, OUTLETS, OutletName, CartEntry, HeroBanner, Branch } from "./types";
import { getOptimizedUnitPrice, getSizeAdjustedPrice, getPriceBreakdown } from "./lib/priceUtils";

// Setup fallback local seed menu data if REST API fails
const LOCAL_BACKUP_MENU: MenuItem[] = [
  {
    _id: "m_1",
    name: "Margherita Classic",
    category: "pizza",
    price: 2.5,
    description: "San Marzano tomato, buffalo mozzarella, fresh basil & olive oil.",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    _id: "m_2",
    name: "BBQ Chicken Royale",
    category: "pizza",
    price: 3.2,
    description: "Smoky BBQ, grilled chicken, caramelised onion & smoked cheddar.",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    _id: "m_3",
    name: "Inferno Diavola",
    category: "pizza",
    price: 3.0,
    description: "Spicy salami, nduja paste, Calabrian chillies & mozzarella.",
    image: "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    _id: "m_4",
    name: "Garden Primavera",
    category: "pizza",
    price: 2.8,
    description: "Roasted peppers, artichoke, pesto base & ricotta dollops.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
];

const LOCAL_BACKUP_BANNERS: HeroBanner[] = [
  {
    _id: "b_1",
    title: "BOLD FLAVOURS. UNFORGETTABLE Moments.",
    subtitle: "Authentic Arabic & Italian flavours crafted with premium ingredients and passion.",
    badge: "Arabic & Italian Flavour",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Order Now",
    buttonLink: "#menu",
    isActive: true,
    stylePattern: "attached"
  },
  {
    _id: "b_2",
    title: "THE ULTIMATE SHARING COMPANION",
    subtitle: "Bake your family gatherings with our customized sizing options. Big flavors, smart savings!",
    badge: "Buy More, Save More",
    image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Configure Sizing",
    buttonLink: "#menu",
    isActive: true,
    stylePattern: "classic"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "menu" | "track" | "loc" | "contact" | "faq" | "admin">("home");
  const [trackOrderId, setTrackOrderId] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Horizontal slide controller refs
  const signatureSliderRef = React.useRef<HTMLDivElement>(null);
  const specialOffersSliderRef = React.useRef<HTMLDivElement>(null);
  const categoryRefs = {
    pizza: React.useRef<HTMLDivElement>(null),
    sides: React.useRef<HTMLDivElement>(null),
    drinks: React.useRef<HTMLDivElement>(null),
    dessert: React.useRef<HTMLDivElement>(null),
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

  const scrollSignature = (dir: "left" | "right") => {
    if (signatureSliderRef.current) {
      const { scrollLeft, clientWidth } = signatureSliderRef.current;
      const scrollAmount = clientWidth * 0.8;
      signatureSliderRef.current.scrollTo({
        left: dir === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
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

  // Global Theme Selection (Light vs High-contrast Midnight Oven Dark Mode)
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

  // Cart Management
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [isOutletSelectorOpen, setIsOutletSelectorOpen] = useState(false);

  // Configure item before add to cart modal
  const [selectedConfigureItem, setSelectedConfigureItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<"Small" | "Medium" | "Large">("Medium");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  // Search & Filter state on Pages
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [menuFilter, setMenuFilter] = useState<string>("all");
  const [faqSearchQuery, setFaqSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Customer feedback contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMsg, setContactMsg] = useState("");

  // Toast notifier
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Interactive Hero Characteristics state
  const [activeHeroTab, setActiveHeroTab] = useState<"crust" | "sauce" | "cheese">("crust");
  const [pizzaRotation, setPizzaRotation] = useState(0);

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Synchronized callback to reload the live menu
  const refreshMenu = async () => {
    try {
      const res = await fetch("/api/menu");
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
      }
    } catch (err) {
      console.warn("Real-time background sync failure", err);
    }
  };

  // Synchronized callback to reload the live banners
  const refreshBanners = async () => {
    try {
      const res = await fetch("/api/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (err) {
      console.warn("Real-time background banners sync failure", err);
    }
  };

  // Load menu items on start up & handle live updates from Broadcast Channels / events
  useEffect(() => {
    async function loadMenu() {
      setIsLoadingMenu(true);
      try {
        const res = await fetch("/api/menu");
        if (!res.ok) throw new Error("JSON parse error from server.");
        const data = await res.json();
        setMenuItems(data);
      } catch (err) {
        console.warn("Could not retrieve menu from db, falling back to cached local items.", err);
        setMenuItems(LOCAL_BACKUP_MENU);
      } finally {
        setIsLoadingMenu(false);
      }
    }

    async function loadBanners() {
      setIsLoadingBanners(true);
      try {
        const res = await fetch("/api/banners");
        if (!res.ok) throw new Error("JSON parse error from server.");
        const data = await res.json();
        setBanners(data);
      } catch (err) {
        console.warn("Could not retrieve banners from db, falling back to cached local banners.", err);
        setBanners(LOCAL_BACKUP_BANNERS);
      } finally {
        setIsLoadingBanners(false);
      }
    }

    async function loadBranches() {
      setIsLoadingBranches(true);
      try {
        const res = await fetch("/api/branches");
        if (!res.ok) throw new Error("JSON parse error for branches.");
        const data = await res.json();
        setBranches(data);
      } catch (err) {
        console.warn("Could not retrieve branches, using static mappings", err);
      } finally {
        setIsLoadingBranches(false);
      }
    }

    loadMenu();
    loadBanners();
    loadBranches();

    // ⚡ Cross-tab Broadcast Channel for real-time synchronization
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("pizza_city_menu_channel");
      bc.onmessage = (event) => {
        if (event.data && event.data.type === "MENU_UPDATED" && event.data.menu) {
          setMenuItems(event.data.menu);
          displayToast("🔔 Live Menu sync: Catalog updated by Administrative changes.");
        }
        if (event.data && event.data.type === "BANNERS_UPDATED" && event.data.banners) {
          setBanners(event.data.banners);
          displayToast("🔔 Live Banners sync: Web banners updated by Administrative changes.");
        }
        if (event.data && event.data.type === "BRANCHES_UPDATED" && event.data.branches) {
          setBranches(event.data.branches);
          displayToast("🔔 Live Branches sync: Branch locations updated!");
        }
      };
    } catch (e) {
      // BroadcastChannel sandbox safety block
    }

    // ⚡ Within-window Event Listener as a fallback
    const handleCustomMenuEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setMenuItems(detail);
        displayToast("🔔 Live Menu sync: Catalog updated successfully!");
      }
    };

    const handleCustomBannersEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setBanners(detail);
        displayToast("🔔 Live Banners sync: Web banners updated successfully!");
      }
    };

    const handleCustomBranchesEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setBranches(detail);
        displayToast("🔔 Live Branches sync: Store network synchronized!");
      }
    };

    window.addEventListener("pizza_city_menu_updated", handleCustomMenuEvent);
    window.addEventListener("pizza_city_banners_updated", handleCustomBannersEvent);
    window.addEventListener("pizza_city_branches_updated", handleCustomBranchesEvent);

    return () => {
      if (bc) {
        bc.close();
      }
      window.removeEventListener("pizza_city_menu_updated", handleCustomMenuEvent);
      window.removeEventListener("pizza_city_banners_updated", handleCustomBannersEvent);
      window.removeEventListener("pizza_city_branches_updated", handleCustomBranchesEvent);
    };
  }, []);

  const addToCart = (product: MenuItem) => {
    setSelectedConfigureItem(product);
    setSelectedSize("Medium");
    setSelectedQuantity(1);
  };

  const confirmAddToCart = () => {
    if (!selectedConfigureItem) return;
    
    const basePrice = (selectedConfigureItem.discountPrice && selectedConfigureItem.discountPrice < selectedConfigureItem.price)
      ? selectedConfigureItem.discountPrice
      : selectedConfigureItem.price;

    const optimizedPrice = getOptimizedUnitPrice(
      basePrice,
      selectedSize,
      selectedQuantity,
      selectedConfigureItem.category
    );

    setCart((prev) => {
      const exists = prev.find(
        (entry) => entry.item._id === selectedConfigureItem._id && entry.size === selectedSize
      );
      if (exists) {
        const newQty = exists.quantity + selectedQuantity;
        const reOptimizedPrice = getOptimizedUnitPrice(
          basePrice,
          selectedSize,
          newQty,
          selectedConfigureItem.category
        );
        return prev.map((entry) =>
          entry.item._id === selectedConfigureItem._id && entry.size === selectedSize
            ? { ...entry, quantity: newQty, unitPrice: reOptimizedPrice }
            : entry
        );
      }
      return [
        ...prev,
        {
          item: selectedConfigureItem,
          quantity: selectedQuantity,
          size: selectedSize,
          unitPrice: optimizedPrice,
        },
      ];
    });

    if (selectedConfigureItem.category === "pizza") {
      displayToast(`🛒 Added ${selectedQuantity}x ${selectedConfigureItem.name} [Size: ${selectedSize}] to cart.`);
    } else {
      displayToast(`🛒 Added ${selectedQuantity}x ${selectedConfigureItem.name} to cart.`);
    }
    setSelectedConfigureItem(null);
    setIsOutletSelectorOpen(true); // Bring up selector overlay automatically!
  };

  const handleUpdateCartItem = (index: number, newQty: number, newSize: "Small" | "Medium" | "Large") => {
    setCart((prev) => {
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      return prev.map((entry, i) => {
        if (i === index) {
          const basePrice = (entry.item.discountPrice && entry.item.discountPrice < entry.item.price)
            ? entry.item.discountPrice
            : entry.item.price;
          const optimizedPrice = getOptimizedUnitPrice(basePrice, newSize, newQty, entry.item.category);
          return {
            ...entry,
            quantity: newQty,
            size: newSize,
            unitPrice: optimizedPrice
          };
        }
        return entry;
      });
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    displayToast("📨 Thank you! Your feedback was received. We’ll respond within 24 hours.");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setContactMsg("");
  };

  const cartTotalQty = cart.reduce((sum, entry) => sum + entry.quantity, 0);

  // Filter menu logic
  const displayedMenuItems = menuItems.filter((item) => {
    if (menuFilter === "all") return true;
    return item.category === menuFilter;
  });

  const hasFeaturedItems = menuItems.some((item) => item.featured);
  const baseFeaturedList = hasFeaturedItems
    ? menuItems.filter((item) => item.featured)
    : menuItems;

  const featuredMenuItems = baseFeaturedList.filter((item) => {
    if (featuredFilter === "all") return true;
    if (featuredFilter === "classic") return item.name.includes("Margherita") || item.category === "pizza";
    if (featuredFilter === "premium") return item.price >= 3.2;
    if (featuredFilter === "veggie") return item.name.includes("Primavera") || item.name.includes("Fungi") || item.name.includes("Cheesy");
    if (featuredFilter === "spicy") return item.name.includes("Inferno");
    return true;
  });

  // Business FAQ arrays grouped
  const FAQS = [
    { q: "How long does delivery take?", a: "We aim for 30 minutes or less across Nizwa, Samail, Sur, Quriyat, and Fanja. If we exceed that, your next order is on us!" },
    { q: "How can I place an order?", a: "Just click the 'Order Now' or 'Add to Cart' buttons here! It builds your invoice list, inserts it into our Express-MongoDB backend, and immediately opens WhatsApp with the pre-filled invoice message for your outlet of choice!" },
    { q: "What active areas do you offer delivery?", a: "We offer hot and fast delivery from our 5 regional stations: Nizwa, Samail, Sur, Quriyat, and Fanja. Follow us on Instagram @_pizza.city_ to get updates when we open near you." },
    { q: "Am I able to configure custom toppings?", a: "Absolutely. When placing your automated WhatsApp text checkout, you can append any custom configurations, extra toppings, or instructions like 'make it extra hot'!" },
    { q: "What payment systems are available?", a: "We currently accept cash-on-delivery, local bank transfer, or card systems. Integrated Oman payment gateways like Thawani are currently under active development." },
    { q: "Are all components of the pizza clean and fresh?", a: "Yes, 100%! We source premium whole-milk mozzarella and hand-stretch our dough daily. No frozen crusts or canned shortcuts are ever permitted." },
  ];

  const filteredFaqs = FAQS.filter(f => 
    f.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const HERO_DETAILS = {
    crust: {
      title: "🌾 48-Hour Signature Sourdough",
      description: "Our signature crust undergoes a slow cold fermentation for 48 hours for maximum bubble structure, crisp wood-fired leopard crown, and perfect light digestibility.",
      stats: [
        { label: "Crispiness Factor", value: 96 },
        { label: "Fermentation Depth", value: 98 },
        { label: "Wood-fired Char", value: 92 }
      ],
      emoji: "🌾",
      colorClass: "text-[#D72B2B] bg-[#D72B2B]/5 border-[#D72B2B]/10"
    },
    sauce: {
      title: "🍅 Orchard-Sweet San Marzano",
      description: "Crushed imported low-acidity sun-drenched Italian San Marzano tomatoes, premium sea salt, and a pinch of cold-pressed virgin olive oil.",
      stats: [
        { label: "Natural Sweetness", value: 94 },
        { label: "Umami Power", value: 90 },
        { label: "Basil Infusion", value: 88 }
      ],
      emoji: "🍅",
      colorClass: "text-[#F26522] bg-[#F26522]/5 border-[#F26522]/10"
    },
    cheese: {
      title: "🧀 Premium Stretch Omani Milk Mozzarella",
      description: "High-moisture whole milk fior di latte, hand-shaped daily by Omani cheese-smiths for the absolute ultimate golden melt pull.",
      stats: [
        { label: "Melt & Stretch Pull", value: 99 },
        { label: "Buttery Dairy Depth", value: 94 },
        { label: "Toasty Crust Bubble", value: 91 }
      ],
      emoji: "🧀",
      colorClass: "text-amber-600 bg-amber-500/5 border-amber-500/10"
    }
  };

  return (
    <div className={`min-h-screen font-sans antialiased selection:bg-[#D72B2B]/20 selection:text-[#D72B2B] flex flex-col transition-colors duration-300 ${isDarkMode ? "midnight-oven bg-[#090302] text-[#ffedd4]" : "bg-[#FFF8F2] text-[#3D1F00]"}`}>
      
      {/* =====================================
          TOP NAVIGATION BAR
          ===================================== */}
      <nav id="navbar" className="fixed top-0 left-0 right-0 z-40 h-16 md:h-20 bg-white/95 backdrop-blur-md border-b border-[#D72B2B]/10 flex items-center shadow-xs">
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between w-full">
          
          {/* Logo brand */}
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab("home")}>
            <img 
              src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/dfZWWj1nq2KWjIwX/ei_1771693328794-removebg-preview-H1gq480p6x8lYS4E.png" 
              alt="Pizza City" 
              className="h-10 md:h-12 object-contain"
            />
          </div>

          {/* Desktop links navigation */}
          <ul className="hidden md:flex items-center gap-8 font-extrabold text-sm text-[#3D1F00]">
            <li>
              <button 
                onClick={() => setActiveTab("home")} 
                className={`relative py-1.5 transition-colors hover:text-[#D72B2B] ${activeTab === "home" ? "text-[#D72B2B]" : ""}`}
              >
                Home
                {activeTab === "home" && (
                  <motion.div layoutId="navline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D72B2B] rounded-full" />
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("menu")} 
                className={`relative py-1.5 transition-colors hover:text-[#D72B2B] ${activeTab === "menu" ? "text-[#D72B2B]" : ""}`}
              >
                Menu
                {activeTab === "menu" && (
                  <motion.div layoutId="navline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D72B2B] rounded-full" />
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("track")} 
                className={`relative py-1.5 transition-colors hover:text-[#D72B2B] ${activeTab === "track" ? "text-[#D72B2B]" : ""}`}
              >
                Track Order
                {activeTab === "track" && (
                  <motion.div layoutId="navline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D72B2B] rounded-full" />
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("loc")} 
                className={`relative py-1.5 transition-colors hover:text-[#D72B2B] ${activeTab === "loc" ? "text-[#D72B2B]" : ""}`}
              >
                Locations
                {activeTab === "loc" && (
                  <motion.div layoutId="navline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D72B2B] rounded-full" />
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("contact")} 
                className={`relative py-1.5 transition-colors hover:text-[#D72B2B] ${activeTab === "contact" ? "text-[#D72B2B]" : ""}`}
              >
                Contact
                {activeTab === "contact" && (
                  <motion.div layoutId="navline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D72B2B] rounded-full" />
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("faq")} 
                className={`relative py-1.5 transition-colors hover:text-[#D72B2B] ${activeTab === "faq" ? "text-[#D72B2B]" : ""}`}
              >
                FAQs
                {activeTab === "faq" && (
                  <motion.div layoutId="navline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D72B2B] rounded-full" />
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("admin")} 
                className={`px-4 py-2 bg-[#D72B2B]/10 hover:bg-[#D72B2B]/20 text-[#D72B2B] rounded-xl flex items-center gap-1.5 transition-all font-bold ${activeTab === "admin" ? "bg-[#D72B2B]! text-white" : ""}`}
              >
                <Lock size={13} />
                Staff Portal
              </button>
            </li>
          </ul>

          {/* Action buttons nav right */}
          <div className="flex items-center gap-3">
            {/* Global Theme Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                displayToast(
                  !isDarkMode 
                    ? "🔥 Entered 'Midnight Oven' High-Contrast Dark Mode. Warm wood-fired baking style!" 
                    : "☀️ Switched to Day Light Baking Mode."
                );
              }}
              title={isDarkMode ? "Toggle Light mode" : "Toggle Midnight Oven dark mode"}
              className="p-2 rounded-full border bg-[#F5EDE3] hover:bg-[#FFF8F2] border-[#D72B2B]/10 text-[#3D1F00] hover:text-[#D72B2B] transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
            >
              {isDarkMode ? (
                <Sun size={18} className="text-amber-400 fill-amber-400/20" />
              ) : (
                <Flame size={18} className="text-[#F26522] animate-pulse" />
              )}
            </button>

            <button 
              onClick={() => {
                if (cart.length === 0) {
                  displayToast("🛒 Your cart is empty. Pick a pizza from the menu!");
                  return;
                }
                setIsOutletSelectorOpen(true);
              }}
              className="relative p-2 rounded-full bg-[#F5EDE3] hover:bg-[#FFF8F2] border border-[#D72B2B]/10 text-[#3D1F00] transition-colors"
            >
              <ShoppingCart size={18} />
              {cartTotalQty > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#D72B2B] text-white font-extrabold text-[10px] rounded-full flex items-center justify-center animate-bounce">
                  {cartTotalQty}
                </span>
              )}
            </button>
            
            {/* Hamburger drawer button (mobile) */}
            <button 
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="md:hidden p-2 rounded-full bg-[#F5EDE3] hover:bg-[#FFF8F2] text-[#3D1F00] transition-colors"
            >
              <MenuIcon size={18} />
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Drawer Slide Navigation Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            <motion.div 
              initial={{ translateX: "100%" }}
              animate={{ translateX: 0 }}
              exit={{ translateX: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-16 bottom-0 w-64 z-50 bg-white shadow-2xl p-6 flex flex-col gap-4 border-l border-gray-100 md:hidden"
            >
              <button 
                onClick={() => { setActiveTab("home"); setDrawerOpen(false); }}
                className={`py-3 px-4 font-bold rounded-xl text-left ${activeTab === "home" ? "bg-[#D72B2B]/10 text-[#D72B2B]" : "hover:bg-gray-50"}`}
              >
                🏠 Home
              </button>
              <button 
                onClick={() => { setActiveTab("menu"); setDrawerOpen(false); }}
                className={`py-3 px-4 font-bold rounded-xl text-left ${activeTab === "menu" ? "bg-[#D72B2B]/10 text-[#D72B2B]" : "hover:bg-gray-50"}`}
              >
                🍕 Menu Catalog
              </button>
              <button 
                onClick={() => { setActiveTab("track"); setDrawerOpen(false); }}
                className={`py-3 px-4 font-bold rounded-xl text-left ${activeTab === "track" ? "bg-[#D72B2B]/10 text-[#D72B2B]" : "hover:bg-gray-50"}`}
              >
                🚀 Track Order
              </button>
              <button 
                onClick={() => { setActiveTab("loc"); setDrawerOpen(false); }}
                className={`py-3 px-4 font-bold rounded-xl text-left ${activeTab === "loc" ? "bg-[#D72B2B]/10 text-[#D72B2B]" : "hover:bg-gray-50"}`}
              >
                📍 Outlet Locations
              </button>
              <button 
                onClick={() => { setActiveTab("contact"); setDrawerOpen(false); }}
                className={`py-3 px-4 font-bold rounded-xl text-left ${activeTab === "contact" ? "bg-[#D72B2B]/10 text-[#D72B2B]" : "hover:bg-gray-50"}`}
              >
                📞 Contact Chain
              </button>
              <button 
                onClick={() => { setActiveTab("faq"); setDrawerOpen(false); }}
                className={`py-3 px-4 font-bold rounded-xl text-left ${activeTab === "faq" ? "bg-[#D72B2B]/10 text-[#D72B2B]" : "hover:bg-gray-50"}`}
              >
                ❓ FAQs
              </button>
              <div className="h-px bg-gray-100 my-2" />
              <button 
                onClick={() => { setActiveTab("admin"); setDrawerOpen(false); }}
                className={`py-3 px-4 font-extrabold rounded-xl text-left flex items-center gap-2 ${activeTab === "admin" ? "bg-[#D72B2B] text-white" : "text-[#D72B2B] bg-[#D72B2B]/10 hover:bg-[#D72B2B]/20"}`}
              >
                <Lock size={14} />
                Outlet Admin Portal
              </button>

              <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-[#9A7B5E] tracking-wider pl-1">App Atmosphere</span>
                <button 
                  type="button"
                  onClick={() => {
                    setIsDarkMode(!isDarkMode);
                    setDrawerOpen(false);
                    displayToast(
                      !isDarkMode 
                        ? "🔥 Entered 'Midnight Oven' High-Contrast Dark Mode. Warm wood-fired baking style!" 
                        : "☀️ Switched to Day Light Baking Mode."
                    );
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-bold flex items-center justify-between text-left text-xs bg-[#F5EDE3] hover:bg-[#FFF8F2] border border-[#D72B2B]/10 text-[#3D1F00] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {isDarkMode ? <Sun size={14} className="text-amber-400 fill-amber-400/20" /> : <Flame size={14} className="text-[#F26522]" />}
                    {isDarkMode ? "Day Light Oven" : "Midnight Oven"}
                  </span>
                  <span className="text-[10px] bg-[#D72B2B]/10 text-[#D72B2B] px-2 py-0.5 rounded-full font-black uppercase">
                    Toggle
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="pt-20 md:pt-24 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            
            {/* =====================================
                🏠 HOME PAGE
                ===================================== */}
            {activeTab === "home" && (
              <div className="space-y-16 pb-16">
                
                {/* Dynamic Web Banners Hero Gallery */}
                <div className="container mx-auto px-4 md:px-8 pt-6">
                  <BannerSlider 
                    banners={banners.filter((b: any) => b.type === "hero" || b.type === "all" || !b.type)}
                    isLoading={isLoadingBanners}
                    onOrderNow={() => {
                      setActiveTab("menu");
                    }}
                  />
                </div>

                {/* Hero section (Legacy fallback) */}
                <section className="hidden container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-6 relative">
                  
                  {/* Floating Background Toppings (Ambient) */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
                    <motion.div 
                      animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-12 left-10 text-3xl opacity-20"
                    >
                      🌿
                    </motion.div>
                    <motion.div 
                      animate={{ y: [0, -20, 0], rotate: [0, -15, 15, 0] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute bottom-24 left-1/3 text-3xl opacity-20"
                    >
                      🍅
                    </motion.div>
                    <motion.div 
                      animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                      className="absolute top-1/2 left-2/3 text-3xl opacity-20"
                    >
                      🫒
                    </motion.div>
                    <motion.div 
                      animate={{ y: [0, -25, 0], rotate: [0, 12, -12, 0] }}
                      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="absolute top-24 left-1/2 text-2xl opacity-15"
                    >
                      🍄
                    </motion.div>
                  </div>

                  {/* Text Column */}
                  <motion.div 
                    variants={heroContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="md:col-span-7 space-y-6"
                  >
                    <motion.div 
                      variants={heroItemVariants}
                      className="inline-flex items-center gap-2 text-xs font-black uppercase text-[#F26522] bg-[#F26522]/10 px-3.5 py-1.5 rounded-full"
                    >
                      🍕 Handcrafted · Premium · Delivered Fast
                    </motion.div>
                    
                    <motion.h1 
                      variants={heroItemVariants}
                      className="font-playfair font-black text-4xl sm:text-5xl lg:text-6xl text-[#1A0A00] leading-tight"
                    >
                      The Art of the <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D72B2B] to-[#F26522] hover:brightness-110 transition-all duration-300">Perfect Slice</span> <br />
                      Starts Here.
                    </motion.h1>
                    
                    <motion.p 
                      variants={heroItemVariants}
                      className="text-[#9A7B5E] text-base md:text-lg leading-relaxed max-w-xl"
                    >
                      Authentic wood-fired pizzas, hand-kneaded signature sourdough bases, and premium Omani ingredients. Place an order directly onto the database with instant WhatsApp notification routing!
                    </motion.p>

                    {/* Interactive Ingredients Spotlight Showcase Card (Sleek tabbed component in hero) */}
                    <motion.div 
                      variants={heroItemVariants}
                      className="bg-white rounded-3xl border border-[#D72B2B]/10 p-5 shadow-sm max-w-xl space-y-4"
                    >
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
                                activeHeroTab === tab
                                  ? "bg-[#D72B2B] text-white border-transparent shadow-xs"
                                  : "bg-gray-50 text-[#9A7B5E] border-gray-100 hover:bg-gray-100"
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeHeroTab}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4"
                        >
                          <div className="space-y-1">
                            <h4 className="font-playfair font-black text-base text-[#1A0A00] flex items-center gap-1.5">
                              {HERO_DETAILS[activeHeroTab].title}
                            </h4>
                            <p className="text-xs text-[#9A7B5E] leading-relaxed">
                              {HERO_DETAILS[activeHeroTab].description}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                            {HERO_DETAILS[activeHeroTab].stats.map((stat, sIdx) => (
                              <div key={sIdx} className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-black text-[#1A0A00]">
                                  <span className="truncate">{stat.label}</span>
                                  <span className="text-[#D72B2B]">{stat.value}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stat.value}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-[#D72B2B] to-[#F26522] rounded-full"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                    
                    <motion.div 
                      variants={heroItemVariants}
                      className="flex flex-col sm:flex-row gap-4 pt-2"
                    >
                      <button 
                        onClick={() => setActiveTab("menu")}
                        className="px-8 py-4 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white rounded-full font-bold shadow-lg shadow-[#D72B2B]/30 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
                      >
                        <ShoppingCart size={18} />
                        View Full Menu
                      </button>
                      <button 
                        onClick={() => setActiveTab("loc")}
                        className="px-8 py-4 border-2 border-[#D72B2B] text-[#D72B2B] rounded-full font-bold hover:bg-[#D72B2B] hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
                      >
                        <MapPin size={18} />
                        Select Outlet Location
                      </button>
                    </motion.div>
                  </motion.div>

                  {/* Imagery Column with Orbiting Micro Toppings and Spin Animation */}
                  <div className="md:col-span-5 relative w-full aspect-square max-w-md mx-auto flex items-center justify-center">
                    
                    {/* Glowing Aura Ring Background */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#D72B2B]/20 to-[#F26522]/20 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" style={{ animationDuration: "4s" }} />
                    
                    {/* Interactive Orbiting Toppings around primary image */}
                    <div className="absolute inset-0 z-10 pointer-events-none">
                      {/* Top-Right Pepper */}
                      <motion.div 
                        animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-6 right-6 text-3xl bg-white/90 p-2 rounded-full border border-[#D72B2B]/10 shadow-sm flex items-center justify-center"
                      >
                        🌶️
                      </motion.div>
                      {/* Left-Middle Basil */}
                      <motion.div 
                        animate={{ y: [0, 8, 0], x: [0, -4, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute top-1/3 -left-2 text-2xl bg-white/90 p-2 rounded-full border border-[#D72B2B]/10 shadow-sm flex items-center justify-center"
                      >
                        🌿
                      </motion.div>
                      {/* Bottom-Right Mozzarella block */}
                      <motion.div 
                        animate={{ y: [0, -6, 0], x: [0, -6, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-10 right-2 text-2xl bg-white/90 p-2 rounded-full border border-[#D72B2B]/10 shadow-sm flex items-center justify-center"
                      >
                        🧀
                      </motion.div>
                    </div>

                    {/* Main Pizza Card Container with Hover Spin */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="relative w-[90%] h-[90%] p-3 bg-white rounded-[48px] border border-[#D72B2B]/10 shadow-2xl overflow-hidden cursor-pointer group"
                      onClick={() => {
                        setPizzaRotation(prev => prev + 90);
                        displayToast("🍕 Smooth rotational spin activated!");
                      }}
                    >
                      <motion.img 
                        src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85"
                        alt="Tasty Italian Margherita Pizza" 
                        animate={{ rotate: pizzaRotation }}
                        whileHover={{ rotate: pizzaRotation + 45 }}
                        transition={{ type: "spring", stiffness: 80, damping: 14 }}
                        className="w-full h-full object-cover rounded-[38px] select-none"
                      />
                      
                      {/* Visual instructions badge overlay inside card */}
                      <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#1A0A00] bg-white/95 px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                          👆 Click to spin oven base
                        </span>
                      </div>
                    </motion.div>

                    {/* Bottom-left Float Badge */}
                    <motion.div 
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -bottom-2 -left-2 bg-white p-4 rounded-2xl flex items-center gap-3 border border-[#D72B2B]/10 shadow-xl max-w-xs z-20"
                    >
                      <span className="text-2xl">🔥</span>
                      <div>
                        <p className="text-xs font-black text-[#1A0A00]">Continuous Hot Oven</p>
                        <p className="text-[10px] text-[#9A7B5E]">Fresh &amp; stone-fired @ 450°C</p>
                      </div>
                    </motion.div>
                  </div>
                </section>

                {/* Statistics Teaser bar */}
                <section className="bg-[#1A0A00] text-white py-12">
                  <div className="container mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div className="space-y-1">
                      <p className="text-3xl font-black font-playfair text-[#F26522]">30 Min</p>
                      <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Delivery Guarantee</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-black font-playfair text-[#F26522]">5 Outlets</p>
                      <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Across Oman</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-black font-playfair text-[#F26522]">100% Raw</p>
                      <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Fresh Daily Dough</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-black font-playfair text-[#F26522]">MongoDB</p>
                      <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Reactive Order Ledger</p>
                    </div>
                  </div>
                </section>

                {/* 🔥 Special Offers Horizontal Banner Slider Section */}
                <section className="container mx-auto px-4 md:px-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#F26522] uppercase tracking-widest block">Limited-Time Deals</span>
                      <h3 className="font-playfair font-black text-2xl md:text-3xl text-[#1A0A00] flex items-center gap-2">
                        <span className="text-yellow-500 animate-pulse">🏷️</span>
                        <span>Special Offers &amp; Hot Combos</span>
                        <span className="text-[10px] bg-[#D72B2B]/10 text-[#D72B2B] font-bold px-2 py-0.5 rounded-full ml-1">
                          Promo codes
                        </span>
                      </h3>
                      <p className="text-[11px] text-[#9A7B5E] max-w-xl font-medium">
                        Crafted for groups, families, and solo cravings. Tap any offer card below to load those categories instantly!
                      </p>
                    </div>

                    {/* Left & Right Slide Buttons triggers */}
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => scrollSpecialOffers("left")}
                        className="w-8 h-8 rounded-full border border-gray-150 bg-white text-gray-500 hover:text-[#D72B2B] hover:border-[#D72B2B]/20 flex items-center justify-center cursor-pointer shadow-xs active:scale-90 transition-all select-none"
                        title="Slide Left"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <button
                        onClick={() => scrollSpecialOffers("right")}
                        className="w-8 h-8 rounded-full border border-gray-150 bg-white text-gray-500 hover:text-[#D72B2B] hover:border-[#D72B2B]/20 flex items-center justify-center cursor-pointer shadow-xs active:scale-90 transition-all select-none"
                        title="Slide Right"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Horizontal scrolling shelf container */}
                  <div
                    ref={specialOffersSliderRef}
                    className="flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
                  >
                    {isLoadingBanners ? (
                      <div className="w-full text-center py-8 space-y-3 bg-white rounded-3xl border border-gray-100 p-8 my-4">
                        <div className="w-6 h-6 rounded-full border-2 border-t-[#D72B2B] border-gray-200 animate-spin mx-auto" />
                        <p className="text-xs text-[#9A7B5E] font-bold">Retrieving special promotion campaigns...</p>
                      </div>
                    ) : banners.filter((b: any) => b.type === "offer" || b.type === "all" || !b.type).length === 0 ? (
                      <div className="w-full text-center py-8 bg-white rounded-3xl border border-gray-100 p-8 my-4 space-y-2">
                        <p className="text-sm font-bold text-[#9A7B5E]">No active promotional campaigns running currently.</p>
                      </div>
                    ) : (
                      banners.filter((b: any) => b.type === "offer" || b.type === "all" || !b.type).map((slide) => (
                        <div
                          key={slide._id}
                          onClick={() => {
                            // Navigate to the gourmet menu page tab and scroll to top
                            setActiveTab("menu");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                            // If there is a category filter in the promotion link or title, set it
                            const badgeTerm = (slide.badge || "").toLowerCase();
                            const titleTerm = (slide.title || "").toLowerCase();
                            const combined = `${badgeTerm} ${titleTerm}`;
                            
                            if (combined.includes("pizza")) {
                              setMenuFilter("pizza");
                            } else if (combined.includes("side") || combined.includes("starter") || combined.includes("appeticer") || combined.includes("fries")) {
                              setMenuFilter("sides");
                            } else if (combined.includes("drink") || combined.includes("soda") || combined.includes("cold")) {
                              setMenuFilter("drinks");
                            } else if (combined.includes("sweet") || combined.includes("dessert") || combined.includes("cream")) {
                              setMenuFilter("dessert");
                            } else {
                              setMenuFilter("all");
                            }
                            displayToast(`🚀 Promo activated: Filtered for "${slide.badge || "Special Offer"}" catalog!`);
                          }}
                          className="flex-shrink-0 w-[290px] sm:w-[350px] md:w-[420px] h-[220px] rounded-[24px] overflow-hidden border border-gray-100 flex flex-col justify-end p-5 relative snap-center cursor-pointer shadow-xs hover:shadow-md hover:border-[#D72B2B]/20 hover:scale-[1.01] active:scale-[0.99] transition-all group select-none bg-neutral-900"
                        >
                          {/* Banner Image */}
                          <div className="absolute inset-0">
                            <img
                              src={slide.image}
                              alt={slide.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover opacity-35 group-hover:scale-103 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
                          </div>

                          {/* Content lines */}
                          <div className="relative z-10 text-left space-y-1">
                            {slide.badge && (
                              <span className="inline-block bg-[#D72B2B] text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-1">
                                {slide.badge}
                              </span>
                            )}
                            <h4 className="font-playfair font-black text-sm sm:text-base text-white leading-tight uppercase group-hover:text-amber-400 transition-colors">
                              {slide.title}
                            </h4>
                            <p className="text-[11px] text-gray-300 leading-normal line-clamp-2">
                              {slide.subtitle}
                            </p>
                            
                            <div className="pt-2 flex items-center gap-1.5 text-[10px] font-black text-amber-450 uppercase tracking-widest font-mono">
                              <span>{slide.buttonText || "Order Now"}</span>
                              <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Popular specialties filtering scroll */}
                <section className="container mx-auto px-4 md:px-8 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                       <span className="text-xs font-bold text-[#F26522] uppercase tracking-widest block">Signature Dishes</span>
                       <h2 className="font-playfair font-black text-3xl md:text-4xl text-[#1A0A00]">Fan-Favourite Slices</h2>
                    </div>
                    <button 
                      onClick={() => setActiveTab("menu")}
                      className="text-sm font-bold text-[#D72B2B] hover:underline self-start md:self-end"
                    >
                      See Catalog →
                    </button>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-none">
                    {["all", "classic", "premium", "veggie", "spicy"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setFeaturedFilter(filter)}
                        className={`capitalize py-2 px-5 rounded-full font-bold text-xs border transition-all ${
                          featuredFilter === filter 
                            ? "bg-[#D72B2B] text-white border-transparent shadow-lg shadow-[#D72B2B]/20" 
                            : "bg-white text-[#9A7B5E] border-gray-200 hover:bg-[#D72B2B]/5"
                        }`}
                      >
                        {filter === "all" ? "All Items" : filter}
                      </button>
                    ))}
                  </div>

                  {/* Grid Listing */}
                  {isLoadingMenu ? (
                    <div className="text-center py-12">
                      <p className="text-sm font-bold text-[#9A7B5E]">Warming up the clay oven...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {featuredMenuItems.map((item) => (
                        <div key={item._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between">
                          <div className="relative aspect-square bg-[#F5EDE3] overflow-hidden group">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {item.category === "pizza" && (
                              <span className="absolute top-3 left-3 bg-[#D72B2B] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                                Wood-Fired
                              </span>
                            )}
                          </div>
                          
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-[#F26522] uppercase tracking-wider">{item.category}</span>
                              <h4 className="font-playfair font-black text-lg text-[#1A0A00] leading-tight">{item.name}</h4>
                              <p className="text-[#9A7B5E] text-xs leading-relaxed line-clamp-2">{item.description}</p>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-gray-50 mt-1">
                              <span className="font-playfair font-black text-lg text-[#D72B2B]">OMR {item.price.toFixed(2)}</span>
                              <button
                                onClick={() => addToCart(item)}
                                className="px-3.5 py-2 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white rounded-full font-bold text-xs flex items-center gap-1 hover:scale-105 transition-all"
                              >
                                + Add
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Why Choices Section */}
                <section className="container mx-auto px-4 md:px-8 bg-gradient-to-br from-[#1A0A00] to-[#2E1200] text-white rounded-[40px] p-8 md:p-12 space-y-8">
                  <div className="text-center space-y-2 max-w-xl mx-auto">
                    <span className="text-xs font-bold text-[#F26522] tracking-widest uppercase mb-1">Our Commitment</span>
                    <h2 className="font-playfair font-black text-3xl md:text-4xl">Crafted With Pure Passion</h2>
                    <p className="text-gray-400 text-xs md:text-sm">We combine authentic traditional preparation techniques with maximum modern transaction speed.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                      <span className="text-3xl">🌿</span>
                      <h4 className="font-extrabold text-base">Fresh Daily Prep</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">Whole milk mozzarella, vine-ripened tomatoes, and handstretched sourdough bases prepared fresh every morning by expert chefs.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                      <span className="text-3xl">🔥</span>
                      <h4 className="font-extrabold text-base">Wood-Fired Crust</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">Our static stone-slab ovens reach high heat temperatures of 400°C, providing that perfect crispy leopard-spiced Italian crunch.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                      <span className="text-3xl">📱</span>
                      <h4 className="font-extrabold text-base">WhatsApp Trigger Integration</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">Place your items onto the database and check out to generate structured invoice text copy directed straight onto our staff lines.</p>
                    </div>
                  </div>
                </section>

                {/* Testimonial cards */}
                <section className="container mx-auto px-4 md:px-8 space-y-8">
                  <div className="text-center space-y-1">
                    <span className="text-xs font-bold text-[#F26522] uppercase tracking-widest">Feedback</span>
                    <h2 className="font-playfair font-black text-3xl text-[#1A0A00]">What Our Fans Say</h2>
                  </div>

                  <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none">
                    {[
                      { name: "Sara Al-Rashdi", city: "Nizwa, Oman", comment: "The sourdough crust is outstanding! Light, crunchy, and the Truffle Fungi is simply incredible. Best gourmet pizza chain in Nizwa without question." },
                      { name: "Khalid Al-Harthy", city: "Samail, Oman", comment: "We order BBQ chicken royale pizzas every Friday night. Fast preparing, hot deliveries, and the WhatsApp messaging invoices are so clean and simple." },
                      { name: "Fatima Al-Zahra", city: "Sur, Oman", comment: "I really love that they offer real vegan-friendly options like the Garden Primavera which has creamy pesto dollops and perfectly roasted artichokes." },
                    ].map((testi, i) => (
                      <div key={i} className="flex-shrink-0 w-80 bg-white border border-gray-100 shadow-xs p-6 rounded-3xl space-y-4">
                        <div className="flex gap-1 text-yellow-400">
                          {Array.from({ length: 5 }).map((_, idx) => <Star key={idx} size={14} fill="currentColor" />)}
                        </div>
                        <p className="text-xs text-[#3D1F00] leading-relaxed italic">"{testi.comment}"</p>
                        <div>
                          <p className="font-bold text-xs text-[#1A0A00]">{testi.name}</p>
                          <p className="text-[10px] text-[#9A7B5E] mt-0.5">📍 {testi.city}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Footer Banner */}
                <section className="container mx-auto px-4 md:px-8">
                  <div className="bg-gradient-to-r from-[#D72B2B] to-[#F26522] rounded-[36px] p-8 md:p-12 text-white text-center space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full scale-[2] -translate-y-12 translate-x-12" />
                    <h2 className="font-playfair font-black text-2xl md:text-4xl max-w-xl mx-auto leading-tight">Ready to Munch the Perfect Sourdough Pizza?</h2>
                    <p className="text-sm text-white/80 max-w-md mx-auto">Explore our live catalog, load your favorites, and place your order into the MongoDB ledger within 60 seconds.</p>
                    <button 
                      onClick={() => setActiveTab("menu")}
                      className="px-8 py-4 bg-white text-[#D72B2B] hover:bg-gray-100 font-extrabold rounded-full transition-all text-sm tracking-wide shadow-xl active:scale-[0.98]"
                    >
                      Browse Full Live Menu
                    </button>
                  </div>
                </section>

              </div>
            )}

            {/* =====================================
                🍕 MENU PAGE
                ===================================== */}
            {activeTab === "menu" && (
              <div className="container mx-auto px-4 md:px-8 pb-16 space-y-8 animate-fadeIn">
                
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
                              
                              {/* Slide-specific header */}
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

                                {/* Left & Right Slide Buttons click triggers */}
                                <div className="flex gap-1.5 shrink-0">
                                  <button
                                    onClick={() => scrollCategory(cat.id, "left")}
                                    className="w-8 h-8 rounded-full border border-gray-150 bg-white text-gray-500 hover:text-[#D72B2B] hover:border-[#D72B2B]/20 flex items-center justify-center cursor-pointer shadow-xs active:scale-90 transition-all select-none"
                                    title="Slide Left"
                                  >
                                    <ChevronLeft size={15} />
                                  </button>
                                  <button
                                    onClick={() => scrollCategory(cat.id, "right")}
                                    className="w-8 h-8 rounded-full border border-gray-150 bg-white text-gray-500 hover:text-[#D72B2B] hover:border-[#D72B2B]/20 flex items-center justify-center cursor-pointer shadow-xs active:scale-90 transition-all select-none"
                                    title="Slide Right"
                                  >
                                    <ChevronRight size={15} />
                                  </button>
                                </div>
                              </div>

                              {/* Horizontal sliding container */}
                              <div
                                ref={categoryRefs[cat.id]}
                                className="flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory font-sans"
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
                                      className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between snap-center self-stretch"
                                    >
                                      {/* Item thumbnail overlay */}
                                      <div className="relative aspect-square bg-gray-100 overflow-hidden group">
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          referrerPolicy="no-referrer"
                                        />
                                        {item.category === "pizza" && (
                                          <span className="absolute top-3 left-3 bg-[#D72B2B] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full select-none">
                                            Clay fired
                                          </span>
                                        )}
                                      </div>

                                      {/* Item body details */}
                                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-1">
                                          <span className="text-[10px] font-black text-[#F26522] uppercase tracking-wider">{item.category}</span>
                                          <h4 className="font-playfair font-black text-base text-[#1A0A00] leading-tight group-hover:text-[#D72B2B] transition-colors">{item.name}</h4>
                                          <p className="text-[#9A7B5E] text-xs leading-relaxed line-clamp-2">{item.description}</p>
                                        </div>

                                        {/* Action button trigger row */}
                                        <div className="flex items-center justify-between pt-1.5 border-t border-gray-50 mt-1">
                                          <span className="font-playfair font-black text-base text-[#D72B2B]">OMR {item.price.toFixed(2)}</span>
                                          <button
                                            onClick={() => addToCart(item)}
                                            className="px-4 py-2 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white rounded-full font-bold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                          >
                                            Add item
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
            )}

            {/* =====================================
                📍 LOCATIONS PAGE
                ===================================== */}
            {activeTab === "loc" && (
              <div className="container mx-auto px-4 md:px-8 pb-16 space-y-8">
                
                {/* Hero section */}
                <div className="text-center space-y-1.5 max-w-xl mx-auto py-6">
                  <span className="text-xs font-bold text-[#F26522] uppercase tracking-widest block">Available Outlets</span>
                  <h1 className="font-playfair font-black text-3xl md:text-4xl text-[#1A0A00]">Our Pizza City Network</h1>
                  <p className="text-xs text-[#9A7B5E] leading-relaxed">
                    Come dine-in, collect order pick-ups, or select hot delivery directly to your home coordinates.
                  </p>
                </div>

                {/* Location item grids cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {((branches && branches.length > 0) 
                    ? branches.filter(b => b.isActive !== false) 
                    : [
                        { _id: "nizwa", name: "Nizwa Outlet", phone: "+968 96928714", map: "https://maps.google.com/maps?q=Nizwa,Oman&t=&z=13&ie=UTF8&iwloc=&output=embed", address: "Near Nizwa Souq, Nizwa City Center, Nizwa, Oman", geo: "Nizwa", hours: "Daily 11 AM – 11 PM", delivery: true },
                        { _id: "samail", name: "Samail Outlet", phone: "+968 96928716", map: "https://maps.google.com/maps?q=Samail,Oman&t=&z=13&ie=UTF8&iwloc=&output=embed", address: "Main Shopping High Street Plaza, Samail, Oman", geo: "Samail", hours: "Daily 11 AM – 11 PM", delivery: true },
                        { _id: "sur", name: "Sur Outlet", phone: "+968 96928717", map: "https://maps.google.com/maps?q=Sur,Oman&t=&z=13&ie=UTF8&iwloc=&output=embed", address: "Al-Muraj Street Commercial Corridor, Sur, Oman", geo: "Sur", hours: "Daily 11 AM – 11 PM", delivery: true },
                        { _id: "quriyat", name: "Quriyat Outlet", phone: "+968 96928719", map: "https://maps.google.com/maps?q=Quriyat,Oman&t=&z=13&ie=UTF8&iwloc=&output=embed", address: "Coastal Expressway High Road, Quriyat, Oman", geo: "Quriyat", hours: "Daily 11 AM – 11 PM", delivery: true },
                        { _id: "fanja", name: "Fanja Outlet", phone: "+968 96749772", map: "https://maps.google.com/maps?q=Fanja,Oman&t=&z=13&ie=UTF8&iwloc=&output=embed", address: "Main Highway Intersection Plaza Road, Fanja, Oman", geo: "Fanja", hours: "Daily 11 AM – 11 PM", delivery: true },
                      ]
                  ).map((outlet) => {
                    const embedMapSrc = outlet.map && outlet.map.includes("output=embed")
                      ? outlet.map
                      : `https://maps.google.com/maps?q=${encodeURIComponent(outlet.name + ", " + outlet.address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
                    const gpsLink = outlet.map && !outlet.map.includes("output=embed")
                      ? outlet.map
                      : `https://maps.google.com/?q=${encodeURIComponent(outlet.geo || outlet.name || "Oman")}`;

                    return (
                      <div key={outlet._id || outlet.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
                        
                        {/* Map or Image Header */}
                        <div className="w-full h-44 bg-[#F5EDE3] relative">
                          <iframe 
                            src={embedMapSrc}
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen={false} 
                            loading="lazy"
                            className="opacity-90 hover:opacity-100 transition-opacity"
                          ></iframe>
                        </div>

                        {/* Content panel */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-xs text-green-700 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                              {outlet.hours || "Open Now · Daily 11 AM – 11 PM"}
                            </div>
                            
                            <h4 className="font-playfair font-black text-lg text-[#1A0A00] leading-tight">{outlet.name}</h4>
                            
                            <p className="text-xs text-[#9A7B5E] leading-relaxed">
                              📍 {outlet.address}
                            </p>
                          </div>

                          <div className="space-y-2 pt-3 border-t border-gray-100">
                            {/* Dial telephone helper */}
                            <div className="flex items-center justify-between text-xs text-[#3D1F00]">
                              <span className="font-semibold flex items-center gap-1">
                                <Phone size={13} className="text-[#F26522]" />
                                Dial Staff line:
                              </span>
                              <span className="font-mono font-bold">{outlet.phone}</span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400 font-bold">Delivery Status:</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                outlet.delivery !== false 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-amber-100 text-amber-700"
                              }`}>
                                {outlet.delivery !== false ? "🛵 Delivery Active" : "🛍️ Pickup Only"}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1.5">
                              <a 
                                href={`tel:${outlet.phone.replace(/\s+/g, "")}`}
                                className="py-2 bg-gray-50 hover:bg-gray-100 text-[#3D1F00] font-bold text-center text-xs rounded-xl border border-gray-100 active:scale-95 transition-all block"
                              >
                                📞 Call Branch
                              </a>
                              <a 
                                href={gpsLink}
                                target="_blank"
                                rel="noreferrer"
                                className="py-2 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white font-bold text-center text-xs rounded-xl active:scale-95 transition-all block"
                              >
                                📍 GPS Dir
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* =====================================
                📞 CONTACT PAGE
                ===================================== */}
            {activeTab === "contact" && (
              <div className="container mx-auto px-4 md:px-8 pb-16 space-y-8">
                
                <div className="text-center space-y-1.5 max-w-xl mx-auto py-6">
                  <span className="text-xs font-bold text-[#F26522] uppercase tracking-widest block">Get in Touch</span>
                  <h1 className="font-playfair font-black text-3xl md:text-4xl text-[#1A0A00]">We'd Love to Hear From You</h1>
                  <p className="text-xs text-[#9A7B5E] leading-relaxed">
                    Submit customer suggestions, menu feedbacks, bulk party bookings, or support questions.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column blocks */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
                      <h4 className="font-bold text-xs text-[#9A7B5E] uppercase tracking-wider">Corporate Email</h4>
                      <p className="font-bold text-sm text-[#1A0A00]">info@pizzacityoman.com</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
                      <h4 className="font-bold text-xs text-[#9A7B5E] uppercase tracking-wider">Dial Helpline</h4>
                      <p className="font-bold text-sm text-[#1A0A00]">+968 9692 8714</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
                      <h4 className="font-bold text-xs text-[#9A7B5E] uppercase tracking-wider">Instagram Feed</h4>
                      <p className="font-bold text-sm text-[#D72B2B]">@_pizza.city_</p>
                    </div>
                  </div>

                  {/* Right Column message form */}
                  <form onSubmit={handleContactSubmit} className="lg:col-span-8 bg-white p-6 md:p-8 rounded-[28px] border border-gray-100 shadow-xs space-y-4">
                    <h3 className="font-playfair font-black text-xl text-[#1A0A00] mb-2">Send Us a Direct Message</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#3D1F00] uppercase tracking-wider mb-1.5">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Salim Al-Maskari" 
                          className="w-full bg-[#FFF8F2] border border-[#D72B2B]/10 rounded-xl px-4 py-3 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#3D1F00] uppercase tracking-wider mb-1.5">Email (Optional)</label>
                        <input 
                          type="email" 
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="e.g. salim@example.com" 
                          className="w-full bg-[#FFF8F2] border border-[#D72B2B]/10 rounded-xl px-4 py-3 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3D1F00] uppercase tracking-wider mb-1.5">WhatsApp Number (Optional)</label>
                      <input 
                        type="tel" 
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="e.g. +968 9XXX XXXX" 
                        className="w-full bg-[#FFF8F2] border border-[#D72B2B]/10 rounded-xl px-4 py-3 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3D1F00] uppercase tracking-wider mb-1.5">Message / Customer Enquiry</label>
                      <textarea 
                        rows={4}
                        required
                        value={contactMsg}
                        onChange={(e) => setContactMsg(e.target.value)}
                        placeholder="Type what's on your mind..." 
                        className="w-full bg-[#FFF8F2] border border-[#D72B2B]/10 rounded-xl px-4 py-3 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="px-6 py-3.5 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white font-bold rounded-full w-full text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#D72B2B]/10 active:scale-95 transition-all"
                    >
                      <Send size={14} />
                      Transmit Message
                    </button>
                  </form>

                </div>

              </div>
            )}

            {/* =====================================
                🚀 ORDER TRACKER PAGE
                ===================================== */}
            {activeTab === "track" && (
              <div className="container mx-auto px-4 md:px-8 pb-16">
                <OrderTracker 
                  initialOrderId={trackOrderId} 
                  onShowToast={displayToast}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}

            {/* =====================================
                ❓ FAQS PAGE
                ===================================== */}
            {activeTab === "faq" && (
              <div className="container mx-auto px-4 md:px-8 pb-16 space-y-8">
                
                <div className="text-center space-y-1.5 max-w-xl mx-auto py-6">
                  <span className="text-xs font-bold text-[#F26522] uppercase tracking-widest block font-sans">Support</span>
                  <h1 className="font-playfair font-black text-3xl md:text-4xl text-[#1A0A00]">Answers to Common Queries</h1>
                  <p className="text-xs text-[#9A7B5E] leading-relaxed">
                    Search questions or look at the accordion blocks below to resolve your inquiries instantly.
                  </p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  {/* FAQs Text Search Bar */}
                  <div className="flex items-center gap-2.5 bg-white border border-[#D72B2B]/10 rounded-full px-4 py-3 shadow-xs">
                    <Search size={16} className="text-[#9A7B5E]" />
                    <input 
                      type="text" 
                      placeholder="Search questions or keywords..."
                      value={faqSearchQuery}
                      onChange={(e) => setFaqSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-xs text-[#3D1F00] focus:outline-none"
                    />
                  </div>

                  {/* Accordion list */}
                  <div className="space-y-3 pt-2">
                    {filteredFaqs.length > 0 ? (
                      filteredFaqs.map((faq, idx) => {
                        const isOpen = openFaqIndex === idx;
                        return (
                          <div 
                            key={idx}
                            className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-xs transition-shadow"
                          >
                            <button
                              onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                              className="w-full flex items-center justify-between text-left p-5 font-bold text-xs md:text-sm text-[#1A0A00] hover:text-[#D72B2B] transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <HelpCircle size={14} className="text-[#F26522]" />
                                {faq.q}
                              </span>
                              <ChevronDown size={14} className={`text-[#9A7B5E] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                            </button>
                            
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-gray-50 bg-[#F26522]/2"
                                >
                                  <p className="p-5 text-xs text-[#9A7B5E] leading-relaxed">
                                    {faq.a}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-xs text-[#9A7B5E] py-8">No matching FAQs resolved.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* =====================================
                🛡️ ADMIN DASHBOARD PAGE
                ===================================== */}
            {activeTab === "admin" && (
              <AdminDashboard onShowToast={displayToast} onMenuUpdated={refreshMenu} />
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* =====================================
          OUTLET SELECTOR OVERLAY MODAL
          ===================================== */}
      <OutletSelector
        isOpen={isOutletSelectorOpen}
        onClose={() => setIsOutletSelectorOpen(false)}
        cart={cart}
        onClearCart={() => setCart([])}
        onShowToast={displayToast}
        onUpdateCartItem={handleUpdateCartItem}
        onOrderSuccess={(orderId) => {
          setTrackOrderId(orderId);
          setActiveTab("track");
        }}
        branches={branches}
      />

      {/* =====================================
          🍕 CONFIGURE OPTIMIZED PIZZA CUSTOMIZER MODAL
          ===================================== */}
      <AnimatePresence>
        {selectedConfigureItem && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedConfigureItem(null)}
              className="fixed inset-0 z-[50] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
            />

            {/* Modal Card wrapper */}
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.35 }}
                className="w-full max-w-md bg-[#FFF8F2] rounded-[32px] border border-[#D72B2B]/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto"
              >
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
                  <div>
                    <h3 className="font-playfair font-black text-xl text-[#1A0A00] flex items-center gap-1.5">
                      <span>{selectedConfigureItem.category === "pizza" ? "🍕 Customize & Optimize Pizza" : "✨ Customize & Optimize Item"}</span>
                    </h3>
                    <p className="text-[11px] text-[#9A7B5E] mt-0.5">
                      {selectedConfigureItem.category === "pizza" 
                        ? "Select size and units to optimize item prices automatically" 
                        : "Select units to optimize item prices automatically"}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedConfigureItem(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#3D1F00] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Scrollable Configuration Body */}
                <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm text-[#3D1F00]">
                  {/* Product Spotlight Card */}
                  <div className="flex gap-4 bg-white p-3.5 rounded-2xl border border-gray-100 items-start">
                    {selectedConfigureItem.image && (
                      <img 
                        src={selectedConfigureItem.image} 
                        alt={selectedConfigureItem.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                      />
                    )}
                    <div className="flex-1 space-y-1">
                      <h4 className="font-black text-[#1A0A00] text-base leading-tight">{selectedConfigureItem.name}</h4>
                      <p className="text-xs text-[#9A7B5E] leading-relaxed line-clamp-2">{selectedConfigureItem.description}</p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full uppercase">
                          {selectedConfigureItem.category}
                        </span>
                        {selectedConfigureItem.discountPrice && selectedConfigureItem.discountPrice < selectedConfigureItem.price ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-400 line-through">OMR {selectedConfigureItem.price.toFixed(3)}</span>
                            <span className="text-xs font-black text-[#D72B2B]">Base: OMR {selectedConfigureItem.discountPrice.toFixed(3)}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-black text-[#D72B2B]">Base: OMR {selectedConfigureItem.price.toFixed(3)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Size chart selection (Only for Pizza category) */}
                  {selectedConfigureItem.category === "pizza" && (
                    <div className="space-y-3">
                      <label className="block text-xs font-black uppercase text-[#1A0A00] tracking-wider">
                        Select Dimension (Size):
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {(["Small", "Medium", "Large"] as const).map((size) => {
                          const basePrice = (selectedConfigureItem.discountPrice && selectedConfigureItem.discountPrice < selectedConfigureItem.price)
                            ? selectedConfigureItem.discountPrice
                            : selectedConfigureItem.price;
                          const adjusted = getSizeAdjustedPrice(basePrice, size, selectedConfigureItem.category);
                          const isSelected = selectedSize === size;
                          
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => setSelectedSize(size)}
                              className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between transition-all cursor-pointer ${
                                isSelected 
                                  ? "bg-gradient-to-b from-[#FFF8F2] to-[#FFF1E5] border-[#D72B2B] shadow-inner scale-[1.02]"
                                  : "bg-white border-gray-200 hover:bg-[#D72B2B]/5 hover:border-[#D72B2B]/20"
                              }`}
                            >
                              <span className={`font-black text-xs ${isSelected ? "text-[#D72B2B]" : "text-gray-700"}`}>
                                {size}
                              </span>
                              <span className="text-[9px] text-[#9A7B5E] mt-0.5">
                                {size === "Small" ? "8\" (4 Slices)" : size === "Medium" ? "11\" (6 Slices)" : "14\" (8 Slices)"}
                              </span>
                              <span className="text-[11px] font-black font-mono text-[#1A0A00] mt-1.5 bg-gray-50 px-2 py-0.5 rounded">
                                OMR {adjusted.toFixed(2)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Size Chart info block (Only for Pizza category) */}
                  {selectedConfigureItem.category === "pizza" && (
                    <div className="bg-white p-3.5 rounded-2xl border border-gray-100 flex gap-3 items-center">
                      <span className="text-xl">📐</span>
                      <div className="text-xs leading-relaxed space-y-0.5 text-[#3D1F00]">
                        <p className="font-extrabold text-[#1A0A00]">Official Pizza City Size Chart:</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#9A7B5E]">
                          <li><strong>Small (8")</strong> — Ideal personal size for single-portion meals.</li>
                          <li><strong>Medium (11")</strong> — Generous share size. Perfect for 1 to 2 people.</li>
                          <li><strong>Large (14")</strong> — Extra-large family tray. Feeds 3 to 4 easily.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector / Unit Number */}
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100">
                    <div className="space-y-0.5">
                      <label className="block text-xs font-black uppercase text-[#1A0A00] tracking-wider">
                        Unit Number (Quantity):
                      </label>
                      <p className="text-[10px] text-[#9A7B5E]">Increase quantity to trigger bulk price optimization!</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold flex items-center justify-center border border-gray-200 transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-playfair font-black text-lg text-[#1A0A00]">
                        {selectedQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedQuantity(Math.min(20, selectedQuantity + 1))}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold flex items-center justify-center border border-gray-200 transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price Optimization & Savings Dashboard */}
                  {(() => {
                    const breakdown = getPriceBreakdown(selectedConfigureItem, selectedSize, selectedQuantity);
                    const isOptimized = breakdown.quantityDiscountPercent > 0;
                    return (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50/50 border border-green-200/60 rounded-2xl p-4 space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-600">
                            {selectedConfigureItem.category === "pizza" ? "Base Unit Adjusted Rate:" : "Base Unit Rate:"}
                          </span>
                          <span className="font-mono text-gray-600">OMR {breakdown.sizeAdjustedPrice.toFixed(2)}</span>
                        </div>
                        {isOptimized && (
                          <div className="flex justify-between items-center text-xs text-green-700 font-extrabold">
                            <span className="flex items-center gap-1">
                              <span>🎉 Bulk volume discount rate:</span>
                              <span className="bg-green-100 px-2 py-0.5 rounded text-[10px]">Saved {breakdown.quantityDiscountPercent}%</span>
                            </span>
                            <span className="font-mono text-right">
                              - OMR {(breakdown.savingsPerUnit * selectedQuantity).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-dashed border-green-200 pt-2 flex justify-between items-center">
                          <div>
                            <span className="font-black text-xs text-green-900 block">Fully Optimized Rate:</span>
                            {isOptimized && (
                              <span className="text-[10px] text-green-600 block">OMR {breakdown.finalOptimizedUnitPrice.toFixed(3)} per unit</span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-playfair font-black text-lg text-green-800 font-mono block">
                              OMR {breakdown.totalPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Action controls */}
                <div className="p-5 border-t border-gray-150 flex gap-3 bg-white">
                  <button
                    type="button"
                    onClick={() => setSelectedConfigureItem(null)}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 font-extrabold rounded-full text-center hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmAddToCart}
                    className="flex-1 py-3 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white font-extrabold rounded-full text-center shadow-lg shadow-[#D72B2B]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Confirm + Add To Cart
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* =====================================
          TOAST ALERT BANNER
          ===================================== */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A0A00] text-white py-3.5 px-6 rounded-full font-bold text-xs flex items-center gap-2 border border-white/10 shadow-2xl tracking-wide max-w-sm text-center"
          >
            <span className="w-2 h-2 rounded-full bg-[#F26522] animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================
          MANDATORY FOOTER STRIP
          ===================================== */}
      <footer className="bg-[#1A0A00] text-gray-400 py-12 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
          
          <div className="md:col-span-4 space-y-4">
            <img 
              src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/dfZWWj1nq2KWjIwX/ei_1771693328794-removebg-preview-H1gq480p6x8lYS4E.png" 
              alt="Pizza City" 
              className="h-8 object-contain"
            />
            <p className="leading-relaxed text-[#9A7B5E]">
              Authentic Italian wood-fired pizza chains with hand-stretched sourdough bases and rapid 30-minute delivery. Crafted with passion in Oman.
            </p>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="font-extrabold text-[#FFF8F2] tracking-wider uppercase text-sm">Quick Directory</h4>
            <div className="grid grid-cols-2 gap-2 text-[#9A7B5E]">
              <button onClick={() => setActiveTab("home")} className="text-left hover:text-[#FFF8F2] transition-colors">🏠 Home</button>
              <button onClick={() => setActiveTab("menu")} className="text-left hover:text-[#FFF8F2] transition-colors">🍕 Menu Card</button>
              <button onClick={() => setActiveTab("loc")} className="text-left hover:text-[#FFF8F2] transition-colors">📍 Outlets</button>
              <button onClick={() => setActiveTab("contact")} className="text-left hover:text-[#FFF8F2] transition-colors">📞 Contact Chain</button>
              <button onClick={() => setActiveTab("faq")} className="text-left hover:text-[#FFF8F2] transition-colors">❓ FAQs</button>
              <button onClick={() => setActiveTab("admin")} className="text-left hover:text-[#FFF8F2] transition-colors">🛡️ Admin Console</button>
            </div>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="font-extrabold text-[#FFF8F2] tracking-wider uppercase text-sm">Our Branches</h4>
            <p className="leading-relaxed text-[#9A7B5E]">
              📍 Nizwa · Samail · Sur · Quriyat · Fanja <br />
              ⏰ Daily 11:00 AM – 11:00 PM (Oman Standard Time)
            </p>
          </div>

        </div>

        <div className="container mx-auto px-4 md:px-8 pt-8 mt-8 border-t border-white/5 text-center text-[10px] text-[#9A7B5E]">
          © 2026 Pizza City Oman. All rights reserved. Database connected full-stack administrative ordering systems.
        </div>
      </footer>

    </div>
  );
}
