import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Plus,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  CheckCircle,
  Truck,
  Play,
  X as CloseIcon,
  Phone,
  FileText,
  DollarSign,
  User,
  ShoppingBag,
  Sliders,
  ChevronRight,
  Menu as MenuIcon,
  Sparkles,
  Search,
  Check,
  AlertCircle,
  Tag,
  Database,
} from "lucide-react";
import { Order, MenuItem, OUTLETS, OutletName, Branch } from "../types";

interface AdminDashboardProps {
  onShowToast: (msg: string) => void;
  onMenuUpdated?: () => void;
}

interface ImageUploaderProps {
  id: string;
  imageUrl: string;
  onChange: (url: string) => void;
  onShowToast: (msg: string) => void;
  token: string;
  label?: string;
  className?: string;
}

function ImageUploader({
  id,
  imageUrl,
  onChange,
  onShowToast,
  token,
  label = "Upload Image",
  className = "",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      onShowToast("❌ Invalid file format! Only JPG, JPEG, PNG, and WebP are allowed.");
      return;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      onShowToast("❌ File size exceeds 20MB limit.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/admin/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Server upload failed");
      }

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
        onShowToast("✨ Image uploaded successfully!");
      } else {
        throw new Error("Invalid response payload from server upload endpoint");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      onShowToast(`❌ Upload failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-[10px] uppercase font-black tracking-wider text-[#9A7B5E]">{label}</label>
      
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[140px] bg-[#FFF8F2] hover:bg-orange-50/40 ${
          isDragging ? "border-[#F26522] bg-orange-50" : "border-[#D72B2B]/20"
        }`}
        id={`${id}-upload-zone`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
          id={id}
        />

        {isUploading ? (
          <div className="text-center space-y-2 py-4">
            <div className="w-8 h-8 rounded-full border-2 border-t-[#D72B2B] border-gray-200 animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#D72B2B] animate-pulse">Uploading, please wait...</p>
          </div>
        ) : imageUrl ? (
          <div className="w-full space-y-3">
            {/* Image Preview */}
            <div className="relative w-full h-32 rounded-xl overflow-hidden shadow-xs border border-gray-150/50 bg-neutral-900 group">
              <img
                src={imageUrl}
                alt="Selected preview"
                className="w-full h-full object-cover opacity-90 group-hover:scale-103 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="bg-white/90 text-[10px] font-extrabold text-neutral-800 px-3 py-1.5 rounded-full shadow-xs">
                  ♻️ Click or drag to replace
                </span>
              </div>
            </div>

            {/* Read-Only URL display */}
            <div className="flex gap-2 items-center bg-white border border-gray-150 rounded-lg px-2.5 py-1.5 text-[10px]">
              <span className="font-bold text-[#9A7B5E] select-none shrink-0">URL:</span>
              <span className="font-mono text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap flex-1 text-left">{imageUrl}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="text-red-500 hover:text-red-700 p-0.5 font-bold"
                title="Remove image"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2 py-4 select-none">
            <div className="w-10 h-10 rounded-full bg-[#D72B2B]/5 text-[#D72B2B] flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#1A0A00]">
                Drag and drop image here, or{" "}
                <span className="text-[#D72B2B] hover:underline">browse</span>
              </p>
              <p className="text-[10px] text-[#9A7B5E] font-medium">Supports JPG, JPEG, PNG, WebP up to 20MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard({ onShowToast, onMenuUpdated }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState<{ userId?: string; username: string; role: string; outletAccess: string[] } | null>(null);

  const isSuperAdmin = currentUser?.role === "superadmin";

  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "menu" | "banners" | "promos" | "branches" | "users">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbType, setDbType] = useState<string>("checking...");

  const [selectedOutlet, setSelectedOutlet] = useState<string>("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("");
  const [orderDateFilter, setOrderDateFilter] = useState<"daily" | "weekly" | "monthly" | "all">("daily");
  const [menuFilter, setMenuFilter] = useState<string>("all");
  const [menuSearch, setMenuSearch] = useState<string>("all");

  // Promos management state
  const [promos, setPromos] = useState<any[]>([]);
  const [isLoadingPromos, setIsLoadingPromos] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any | null>(null);

  // Promo modal fields
  const [promoCodeState, setPromoCodeState] = useState("");
  const [promoDiscountType, setPromoDiscountType] = useState<"percentage" | "flat">("percentage");
  const [promoDiscountValue, setPromoDiscountValue] = useState("");
  const [promoMinOrder, setPromoMinOrder] = useState("");
  const [promoActive, setPromoActive] = useState(true);

  // Modals discount states for recipes
  const [fieldDiscountPrice, setFieldDiscountPrice] = useState("");
  const [fieldDiscountPercentage, setFieldDiscountPercentage] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [summaryData, setSummaryData] = useState<Record<string, { totalOrders: number; totalRevenue: number; pending: number }>>({});

  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Dynamic Banners Manager state hooks
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);

  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerBadge, setBannerBadge] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [bannerButtonText, setBannerButtonText] = useState("Order Now");
  const [bannerButtonLink, setBannerButtonLink] = useState("#menu");
  const [bannerIsActive, setBannerIsActive] = useState(true);
  const [bannerStylePattern, setBannerStylePattern] = useState<"attached" | "classic" | "modern">("attached");
  const [bannerType, setBannerType] = useState<"hero" | "offer" | "all">("all");

  // Dynamic Branches Manager state hooks
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [branchName, setBranchName] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchWhatsapp, setBranchWhatsapp] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchMap, setBranchMap] = useState("");
  const [branchGeo, setBranchGeo] = useState("");
  const [branchHours, setBranchHours] = useState("Daily 11 AM – 11 PM");
  const [branchDelivery, setBranchDelivery] = useState(true);
  const [branchActive, setBranchActive] = useState(true);
  const [branchImage, setBranchImage] = useState("");

  // Modal State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);

  // Modal Field States
  const [fieldName, setFieldName] = useState("");
  const [fieldPrice, setFieldPrice] = useState("");
  const [fieldCategory, setFieldCategory] = useState("pizza");
  const [fieldSubcat, setFieldSubcat] = useState("");
  const [fieldDesc, setFieldDesc] = useState("");
  const [fieldBadge, setFieldBadge] = useState("");
  const [fieldImage, setFieldImage] = useState("");
  const [fieldAvailable, setFieldAvailable] = useState(true);
  const [fieldFeatured, setFieldFeatured] = useState(false);

  // User Management state
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userFormUsername, setUserFormUsername] = useState("");
  const [userFormPassword, setUserFormPassword] = useState("");
  const [userFormRole, setUserFormRole] = useState("moderator");
  const [userFormOutletAccess, setUserFormOutletAccess] = useState<string[]>([]);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("pc_token");
    const savedUser = localStorage.getItem("pc_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const loadSummaryData = async () => {
    setIsLoadingSummary(true);
    let branchKeys: string[];
    if (!isSuperAdmin && currentUser?.outletAccess?.length) {
      branchKeys = currentUser.outletAccess;
    } else if (branches && branches.length > 0) {
      branchKeys = branches.filter(b => b.isActive !== false).map(b => b.name);
    } else {
      branchKeys = ["Nizwa", "Samail", "Sur", "Quriyat", "Fanja"];
    }
    const results: Record<string, { totalOrders: number; totalRevenue: number; pending: number }> = {};

    try {
      await Promise.all(
        branchKeys.map(async (branch) => {
          const res = await fetch(`/api/orders/${branch}/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const pendingCount = data.breakdown?.find((b: any) => b._id === "pending")?.count || 0;
            results[branch] = {
              totalOrders: data.totals?.totalOrders || 0,
              totalRevenue: data.totals?.totalRevenue || 0,
              pending: pendingCount,
            };
          } else {
            results[branch] = { totalOrders: 0, totalRevenue: 0, pending: 0 };
          }
        })
      );
      setSummaryData(results);
    } catch (err) {
      console.warn("Error fetching summary data:", err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const loadOrders = async (outlet: string, status: string) => {
    setIsLoadingOrders(true);
    
    const branchKeys = (branches && branches.length > 0)
      ? branches.filter(b => b.isActive !== false).map(b => b.name)
      : ["Nizwa", "Samail", "Sur", "Quriyat", "Fanja"];
    try {
      if (outlet === "all") {
        const results = await Promise.all(
          branchKeys.map(async (branch) => {
            const res = await fetch(`/api/orders/${branch}${status ? `?status=${status}` : ""}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const data = await res.json();
              return data.map((item: any) => ({ ...item, outlet: branch }));
            }
            return [];
          })
        );
        const combined = results.flat().sort((a: any, b: any) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setOrders(combined);
      } else {
        const res = await fetch(`/api/orders/${outlet}${status ? `?status=${status}` : ""}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      }
    } catch (err) {
      console.warn("Error loading orders:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const loadMenu = async () => {
    setIsLoadingMenu(true);
    try {
      const res = await fetch("/api/menu");
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
        if (onMenuUpdated) {
          onMenuUpdated();
        }
        // Broadcast across tabs (works in iframe other tabs or standard browser tabs)
        try {
          const bc = new BroadcastChannel("pizza_city_menu_channel");
          bc.postMessage({ type: "MENU_UPDATED", menu: data });
          bc.close();
        } catch (e) {
          // Fallback if BroadcastChannel is blocked/unsupported in sandboxed frames
        }
        try {
          window.dispatchEvent(new CustomEvent("pizza_city_menu_updated", { detail: data }));
        } catch (e) {}
      }
    } catch (err) {
      console.warn("Error loading menu:", err);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial load
    loadSummaryData();
    loadOrders(selectedOutlet, orderStatusFilter);

    // 🕒 7-second auto-polling for robust multi-device/multi-session sync
    const intervalId = setInterval(() => {
      loadSummaryData();
      loadOrders(selectedOutlet, orderStatusFilter);
    }, 7000);

    // ⚡ Cross-tab / same-origin Live Broadcast and CustomEvent listeners for instant sync
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("pizza_city_menu_channel");
      bc.onmessage = (event) => {
        if (event.data && event.data.type === "NEW_ORDER_PLACED") {
          loadSummaryData();
          loadOrders(selectedOutlet, orderStatusFilter);
          onShowToast("🔔 Live Order sync: A new order was just placed!");
        }
      };
    } catch (e) {
      console.warn("BroadcastChannel sandbox block in AdminDashboard:", e);
    }

    const handleCustomOrderEvent = () => {
      loadSummaryData();
      loadOrders(selectedOutlet, orderStatusFilter);
      onShowToast("🔔 Live Order sync: A new order was just placed!");
    };

    window.addEventListener("pizza_city_new_order_placed", handleCustomOrderEvent);

    return () => {
      clearInterval(intervalId);
      if (bc) bc.close();
      window.removeEventListener("pizza_city_new_order_placed", handleCustomOrderEvent);
    };
  }, [isAuthenticated, selectedOutlet, orderStatusFilter, branches]);

  const loadBanners = async () => {
    setIsLoadingBanners(true);
    try {
      const res = await fetch("/api/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (err) {
      onShowToast("❌ Failed to load banners Database reference.");
    } finally {
      setIsLoadingBanners(false);
    }
  };

  const loadPromos = async () => {
    setIsLoadingPromos(true);
    
    try {
      const res = await fetch("/admin/api/promos", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPromos(data);
      } else {
        console.warn("Could not retrieve promo codes from db (non-ok status), using offline simulator memory.");
      }
    } catch (err) {
      console.warn("Could not retrieve promo codes from db, using offline simulator memory.", err);
    } finally {
      setIsLoadingPromos(false);
    }
  };

  const openPromoModal = (promo: any | null) => {
    setEditingPromo(promo);
    if (promo) {
      setPromoCodeState(promo.code);
      setPromoDiscountType(promo.discountType || "percentage");
      setPromoDiscountValue(promo.discountValue.toString());
      setPromoMinOrder(promo.minOrderAmount ? promo.minOrderAmount.toString() : "");
      setPromoActive(promo.isActive !== false);
    } else {
      setPromoCodeState("");
      setPromoDiscountType("percentage");
      setPromoDiscountValue("");
      setPromoMinOrder("");
      setPromoActive(true);
    }
    setIsPromoModalOpen(true);
  };

  const handleSavePromo = async () => {
    if (!promoCodeState.trim() || !promoDiscountValue.trim()) {
      onShowToast("⚠️ Code and discount value are required parameters.");
      return;
    }

    
    const payload = {
      code: promoCodeState.trim().toUpperCase(),
      discountType: promoDiscountType,
      discountValue: parseFloat(promoDiscountValue),
      minOrderAmount: promoMinOrder ? parseFloat(promoMinOrder) : 0,
      isActive: promoActive,
    };

    try {
      if (editingPromo) {
        const res = await fetch(`/admin/api/promos/${editingPromo._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          onShowToast(`✅ Coupon code "${payload.code}" updated successfully!`);
          setIsPromoModalOpen(false);
          loadPromos();
        } else {
          const errData = await res.json();
          onShowToast(`❌ Update failed: ${errData.error || "Unknown server response."}`);
        }
      } else {
        const res = await fetch(`/admin/api/promos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          onShowToast(`✅ Coupon code "${payload.code}" registered live!`);
          setIsPromoModalOpen(false);
          loadPromos();
        } else {
          const errData = await res.json();
          onShowToast(`❌ Creation failed: ${errData.error || "Code may already exist."}`);
        }
      }
    } catch (err) {
      onShowToast("❌ Database connection error for save operation.");
    }
  };

  const handleTogglePromoActive = async (id: string, currentActive: boolean) => {
    
    try {
      const res = await fetch(`/admin/api/promos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        onShowToast("⚡ Toggle applied to coupon code.");
        loadPromos();
      } else {
        onShowToast("❌ Toggle failed on current node.");
      }
    } catch (err) {
      onShowToast("❌ Connection handshaking failure.");
    }
  };

  const handleDeletePromo = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to permanently disable and delete promo "${code}"?`)) {
      return;
    }
    
    try {
      const res = await fetch(`/admin/api/promos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onShowToast(`🗑️ Coupon code "${code}" purged from index.`);
        loadPromos();
      } else {
        onShowToast("❌ Deletion rejected by server.");
      }
    } catch (err) {
      onShowToast("❌ Connection error on deleting index.");
    }
  };

  const loadBranches = async () => {
    setIsLoadingBranches(true);
    
    try {
      const res = await fetch("/admin/api/branches", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBranches(data);
        
        // Broadcast and dispatch for real-time synchronization
        try {
          const bc = new BroadcastChannel("pizza_city_menu_channel");
          bc.postMessage({ type: "BRANCHES_UPDATED", branches: data });
          bc.close();
        } catch (e) {
          // sandbox safe fallback
        }
        window.dispatchEvent(new CustomEvent("pizza_city_branches_updated", { detail: data }));
      } else {
        console.warn("Could not retrieve branches from db.");
      }
    } catch (err) {
      console.warn("Could not retrieve branches from db.", err);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const openBranchModal = (branch: Branch | null) => {
    setEditingBranch(branch);
    if (branch) {
      setBranchName(branch.name);
      setBranchPhone(branch.phone);
      setBranchWhatsapp(branch.whatsapp);
      setBranchAddress(branch.address);
      setBranchMap(branch.map || "");
      setBranchGeo(branch.geo || "");
      setBranchHours(branch.hours || "Daily 11 AM – 11 PM");
      setBranchDelivery(branch.delivery !== false);
      setBranchActive(branch.isActive !== false);
      setBranchImage(branch.image || "");
    } else {
      setBranchName("");
      setBranchPhone("");
      setBranchWhatsapp("");
      setBranchAddress("");
      setBranchMap("");
      setBranchGeo("");
      setBranchHours("Daily 11 AM – 11 PM");
      setBranchDelivery(true);
      setBranchActive(true);
      setBranchImage("");
    }
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = async () => {
    if (!branchName.trim() || !branchPhone.trim() || !branchWhatsapp.trim() || !branchAddress.trim()) {
      onShowToast("⚠️ Branch Name, Phone, WhatsApp, and Address are required parameters.");
      return;
    }

    
    const payload = {
      name: branchName.trim(),
      phone: branchPhone.trim(),
      whatsapp: branchWhatsapp.trim(),
      address: branchAddress.trim(),
      map: branchMap.trim(),
      geo: branchGeo.trim(),
      hours: branchHours.trim(),
      delivery: branchDelivery,
      isActive: branchActive,
      image: branchImage.trim(),
    };

    try {
      if (editingBranch) {
        const id = editingBranch._id || editingBranch.id;
        const res = await fetch(`/admin/api/branches/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          onShowToast(`✨ Branch "${branchName}" updated successfully.`);
          setIsBranchModalOpen(false);
          loadBranches();
          loadSummaryData();
        } else {
          onShowToast("❌ Server rejected branch update.");
        }
      } else {
        const res = await fetch("/admin/api/branches", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          onShowToast(`🎉 Branch "${branchName}" created successfully.`);
          setIsBranchModalOpen(false);
          loadBranches();
          loadSummaryData();
        } else {
          onShowToast("❌ Server rejected branch creation.");
        }
      }
    } catch (err) {
      onShowToast("❌ Connection error while saving branch.");
    }
  };

  const handleDeleteBranch = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the branch "${name}"?`)) {
      return;
    }
    
    try {
      const res = await fetch(`/admin/api/branches/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onShowToast(`🗑️ Branch "${name}" deleted successfully.`);
        loadBranches();
      } else {
        onShowToast("❌ Server rejected branch deletion.");
      }
    } catch (err) {
      onShowToast("❌ Connection error while deleting branch.");
    }
  };

  const handleToggleBranchActive = async (id: string, currentActive: boolean) => {
    
    try {
      const res = await fetch(`/admin/api/branches/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onShowToast("⚡ Branch active status toggled.");
        loadBranches();
      } else {
        onShowToast("❌ Server rejected toggling active status.");
      }
    } catch (err) {
      onShowToast("❌ Connection handshaking failure.");
    }
  };

  const openBannerModal = (banner: any | null) => {
    setEditingBanner(banner);
    if (banner) {
      setBannerTitle(banner.title);
      setBannerSubtitle(banner.subtitle || "");
      setBannerBadge(banner.badge || "");
      setBannerImage(banner.image || "");
      setBannerButtonText(banner.buttonText || "Order Now");
      setBannerButtonLink(banner.buttonLink || "#menu");
      setBannerIsActive(banner.isActive ?? true);
      setBannerStylePattern(banner.stylePattern || "attached");
      setBannerType(banner.type || "all");
    } else {
      setBannerTitle("");
      setBannerSubtitle("");
      setBannerBadge("");
      setBannerImage("");
      setBannerButtonText("Order Now");
      setBannerButtonLink("#menu");
      setBannerIsActive(true);
      setBannerStylePattern("attached");
      setBannerType("all");
    }
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async () => {
    if (!bannerTitle.trim()) {
      onShowToast("⚠️ Banner template Heading/Title is a required parameter.");
      return;
    }

    
    const payload = {
      title: bannerTitle.trim(),
      subtitle: bannerSubtitle.trim(),
      badge: bannerBadge.trim(),
      image: bannerImage.trim() || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
      buttonText: bannerButtonText.trim(),
      buttonLink: bannerButtonLink.trim(),
      isActive: bannerIsActive,
      stylePattern: bannerStylePattern,
      type: bannerType,
    };

    try {
      let res;
      if (editingBanner) {
        res = await fetch(`/admin/api/banners/${editingBanner._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/admin/api/banners`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        onShowToast(editingBanner ? "✅ Banner details updated successfully!" : "✅ Banner added to slideshow!");
        setIsBannerModalOpen(false);
        loadBanners();
        
        // ⚡ Live sync across windows / frames
        try {
          const activeRes = await fetch("/api/banners");
          if (activeRes.ok) {
            const activeData = await activeRes.json();
            const bc = new BroadcastChannel("pizza_city_menu_channel");
            bc.postMessage({ type: "BANNERS_UPDATED", banners: activeData });
            bc.close();
            window.dispatchEvent(new CustomEvent("pizza_city_banners_updated", { detail: activeData }));
          }
        } catch (syncErr) {
          console.warn("Cross-frame dynamic synchronisation blocked.", syncErr);
        }
      } else {
        onShowToast("❌ Server failure saving banner.");
      }
    } catch (err) {
      onShowToast("❌ Connection error saving banner record.");
    }
  };

  const handleToggleBannerActive = async (id: string) => {
    
    try {
      const res = await fetch(`/admin/api/banners/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onShowToast("✅ Banner status changed successfully.");
        loadBanners();
        
        try {
          const activeRes = await fetch("/api/banners");
          if (activeRes.ok) {
            const activeData = await activeRes.json();
            const bc = new BroadcastChannel("pizza_city_menu_channel");
            bc.postMessage({ type: "BANNERS_UPDATED", banners: activeData });
            bc.close();
            window.dispatchEvent(new CustomEvent("pizza_city_banners_updated", { detail: activeData }));
          }
        } catch (syncErr) {}
      } else {
        onShowToast("❌ Could not toggle banner switch.");
      }
    } catch (err) {
      onShowToast("❌ Connection failure.");
    }
  };

  const handleDeleteBanner = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete banner "${title}" from the homepage slideshow?`)) {
      return;
    }
    
    try {
      const res = await fetch(`/admin/api/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onShowToast("🗑️ Banner removed from MongoDB entry.");
        loadBanners();
        
        try {
          const activeRes = await fetch("/api/banners");
          if (activeRes.ok) {
            const activeData = await activeRes.json();
            const bc = new BroadcastChannel("pizza_city_menu_channel");
            bc.postMessage({ type: "BANNERS_UPDATED", banners: activeData });
            bc.close();
            window.dispatchEvent(new CustomEvent("pizza_city_banners_updated", { detail: activeData }));
          }
        } catch (syncErr) {}
      } else {
        onShowToast("❌ Failed to delete banner record.");
      }
    } catch (err) {
      onShowToast("❌ Connection failure during deletion.");
    }
  };

  const fetchHealthStatus = async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setDbType(data.database || "In-Memory/Local Fallback Mock Mode");
      } else {
        setDbType("In-Memory/Local Fallback Mock Mode");
      }
    } catch (err) {
      setDbType("In-Memory/Local Fallback Mock Mode");
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadMenu();
      loadBanners();
      loadPromos();
      loadBranches();
      fetchHealthStatus();
    }
  }, [isAuthenticated]);

  // Load users when switching to users tab
  useEffect(() => {
    if (isAuthenticated && activeTab === "users") {
      loadUsers();
    }
  }, [isAuthenticated, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      onShowToast("⚠️ Please enter username and password credentials.");
      return;
    }

    try {
      const res = await fetch(`/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      if (res.status === 401) {
        onShowToast("❌ Invalid username or password.");
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        onShowToast(`❌ Login failed: ${errData.error || "Unknown error"}`);
        return;
      }

      const data = await res.json();
      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem("pc_token", data.token);
      localStorage.setItem("pc_user", JSON.stringify(data.user));
      setIsAuthenticated(true);
      onShowToast(`🔐 Welcome, ${data.user.username}!`);
    } catch (err) {
      // Allow simulation mode if backend offline
      onShowToast("⚠️ Operating in local database stores simulation.");
    }
  };

  const handleLogOut = () => {
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setToken("");
    setCurrentUser(null);
    localStorage.removeItem("pc_token");
    localStorage.removeItem("pc_user");
    setOrders([]);
    setMenuItems([]);
    onShowToast("🔒 Disconnected successfully from database cluster.");
  };

  // User Management handlers
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("/admin/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleCreateUser = async () => {
    if (!userFormUsername.trim() || !userFormPassword.trim()) {
      onShowToast("⚠️ Username and password are required.");
      return;
    }
    try {
      const res = await fetch("/admin/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          username: userFormUsername.trim(),
          password: userFormPassword,
          role: userFormRole,
          outletAccess: userFormOutletAccess,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onShowToast(`❌ ${data.error || "Failed to create user"}`);
        return;
      }
      onShowToast(`✅ User "${userFormUsername}" created successfully!`);
      setIsUserModalOpen(false);
      loadUsers();
    } catch (err: any) {
      onShowToast(`❌ Failed to create user: ${err.message}`);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser?._id) return;
    try {
      const body: any = {};
      if (userFormUsername.trim() && userFormUsername.trim() !== editingUser.username) body.username = userFormUsername.trim();
      if (userFormPassword.trim()) body.password = userFormPassword;
      if (userFormRole !== editingUser.role) body.role = userFormRole;
      body.outletAccess = userFormOutletAccess;

      const res = await fetch(`/admin/api/users/${editingUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        onShowToast(`❌ ${data.error || "Failed to update user"}`);
        return;
      }
      onShowToast(`✅ User "${userFormUsername}" updated!`);
      setIsUserModalOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      onShowToast(`❌ Failed to update user: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/admin/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        onShowToast(`❌ ${data.error || "Failed to delete user"}`);
        return;
      }
      onShowToast(`✅ User "${username}" deleted.`);
      loadUsers();
    } catch (err: any) {
      onShowToast(`❌ Failed to delete user: ${err.message}`);
    }
  };

  const handleToggleUser = async (userId: string) => {
    try {
      const res = await fetch(`/admin/api/users/${userId}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        onShowToast(`❌ ${data.error || "Failed to toggle user status"}`);
        return;
      }
      onShowToast(`🔄 User status toggled.`);
      loadUsers();
    } catch (err: any) {
      onShowToast(`❌ Failed to toggle user: ${err.message}`);
    }
  };

  const refreshCurrentView = () => {
    if (activeTab === "dashboard") {
      loadSummaryData();
      onShowToast("🔄 Dashboard summary charts reloaded.");
    } else if (activeTab === "orders") {
      loadOrders(selectedOutlet, orderStatusFilter);
      onShowToast(`🔄 Order listing for "${selectedOutlet}" synced.`);
    } else if (activeTab === "menu") {
      loadMenu();
      onShowToast("🔄 Menu catalog synchronized.");
    } else if (activeTab === "banners") {
      loadBanners();
      onShowToast("🔄 Banner configurations synchronized.");
    } else if (activeTab === "promos") {
      loadPromos();
      onShowToast("🔄 Promo Codes database listings synchronized.");
    } else if (activeTab === "branches") {
      loadBranches();
      onShowToast("🔄 Branches database listings synchronized.");
    }
  };

  const handleSaveMenuItem = async () => {
    if (!fieldName.trim() || !fieldPrice.trim()) {
      onShowToast("⚠️ Name and price are required parameters.");
      return;
    }

    
    const payload = {
      name: fieldName.trim(),
      price: parseFloat(fieldPrice),
      category: fieldCategory,
      subCategory: fieldSubcat.trim(),
      description: fieldDesc.trim(),
      badge: fieldBadge,
      image: fieldImage.trim() || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
      available: fieldAvailable,
      featured: fieldFeatured,
      discountPrice: fieldDiscountPrice ? parseFloat(fieldDiscountPrice) : 0,
      discountPercentage: fieldDiscountPercentage ? parseFloat(fieldDiscountPercentage) : 0,
    };

    try {
      if (editingMenuItem) {
        const res = await fetch(`/admin/api/menu/${editingMenuItem._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          onShowToast(`✅ Updated "${fieldName}" successfully!`);
          setIsMenuModalOpen(false);
          loadMenu();
        } else {
          onShowToast("❌ Failed to update menu item.");
        }
      } else {
        const res = await fetch(`/admin/api/menu`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          onShowToast(`✅ Added "${fieldName}" to catalog!`);
          setIsMenuModalOpen(false);
          loadMenu();
        } else {
          onShowToast("❌ Failed to add menu item.");
        }
      }
    } catch (err) {
      onShowToast("❌ Network error connecting to database.");
    }
  };

  const handleToggleMenuItem = async (id: string) => {
    
    try {
      const res = await fetch(`/admin/api/menu/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onShowToast(`✅ Product availability toggled.`);
        loadMenu();
      } else {
        onShowToast("❌ Failed to toggle menu availability.");
      }
    } catch (err) {
      onShowToast("❌ Error connecting to database.");
    }
  };

  const handleDeleteMenuItem = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete "${name}" from the active database?`)) {
      return;
    }

    
    try {
      const res = await fetch(`/admin/api/menu/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onShowToast(`🗑️ "${name}" removed from the catalog database.`);
        loadMenu();
      } else {
        onShowToast("❌ Failed to delete item.");
      }
    } catch (err) {
      onShowToast("❌ Database deletion connection failure.");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    
    onShowToast(`⚙️ Directing Status payload updates...`);

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onShowToast(`✅ Status successfully changed to "${newStatus}"!`);
        loadOrders(selectedOutlet, orderStatusFilter);
        loadSummaryData();
      } else {
        onShowToast("❌ Operations failed status update response.");
      }
    } catch (err) {
      onShowToast("❌ Backend endpoint handshake error.");
    }
  };

  const openEditModal = (item: MenuItem | null) => {
    setEditingMenuItem(item);
    if (item) {
      setFieldName(item.name);
      setFieldPrice(item.price.toString());
      setFieldCategory(item.category);
      setFieldSubcat((item as any).subCategory || "");
      setFieldDesc(item.description || "");
      setFieldBadge((item as any).badge || "");
      setFieldImage(item.image || "");
      setFieldAvailable(item.available !== false);
      setFieldFeatured(!!(item as any).featured);
      setFieldDiscountPrice((item as any).discountPrice ? (item as any).discountPrice.toString() : "");
      setFieldDiscountPercentage((item as any).discountPercentage ? (item as any).discountPercentage.toString() : "");
    } else {
      setFieldName("");
      setFieldPrice("");
      setFieldCategory("pizza");
      setFieldSubcat("");
      setFieldDesc("");
      setFieldBadge("");
      setFieldImage("");
      setFieldAvailable(true);
      setFieldFeatured(false);
      setFieldDiscountPrice("");
      setFieldDiscountPercentage("");
    }
    setIsMenuModalOpen(true);
  };

  // Aggregated Summary values
  const summaryValues = Object.values(summaryData) as Array<{ totalOrders: number; totalRevenue: number; pending: number }>;
  const totalOrdersAcrossAll = summaryValues.reduce((sum, item) => sum + item.totalOrders, 0);
  const totalRevenueAcrossAll = summaryValues.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalPendingAcrossAll = summaryValues.reduce((sum, item) => sum + item.pending, 0);

  // Filter and Search Menu Catalog
  const filteredMenuItems = menuItems.filter((item) => {
    const isCategoryMatch = menuFilter === "all" || item.category === menuFilter;
    if (menuSearch === "all" || !menuSearch.trim()) return isCategoryMatch;
    
    const searchLower = menuSearch.toLowerCase();
    const nameMatch = item.name.toLowerCase().includes(searchLower);
    const descMatch = (item.description || "").toLowerCase().includes(searchLower);
    const catMatch = item.category.toLowerCase().includes(searchLower);
    return isCategoryMatch && (nameMatch || descMatch || catMatch);
  });

  const capitalise = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

  // ─── Date-range helpers (Asia/Muscat = UTC+4) ───────────────────────────
  const getMuscatDateString = (date: Date) => {
    return date.toLocaleDateString("en-CA", { timeZone: "Asia/Muscat" }); // "YYYY-MM-DD"
  };
  const todayStr = getMuscatDateString(new Date());

  const isToday    = (ts: string) => getMuscatDateString(new Date(ts)) === todayStr;
  const isThisWeek = (ts: string) => {
    const now  = new Date();
    const msIn7Days = 7 * 24 * 60 * 60 * 1000;
    return new Date(ts).getTime() >= now.getTime() - msIn7Days;
  };
  const isThisMonth = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const dStr = d.toLocaleDateString("en-CA", { timeZone: "Asia/Muscat" });
    const nowStr = getMuscatDateString(now);
    return dStr.slice(0, 7) === nowStr.slice(0, 7); // same YYYY-MM
  };

  const applyDateFilter = (list: Order[], range: "daily" | "weekly" | "monthly" | "all") => {
    if (range === "daily")   return list.filter(o => isToday(o.timestamp));
    if (range === "weekly")  return list.filter(o => isThisWeek(o.timestamp));
    if (range === "monthly") return list.filter(o => isThisMonth(o.timestamp));
    return list; // "all"
  };

  // Today-only derived values for dashboard summary cards
  const todayOrders  = orders.filter(o => isToday(o.timestamp));
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
  const todayPending = todayOrders.filter(o => o.status === "pending").length;

  // Date-filtered orders for the Orders tab
  const dateFilteredOrders = applyDateFilter(orders, orderDateFilter);

  return (
    <div className="w-full min-h-screen bg-[#FFF8F2] text-[#3D1F00] font-sans antialiased">
      {!isAuthenticated ? (
        /* ==================== LOGIN COMPONENT ==================== */
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#D72B2B]/15 shadow-xl">
            <div className="text-center space-y-3 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D72B2B] to-[#F26522] flex items-center justify-center text-white text-3xl mx-auto shadow-md">
                🍕
              </div>
              <h2 className="font-playfair font-black text-2xl text-[#1A0A00]">Oman Admin Dashboard</h2>
              <p className="text-xs text-[#9A7B5E]">
                Pizza City — Staff &amp; Operational Management Console
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-[#9A7B5E] uppercase tracking-wider mb-2">
                  Staff Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="pizzacity_admin"
                  className="w-full bg-[#FFF8F2] border border-[#D72B2B]/20 rounded-xl px-4 py-3 text-sm text-[#3D1F00] focus:border-[#F26522] focus:outline-none focus:ring-1 focus:ring-[#F26522]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#9A7B5E] uppercase tracking-wider mb-2">
                  Staff Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FFF8F2] border border-[#D72B2B]/20 rounded-xl px-4 py-3 text-sm text-[#3D1F00] focus:border-[#F26522] focus:outline-none focus:ring-1 focus:ring-[#F26522]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white font-black rounded-full shadow-lg shadow-[#D72B2B]/35 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer"
              >
                Sign In onto Console
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* ==================== PANEL DESKTOP WRAPPER ==================== */
        <div className="flex min-h-screen relative">
          
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* SIDEBAR NAVIGATION */}
          <aside className={`fixed top-0 bottom-0 left-0 bg-[#1A0A00] w-64 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
            {/* Sidebar Logo */}
            <div className="flex items-center gap-3 p-5 border-b border-white/10">
              <span className="text-2xl bg-gradient-to-br from-[#D72B2B] to-[#F26522] p-1.5 rounded-xl">🍕</span>
              <div>
                <h2 className="font-playfair font-black text-white text-base leading-tight">Pizza City</h2>
                <p className="text-[9px] font-bold text-[#FF8C42] tracking-widest uppercase">Oman Operations</p>
              </div>
              <button 
                className="ml-auto text-white/50 hover:text-white lg:hidden cursor-pointer"
                onClick={() => setSidebarOpen(false)}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Sidebar Navigation Options */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
              
              <div className="space-y-1.5">
                <span className="block text-[10px] font-black tracking-widest uppercase text-white/30 px-3 mb-2">Overview</span>
                
                <button
                  onClick={() => { setActiveTab("dashboard"); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-gradient-to-r from-[#D72B2B]/40 to-[#F26522]/30 text-white border border-[#FF8C42]/20"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <LayoutDashboard size={14} className="text-[#FF8C42]" />
                  Dashboard Control
                </button>

                <button
                  onClick={() => { setActiveTab("orders"); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
                    activeTab === "orders"
                      ? "bg-gradient-to-r from-[#D72B2B]/40 to-[#F26522]/30 text-white border border-[#FF8C42]/20"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <ClipboardList size={14} className="text-[#FF8C42]" />
                  All Orders queue
                  {totalPendingAcrossAll > 0 && (
                    <span className="ml-auto bg-[#D72B2B] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                      {totalPendingAcrossAll}
                    </span>
                  )}
                </button>

                {isSuperAdmin && (
                  <button
                    onClick={() => { setActiveTab("menu"); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
                      activeTab === "menu"
                        ? "bg-gradient-to-r from-[#D72B2B]/40 to-[#F26522]/30 text-white border border-[#FF8C42]/20"
                        : "text-white/65 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <ShoppingBag size={14} className="text-[#FF8C42]" />
                    Menu Manager
                  </button>
                )}

                {isSuperAdmin && (
                  <button
                    onClick={() => { setActiveTab("banners"); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
                      activeTab === "banners"
                        ? "bg-gradient-to-r from-[#D72B2B]/40 to-[#F26522]/30 text-white border border-[#FF8C42]/20"
                        : "text-white/65 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Sliders size={14} className="text-[#FF8C42]" />
                    Promo Banners
                  </button>
                )}

                {isSuperAdmin && (
                  <button
                    onClick={() => { setActiveTab("promos"); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
                      activeTab === "promos"
                        ? "bg-gradient-to-r from-[#D72B2B]/40 to-[#F26522]/30 text-white border border-[#FF8C42]/20"
                        : "text-white/65 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Tag size={14} className="text-[#FF8C42]" />
                    Promo Codes
                  </button>
                )}

                {isSuperAdmin && (
                  <button
                    onClick={() => { setActiveTab("branches"); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
                      activeTab === "branches"
                        ? "bg-gradient-to-r from-[#D72B2B]/40 to-[#F26522]/30 text-white border border-[#FF8C42]/20"
                        : "text-white/65 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <MapPin size={14} className="text-[#FF8C42]" />
                    Branch Management
                  </button>
                )}

                {isSuperAdmin && (
                  <button
                    onClick={() => { setActiveTab("users"); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
                      activeTab === "users"
                        ? "bg-gradient-to-r from-[#D72B2B]/40 to-[#F26522]/30 text-white border border-[#FF8C42]/20"
                        : "text-white/65 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <User size={14} className="text-[#FF8C42]" />
                    User Management
                  </button>
                )}
              </div>

              {/* Sidebar Outlet Selector Shortcuts */}
              <div className="space-y-1.5pt-4 border-t border-white/5">
                <span className="block text-[10px] font-black tracking-widest uppercase text-white/30 px-3 mb-2">Branches Select ({orders.length})</span>

                {/* All Outlets button — superadmin only */}
                {isSuperAdmin && (
                  <button
                    onClick={() => { setSelectedOutlet("all"); setActiveTab("orders"); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                      selectedOutlet === "all" && activeTab === "orders" ? "text-[#FF8C42] bg-white/5" : "text-white/50 hover:text-white"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C42]" />
                    All Outlets
                  </button>
                )}

                {/* Filter outlet list — superadmins see all, moderators see only their assigned outlets */}
                {(isSuperAdmin
                  ? (branches && branches.length > 0 ? branches.map(b => b.name) : ["Nizwa", "Samail", "Sur", "Quriyat", "Fanja"])
                  : (currentUser?.outletAccess || [])
                ).map((branch: string) => {
                  const data = summaryData[branch] || { pending: 0 };
                  return (
                    <button
                      key={branch}
                      onClick={() => { setSelectedOutlet(branch); setActiveTab("orders"); setSidebarOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                        selectedOutlet === branch && activeTab === "orders" ? "text-white bg-white/5 font-black" : "text-white/50 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span>{branch}</span>
                      </div>
                      {data.pending > 0 && (
                        <span className="text-[9px] font-black bg-[#D72B2B]/20 text-[#FF8C42] border border-[#D72B2B]/40 px-1.5 py-0.5 rounded-full">
                          {data.pending}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Sidebar Actions bottom footer */}
            <div className="p-4 border-t border-white/10 space-y-3.5">
              {/* Database Status indicator */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <Database size={13} className={dbType.includes("MongoDB") ? "text-green-400" : "text-amber-400"} />
                  <span className="text-[10px] font-black uppercase text-white/55 tracking-wider">Database Link</span>
                </div>
                <div className="flex items-center justify-between">
                  {dbType.includes("MongoDB") ? (
                    <>
                      <span className="text-[11px] font-black text-green-400">MongoDB Atlas</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] font-black text-amber-400">Offline Fallback</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    </>
                  )}
                </div>
                <p className="text-[9px] text-white/35 leading-normal">
                  {dbType.includes("MongoDB") 
                    ? "Live data synced and stored permanently on MongoDB Atlas cloud." 
                    : "No MONGODB_URI secret set in settings. Operating in mock mode."}
                </p>
              </div>

              <button
                onClick={handleLogOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-red-400 hover:bg-red-500/10 transition-all text-left cursor-pointer"
              >
                <LogOut size={14} />
                Disconnect Session
              </button>
            </div>
          </aside>

          {/* MAIN PAGE PANEL CONTAINER */}
          <main className="flex-1 flex flex-col min-w-0">
            
            {/* TOP BAR ACTION LEVEL HEADER */}
            <header className="h-16 bg-white border-b border-[#D72B2B]/10 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <button 
                  className="p-1 rounded-lg text-[#3D1F00] hover:bg-[#FFF8F2] lg:hidden cursor-pointer"
                  onClick={() => setSidebarOpen(true)}
                >
                  <MenuIcon size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏪</span>
                  <h1 className="font-playfair font-black text-lg text-[#1A0A00]">
                    {activeTab === "dashboard" ? "Dashboard Desk" : activeTab === "orders" ? "Active Invoices" : activeTab === "menu" ? "Menu Catalog" : activeTab === "banners" ? "Setup Live Banners" : activeTab === "branches" ? "Branch Outlets Management" : activeTab === "users" ? "User Management" : "Settings & Promo Codes"}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {activeTab === "orders" && (
                  <div className="hidden sm:inline-flex items-center text-[10px] font-black bg-[#D72B2B]/10 text-[#D72B2B] px-3 py-1.5 rounded-full uppercase tracking-wider">
                    Outlet Filter: {selectedOutlet === "all" ? "All Oman Branches" : selectedOutlet}
                  </div>
                )}
                
                <button
                  onClick={refreshCurrentView}
                  className="p-2 bg-[#FFF8F2] hover:bg-[#FFF8F2]/60 rounded-xl border border-[#D72B2B]/10 text-gray-700 transition-transform hover:rotate-45 cursor-pointer"
                  title="Force Database Sync"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            </header>

            {/* MAIN PORTAL AREA */}
            <div className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
              
              {/* ==================== 1. DASHBOARD VIEW ==================== */}
              {activeTab === "dashboard" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Today's date label */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-[#D72B2B]/15 rounded-2xl px-4 py-2 shadow-sm">
                      <span className="text-base">📅</span>
                      <div>
                        <span className="block text-[9px] font-black uppercase text-[#9A7B5E] tracking-wider">Today's Dashboard</span>
                        <span className="text-xs font-black text-[#1A0A00]">
                          {new Date().toLocaleDateString("en-OM", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Muscat" })}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#9A7B5E] italic">Showing today's live activity only. Use Orders tab for full history.</span>
                  </div>

                  {/* Dynamic Summary Cards — TODAY only */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="bg-white p-5 rounded-3xl border border-[#D72B2B]/10 shadow-sm relative overflow-hidden">
                      <div className="absolute right-3 top-3 text-2xl opacity-20">📋</div>
                      <span className="block text-[10px] font-black uppercase text-[#9A7B5E] tracking-wider mb-2">Today's Orders</span>
                      <h3 className="font-playfair font-black text-2xl text-[#1A0A00]">
                        {isLoadingOrders ? "..." : todayOrders.length}
                      </h3>
                      <p className="text-[10px] text-[#9A7B5E] mt-1.5">Orders placed today</p>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-[#D72B2B]/10 shadow-sm relative overflow-hidden">
                      <div className="absolute right-3 top-3 text-2xl opacity-20">💰</div>
                      <span className="block text-[10px] font-black uppercase text-[#9A7B5E] tracking-wider mb-2">Today's Revenue</span>
                      <h3 className="font-playfair font-black text-2xl text-[#D72B2B]">
                        {isLoadingOrders ? "..." : `OMR ${todayRevenue.toFixed(2)}`}
                      </h3>
                      <p className="text-[10px] text-[#9A7B5E] mt-1.5">Gross earnings today</p>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-[#D72B2B]/10 shadow-sm relative overflow-hidden">
                      <div className="absolute right-3 top-3 text-2xl opacity-20">⏳</div>
                      <span className="block text-[10px] font-black uppercase text-[#9A7B5E] tracking-wider mb-2">Pending Kitchen Today</span>
                      <h3 className="font-playfair font-black text-2xl text-amber-600">
                        {isLoadingOrders ? "..." : todayPending}
                      </h3>
                      <p className="text-[10px] text-[#9A7B5E] mt-1.5">Awaiting preparation now</p>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-[#D72B2B]/10 shadow-sm relative overflow-hidden">
                      <div className="absolute right-3 top-3 text-2xl opacity-20">🏪</div>
                      <span className="block text-[10px] font-black uppercase text-[#9A7B5E] tracking-wider mb-2">Activated Branches</span>
                      <h3 className="font-playfair font-black text-2xl text-green-600">
                        {isLoadingBranches ? "..." : (branches && branches.length > 0) ? branches.filter(b => b.isActive !== false).length : 5}
                      </h3>
                      <p className="text-[10px] text-[#9A7B5E] mt-1.5">Active outlet locations online</p>
                    </div>

                  </div>

                  {/* DATABASE INTEGRATION DASHBOARD STATUS CARD */}
                  <div className="bg-white rounded-3xl border border-[#D72B2B]/10 overflow-hidden flex flex-col md:flex-row shadow-sm text-left">
                    <div className="p-6 md:p-8 flex-1 space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${dbType.includes("MongoDB") ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
                          <Database size={20} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-[#9A7B5E] tracking-wider block">Backend Cloud Connection</span>
                          <h3 className="font-playfair font-black text-base md:text-lg text-[#1A0A00]">
                            {dbType.includes("MongoDB") ? "🟢 Active Database: Connected to MongoDB Atlas Cloud" : "🟡 Offline Mode: Local In-Memory Fallback"}
                          </h3>
                        </div>
                      </div>

                      {dbType.includes("MongoDB") ? (
                        <div className="text-sm text-[#3D1F00] leading-relaxed space-y-2">
                          <p>
                            Great news! Your Pizza City website is connected to your MongoDB Atlas cloud database. All customer order histories, 
                            menu listings, promotional flyers, and discount vouchers are secured and updated dynamically on the cloud!
                          </p>
                          <div className="text-xs bg-green-50/60 border border-green-150 rounded-xl p-3.5 space-y-1">
                            <span className="font-black text-green-800 uppercase block tracking-wider text-[10px]">Active Mongo Connection String:</span>
                            <code className="text-green-700 font-mono break-all text-[11px] block select-all bg-white px-2.5 py-1.5 rounded-lg border border-green-150">
                              mongodb+srv://******... (Injected securely at runtime via secrets)
                            </code>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-xs text-[#9A7B5E] leading-relaxed">
                            The application is running in an <strong>offline sandbox mode</strong>. Modified menu prices, coupons, or order status cards will reset when the sandbox container reboots. Link a persistent MongoDB Atlas instantly:
                          </p>
                          <div className="bg-amber-50/75 border border-amber-200/50 rounded-2xl p-4 md:p-5 space-y-3 px-5 text-xs text-[#3D1F00]">
                            <span className="font-black text-amber-800 uppercase tracking-wider block text-[10px]">How to Connect Your MongoDB Cloud Database:</span>
                            <ol className="list-decimal list-inside space-y-2 leading-relaxed font-medium">
                              <li>Obtain a database connection string from <a href="https://www.mongodb.com/cloud/atlas" target="_blank" rel="noopener noreferrer" className="text-[#D72B2B] hover:underline font-bold">MongoDB Atlas (Free tier available)</a>.</li>
                              <li>Go to the <strong>Settings</strong> button at the top-right corner of your AI Studio workspace.</li>
                              <li>Create a new Environment Secret named exactly <strong className="font-black font-mono text-[#D72B2B]">MONGODB_URI</strong>.</li>
                              <li>Set the secret value to your connection string (e.g., <code className="bg-white/80 border border-amber-200/70 py-0.5 px-1.5 rounded font-mono text-[10px]">mongodb+srv://user:pass@cluster.mongodb.net/pizzacity</code>) and save.</li>
                            </ol>
                            <div className="pt-2">
                              <button
                                onClick={fetchHealthStatus}
                                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold tracking-tight text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                              >
                                <RefreshCw size={11} className="mr-0.5" />
                                Refresh Status Verification
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BRANCHES COMPARATIVE SECTION OVERVIEW */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-playfair font-black text-lg text-[#1A0A00]">Oman Branch Breakdown</h2>
                      <span className="text-xs text-[#9A7B5E]">Click branch to filter active invoices</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {((branches && branches.length > 0)
                        ? branches.filter(b => b.isActive !== false).map(b => b.name)
                        : ["Nizwa", "Samail", "Sur", "Quriyat", "Fanja"]
                      ).map((branch) => {
                        const data = summaryData[branch] || { totalOrders: 0, totalRevenue: 0, pending: 0 };
                        return (
                          <div 
                            key={branch}
                            onClick={() => { setSelectedOutlet(branch); setActiveTab("orders"); }}
                            className="bg-white rounded-3xl border border-[#D72B2B]/15 shadow-sm p-5 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                          >
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                              <div>
                                <h3 className="font-playfair font-black text-base text-[#1A0A00]">{branch}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                  <span className="text-[10px] text-green-600 uppercase font-black">Live &amp; Online</span>
                                </div>
                              </div>
                              <span className="text-xl">📍</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 py-4">
                              <div className="text-center bg-[#FFF8F2] p-2.5 rounded-2xl">
                                <span className="block text-[10px] text-[#9A7B5E] font-black uppercase">Today's Sales</span>
                                <span className="font-playfair font-black text-lg text-[#1A0A00]">{data.totalOrders}</span>
                              </div>
                              <div className="text-center bg-[#FFF8F2] p-2.5 rounded-2xl">
                                <span className="block text-[10px] text-[#9A7B5E] font-black uppercase">Revenue</span>
                                <span className="font-playfair font-black text-[#D72B2B] text-base">OMR {data.totalRevenue.toFixed(2)}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                data.pending > 0 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-500"
                              }`}>
                                {data.pending} Pending Cooking
                              </span>
                              <span className="text-[10px] font-black text-[#D72B2B] flex items-center gap-1">
                                Inspect branch order stream <ChevronRight size={10} />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* ==================== 2. ORDERS LIST VIEW ==================== */}
              {activeTab === "orders" && (
                <div className="space-y-6 animate-fadeIn">

                  {/* ── Date Range Sub-Tabs ── */}
                  <div className="bg-white rounded-3xl border border-[#D72B2B]/10 shadow-sm p-1.5 flex gap-1">
                    {([
                      { key: "daily",   label: "Today",        icon: "📅", desc: "Orders placed today" },
                      { key: "weekly",  label: "This Week",    icon: "📆", desc: "Last 7 days" },
                      { key: "monthly", label: "This Month",   icon: "🗓️", desc: "Current calendar month" },
                      { key: "all",     label: "All Orders",   icon: "📋", desc: "Complete order history" },
                    ] as const).map(({ key, label, icon, desc }) => (
                      <button
                        key={key}
                        onClick={() => setOrderDateFilter(key)}
                        className={`flex-1 flex flex-col items-center py-2.5 px-1 rounded-2xl text-[10px] font-black uppercase tracking-wide transition-all cursor-pointer ${
                          orderDateFilter === key
                            ? "bg-gradient-to-br from-[#D72B2B] to-[#F26522] text-white shadow-md shadow-[#D72B2B]/25"
                            : "text-[#9A7B5E] hover:bg-[#FFF8F2] hover:text-[#3D1F00]"
                        }`}
                      >
                        <span className="text-lg mb-0.5">{icon}</span>
                        <span>{label}</span>
                        <span className={`text-[8px] font-medium normal-case mt-0.5 ${
                          orderDateFilter === key ? "text-white/70" : "text-[#9A7B5E]/70"
                        }`}>{desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Count badge for current period */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#1A0A00]">
                      {orderDateFilter === "daily" ? "Today's" : orderDateFilter === "weekly" ? "This Week's" : orderDateFilter === "monthly" ? "This Month's" : "All"} Orders
                    </span>
                    <span className="text-[10px] font-black bg-[#D72B2B]/10 text-[#D72B2B] px-2.5 py-0.5 rounded-full">
                      {dateFilteredOrders.length} order{dateFilteredOrders.length !== 1 ? "s" : ""}
                    </span>
                    {orderDateFilter !== "all" && (
                      <span className="text-[10px] text-[#9A7B5E]">
                        · OMR {dateFilteredOrders.reduce((s, o) => s + (o.total || 0), 0).toFixed(2)} revenue
                      </span>
                    )}
                  </div>

                  {/* Outlet & Status Pills selection bar */}
                  <div className="space-y-3">
                    <span className="block text-xs font-black uppercase text-[#9A7B5E]">Select Outlet Queue</span>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      <button
                        onClick={() => setSelectedOutlet("all")}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-full font-black text-xs border transition-all cursor-pointer ${
                          selectedOutlet === "all"
                            ? "bg-[#D72B2B] text-white border-transparent shadow-md shadow-[#D72B2B]/20"
                            : "bg-white text-[#3D1F00] border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        🌐 All Oman Outlets
                      </button>
                       {((branches && branches.length > 0)
                        ? branches.filter(b => b.isActive !== false).map(b => b.name)
                        : ["Nizwa", "Samail", "Sur", "Quriyat", "Fanja"]
                      ).map((branch) => (
                        <button
                          key={branch}
                          onClick={() => setSelectedOutlet(branch)}
                          className={`flex-shrink-0 px-4 py-2.5 rounded-full font-black text-xs border transition-all cursor-pointer ${
                            selectedOutlet === branch
                              ? "bg-[#D72B2B] text-white border-transparent shadow-md shadow-[#D72B2B]/20"
                              : "bg-white text-[#3D1F00] border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          📍 {branch}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status selection filters */}
                  <div className="space-y-3">
                    <span className="block text-xs font-black uppercase text-[#9A7B5E]">Filter by Kitchen State</span>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                      {[
                        { key: "", label: "All Invoices" },
                        { key: "pending", label: "Pending Setup" },
                        { key: "preparing", label: "In the Oven" },
                        { key: "out-for-delivery", label: "Out with Rider" },
                        { key: "delivered", label: "Delivered Slices" },
                        { key: "cancelled", label: "Cancelled Errors" },
                      ].map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setOrderStatusFilter(item.key)}
                          className={`flex-shrink-0 px-3.5 py-2 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                            orderStatusFilter === item.key
                              ? "bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white border-transparent"
                              : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orders Queue Loop area */}
                  {isLoadingOrders ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
                      <RefreshCw size={30} className="text-[#D72B2B] animate-spin mb-3" />
                      <p className="text-xs font-bold text-[#9A7B5E]">Reading dynamic operational queues...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dateFilteredOrders.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-[#D72B2B]/10 shadow-sm space-y-3">
                          <span className="text-4xl block">🍕</span>
                          <h4 className="font-playfair font-black text-lg text-[#1A0A00]">Quiet Kitchen Shifts</h4>
                          <p className="text-xs text-[#9A7B5E] max-w-sm mx-auto leading-relaxed">
                            No orders found for the selected period ({orderDateFilter === "daily" ? "today" : orderDateFilter === "weekly" ? "last 7 days" : orderDateFilter === "monthly" ? "this month" : "all time"}) at "{selectedOutlet === "all" ? "All Oman Branches" : selectedOutlet}".
                          </p>
                        </div>
                      ) : (
                        dateFilteredOrders.map((order) => {
                          const quantitySum = order.items.reduce((s, i) => s + i.quantity, 0);
                          return (
                            <div 
                              key={order._id}
                              className="bg-white p-5 md:p-6 rounded-3xl border border-[#D72B2B]/10 shadow-sm flex flex-col lg:flex-row justify-between gap-6 hover:shadow-md transition-shadow"
                            >
                              
                              {/* Left Columns - Client Stamp details */}
                              <div className="space-y-3 lg:max-w-sm w-full">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-black bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-md font-mono">
                                    ID: {order._id.toString().slice(-6).toUpperCase()}
                                  </span>
                                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                    order.status === "pending"
                                      ? "bg-amber-100 text-amber-800"
                                      : order.status === "preparing"
                                      ? "bg-blue-100 text-blue-800"
                                      : order.status === "out-for-delivery"
                                      ? "bg-orange-100 text-[#F26522]"
                                      : order.status === "delivered"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                    {order.status === "out-for-delivery" ? "Transit" : order.status}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[10px] font-black text-[#FF8C42] uppercase tracking-wider">
                                    Branch: {capitalise(order.outlet)}
                                  </span>
                                  <h4 className="font-playfair font-black text-lg text-[#1A0A00] leading-tight">
                                    {order.customer.name}
                                  </h4>
                                  <div className="space-y-0.5 text-xs text-[#9A7B5E]">
                                    <p className="flex items-center gap-1">
                                      📞 <span className="font-bold text-[#1A0A00]">{order.customer.phone}</span>
                                    </p>
                                    {order.customer.email && (
                                      <p className="truncate">📧 {order.customer.email}</p>
                                    )}
                                    <p className="flex items-center gap-1 mt-1 text-[11px]">
                                      <Clock size={11} />
                                      {new Date(order.timestamp).toLocaleTimeString("en-OM", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                        timeZone: "Asia/Muscat"
                                      })} · {new Date(order.timestamp).toLocaleDateString("en-OM")}
                                    </p>
                                  </div>
                                </div>

                                {order.customer.notes && (
                                  <div className="bg-[#FFF8F2] border border-[#F26522]/10 p-3 rounded-xl text-xs text-[#3D1F00] leading-relaxed">
                                    <strong>📝 Notes:</strong> {order.customer.notes}
                                  </div>
                                )}
                              </div>

                              {/* Middle Column - Pizza Order Listing */}
                              <div className="flex-1 bg-[#FFF8F2]/45 border border-[#D72B2B]/5 rounded-2xl p-4 flex flex-col justify-between max-w-md">
                                <div className="space-y-2">
                                  <span className="block text-[10px] font-black uppercase text-[#9A7B5E] tracking-wider pb-2 border-b border-gray-100">
                                    Order Cart Summary ({quantitySum} items)
                                  </span>
                                  <div className="space-y-1.5 scrollbar-thin max-h-32 overflow-y-auto">
                                    {order.items.map((item, id) => (
                                      <div key={id} className="flex justify-between items-center text-xs text-[#3D1F00]">
                                        <span>
                                          <strong className="text-[#D72B2B] font-bold mr-1">{item.quantity}x</strong>
                                          {item.name}
                                        </span>
                                        <span className="font-mono font-bold text-[#1A0A00]">
                                          OMR {(item.price * item.quantity).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="border-t border-dashed border-[#D72B2B]/20 pt-3 mt-3 flex justify-between items-center font-black">
                                  <span className="text-xs text-[#9A7B5E]">Invoice Ticket Total:</span>
                                  <span className="text-sm font-mono text-[#D72B2B]">
                                    OMR {order.total ? order.total.toFixed(2) : "0.00"}
                                  </span>
                                </div>
                              </div>

                              {/* Right Column - Status Action Set */}
                              <div className="w-full lg:w-48 flex flex-col justify-center gap-2 lg:border-l lg:border-gray-100 lg:pl-5">
                                <span className="text-[10px] font-black text-[#9A7B5E] uppercase tracking-wider text-center lg:text-left mb-1">
                                  Change Operations State
                                </span>
                                
                                <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                                  
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order._id, "preparing")}
                                    className={`py-2 px-3 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                                      order.status === "preparing"
                                        ? "bg-blue-100 border-blue-200 text-blue-900"
                                        : "bg-white hover:bg-blue-50 border-gray-200 text-gray-700 hover:border-blue-200"
                                    }`}
                                  >
                                    <Play size={9} className="fill-current" />
                                    Baking Oven
                                  </button>

                                  <button
                                    onClick={() => handleUpdateOrderStatus(order._id, "out-for-delivery")}
                                    className={`py-2 px-3 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                                      order.status === "out-for-delivery"
                                        ? "bg-orange-150 border-[#F26522]/30 text-[#D72B2B]"
                                        : "bg-white hover:bg-orange-50 border-gray-200 text-gray-700 hover:border-[#F26522]/20"
                                    }`}
                                  >
                                    <Truck size={10} />
                                    Transit Rider
                                  </button>

                                  <button
                                    onClick={() => handleUpdateOrderStatus(order._id, "delivered")}
                                    className={`py-2 px-3 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                                      order.status === "delivered"
                                        ? "bg-green-100 border-green-200 text-green-900"
                                        : "bg-white hover:bg-green-50 border-gray-200 text-gray-700 hover:border-green-200"
                                    }`}
                                  >
                                    <CheckCircle size={10} />
                                    Delivered
                                  </button>

                                  <button
                                    onClick={() => handleUpdateOrderStatus(order._id, "cancelled")}
                                    className={`py-2 px-3 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                                      order.status === "cancelled"
                                        ? "bg-red-100 border-red-200 text-red-900"
                                        : "bg-white hover:bg-red-50 border-gray-200 text-red-500 hover:border-red-200"
                                    }`}
                                  >
                                    Cancel order
                                  </button>

                                </div>
                              </div>

                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* ==================== 3. MENU ITEMS VIEW ==================== */}
              {activeTab === "menu" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Menu Management Header Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                      <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                        <Search size={15} />
                      </span>
                      <input
                        type="text"
                        placeholder="Search recipes, ingredients or categories..."
                        value={menuSearch === "all" ? "" : menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        className="w-full bg-white border border-[#D72B2B]/20 rounded-2xl pl-9 pr-4 py-2.5 text-sm text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => openEditModal(null)}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white rounded-full font-black text-xs shadow-md shadow-[#D72B2B]/20 flex items-center justify-center gap-1.5 self-start sm:self-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Plus size={14} />
                      Add Recipe Item
                    </button>
                  </div>

                  {/* Category Pills filtering */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                    {[
                      { key: "all", label: "Entire Catalog" },
                      { key: "pizza", label: "Sourdough Pizzas" },
                      { key: "sides", label: "Fired Sides" },
                      { key: "drinks", label: "Chilled Drinks" },
                      { key: "dessert", label: "Dessert Pies" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setMenuFilter(item.key)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          menuFilter === item.key
                            ? "bg-[#D72B2B] text-white border-transparent"
                            : "bg-white text-gray-500 border-gray-100 hover:bg-[#FFF8F2]/65"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Items Display Grid */}
                  {isLoadingMenu ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
                      <RefreshCw size={30} className="text-[#D72B2B] animate-spin mb-3" />
                      <p className="text-xs font-bold text-[#9A7B5E]">Reading current live recipe catalog...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredMenuItems.length === 0 ? (
                        <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-[#D72B2B]/10 space-y-2">
                          <span className="text-3xl">🥦</span>
                          <h4 className="font-playfair font-black text-base text-[#1A0A00]">No Recipe Matches</h4>
                          <p className="text-xs text-[#9A7B5E]">
                            Try checking other category pills or refine your active search criteria.
                          </p>
                        </div>
                      ) : (
                        filteredMenuItems.map((item) => (
                          <div 
                            key={item._id}
                            className={`bg-white rounded-3xl border border-[#D72B2B]/10 overflow-hidden shadow-sm flex flex-col justify-between group transition-all hover:shadow-md ${
                              item.available === false ? "opacity-65" : ""
                            }`}
                          >
                            <div className="relative aspect-video bg-gray-50 overflow-hidden">
                              <img 
                                src={item.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80"} 
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              
                              {/* Overlay Presets Badge */}
                              {((item as any).badge || (item as any).featured) && (
                                <span className="absolute top-3 left-3 bg-white/95 text-[#1A0A00] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                                  {(item as any).featured ? "⭐ Featured" : (item as any).badge}
                                </span>
                              )}

                              {/* Live Availability Toggle Switch button Overlay */}
                              <button
                                onClick={() => handleToggleMenuItem(item._id)}
                                className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white border shadow-md cursor-pointer transition-all ${
                                  item.available !== false
                                    ? "bg-green-600 border-green-500 hover:scale-105"
                                    : "bg-red-600 border-red-500 hover:scale-105"
                                }`}
                                title={item.available !== false ? "Hide item from customers" : "Show item on active menu"}
                              >
                                {item.available !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                              </button>
                            </div>

                            {/* Item Body details */}
                            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                              
                              <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase text-[#FF8C42] tracking-widest">
                                  {(item as any).subCategory || item.category}
                                </span>
                                <h4 className="font-playfair font-black text-base text-[#1A0A00] leading-snug">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-[#9A7B5E] leading-relaxed line-clamp-2">
                                  {item.description || "No recipe description provided yet."}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                <span className="font-playfair font-black text-base text-[#D72B2B]">
                                  OMR {item.price.toFixed(3)}
                                </span>
                                
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => openEditModal(item)}
                                    className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200/50 transition-all cursor-pointer"
                                    title="Edit Recipe details"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMenuItem(item._id, item.name)}
                                    className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg border border-red-200/55 transition-all cursor-pointer"
                                    title="Delete product"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>

                            </div>

                          </div>
                        ))
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* ==================== 4. PROMO BANNERS VIEW ==================== */}
              {activeTab === "banners" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Banners Header Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                    <div className="space-y-1">
                      <h3 className="font-playfair font-black text-2xl text-[#1A0A00]">Promo Slideshow Settings</h3>
                      <p className="text-xs text-[#9A7B5E]">Manage interactive advertisements, promotions, and announcements on your storefront.</p>
                    </div>

                    <button
                      onClick={() => openBannerModal(null)}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white rounded-full font-black text-xs shadow-md shadow-[#D72B2B]/20 flex items-center justify-center gap-1.5 self-start sm:self-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Plus size={14} />
                      Add Promo Slide
                    </button>
                  </div>

                  {/* Banners Grid list */}
                  {isLoadingBanners ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                      <RefreshCw size={24} className="animate-spin text-[#F26522]" />
                      <p className="text-xs text-[#9A7B5E] font-bold">Synchronizing active advertisements...</p>
                    </div>
                  ) : banners.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-150 rounded-3xl p-8 text-center space-y-3">
                      <Sliders className="mx-auto text-amber-500" size={32} />
                      <p className="font-playfair font-black text-lg text-[#3D1F00]">No Slideshow Banners</p>
                      <p className="text-xs text-[#9A7B5E] max-w-sm mx-auto">Click "Add Promo Slide" to design your first beautiful banner. It will immediately show up at the header of your customer website!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {banners.map((slide) => (
                        <div 
                          key={slide._id} 
                          className={`bg-white rounded-[2rem] border border-[#D72B2B]/10 overflow-hidden shadow-sm flex flex-col relative transition-all ${
                            slide.isActive !== false ? "opacity-100 ring-2 ring-emerald-500/10" : "opacity-60 grayscale-[30%]"
                          }`}
                        >
                          {/* Image Wrapper */}
                          <div className="h-44 w-full relative overflow-hidden bg-gray-50">
                            <img 
                              src={slide.image} 
                              alt={slide.title} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            {/* Layout tag overlay */}
                            <span className="absolute top-3 left-3 bg-[#1A0A00]/80 text-[#FF8C42] text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">
                              Format: {slide.stylePattern || "attached"}
                            </span>

                            {/* Active Switch button */}
                            <button
                              onClick={() => handleToggleBannerActive(slide._id)}
                              className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border shadow-md cursor-pointer transition-all ${
                                slide.isActive !== false
                                  ? "bg-green-600 border-green-500 text-white"
                                  : "bg-red-650 border-red-500 text-white"
                              }`}
                              title={slide.isActive !== false ? "Hide from storefront" : "Publish to storefront"}
                            >
                              {slide.isActive !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                            </button>
                          </div>

                          {/* Slide body details */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2 text-left">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {slide.badge && (
                                  <span className="inline-block bg-[#F26522]/10 text-[#F26522] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
                                    {slide.badge}
                                  </span>
                                )}
                                <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                                  slide.type === "hero" 
                                    ? "bg-blue-50 text-blue-700 border border-blue-200" 
                                    : slide.type === "offer" 
                                      ? "bg-purple-100 text-purple-700 border border-purple-200" 
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}>
                                  📍 {slide.type === "hero" 
                                    ? "Hero Slider" 
                                    : slide.type === "offer" 
                                      ? "Special Offer" 
                                      : "All Sections"}
                                </span>
                              </div>
                              <h4 className="font-playfair font-black text-lg text-[#1A0A00] leading-snug line-clamp-2">
                                {slide.title}
                              </h4>
                              {slide.subtitle && (
                                <p className="text-xs text-[#9A7B5E] leading-relaxed line-clamp-3">
                                  {slide.subtitle}
                                </p>
                              )}
                              {(slide.buttonText || slide.buttonLink) && (
                                <div className="pt-2 flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-gray-400">Trigger:</span>
                                  <span className="text-[10px] font-black text-[#1A0A00] bg-gray-100 px-2.5 py-1 rounded-sm">
                                    {slide.buttonText || "Order Now"} ({slide.buttonLink || "#menu"})
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Action Row */}
                            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                              <button
                                onClick={() => openBannerModal(slide)}
                                className="px-3.5 py-2 text-xs font-black bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl border border-blue-200/50 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Edit2 size={12} />
                                Edit Slide
                              </button>
                              <button
                                onClick={() => handleDeleteBanner(slide._id, slide.title)}
                                className="px-3.5 py-2 text-xs font-black bg-red-50 text-red-700 hover:bg-red-100 rounded-xl border border-red-200/55 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* ==================== 5. PROMO CODES VIEW ==================== */}
              {activeTab === "promos" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                    <div className="space-y-1">
                      <h3 className="font-playfair font-black text-2xl text-[#1A0A00]">Active Promo Codes & Coupons</h3>
                      <p className="text-xs text-[#9A7B5E]">Setup and configure live checkout system promo codes, cash back or cart percentage discounts.</p>
                    </div>

                    <button
                      onClick={() => openPromoModal(null)}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white rounded-full font-black text-xs shadow-md shadow-[#D72B2B]/20 flex items-center justify-center gap-1.5 self-start sm:self-center cursor-pointer hover:scale-[1.02] transition-all"
                    >
                      <Plus size={14} />
                      Create New Promo
                    </button>
                  </div>

                  {isLoadingPromos ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center animate-pulse">
                      <p className="text-xs text-gray-405 font-bold">Synchronizing promotional indexes from databases...</p>
                    </div>
                  ) : promos.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-3">
                      <p className="text-sm font-bold text-[#3D1F00]">No promotional discount codes found.</p>
                      <p className="text-xs text-[#9A7B5E]">Create one to boost sales and public retention on the main Pizza City checkout screens!</p>
                      <button
                        onClick={() => openPromoModal(null)}
                        className="px-4 py-2 bg-gradient-to-r from-[#D72B2B]/90 to-[#F26522]/90 text-white text-[11px] font-black rounded-lg mx-auto cursor-pointer"
                      >
                        Create Your First Code
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {promos.map((promo) => (
                        <div 
                          key={promo._id} 
                          className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                        >
                          <div className="p-5 space-y-4 text-left">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-black text-sm text-[#D72B2B] bg-[#D72B2B]/5 border border-[#D72B2B]/10 px-3 py-1 rounded-lg">
                                {promo.code}
                              </span>
                              
                              <button
                                onClick={() => handleTogglePromoActive(promo._id, promo.isActive !== false)}
                                className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                                  promo.isActive !== false
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-red-100 text-red-700 border border-red-200"
                                }`}
                              >
                                {promo.isActive !== false ? "● Active" : "○ Paused"}
                              </button>
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Discount Value</p>
                              <p className="text-lg font-playfair font-black text-[#1A0A00]">
                                {promo.discountType === "percentage" 
                                  ? `${promo.discountValue}% Off Total Order`
                                  : `OMR ${promo.discountValue.toFixed(3)} Off Total Order`
                                }
                              </p>
                            </div>

                            <div className="bg-[#FFF8F2] rounded-xl p-3 border border-[#FFF8F2]/10 space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-[#9A7B5E]">Minimum Order Required:</span>
                                <span className="font-bold text-[#1A0A00]">
                                  {promo.minOrderAmount > 0 
                                    ? `OMR ${promo.minOrderAmount.toFixed(3)}` 
                                    : "No minimum"
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-[#FFF8F2]/30 border-t border-gray-100 flex items-center justify-end gap-2">
                            <button
                              onClick={() => openPromoModal(promo)}
                              className="px-3.5 py-1.5 text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-150 rounded-lg hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Edit2 size={10} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePromo(promo._id, promo.code)}
                              className="px-3.5 py-1.5 text-[10px] font-black bg-red-50 text-red-700 border border-[#D72B2B]/20 rounded-lg hover:bg-red-100 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 size={10} />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* ==================== 6. BRANCH OUTLETS VIEW ==================== */}
              {activeTab === "branches" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-playfair font-black text-2xl text-[#1A0A00]">Oman Branch Network</h3>
                      <p className="text-xs text-[#9A7B5E]">Manage customer-facing outlets, physical addresses, Google Maps geo links, WhatsApp numbers, opening hours, and delivery statuses.</p>
                    </div>

                    <button
                      onClick={() => openBranchModal(null)}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white rounded-full font-black text-xs shadow-md shadow-[#D72B2B]/20 flex items-center justify-center gap-1.5 self-start sm:self-center cursor-pointer hover:scale-[1.02] transition-all"
                    >
                      <Plus size={14} />
                      Add New Branch
                    </button>
                  </div>

                  {isLoadingBranches ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center animate-pulse">
                      <p className="text-xs text-gray-400 font-bold">Retrieving branches and coordinates from index...</p>
                    </div>
                  ) : branches.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-3">
                      <p className="text-sm font-bold text-[#3D1F00]">No physical branches found in your store database.</p>
                      <p className="text-xs text-[#9A7B5E]">Add a store location so users can view outlet locations, make orders, and lookup WhatsApp support channels.</p>
                      <button
                        onClick={() => openBranchModal(null)}
                        className="px-4 py-2 bg-gradient-to-r from-[#D72B2B]/90 to-[#F26522]/90 text-white text-[11px] font-black rounded-lg mx-auto cursor-pointer"
                      >
                        Create Your First Branch
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {branches.map((branch) => (
                        <div 
                          key={branch._id || branch.id}
                          className={`bg-white rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${
                            branch.isActive !== false 
                              ? "border-gray-100 shadow-md shadow-gray-100/40" 
                              : "border-gray-200 opacity-70 bg-gray-50/50"
                          }`}
                        >
                          <div>
                            {/* Branch Card Top Banner */}
                            <div className="h-32 bg-[#FFF8F2] relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                              {branch.image ? (
                                <img 
                                  src={branch.image} 
                                  alt={branch.name} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="text-center space-y-1">
                                  <span className="text-3xl block">📍</span>
                                  <span className="text-[10px] uppercase tracking-widest font-black text-[#D72B2B]/60">Pizza City Outlet</span>
                                </div>
                              )}
                              
                              {/* Status Badge */}
                              <span className={`absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                branch.isActive !== false 
                                  ? "bg-green-500/10 text-green-600 border-green-500/20" 
                                  : "bg-red-500/10 text-red-600 border-red-500/20"
                              }`}>
                                {branch.isActive !== false ? "Active" : "Inactive"}
                              </span>
                            </div>

                            {/* Branch Main Details */}
                            <div className="p-5 space-y-4 text-left">
                              <div className="space-y-0.5">
                                <h4 className="font-playfair font-black text-lg text-[#1A0A00]">{branch.name}</h4>
                                <p className="text-[11px] text-gray-500 font-medium leading-relaxed line-clamp-2">📍 {branch.address}</p>
                              </div>

                              <div className="space-y-2 border-t border-dashed border-gray-100 pt-3 text-xs">
                                <div className="flex items-center justify-between text-gray-600">
                                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Contact Phone:</span>
                                  <span className="font-mono text-gray-800 font-bold text-gray-700">{branch.phone}</span>
                                </div>

                                <div className="flex items-center justify-between text-gray-600">
                                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">WhatsApp Ordering:</span>
                                  <span className="font-mono text-gray-800 font-bold text-emerald-600">{branch.whatsapp}</span>
                                </div>

                                <div className="flex items-center justify-between text-gray-600">
                                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Opening Hours:</span>
                                  <span className="font-semibold text-gray-700">{branch.hours || "Daily 11 AM – 11 PM"}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Delivery Available:</span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    branch.delivery !== false 
                                      ? "bg-[#D72B2B]/10 text-[#FF8C42]" 
                                      : "bg-gray-100 text-gray-400"
                                  }`}>
                                    {branch.delivery !== false ? "Yes, Active" : "No, Pickup Only"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card Actions Footer */}
                          <div className="p-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-2.5">
                            <button
                              onClick={() => handleToggleBranchActive(branch._id || branch.id || "", branch.isActive !== false)}
                              className={`flex-1 py-1.5 rounded-lg font-black text-[10px] uppercase border transition-all cursor-pointer ${
                                branch.isActive !== false 
                                  ? "bg-white text-red-500 border-red-500/20 hover:bg-red-500/5" 
                                  : "bg-[#FF8C42] text-white border-none hover:bg-opacity-90"
                              }`}
                            >
                              {branch.isActive !== false ? "Deactivate" : "Activate"}
                            </button>

                            <button
                              onClick={() => openBranchModal(branch)}
                              className="p-1.5 bg-white hover:bg-[#FFF8F2] border border-gray-200 text-gray-600 hover:text-[#FF8C42] rounded-lg transition-all cursor-pointer"
                              title="Edit Branch Outlet"
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              onClick={() => handleDeleteBranch(branch._id || branch.id || "", branch.name)}
                              className="p-1.5 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg transition-all cursor-pointer"
                              title="Delete Branch"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ==================== 7. USERS MANAGEMENT ==================== */}
              {activeTab === "users" && isSuperAdmin && (
                <div className="space-y-6 animate-fadeIn text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-playfair font-black text-2xl text-[#1A0A00]">User Management</h3>
                      <p className="text-xs text-[#9A7B5E]">Manage admin and moderator accounts, roles, and outlet access permissions.</p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingUser(null);
                        setUserFormUsername("");
                        setUserFormPassword("");
                        setUserFormRole("moderator");
                        setUserFormOutletAccess([]);
                        setIsUserModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white rounded-full text-xs font-black shadow-md shadow-[#D72B2B]/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Plus size={14} />
                      Add User
                    </button>
                  </div>

                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="w-8 h-8 rounded-full border-2 border-t-[#D72B2B] border-gray-200 animate-spin" />
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-[#D72B2B]/10">
                      <User size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="font-bold text-[#1A0A00]">No users found</p>
                      <p className="text-xs text-[#9A7B5E] mt-1">Create your first moderator account above.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-[#D72B2B]/10 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-[#FFF8F2] border-b border-[#D72B2B]/10">
                              <th className="text-left px-4 py-3 font-black text-[#9A7B5E] uppercase tracking-wider">Username</th>
                              <th className="text-left px-4 py-3 font-black text-[#9A7B5E] uppercase tracking-wider">Role</th>
                              <th className="text-left px-4 py-3 font-black text-[#9A7B5E] uppercase tracking-wider">Outlet Access</th>
                              <th className="text-left px-4 py-3 font-black text-[#9A7B5E] uppercase tracking-wider">Status</th>
                              <th className="text-right px-4 py-3 font-black text-[#9A7B5E] uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((u: any) => (
                              <tr key={u._id} className="border-b border-gray-100 hover:bg-[#FFF8F2]/50 transition-colors">
                                <td className="px-4 py-3 font-bold text-[#1A0A00]">{u.username}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                    u.role === "superadmin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                  }`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-[#9A7B5E]">
                                  {u.outletAccess && u.outletAccess.length > 0
                                    ? u.outletAccess.join(", ")
                                    : "All outlets"}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black ${
                                    u.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                                  }`}>
                                    {u.isActive !== false ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingUser(u);
                                        setUserFormUsername(u.username);
                                        setUserFormPassword("");
                                        setUserFormRole(u.role);
                                        setUserFormOutletAccess(u.outletAccess || []);
                                        setIsUserModalOpen(true);
                                      }}
                                      className="px-2.5 py-1.5 text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-150 rounded-lg hover:bg-blue-100 transition-all cursor-pointer"
                                    >
                                      <Edit2 size={10} />
                                    </button>
                                    <button
                                      onClick={() => handleToggleUser(u._id)}
                                      className="px-2.5 py-1.5 text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all cursor-pointer"
                                    >
                                      {u.isActive !== false ? <EyeOff size={10} /> : <Eye size={10} />}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(u._id, u.username)}
                                      className="px-2.5 py-1.5 text-[9px] font-black bg-red-50 text-red-700 border border-[#D72B2B]/20 rounded-lg hover:bg-red-100 transition-all cursor-pointer"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </main>

          {/* ==================== CREATION & SELECTION MODAL ==================== */}
          {isMenuModalOpen && (
            <div className="fixed inset-0 bg-[#1A0A00]/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-white rounded-3xl border border-[#D72B2B]/10 p-6 md:p-8 space-y-6 shadow-2xl relative animate-scaleUp max-h-[90vh] overflow-y-auto">
                
                <button
                  onClick={() => setIsMenuModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-[#1A0A00]"
                >
                  <CloseIcon size={20} />
                </button>

                <div>
                  <h3 className="font-playfair font-black text-xl text-[#1A0A00]">
                    {editingMenuItem ? "Edit Menu Recipe" : "Add Sized Recipe"}
                  </h3>
                  <p className="text-xs text-[#9A7B5E]">Configure catalog fields onto primary database index.</p>
                </div>

                <div className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-wider text-[#9A7B5E] mb-2">Item Name *</label>
                      <input 
                        type="text"
                        value={fieldName}
                        onChange={(e) => setFieldName(e.target.value)}
                        placeholder="e.g., Sizzler Fajita Special"
                        className="w-full bg-[#FFF8F2] border border-[#D72B2B]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F26522]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-wider text-[#9A7B5E] mb-2">Price (OMR) *</label>
                      <input 
                        type="number"
                        step="0.001"
                        value={fieldPrice}
                        onChange={(e) => setFieldPrice(e.target.value)}
                        placeholder="e.g., 3.250"
                        className="w-full bg-[#FFF8F2] border border-[#D72B2B]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F26522]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-wider text-[#9A7B5E] mb-2">Category *</label>
                      <select 
                        value={fieldCategory}
                        onChange={(e) => setFieldCategory(e.target.value)}
                        className="w-full bg-[#FFF8F2] border border-[#D72B2B]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F26522] cursor-pointer"
                      >
                        <option value="pizza">Pizza</option>
                        <option value="sides">Sides</option>
                        <option value="drinks">Drinks</option>
                        <option value="dessert">Dessert</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-wider text-[#9A7B5E] mb-2">Sub Category Tag</label>
                      <input 
                        type="text"
                        value={fieldSubcat}
                        onChange={(e) => setFieldSubcat(e.target.value)}
                        placeholder="e.g., Spicy Pizza"
                        className="w-full bg-[#FFF8F2] border border-[#D72B2B]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F26522]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-wider text-[#9A7B5E] mb-2">Ingredients Description</label>
                    <textarea 
                      value={fieldDesc}
                      onChange={(e) => setFieldDesc(e.target.value)}
                      placeholder="e.g., Creamy base, tender mushrooms, hand-pulled cheese..."
                      rows={3}
                      className="w-full bg-[#FFF8F2] border border-[#D72B2B]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F26522] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed border-gray-150 pt-4">
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-wider text-[#9A7B5E] mb-2 font-bold">Discount Price (OMR)</label>
                      <input 
                        type="number"
                        step="0.001"
                        value={fieldDiscountPrice}
                        onChange={(e) => {
                          setFieldDiscountPrice(e.target.value);
                          if (e.target.value && fieldPrice) {
                            const original = parseFloat(fieldPrice);
                            const current = parseFloat(e.target.value);
                            if (original > 0) {
                              const pct = Math.round(((original - current) / original) * 100);
                              setFieldDiscountPercentage(pct.toString());
                            }
                          } else {
                            setFieldDiscountPercentage("");
                          }
                        }}
                        placeholder="Leave empty for no discount"
                        className="w-full bg-[#FFF8F2] border border-[#D72B2B]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F26522]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-wider text-[#D72B2B] mb-2 font-black">Discount Percentage (%)</label>
                      <input 
                        type="number"
                        max="100"
                        value={fieldDiscountPercentage}
                        onChange={(e) => {
                          setFieldDiscountPercentage(e.target.value);
                          if (e.target.value && fieldPrice) {
                            const original = parseFloat(fieldPrice);
                            const pct = parseFloat(e.target.value);
                            const calculated = original - (original * pct / 100);
                            setFieldDiscountPrice(calculated.toFixed(3));
                          } else {
                            setFieldDiscountPrice("");
                          }
                        }}
                        placeholder="e.g., 20"
                        className="w-full bg-[#FFF8F2] border border-[#D72B2B]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F26522]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-wider text-[#9A7B5E] mb-2">Badge Custom Tag</label>
                      <select 
                        value={fieldBadge}
                        onChange={(e) => setFieldBadge(e.target.value)}
                        className="w-full bg-[#FFF8F2] border border-[#D72B2B]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F26522] cursor-pointer"
                      >
                        <option value="">None</option>
                        <option value="Bestseller">🥇 Bestseller</option>
                        <option value="New">🌱 Fresh New</option>
                        <option value="🌶️ Spicy">🌶️ Spicy Inferno</option>
                        <option value="Chef's Pick">👨‍🍳 Chef's Pick</option>
                      </select>
                    </div>
                    <div>
                      <ImageUploader
                        id="recipe-image-upload"
                        imageUrl={fieldImage}
                        onChange={setFieldImage}
                        onShowToast={onShowToast}
                        token={token}
                        label="Recipe Image"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 py-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#3D1F00] cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={fieldAvailable}
                        onChange={(e) => setFieldAvailable(e.target.checked)}
                        className="w-4 h-4 rounded-sm border-[#D72B2B]/30 focus:ring-0 text-[#D72B2B] accent-[#D72B2B] cursor-pointer"
                      />
                      Show on Active Menu
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-[#3D1F00] cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={fieldFeatured}
                        onChange={(e) => setFieldFeatured(e.target.checked)}
                        className="w-4 h-4 rounded-sm border-[#D72B2B]/30 focus:ring-0 text-[#D72B2B] accent-[#D72B2B] cursor-pointer"
                      />
                      Feature on Home Spotlights
                    </label>
                  </div>

                </div>

                <div className="pt-4 flex gap-3 border-t border-gray-100">
                  <button
                    onClick={() => setIsMenuModalOpen(false)}
                    className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-[#9A7B5E] text-xs font-black rounded-full cursor-pointer"
                  >
                    Cancel Setup
                  </button>
                  <button
                    onClick={handleSaveMenuItem}
                    className="flex-2 py-3 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white text-xs font-black rounded-full shadow-lg shadow-[#D72B2B]/25 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Save Operational Recipe
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ==================== BANNER DIALOG MODAL ==================== */}
          {isBannerModalOpen && (
            <div className="fixed inset-0 bg-[#1A0A00]/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-white rounded-3xl border border-[#D72B2B]/10 p-6 md:p-8 space-y-6 shadow-2xl relative animate-scaleUp max-h-[90vh] overflow-y-auto">
                
                <button
                  onClick={() => setIsBannerModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-[#1A0A00] p-1.5 hover:bg-gray-100 rounded-full transition-all cursor-pointer"
                >
                  <CloseIcon size={18} />
                </button>

                <div className="space-y-1 text-left">
                  <h3 className="font-playfair font-black text-xl text-[#1A0A00]">
                    {editingBanner ? "✏️ Edit Advertisement Slide" : "✨ Create New Banner Slide"}
                  </h3>
                  <p className="text-xs text-[#9A7B5E]">Design custom slider items with badges, overlays, and redirects.</p>
                </div>

                <div className="space-y-4 text-left">
                  
                  {/* Badge & Style Pattern row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#1A0A00] uppercase tracking-wider block">Badge tag (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g., Arabic & Italian Flavour"
                        value={bannerBadge}
                        onChange={(e) => setBannerBadge(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#1A0A00] uppercase tracking-wider block">Visual Template Format</label>
                      <select
                        value={bannerStylePattern}
                        onChange={(e: any) => setBannerStylePattern(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none cursor-pointer font-bold"
                      >
                        <option value="attached">Attached Flier Layout (Left content / right asset)</option>
                        <option value="classic">Classic Minimal Backdrop (Clean full card banner)</option>
                        <option value="modern">Modern Glassmorphic Card Overlay</option>
                        <option value="fullImage">🖼️ Photoshop Custom Banner (Full clickable image, no overlay text)</option>
                      </select>
                    </div>
                  </div>

                  {/* Banner Placement Section */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#1A0A00] uppercase tracking-wider block">Placement Section / Category</label>
                    <select
                      value={bannerType}
                      onChange={(e: any) => setBannerType(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none cursor-pointer font-bold"
                    >
                      <option value="all">Both (Hero Slideshow & Special Deals)</option>
                      <option value="hero">Hero Slideshow Only (Top Header Carousel)</option>
                      <option value="offer">Special Offers & Hot Combos Only (Horizontal Shelf)</option>
                    </select>
                    <span className="text-[10px] text-[#9A7B5E] block font-medium">Choose where this promotional banner displays. Hero is the larger slider, Offer is the smaller carousel cards.</span>
                  </div>

                  {/* Heading Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-[#1A0A00] uppercase tracking-wider block">Banner Heading / Title *</label>
                    <input
                      type="text"
                      placeholder="e.g., BOLD FLAVOURS. UNFORGETTABLE Moments."
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
                      required
                    />
                  </div>

                  {/* Subtitle / Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-[#1A0A00] uppercase tracking-wider block">Banner Bullet description</label>
                    <textarea
                      placeholder="e.g., Authentic Arabic & Italian flavours crafted with premium ingredients and passion."
                      value={bannerSubtitle}
                      onChange={(e) => setBannerSubtitle(e.target.value)}
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none resize-none"
                    />
                  </div>

                  {/* Background Image URL */}
                  <div className="space-y-1.5">
                    <ImageUploader
                      id="banner-image-upload"
                      imageUrl={bannerImage}
                      onChange={setBannerImage}
                      onShowToast={onShowToast}
                      token={token}
                      label="Promotion Background Image"
                    />
                  </div>

                  {/* Button redirect actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#1A0A00] uppercase tracking-wider block">CTA Button Label</label>
                      <input
                        type="text"
                        placeholder="e.g., Order Now"
                        value={bannerButtonText}
                        onChange={(e) => setBannerButtonText(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#1A0A00] uppercase tracking-wider block">Redirect Anchor hash / link</label>
                      <input
                        type="text"
                        placeholder="e.g., #menu"
                        value={bannerButtonLink}
                        onChange={(e) => setBannerButtonLink(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Active Toggle Switch */}
                  <div className="pt-2 flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-[#1A0A00] uppercase tracking-wider block">Publish Slide immediately</span>
                      <span className="text-[10px] text-[#9A7B5E] block">Toggle whether to active stream this banner context in customer frame.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBannerIsActive(!bannerIsActive)}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${
                        bannerIsActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                          bannerIsActive ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsBannerModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-full text-xs font-bold transition-all cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveBanner}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white rounded-full text-xs font-black shadow-md shadow-[#D72B2B]/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {editingBanner ? "Save Updates" : "Publish Slide"}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ==================== PROMO DIALOG MODAL ==================== */}
          {isPromoModalOpen && (
            <div className="fixed inset-0 bg-[#1A0A00]/55 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-left">
              <div className="w-full max-w-sm bg-white rounded-3xl border border-[#D72B2B]/10 p-6 md:p-8 space-y-6 shadow-2xl relative animate-scaleUp max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setIsPromoModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-[#1A0A00] p-1.5 hover:bg-gray-100 rounded-full transition-all cursor-pointer"
                >
                  <CloseIcon size={18} />
                </button>

                <div className="space-y-1">
                  <h3 className="font-playfair font-black text-xl text-[#1A0A00]">
                    {editingPromo ? "✏️ Edit Coupon Code" : "🎫 Create New Promotion Code"}
                  </h3>
                  <p className="text-xs text-[#9A7B5E]">Configure live database coupon attributes for customers checkout page.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-[#1A0A00] uppercase block">Coupon Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. CITYPIZZA20"
                      value={promoCodeState}
                      onChange={(e) => setPromoCodeState(e.target.value.toUpperCase().trim())}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none font-bold placeholder:font-normal uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-[#1A0A00] uppercase block">Discount Formula</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPromoDiscountType("percentage")}
                        className={`py-2 px-3 text-xs rounded-xl border text-center font-bold tracking-tight transition-all ${
                          promoDiscountType === "percentage"
                            ? "bg-[#D72B2B]/15 border-[#D72B2B] text-[#D72B2B]"
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        Percentage Off (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPromoDiscountType("flat")}
                        className={`py-2 px-3 text-xs rounded-xl border text-center font-bold tracking-tight transition-all ${
                          promoDiscountType === "flat"
                            ? "bg-[#D72B2B]/15 border-[#D72B2B] text-[#D72B2B]"
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        Flat Off (OMR)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#1A0A00] uppercase block">
                        Value {promoDiscountType === "percentage" ? "(%)" : "(OMR)"} *
                      </label>
                      <input
                        type="number"
                        step={promoDiscountType === "flat" ? "0.05" : "1"}
                        placeholder={promoDiscountType === "percentage" ? "e.g. 15" : "e.g. 1.500"}
                        value={promoDiscountValue}
                        onChange={(e) => setPromoDiscountValue(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#1A0A00] uppercase block">Min Cart Total (OMR)</label>
                      <input
                        type="number"
                        step="0.05"
                        placeholder="e.g. 5.000 (0 if none)"
                        value={promoMinOrder}
                        onChange={(e) => setPromoMinOrder(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <div>
                      <span className="text-xs font-black text-[#1A0A00] uppercase block">Publish status</span>
                      <span className="text-[10px] text-gray-400">If paused, customers cannot redeem this code.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPromoActive(!promoActive)}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${
                        promoActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                          promoActive ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsPromoModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-full text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePromo}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white rounded-full text-xs font-black shadow-md shadow-[#D72B2B]/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {editingPromo ? "Save Changes" : "Create Code"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== BRANCH DIALOG MODAL ==================== */}
          {isBranchModalOpen && (
            <div className="fixed inset-0 bg-[#1A0A00]/55 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-left">
              <div className="w-full max-w-lg bg-white rounded-3xl border border-[#D72B2B]/10 p-6 md:p-8 space-y-6 shadow-2xl relative animate-scaleUp max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setIsBranchModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-[#1A0A00] p-1.5 hover:bg-gray-100 rounded-full transition-all cursor-pointer"
                >
                  <CloseIcon size={18} />
                </button>

                <div className="space-y-1">
                  <h3 className="font-playfair font-black text-xl text-[#1A0A00]">
                    {editingBranch ? "✏️ Edit Branch Location" : "🏢 Create New Physical Branch"}
                  </h3>
                  <p className="text-xs text-[#9A7B5E]">Configure live database outlet attributes for customers site.</p>
                </div>

                <div className="space-y-4">
                  {/* Row 1: Name and Hours */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#1A0A00] uppercase block">Branch Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Nizwa"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#1A0A00] uppercase block">Opening Hours</label>
                      <input
                        type="text"
                        placeholder="e.g. Daily 11 AM – 11 PM"
                        value={branchHours}
                        onChange={(e) => setBranchHours(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone and WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#1A0A00] uppercase block">Contact Phone *</label>
                      <input
                        type="text"
                        placeholder="e.g. 96928714"
                        value={branchPhone}
                        onChange={(e) => setBranchPhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#1A0A00] uppercase block">WhatsApp Ordering *</label>
                      <input
                        type="text"
                        placeholder="e.g. 96928714"
                        value={branchWhatsapp}
                        onChange={(e) => setBranchWhatsapp(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Row 3: Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-[#1A0A00] uppercase block">Full Address *</label>
                    <textarea
                      placeholder="e.g. Firq near Nizwa Grand Mall, Nizwa, Oman"
                      value={branchAddress}
                      onChange={(e) => setBranchAddress(e.target.value)}
                      rows={2}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none resize-none"
                    />
                  </div>

                  {/* Row 4: Google Maps Link & Map Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#1A0A00] uppercase block">Google Maps Link (Map)</label>
                      <input
                        type="text"
                        placeholder="e.g. https://maps.google.com/..."
                        value={branchMap}
                        onChange={(e) => setBranchMap(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#1A0A00] uppercase block">Coords/Geo (Short location name)</label>
                      <input
                        type="text"
                        placeholder="e.g. Nizwa"
                        value={branchGeo}
                        onChange={(e) => setBranchGeo(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 5: Image Uploader */}
                  <div className="space-y-1.5">
                    <ImageUploader
                      id="branch-image-upload"
                      imageUrl={branchImage}
                      onChange={setBranchImage}
                      onShowToast={onShowToast}
                      token={token}
                      label="Branch Optional Image Cover"
                    />
                  </div>

                  {/* Row 6: Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <div>
                        <span className="text-xs font-black text-[#1A0A00] uppercase block">Delivery Status</span>
                        <span className="text-[10px] text-gray-400">Available for delivery?</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBranchDelivery(!branchDelivery)}
                        className={`w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${
                          branchDelivery ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                            branchDelivery ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <div>
                        <span className="text-xs font-black text-[#1A0A00] uppercase block">Branch Status</span>
                        <span className="text-[10px] text-gray-400">Published to customers?</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBranchActive(!branchActive)}
                        className={`w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${
                          branchActive ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                            branchActive ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsBranchModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-full text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBranch}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white rounded-full text-xs font-black shadow-md shadow-[#D72B2B]/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {editingBranch ? "Save Changes" : "Create Branch"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== USER CREATION / EDIT MODAL ==================== */}
          {isUserModalOpen && (
            <div className="fixed inset-0 bg-[#1A0A00]/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white rounded-3xl border border-[#D72B2B]/10 p-6 md:p-8 space-y-6 shadow-2xl relative animate-scaleUp max-h-[90vh] overflow-y-auto">
                
                <button
                  onClick={() => setIsUserModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-[#1A0A00]"
                >
                  <CloseIcon size={20} />
                </button>

                <div>
                  <h3 className="font-playfair font-black text-xl text-[#1A0A00]">
                    {editingUser ? "Edit User" : "Add New User"}
                  </h3>
                  <p className="text-xs text-[#9A7B5E]">
                    {editingUser ? "Update user role, outlet access, or reset password." : "Create a new moderator or admin account."}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-[#1A0A00] uppercase block">Username *</label>
                    <input
                      type="text"
                      placeholder="e.g. branch_moderator"
                      value={userFormUsername}
                      onChange={(e) => setUserFormUsername(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-[#1A0A00] uppercase block">
                      {editingUser ? "New Password (leave blank to keep current)" : "Password *"}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={userFormPassword}
                      onChange={(e) => setUserFormPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-[#1A0A00] uppercase block">Role</label>
                    <select
                      value={userFormRole}
                      onChange={(e) => setUserFormRole(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
                    >
                      <option value="moderator">Moderator</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-[#1A0A00] uppercase block">Outlet Access</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(branches.length ? branches.map(b => b.name) : ["Nizwa", "Samail", "Sur", "Quriyat", "Fanja"]).map((outlet) => (
                        <label key={outlet} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={userFormOutletAccess.includes(outlet)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setUserFormOutletAccess([...userFormOutletAccess, outlet]);
                              } else {
                                setUserFormOutletAccess(userFormOutletAccess.filter((o) => o !== outlet));
                              }
                            }}
                            className="rounded border-gray-300 text-[#D72B2B] focus:ring-[#D72B2B]"
                          />
                          <span className="text-xs font-bold text-[#1A0A00]">{outlet}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#9A7B5E] mt-1">Leave all unchecked for full access (superadmin only).</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-full text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingUser ? handleUpdateUser : handleCreateUser}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white rounded-full text-xs font-black shadow-md shadow-[#D72B2B]/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {editingUser ? "Save Changes" : "Create User"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
