import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Search, Loader2, Package, Flame, Truck, CheckCircle2, XCircle, Clock, MapPin, ChevronRight, History, Bell, BellOff, Volume2, RefreshCw } from "lucide-react";
import { Order } from "../types";

interface OrderTrackerProps {
  initialOrderId?: string;
  onShowToast: (msg: string) => void;
  isDarkMode?: boolean;
}

export default function OrderTracker({ initialOrderId = "", onShowToast, isDarkMode }: OrderTrackerProps) {
  const [searchId, setSearchId] = useState(initialOrderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<string[]>([]);

  // Push notifications and polling status States
  const [isPolling, setIsPolling] = useState(false);
  const [lastPolledAt, setLastPolledAt] = useState<Date | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<"default" | "granted" | "denied">("default");

  // Keep state reference to avoid stale closures in background timers
  const orderRef = useRef<Order | null>(null);
  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  // Load recent tracked orders from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pizza_city_recent_tracked_orders");
      if (stored) {
        setRecentOrders(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save new tracked order to recent order list
  const addToRecentOrders = (id: string) => {
    try {
      const stored = localStorage.getItem("pizza_city_recent_tracked_orders");
      let currentList: string[] = stored ? JSON.parse(stored) : [];
      if (!currentList.includes(id)) {
        currentList = [id, ...currentList].slice(0, 5); // Keep last 5 tracked
        localStorage.setItem("pizza_city_recent_tracked_orders", JSON.stringify(currentList));
        setRecentOrders(currentList);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeRecentOrder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = recentOrders.filter(o => o !== id);
      localStorage.setItem("pizza_city_recent_tracked_orders", JSON.stringify(updated));
      setRecentOrders(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const trackOrder = async (idToTrack: string) => {
    if (!idToTrack.trim()) {
      onShowToast("⚠️ Please enter a valid Order ID or Code.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track/${idToTrack.trim()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Order not found. Please verify the ID.");
      }

      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        addToRecentOrders(idToTrack.trim());
      } else {
        throw new Error("Unable to read tracking data from server response.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Unable to locate order reference.");
      onShowToast(`❌ Tracking Failed: ${err.message || "Order not found"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Synchronize browser notification permission on load
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Request browser Notification permissions
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      onShowToast("⚠️ Desktop notifications are not supported by your current browser.");
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === "granted") {
        onShowToast("🎉 Browser alerts activated! We will ping you for status milestones.");
        playChime();
        try {
          new Notification("🍕 Pizza City Alerts Enabled", {
            body: "You will receive desktop alerts whenever your pizza changes states!",
            icon: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=128&q=80"
          });
        } catch (e) {
          console.warn("Direct notification creation rejected in this frame context.", e);
        }
      } else if (perm === "denied") {
        onShowToast("ℹ️ Notifications declined. We will rely on on-screen toasts.");
      }
    } catch (err) {
      console.error("Failed requesting notification permissions:", err);
    }
  };

  // Synthesize a retro 3-tone chime for real-time alerts
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur - 0.02);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      };

      // Play major ascending success chime
      playTone(523.25, 0.0, 0.15);  // C5
      playTone(659.25, 0.12, 0.15); // E5
      playTone(783.99, 0.24, 0.35); // G5
    } catch (err) {
      console.warn("AudioContext tone blocked or unsupported in preview frame context:", err);
    }
  };

  const formatStatusName = (status: string) => {
    switch (status) {
      case "pending": return "Order Placed / Pending";
      case "preparing": return "Baking & Preparing";
      case "out-for-delivery": return "Out for Delivery";
      case "delivered": return "Delivered & Savoring";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  // Trigger sound chimes + visual toasts + browser push announcements
  const triggerNotification = (title: string, message: string) => {
    playChime();
    onShowToast(`🔔 ${title}: ${message}`);
    
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body: message,
          icon: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=128&q=80",
          tag: "pizza-city-alert"
        });
      } catch (err) {
        console.warn("Permission granted but push construction blocked by sandbox frame context:", err);
      }
    }
  };

  // Silent background status poller
  const silentPoll = async () => {
    const currentOrder = orderRef.current;
    if (!currentOrder) return;
    
    setIsPolling(true);
    try {
      const res = await fetch(`/api/orders/track/${currentOrder._id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          const newStatus = data.order.status;
          const oldStatus = currentOrder.status;

          // Alert only if there is a distinct state bump
          if (oldStatus !== newStatus) {
            if (oldStatus === "preparing" && newStatus === "out-for-delivery") {
              triggerNotification(
                "🚀 Out for Delivery!",
                `Awesome! Your delicious order is on its way from the Pizza City ${data.order.outlet} branch!`
              );
            } else {
              triggerNotification(
                `🍕 Status Updated: ${formatStatusName(newStatus)}`,
                `Your order transitioned from ${formatStatusName(oldStatus)} to ${formatStatusName(newStatus)}.`
              );
            }
            setOrder(data.order);
          }
          setLastPolledAt(new Date());
        }
      }
    } catch (err) {
      console.warn("Silent polling error:", err);
    } finally {
      setIsPolling(false);
    }
  };

  // Automated background polling trigger for non-terminal statuses
  useEffect(() => {
    const activeOrder = order;
    if (!activeOrder || activeOrder.status === "delivered" || activeOrder.status === "cancelled") {
      return;
    }

    // Run custom silent poll every 8 seconds
    const intervalId = setInterval(() => {
      silentPoll();
    }, 8000);

    return () => clearInterval(intervalId);
  }, [order?._id, order?.status]);

  useEffect(() => {
    if (initialOrderId) {
      setSearchId(initialOrderId);
      trackOrder(initialOrderId);
    }
  }, [initialOrderId]);

  // Status mapping to steps
  const getStatusStep = (status: string) => {
    switch (status) {
      case "pending": return 0;
      case "preparing": return 1;
      case "out-for-delivery": return 2;
      case "delivered": return 3;
      default: return -1;
    }
  };

  const currentStep = order ? getStatusStep(order.status) : -1;
  const isCancelled = order?.status === "cancelled";

  const steps = [
    { title: "Order Placed", desc: "Awaiting approval", icon: Package },
    { title: "Baking & Cooking", desc: "In the hot stone oven", icon: Flame },
    { title: "Out for Delivery", desc: "Fast & fresh transit", icon: Truck },
    { title: "Savoring!", desc: "Delivered to your door", icon: CheckCircle2 }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-left">
      {/* Header section with branding accent */}
      <div className="text-center md:text-left space-y-2 mb-8">
        <span className="inline-block bg-[#D72B2B]/10 text-[#D72B2B] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
          Realtime Pizza City Transit Tracker
        </span>
        <h2 className="font-playfair font-black text-3xl md:text-4xl text-[#1A0A00]">
          Track Your Hot Slice
        </h2>
        <p className="text-xs text-[#9A7B5E] max-w-xl leading-relaxed">
          Enter your 6-character order code or the full order ID from your WhatsApp message to monitor your gourmet wood-fired pizza assembly in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Search controls row (Span 5 on large) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs flex flex-col gap-4">
            <h3 className="font-playfair font-black text-lg text-[#1A0A00] flex items-center gap-2">
              <Search size={18} className="text-[#D72B2B]" />
              Track Order Status
            </h3>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., ord_17178000 or last 6 characters..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && trackOrder(searchId)}
                  className="w-full bg-[#FFF8F2] border border-[#D72B2B]/20 rounded-2xl pl-4 pr-12 py-3.5 text-xs text-[#3D1F00] font-bold focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522] placeholder-gray-400"
                  id="order-tracker-search-input"
                />
                <button
                  type="button"
                  onClick={() => trackOrder(searchId)}
                  disabled={isLoading}
                  className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white px-3.5 rounded-xl flex items-center justify-center transition-all cursor-pointer hover:scale-[1.02] active:scale-98 disabled:opacity-50"
                  id="order-tracker-submit-btn"
                  title="Search order reference code"
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={16} className="stroke-[3]" />}
                </button>
              </div>

              <p className="text-[10px] text-[#9A7B5E] font-medium leading-relaxed pl-1">
                📌 Your unique reference can be found inside the pre-filled checkout request or direct order verification message.
              </p>
            </div>
          </div>

          {/* Notification & Sound Live Prefs Card */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-playfair font-black text-sm text-[#1A0A00] flex items-center gap-1.5">
                <Bell size={16} className="text-[#F26522]" />
                Live Status Watcher
              </h3>
              
              <div className="flex items-center gap-1.5">
                {isPolling ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-emerald-600 font-extrabold uppercase">Watching</span>
                  </span>
                ) : order && order.status !== "delivered" && order.status !== "cancelled" ? (
                  <span className="text-[9px] font-mono text-emerald-500 font-black animate-pulse uppercase">Polling Enabled</span>
                ) : null}
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <p className="text-[11px] text-[#9A7B5E] leading-relaxed">
                Receive visual push alerts, on-screen dynamic toasts, and status chimes when your pizza changes state (especially when cooking completes & goes in-transit).
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {/* Enable push permission button */}
                {notificationPermission === "granted" ? (
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-150 text-[10px] font-black px-3 py-1.5 rounded-xl">
                    <Bell size={12} className="text-emerald-600" />
                    Push Alerts Enabled
                  </div>
                ) : notificationPermission === "denied" ? (
                  <div className="flex items-center gap-1.5 bg-red-50 text-red-800 border border-red-150 text-[10px] font-black px-3 py-1.5 rounded-xl" title="Please enable notifications from site settings">
                    <BellOff size={12} strokeWidth={2.5} />
                    Push Alerts Blocked
                  </div>
                ) : (
                  <button
                    onClick={requestNotificationPermission}
                    className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100/80 text-orange-850 border border-orange-200/50 text-[10px] font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    <Bell size={12} className="animate-bounce" />
                    Request Push Permission
                  </button>
                )}

                {/* Test Chime button */}
                <button
                  type="button"
                  onClick={playChime}
                  className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-850 border border-slate-200/50 text-[10px] font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  title="Test alert sound chime"
                >
                  <Volume2 size={12} className="text-slate-600" />
                  Test Chime Sound
                </button>
              </div>

              {/* Poller log metadata */}
              {order && order.status !== "delivered" && order.status !== "cancelled" ? (
                <div className="pt-2 border-t border-gray-100 text-[10px] text-gray-400 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>Checking Status:</span>
                    <span className="font-mono text-slate-500">Every 8 seconds</span>
                  </div>
                  {lastPolledAt && (
                    <div className="flex items-center justify-between">
                      <span>Last connection:</span>
                      <span className="font-mono text-gray-500">
                        {lastPolledAt.toLocaleTimeString("en-US", { hour12: false })}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-100 text-[9px] text-[#9A7B5E] italic">
                  * Poller will auto-awaken as soon as you track a pending or active transit order ticket.
                </div>
              )}
            </div>
          </div>

          {/* Recent tracked orders helper list */}
          {recentOrders.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-[#9A7B5E] flex items-center gap-1.5 matches-label">
                  <History size={12} />
                  Recently Tracked Orders
                </h4>
                <button
                  onClick={() => {
                    localStorage.removeItem("pizza_city_recent_tracked_orders");
                    setRecentOrders([]);
                  }}
                  className="text-[9px] font-black text-red-500 hover:underline hover:text-red-700 font-sans"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2">
                {recentOrders.map((id) => (
                  <div
                    key={id}
                    onClick={() => {
                      setSearchId(id);
                      trackOrder(id);
                    }}
                    className="flex items-center justify-between bg-orange-50/30 hover:bg-[#FFF8F2] border border-[#D72B2B]/5 rounded-xl p-3 text-xs cursor-pointer text-[#1A0A00] font-bold group transition-all"
                  >
                    <span className="font-mono text-gray-500 group-hover:text-[#D72B2B] transition-colors">
                      {id.slice(-8)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-red-50 text-[#D72B2B] border border-red-100 px-2 py-0.5 rounded-md font-black">
                        Track Now
                      </span>
                      <button
                        onClick={(e) => removeRecentOrder(id, e)}
                        className="text-gray-400 hover:text-red-500 p-0.5 transition-colors"
                        title="Remove from history"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Display area (Span 7) */}
        <div className="lg:col-span-7">
          {isLoading ? (
            <div className="bg-white rounded-[2rem] border border-gray-150 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xs min-h-[350px]">
              <div className="w-12 h-12 rounded-full border-4 border-t-[#D72B2B] border-orange-50 animate-spin flex items-center justify-center" />
              <div className="space-y-1">
                <p className="font-playfair font-black text-lg text-[#1A0A00]">Connecting to kitchen network...</p>
                <p className="text-xs text-[#9A7B5E]">Retrieving latest oven coordinates and logistics status...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-[2rem] border border-red-100 p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-xs min-h-[350px]">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                <XCircle size={32} />
              </div>
              <div className="space-y-2 max-w-sm">
                <p className="font-playfair font-black text-lg text-red-950">Oops! Order Not Found</p>
                <p className="text-xs text-[#9A7B5E] leading-relaxed">
                  {error}
                </p>
                <p className="text-[11px] text-gray-400 pt-2 leading-relaxed">
                  Make sure you didn't leave out any character, or check with your Branch Representative if the order was submitted directly over the phone!
                </p>
              </div>
            </div>
          ) : order ? (
            <div className="bg-white rounded-[2rem] border border-gray-150 overflow-hidden shadow-xs">
              {/* Tracker Top Ribbon */}
              <div className="bg-gradient-to-r from-[#D72B2B] to-[#F26522] p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-white/20 border border-white/30 text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      ID Suffix: {order._id.slice(-6)}
                    </span>
                    {isCancelled && (
                      <span className="text-[9px] bg-red-600 border border-red-400 text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        CANCELLED
                      </span>
                    )}
                  </div>
                  <h4 className="font-playfair font-black text-xl">
                    Order for {order.customer.name}
                  </h4>
                </div>

                <div className="text-left sm:text-right space-y-0.5 select-none shrink-0 border-l sm:border-l-0 sm:border-r border-white/20 pl-4 sm:pl-0 sm:pr-4">
                  <p className="text-[10px] text-orange-200 font-extrabold uppercase tracking-wider">Branch Outlet</p>
                  <p className="text-sm font-black flex items-center gap-1.5">
                    <MapPin size={14} className="text-orange-200" />
                    Pizza City {order.outlet}
                  </p>
                </div>
              </div>

              {/* Physical Progress Flow timeline */}
              <div className="p-6 md:p-8 space-y-8">
                {isCancelled ? (
                  <div className="bg-red-50 border border-red-150 rounded-2xl p-4 flex gap-4 items-start">
                    <XCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                    <div className="space-y-1 text-left">
                      <p className="font-extrabold text-xs text-red-950">This order has been cancelled</p>
                      <p className="text-[11px] text-[#9A7B5E] leading-relaxed">
                        If you believe this happened by mistake or would like to request adjustments, please dial the {order.outlet} branch hotline directly.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Background Progress bar line */}
                    <div className="absolute top-[22px] left-[20px] right-[20px] h-[3px] bg-gray-100 -z-0" />
                    
                    {/* Foreground Animated Progress bar line */}
                    <motion.div
                      className="absolute top-[22px] left-[20px] h-[3px] bg-[#D72B2B] -z-0"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    />

                    <div className="grid grid-cols-4 relative z-10">
                      {steps.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isDone = idx <= currentStep;
                        const isActive = idx === currentStep;

                        return (
                          <div key={idx} className="flex flex-col items-center text-center group">
                            {/* Round Node circle wrapper */}
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                              isDone 
                                ? "bg-[#D72B2B] text-white shadow-[#D72B2B]/20 shadow-md ring-4 ring-[#FFF8F2]" 
                                : "bg-white text-gray-400 border-2 border-gray-100"
                            }`}>
                              {isActive ? (
                                <motion.div
                                  animate={{ scale: [1, 1.15, 1] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                  <StepIcon size={18} className="stroke-[2.5]" />
                                </motion.div>
                              ) : (
                                <StepIcon size={18} className="stroke-[2.5]" />
                              )}
                            </div>

                            {/* Node Titles */}
                            <div className="mt-3.5 space-y-0.5 px-1">
                              <p className={`text-[11px] font-black leading-tight ${
                                isActive ? "text-[#D72B2B]" : isDone ? "text-[#1A0A00]" : "text-gray-400"
                              }`}>
                                {step.title}
                              </p>
                              <p className="hidden sm:block text-[9px] text-[#9A7B5E] font-medium leading-tight">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tracking status details block */}
                <div className="bg-neutral-50/70 border border-neutral-100 rounded-3xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200/60 text-xs">
                    <span className="text-gray-400 flex items-center gap-1.5 font-bold">
                      <Clock size={13} />
                      Placed on: {new Date(order.timestamp).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}
                    </span>
                    <span className="font-extrabold text-[#3D1F00]">
                      Total Ticket: <span className="text-[#D72B2B] font-black">OMR {order.total.toFixed(3)}</span>
                    </span>
                  </div>

                  {/* Order checklist breakdown */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] uppercase font-black text-[#9A7B5E] tracking-wider">Kitchen Ticket Contents:</h5>
                    
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-xs font-bold text-[#1A0A00]">
                          <div className="flex items-center gap-2">
                            <span className="bg-orange-50 text-[#D72B2B] font-black px-1.5 py-0.5 rounded text-[10px] min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <span>{item.name}</span>
                          </div>
                          <span className="text-gray-500 font-mono">OMR {(item.price * item.quantity).toFixed(3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Help assistance banner */}
                <div className="text-center pt-2">
                  <p className="text-[10px] text-[#9A7B5E] font-medium">
                    Questions about your assembly? Call Pizza City {order.outlet} branch immediately or message our support WhatsApp thread.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFF8F2] rounded-[2rem] border border-[#D72B2B]/10 p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[350px]">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#D72B2B] shadow-sm">
                <Package size={32} />
              </div>
              <div className="space-y-2 max-w-sm">
                <p className="font-playfair font-black text-xl text-[#1A0A00]">Ready to Track State</p>
                <p className="text-xs text-[#9A7B5E] leading-relaxed">
                  Input your 6-character order hash or full voucher reference key into the input container on the left to review realtime prep phases.
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-white text-[10px] font-black text-[#D72B2B] rounded-full border border-[#D72B2B]/20">
                    🍕 Live GPS & Oven Status Synchronization
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
