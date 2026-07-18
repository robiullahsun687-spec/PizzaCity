import React, { useState, useEffect } from "react";
import { X, Search, ShoppingCart, MessageSquare, MapPin, ChevronRight, Info, Plus, Minus, Phone } from "lucide-react";
import { MenuItem, OUTLETS, OutletName, CartEntry, Branch } from "../types";
import { getVolumeDiscountPercentage, getSizeAdjustedPrice } from "../lib/priceUtils";

interface OutletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartEntry[];
  onClearCart: () => void;
  onShowToast: (msg: string) => void;
  onUpdateCartItem: (index: number, newQty: number, newSize: "Small" | "Medium" | "Large") => void;
  onOrderSuccess?: (orderId: string) => void;
  branches?: Branch[];
}

export default function OutletSelector({
  isOpen,
  onClose,
  cart,
  onClearCart,
  onShowToast,
  onUpdateCartItem,
  onOrderSuccess,
  branches,
}: OutletSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState<string | null>(null);
  
  // Dynamic branches state
  const [localBranches, setLocalBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (branches && branches.length > 0) {
      setLocalBranches(branches.filter(b => b.isActive !== false));
      return;
    }
    setIsLoadingBranches(true);
    fetch("/api/branches")
      .then((r) => r.json())
      .then((data) => {
        setLocalBranches(data.filter((b: any) => b.isActive !== false));
      })
      .catch((err) => console.warn("Failed fetching active branches:", err))
      .finally(() => setIsLoadingBranches(false));
  }, [isOpen, branches]);

  // Customer details form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"checkout" | "outlet">("checkout"); // checkout info first, then choose outlet
  const [showSizeChartInCart, setShowSizeChartInCart] = useState(true);

  // Promo code states
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  if (!isOpen) return null;

  const hasPizzaItems = cart.some((entry) => entry.item.category === "pizza");

  const totalAmount = cart.reduce((sum, entry) => sum + entry.unitPrice * entry.quantity, 0);

  const discountAmount = appliedPromo
    ? (appliedPromo.discountType === "percentage"
        ? totalAmount * (appliedPromo.discountValue / 100)
        : appliedPromo.discountValue)
    : 0;

  const finalAmount = Math.max(0, totalAmount - discountAmount);

  // Group outlets based on search query
  const q = searchQuery.toLowerCase().trim();
  const filteredDynamicBranches = localBranches.filter((b) => {
    return (
      b.name.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q)
    );
  });

  const filteredOutletsKeys = (Object.keys(OUTLETS) as OutletName[]).filter((key) => {
    const outlet = OUTLETS[key];
    return (
      outlet.name.toLowerCase().includes(q) ||
      outlet.location.toLowerCase().includes(q)
    );
  });

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) {
      setPromoError("⚠️ Code cannot be empty.");
      return;
    }
    setIsValidatingPromo(true);
    setPromoError("");
    try {
      const response = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCodeInput.trim().toUpperCase(), cartTotal: totalAmount }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAppliedPromo(data.promo);
        onShowToast(`🎉 Code "${data.promo.code.toUpperCase()}" applied!`);
        setPromoError("");
      } else {
        setPromoError(data.error || "❌ Invalid code.");
        setAppliedPromo(null);
      }
    } catch (err) {
      setPromoError("⚡ Network error validating promo.");
      setAppliedPromo(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleClearPromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput("");
    setPromoError("");
  };

  const handleOrderSubmission = async (outletName: string) => {
    if (!customerName.trim()) {
      onShowToast("⚠️ Please enter your name.");
      setStep("checkout");
      return;
    }
    if (!customerPhone.trim()) {
      onShowToast("⚠️ Please enter your WhatsApp phone number.");
      setStep("checkout");
      return;
    }

    setIsSubmitting(true);
    onShowToast("🍕 Saving your order to database...");

    const orderPayload = {
      items: cart.map((entry) => ({
        name: entry.item.category === "pizza" ? `${entry.item.name} [Size: ${entry.size}]` : entry.item.name,
        price: entry.unitPrice,
        quantity: entry.quantity,
      })),
      customer: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail || undefined,
        notes: customerNotes || undefined,
      },
      outlet: outletName,
      promoCode: appliedPromo ? appliedPromo.code : undefined,
      promoDiscount: discountAmount > 0 ? discountAmount : undefined,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save order");
      }

      // Save order ID database references to local history automatically
      if (data.order && data.order._id) {
        try {
          const stored = localStorage.getItem("pizza_city_recent_tracked_orders");
          let currentList: string[] = stored ? JSON.parse(stored) : [];
          if (!currentList.includes(data.order._id)) {
            currentList = [data.order._id, ...currentList].slice(0, 5);
            localStorage.setItem("pizza_city_recent_tracked_orders", JSON.stringify(currentList));
          }
          localStorage.setItem("pizza_city_last_placed_order_id", data.order._id);
        } catch (e) {
          console.error("Local storage error:", e);
        }
      }

      onShowToast(`🎉 Order Placed! Opening WhatsApp for ${outletName}...`);
      
      // ⚡ Broadcast and dispatch new order event for live sync
      try {
        const bc = new BroadcastChannel("pizza_city_menu_channel");
        bc.postMessage({ type: "NEW_ORDER_PLACED", order: data.order });
        bc.close();
      } catch (e) {
        // sandbox safe fallback
      }
      window.dispatchEvent(new CustomEvent("pizza_city_new_order_placed", { detail: data.order }));

      // Delay slightly and open WhatsApp pre-filled text in new window
      setTimeout(() => {
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, "_blank");
        }
        onClearCart();
        // Reset states
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setCustomerNotes("");
        setPromoCodeInput("");
        setAppliedPromo(null);
        setPromoError("");
        setSelectedOutlet(null);
        setStep("checkout");
        onClose();
        
        // Switch view if callback is specified
        if (data.order && data.order._id && onOrderSuccess) {
          onOrderSuccess(data.order._id);
        }
      }, 1000);
    } catch (err: any) {
      console.error(err);
      onShowToast("❌ Error placing order: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div 
        id="outlet-modal"
        className="w-full max-w-lg bg-[#FFF8F2] rounded-3xl border border-[#D72B2B]/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="font-playfair font-black text-2xl text-[#1A0A00]">
              {step === "checkout" ? "Complete Your Order 🛒" : "Select Nearest Outlet 📍"}
            </h3>
            <p className="text-xs text-[#9A7B5E] mt-1">
              {step === "checkout" 
                ? "Enter your details to generate your database order & invoice" 
                : "Choose which Pizza City branch should prepare your order"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-[#3D1F00] flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* SIZE CHART TOGGLER & CARD — only for pizza items */}
          {hasPizzaItems && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setShowSizeChartInCart(!showSizeChartInCart)}
                className="text-xs font-black text-[#D72B2B] hover:text-[#F26522] flex items-center gap-1 bg-[#D72B2B]/5 px-3 py-1.5 rounded-full border border-[#D72B2B]/10 transition-all cursor-pointer"
              >
                📐 {showSizeChartInCart ? "Hide Size Chart & Info" : "View Size Chart & Info"}
              </button>
              <span className="text-[10px] font-black uppercase text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200/50">
                Bulk savings active!
              </span>
            </div>

            {showSizeChartInCart && (
              <div className="bg-white p-4 rounded-2xl border border-[#D72B2B]/15 shadow-sm space-y-3">
                <div className="grid grid-cols-3 gap-2.5 text-center text-[11px]">
                  <div className="bg-[#FFF8F2]/50 p-2 rounded-xl border border-[#D72B2B]/5 flex flex-col justify-between">
                    <span className="font-extrabold text-[#D72B2B]">Small (8")</span>
                    <span className="text-[9px] text-[#9A7B5E] mt-0.5">4 Slices · Personal Slice</span>
                    <span className="font-black text-[9px] mt-1 text-green-700 bg-green-50 py-0.5 rounded">20% Off Base</span>
                  </div>
                  <div className="bg-[#FFF8F2]/50 p-2 rounded-xl border border-[#D72B2B]/5 flex flex-col justify-between">
                    <span className="font-extrabold text-amber-600">Medium (11")</span>
                    <span className="text-[9px] text-[#9A7B5E] mt-0.5">6 Slices · 1-2 Persons</span>
                    <span className="font-black text-[9px] mt-1 text-gray-700 bg-gray-50 py-0.5 rounded">Standard Price</span>
                  </div>
                  <div className="bg-[#FFF8F2]/50 p-2 rounded-xl border border-[#D72B2B]/5 flex flex-col justify-between">
                    <span className="font-extrabold text-[#F26522]">Large (14")</span>
                    <span className="text-[9px] text-[#9A7B5E] mt-0.5">8 Slices · 3-4 Persons</span>
                    <span className="font-black text-[9px] mt-1 text-red-700 bg-red-50 py-0.5 rounded">Large modifier</span>
                  </div>
                </div>
                <div className="text-[10px] text-[#9A7B5E] border-t border-dashed border-gray-150 pt-2 leading-relaxed">
                  📢 <strong>Optimize Unit Rates with Bulk Volume:</strong> Buy 2 units → <strong>Save 5%</strong>. Buy 3-4 units → <strong>Save 8%</strong>. Buy 5+ units → <strong>Save 12% on final unit price!</strong>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Cart Summary Header */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3.5">
            <h4 className="font-bold text-sm text-[#1A0A00] flex items-center gap-2">
              <ShoppingCart size={16} className="text-[#D72B2B]" />
              Your Customized Cart ({cart.reduce((s, e) => s + e.quantity, 0)} items)
            </h4>
            
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cart.map((entry, index) => {
                const discountPercent = getVolumeDiscountPercentage(entry.quantity);
                const isDiscounted = discountPercent > 0;
                
                return (
                  <div key={index} className="bg-[#FFF8F2]/60 p-3 rounded-xl border border-[#D72B2B]/5 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-black text-xs text-[#1A0A00]">{entry.item.name}</h5>
                        <p className="text-[10px] text-[#9A7B5E] mt-0.5">
                          Base OMR {entry.item.price.toFixed(2)}
                          {entry.item.category === "pizza" && (
                            <> · Size: <span className="font-bold text-[#3D1F00]">{entry.size}</span></>
                          )}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="font-mono font-bold text-xs text-[#D72B2B]">
                          OMR {(entry.unitPrice * entry.quantity).toFixed(2)}
                        </span>
                        {isDiscounted && (
                          <span className="text-[9px] bg-green-100 text-green-700 font-extrabold px-1.5 py-0.5 rounded-full mt-0.5">
                            Saved {discountPercent}%!
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-dashed border-[#D72B2B]/5">
                      {/* Units option selector */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase text-[#9A7B5E]">Units:</span>
                        <div className="flex items-center bg-white rounded-lg border border-gray-200 p-0.5">
                          <button
                            onClick={() => onUpdateCartItem(index, entry.quantity - 1, entry.size)}
                            className="w-5 h-5 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded text-xs font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-extrabold text-[#1A0A00]">{entry.quantity}</span>
                          <button
                            onClick={() => onUpdateCartItem(index, entry.quantity + 1, entry.size)}
                            className="w-5 h-5 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Size Selector */}
                      {entry.item.category === "pizza" ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase text-[#9A7B5E]">Size:</span>
                          <select
                            value={entry.size}
                            onChange={(e) => onUpdateCartItem(index, entry.quantity, e.target.value as any)}
                            className="text-[10px] font-bold bg-white text-[#3D1F00] border border-gray-200 rounded-lg px-2 py-0.5 cursor-pointer focus:outline-none"
                          >
                            <option value="Small">Small (8")</option>
                            <option value="Medium">Medium (11")</option>
                            <option value="Large">Large (14")</option>
                          </select>
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-[#9A7B5E] bg-gray-100 px-2 py-0.5 rounded-full">
                          Standard Size
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Promo Code Coupon Area */}
            <div className="bg-[#FFF8F2] border border-[#FFF8F2]/60 rounded-2xl p-4 mt-4 space-y-3 text-left">
              <span className="text-xs font-black uppercase text-[#3D1F00] tracking-wider block">Have a Promo Coupon?</span>
              
              {!appliedPromo ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER CODE"
                    value={promoCodeInput}
                    onChange={(e) => {
                      setPromoCodeInput(e.target.value.toUpperCase());
                      setPromoError("");
                    }}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#F26522] uppercase font-bold placeholder:font-normal"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={isValidatingPromo}
                    className="px-4 py-2 bg-[#D72B2B] text-white rounded-xl text-xs font-black hover:bg-[#F26522] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isValidatingPromo ? "Applying" : "Apply"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50/70 border border-green-200/50 rounded-xl px-3.5 py-2.5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-green-700">Code Applied</span>
                    <p className="text-xs font-black text-green-800">{appliedPromo.code.toUpperCase()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearPromo}
                    className="text-[10px] font-black text-[#D72B2B] hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              {promoError && (
                <p className="text-[11px] font-bold text-red-650 leading-relaxed">{promoError}</p>
              )}
            </div>

            {/* Pricing calculations rows */}
            <div className="border-t border-dashed border-gray-200 mt-4 pt-4 space-y-2 font-bold text-[#1A0A00]">
              {appliedPromo && (
                <>
                  <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                    <span>Subtotal Price:</span>
                    <span className="font-mono">OMR {totalAmount.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-green-600 font-medium pb-2 border-b border-gray-150 border-dotted">
                    <span>Discount Applied:</span>
                    <span className="font-mono">- OMR {discountAmount.toFixed(3)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm">Total Optimized Price:</span>
                <span className="text-lg text-[#D72B2B] font-mono">OMR {finalAmount.toFixed(3)}</span>
              </div>
            </div>
          </div>

          {step === "checkout" ? (
            /* STEP 1: CUSTOMER DETAILS */
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3D1F00] uppercase tracking-wider mb-1.5">
                    Your Name <span className="text-[#D72B2B]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmad Al-Farsi"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-[#D72B2B]/20 rounded-xl px-4 py-3 text-sm focus:border-[#F26522] focus:outline-none focus:ring-1 focus:ring-[#F26522] text-[#3D1F00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3D1F00] uppercase tracking-wider mb-1.5">
                    WhatsApp Phone Number <span className="text-[#D72B2B]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 96896928714"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white border border-[#D72B2B]/20 rounded-xl px-4 py-3 text-sm focus:border-[#F26522] focus:outline-none focus:ring-1 focus:ring-[#F26522] text-[#3D1F00]"
                  />
                  <p className="text-[10px] text-[#9A7B5E] mt-1">
                    Enter numbers only including country code (e.g. 968XXXXXXXX).
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3D1F00] uppercase tracking-wider mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. customer@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-white border border-[#D72B2B]/20 rounded-xl px-4 py-3 text-sm focus:border-[#F26522] focus:outline-none focus:ring-1 focus:ring-[#F26522] text-[#3D1F00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3D1F00] uppercase tracking-wider mb-1.5">
                    Delivery Address &amp; Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter your home address or special prep details..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full bg-white border border-[#D72B2B]/20 rounded-xl px-4 py-3 text-sm focus:border-[#F26522] focus:outline-none focus:ring-1 focus:ring-[#F26522] text-[#3D1F00]"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (!customerName.trim() || !customerPhone.trim()) {
                    onShowToast("⚠️ Please enter both your Name and WhatsApp phone number.");
                    return;
                  }
                  setStep("outlet");
                }}
                className="w-full mt-4 py-3.5 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white rounded-full font-bold text-center shadow-lg shadow-[#D72B2B]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Proceed to Select Outlet 📍
              </button>
            </div>
          ) : (
            /* STEP 2: OUTLET SELECTOR */
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-white border border-[#D72B2B]/10 rounded-full px-4 py-2.5 shadow-sm">
                <Search size={16} className="text-[#9A7B5E]" />
                <input
                  type="text"
                  placeholder="Search city or branch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm focus:outline-none text-[#3D1F00]"
                />
              </div>

              <div className="space-y-3">
                {isLoadingBranches ? (
                  <p className="text-center text-xs text-[#9A7B5E] py-4">Synchronizing branch status indices...</p>
                ) : localBranches.length > 0 ? (
                  filteredDynamicBranches.length > 0 ? (
                    filteredDynamicBranches.map((branch) => (
                      <div
                        key={branch._id || branch.id}
                        onClick={() => handleOrderSubmission(branch.name)}
                        className="flex items-center gap-4 p-4 bg-white hover:bg-[#D72B2B]/5 rounded-2xl cursor-pointer border border-transparent hover:border-[#D72B2B]/20 transition-all shadow-sm active:scale-[0.98]"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D72B2B]/10 to-[#F26522]/10 border border-[#D72B2B]/10 flex items-center justify-center font-bold text-lg text-[#D72B2B]">
                          🍕
                        </div>
                        <div className="flex-1 text-left">
                          <h5 className="font-extrabold text-sm text-[#1A0A00]">
                            Pizza City — {branch.name}
                          </h5>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-[#9A7B5E]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                            <span>{branch.hours || "Open Now · Daily 11 AM - 11 PM"} · 📞 {branch.phone}</span>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#D72B2B] to-[#F26522] flex items-center justify-center text-white font-bold text-xs shadow-md">
                          →
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm text-[#9A7B5E] py-4">No matching active outlets found.</p>
                  )
                ) : filteredOutletsKeys.length > 0 ? (
                  filteredOutletsKeys.map((key) => {
                    const outlet = OUTLETS[key];
                    return (
                      <div
                        key={key}
                        onClick={() => handleOrderSubmission(key)}
                        className="flex items-center gap-4 p-4 bg-white hover:bg-[#D72B2B]/5 rounded-2xl cursor-pointer border border-transparent hover:border-[#D72B2B]/20 transition-all shadow-sm active:scale-[0.98]"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D72B2B]/10 to-[#F26522]/10 border border-[#D72B2B]/10 flex items-center justify-center font-bold text-lg text-[#D72B2B]">
                          🍕
                        </div>
                        <div className="flex-1 text-left">
                          <h5 className="font-extrabold text-sm text-[#1A0A00]">
                            Pizza City — {outlet.name}
                          </h5>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-[#9A7B5E]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                            <span>Open Now · {outlet.location} · 📞 +968 {outlet.phone}</span>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#D72B2B] to-[#F26522] flex items-center justify-center text-white font-bold text-xs shadow-md">
                          →
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-sm text-[#9A7B5E] py-4">No matching outlets found.</p>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep("checkout")}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-[#3D1F00] font-bold rounded-full text-sm transition-all"
                >
                  ← Edit Details
                </button>
              </div>
            </div>
          )}

          {/* Footer note info banner */}
          <div className="bg-[#F26522]/5 border border-[#F26522]/20 rounded-xl p-3 flex items-center gap-3 text-xs text-[#3D1F00]">
            <span className="text-lg flex-shrink-0">💬</span>
            <p className="leading-relaxed">
              Confirming order will securely save details to the Pizza City MongoDB cluster and redirect to WhatsApp to send the invoice automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
