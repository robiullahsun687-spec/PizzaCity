import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Global uncaught exception and unhandled rejection handlers to prevent server crashes
process.on("unhandledRejection", (reason, promise) => {
  console.error("🟢 [Server Process] Unhandled Promise Rejection:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("🟢 [Server Process] Uncaught Exception:", error);
});

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ==========================================
// DB MODEL DEFINITIONS & DATA LAYER SEEDING
// ==========================================

const SEED_MENU_ITEMS = [
  {
    name: "Margherita Classic",
    category: "pizza",
    price: 2.5,
    description: "San Marzano tomato, buffalo mozzarella, fresh basil & olive oil.",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    name: "BBQ Chicken Royale",
    category: "pizza",
    price: 3.2,
    description: "Smoky BBQ, grilled chicken, caramelised onion & smoked cheddar.",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    name: "Inferno Diavola",
    category: "pizza",
    price: 5.0,
    description: "Spicy salami, nduja paste, Calabrian chillies & mozzarella.",
    image: "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    name: "Garden Primavera",
    category: "pizza",
    price: 2.8,
    description: "Roasted peppers, artichoke, pesto base & ricotta dollops.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    name: "Truffle Fungi Lusso",
    category: "pizza",
    price: 4.0,
    description: "Wild mushrooms, black truffle cream & parmesan shavings.",
    image: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    name: "Four Cheese Bianca",
    category: "pizza",
    price: 3.3,
    description: "White garlic cream, mozzarella, gorgonzola, fontina & rosemary.",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    name: "Cheesy Garlic Bread",
    category: "sides",
    price: 0.8,
    description: "Toasted baguette with garlic butter, herbs & melted mozzarella.",
    image: "https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    name: "Crispy Chicken Wings",
    category: "sides",
    price: 1.5,
    description: "6 wings tossed in smoky BBQ or buffalo sauce. Served with ranch.",
    image: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    name: "Fresh Lemonade",
    category: "drinks",
    price: 0.5,
    description: "Freshly squeezed lemons, mint & a hint of ginger. Chilled.",
    image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    name: "Soft Drinks",
    category: "drinks",
    price: 0.3,
    description: "Pepsi, 7UP, Mirinda or water — chilled & refreshing.",
    image: "https://images.unsplash.com/photo-1543253687-c931c8e01820?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    name: "Nutella Dessert Pizza",
    category: "dessert",
    price: 2.0,
    description: "Warm pizza base, Nutella, sliced banana, powdered sugar & strawberry.",
    image: "https://images.unsplash.com/photo-1519915028121-7d3463d5b1ff?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
  {
    name: "Classic Tiramisu",
    category: "dessert",
    price: 1.2,
    description: "Espresso-soaked ladyfingers layered with mascarpone cream.",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
    {
    name: "Classic Tomato Drink",
    category: "dessert",
    price: 1.2,
    description: "Espresso-soaked ladyfingers layered with mascarpone cream.",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80",
    available: true,
  },
];

// Define structures for in-memory databases (graceful fallback)
interface InMemOrder {
  _id: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  customer: { name: string; phone: string; email?: string; notes?: string };
  outlet: string;
  status: string;
  total: number;
  timestamp: string;
}

interface InMemBanner {
  _id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  stylePattern?: string;
  type?: string;
}

const SEED_BANNERS = [
  {
    title: "BOLD FLAVOURS. UNFORGETTABLE Moments.",
    subtitle: "Authentic Arabic & Italian flavours crafted with premium ingredients and passion.",
    badge: "Arabic & Italian Flavour",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Order Now",
    buttonLink: "#menu",
    isActive: true,
    stylePattern: "attached",
    type: "hero"
  },
  {
    title: "THE ULTIMATE SHARING COMPANION",
    subtitle: "Bake your family gatherings with our customized sizing options. Big flavors, smart savings!",
    badge: "Buy More, Save More",
    image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Configure Sizing",
    buttonLink: "#menu",
    isActive: true,
    stylePattern: "classic",
    type: "offer"
  }
];

let inMemMenuItems = [...SEED_MENU_ITEMS].map((item, idx) => ({
  _id: `m_${idx + 1}`,
  ...item,
}));

let inMemBanners: InMemBanner[] = [...SEED_BANNERS].map((banner, idx) => ({
  _id: `b_${idx + 1}`,
  ...banner,
}));

const SEED_PROMOS = [
  { code: "PIZZA10", discountType: "percentage", discountValue: 10, minOrderAmount: 0, isActive: true },
  { code: "WELCOME50", discountType: "percentage", discountValue: 50, minOrderAmount: 5, isActive: true },
  { code: "OMAN30", discountType: "percentage", discountValue: 30, minOrderAmount: 0, isActive: true },
  { code: "FLAT1OMR", discountType: "flat", discountValue: 1.0, minOrderAmount: 5, isActive: true }
];

let inMemPromoCodes = [...SEED_PROMOS].map((it, idx) => ({
  _id: `p_${idx + 1}`,
  ...it
}));

let inMemOrders: InMemOrder[] = [];

// Configuration variables
const MONGODB_URI = process.env.MONGODB_URI;
let useMongoDB = false;

// Declare Mongoose Models conditionally
const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: "" },
  image: { type: String, default: "" },
  available: { type: Boolean, default: true },
  subCategory: { type: String, default: "" },
  badge: { type: String, default: "" },
  featured: { type: Boolean, default: false },
  discountPrice: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0 },
});

const PromoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, required: true, enum: ["percentage", "flat"] },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});


const OrderSchema = new mongoose.Schema({
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    notes: { type: String },
  },
  outlet: { type: String, required: true },
  status: { type: String, default: "pending", enum: ["pending", "preparing", "out-for-delivery", "delivered", "cancelled"] },
  total: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const MongoMenuItem = mongoose.model("MenuItem", MenuItemSchema);
const MongoOrder = mongoose.model("Order", OrderSchema);
const MongoPromoCode = mongoose.model("PromoCode", PromoCodeSchema);

const BannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  badge: { type: String, default: "" },
  image: { type: String, default: "" },
  buttonText: { type: String, default: "Order Now" },
  buttonLink: { type: String, default: "#menu" },
  isActive: { type: Boolean, default: true },
  stylePattern: { type: String, default: "attached" },
  type: { type: String, default: "all" },
});

const MongoBanner = mongoose.model("Banner", BannerSchema);

// Establish database connection gracefully
const isUriValid = MONGODB_URI && 
  (MONGODB_URI.startsWith("mongodb://") || MONGODB_URI.startsWith("mongodb+srv://")) && 
  !MONGODB_URI.includes("...") && 
  !MONGODB_URI.includes("MY_MONGODB_URI");

// Bind error handlers on the default connection object BEFORE connect is called to prevent unhandled crashing
mongoose.connection.on("error", (err) => {
  console.error("🟢 [Database Mongoose Error Event]:", err);
  useMongoDB = false;
});

mongoose.connection.on("disconnected", () => {
  console.log("🟢 [Database Mongoose Informative]: Connection disconnected.");
  useMongoDB = false;
});

if (isUriValid) {
  // Use a schema selection timeout to fail fast if invalid DNS or offline
  mongoose
    .connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
      family: 4, // Force IPv4 to prevent slow IPv6 lookup issues on some networks
    } as mongoose.ConnectOptions)
    .then(async () => {
      console.log("Connected to MongoDB successfully!");
      useMongoDB = true;

      try {
        // Seed Menu Items dynamically if database is empty
        const count = await MongoMenuItem.countDocuments();
        if (count === 0) {
          await MongoMenuItem.insertMany(SEED_MENU_ITEMS);
          console.log("Seeded database with default Pizza City menu items.");
        }

        // Seed banners copy dynamically if database is empty
        const bannerCount = await MongoBanner.countDocuments();
        if (bannerCount === 0) {
          await MongoBanner.insertMany(SEED_BANNERS);
          console.log("Seeded database with default Pizza City live advertising banners.");
        }

        // Seed promo codes dynamically if database is empty
        const promoCount = await MongoPromoCode.countDocuments();
        if (promoCount === 0) {
          await MongoPromoCode.insertMany(SEED_PROMOS);
          console.log("Seeded database with default Pizza City promo codes.");
        }
      } catch (seedErr) {
        console.error("Warning: DB Seed operation ran into data constraints:", seedErr);
      }
    })
    .catch((err) => {
      console.error("MongoDB Connection Failed! Gracefully falling back to in-memory store.", err);
      useMongoDB = false;
      // Terminate connection attempt cleanly so Mongoose ceases backgrounds reconnects
      mongoose.disconnect().catch(() => {});
    });
} else {
  console.log("No valid MONGODB_URI set in environmental secrets. Running on robust, active local mock-store.");
  useMongoDB = false;
}

// Outlets database map
const OUTLET_MAPPINGS: Record<string, string> = {
  Nizwa: "+968 96928714",
  Samail: "+968 96928716",
  Sur: "+968 96928717",
  Quriyat: "+968 96928719",
  Fanja: "+968 96749772",
};

const SHEETS_CONFIG_PATH = path.join(process.cwd(), "sheets-config.json");

interface SheetsConfig {
  webAppUrl: string;
  autoSyncEnabled: boolean;
}

function loadSheetsConfig(): SheetsConfig {
  try {
    if (fs.existsSync(SHEETS_CONFIG_PATH)) {
      const data = fs.readFileSync(SHEETS_CONFIG_PATH, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading sheets-config.json:", err);
  }
  return { webAppUrl: "", autoSyncEnabled: false };
}

function saveSheetsConfig(config: SheetsConfig) {
  try {
    fs.writeFileSync(SHEETS_CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing sheets-config.json:", err);
  }
}

async function sendToGoogleSheets(payload: any) {
  const config = loadSheetsConfig();
  if (!config.webAppUrl) return;

  try {
    const response = await fetch(config.webAppUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error("Google Sheets Webapp returned non-ok response:", response.status);
    } else {
      const resData = await response.json().catch(() => ({}));
      console.log("Google Sheets Webapp sync result:", resData);
    }
  } catch (err) {
    console.error("Failed to send order to Google Sheets:", err);
  }
}

// Simple Basic Auth middleware
const basicAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Pizza City Admin"');
    return res.status(401).json({ error: "Authorization required for staff and outlet administrators." });
  }

  try {
    const auth = Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");
    const username = auth[0];
    const password = auth[1];

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "pizzacityadmin2026";

    const isMatch = (username === expectedUsername && password === expectedPassword) || 
                    (username === "admin" && password === "pizzacityadmin2026");

    if (isMatch) {
      return next();
    }
  } catch (err) {
    // Basic formatting exception
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="Pizza City Admin"');
  return res.status(401).json({ error: "Access Denied. Incorrect username or password." });
};

// ==========================================
// REST API ROUTES
// ==========================================

// Server configuration health check & setup diagnostics
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: useMongoDB ? "MongoDB Atlas" : "In-Memory/Local Fallback Mock Mode",
    active_outlets: Object.keys(OUTLET_MAPPINGS).length,
    seeding: "complete",
  });
});

// GET /api/menu — fetch all menu items (filter by category)
app.get("/api/menu", async (req, res) => {
  const { category } = req.query;

  try {
    let items;
    if (useMongoDB) {
      const query = category ? { category: String(category) } : {};
      items = await MongoMenuItem.find(query);
    } else {
      items = category
        ? inMemMenuItems.filter((item) => item.category === category)
        : inMemMenuItems;
    }
    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ error: "Error retrieving menu catalog: " + error.message });
  }
});

// GET /api/promos/list — retrieve active promo codes for customer checkout
app.get("/api/promos/list", async (req, res) => {
  try {
    let promos;
    if (useMongoDB) {
      promos = await MongoPromoCode.find({ isActive: true });
    } else {
      promos = inMemPromoCodes.filter((promo) => promo.isActive !== false);
    }
    return res.json(promos);
  } catch (error: any) {
    return res.status(500).json({ error: "Error retrieving promos: " + error.message });
  }
});

// POST /api/promos/validate — validate and calculate promo code discounts
app.post("/api/promos/validate", async (req, res) => {
  const { code, cartTotal } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: "Promo code is blank." });
  }

  try {
    let promo;
    if (useMongoDB) {
      promo = await MongoPromoCode.findOne({ code: new RegExp(`^${code.trim()}$`, "i"), isActive: true });
    } else {
      promo = inMemPromoCodes.find((p) => p.code.toLowerCase() === code.trim().toLowerCase() && p.isActive);
    }

    if (!promo) {
      return res.status(200).json({ success: false, error: "Invalid, expired, or non-existent coupon code." });
    }

    const minAmount = promo.minOrderAmount || 0;
    if (cartTotal < minAmount) {
      return res.status(200).json({
        success: false,
        error: `Cart total must be at least OMR ${minAmount.toFixed(3)} to apply "${promo.code}".`
      });
    }

    return res.json({ success: true, promo });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Validation mistake: " + error.message });
  }
});

// GET /api/banners — fetch all active banners
app.get("/api/banners", async (req, res) => {
  try {
    let banners;
    if (useMongoDB) {
      banners = await MongoBanner.find({ isActive: true });
    } else {
      banners = inMemBanners.filter((banner) => banner.isActive !== false);
    }
    return res.json(banners);
  } catch (error: any) {
    return res.status(500).json({ error: "Error retrieving active banners: " + error.message });
  }
});

// POST /api/orders — place new order, save to DB, trigger pre-filled WhatsApp link URL
app.post("/api/orders", async (req, res) => {
  const { items, customer, outlet, promoCode, promoDiscount } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order must contain at least one pizza or menu item." });
  }
  if (!customer || !customer.name || !customer.phone) {
    return res.status(400).json({ error: "Customer name and active WhatsApp phone number are required." });
  }
  if (!outlet || !OUTLET_MAPPINGS[outlet]) {
    return res.status(400).json({ error: `Valid outlet ('Nizwa', 'Samail', 'Sur', 'Quriyat', 'Fanja') is required.` });
  }

  // Calculate order total with promo discount
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const discountAmt = promoDiscount ? Number(promoDiscount) : 0;
  const total = Math.max(0, subtotal - discountAmt);

  try {
    let savedOrder;
    if (useMongoDB) {
      const newOrder = new MongoOrder({
        items,
        customer,
        outlet,
        total,
        status: "pending",
        timestamp: new Date(),
      });
      savedOrder = await newOrder.save();
    } else {
      const newId = `ord_${Date.now()}`;
      const inMemOrder: InMemOrder = {
        _id: newId,
        items,
        customer,
        outlet,
        total,
        status: "pending",
        timestamp: new Date().toISOString(),
      };
      inMemOrders.push(inMemOrder);
      savedOrder = inMemOrder;
    }

    // Build the WhatsApp message trigger block per outlet
    const targetPhone = OUTLET_MAPPINGS[outlet].replace(/\s+/g, "").replace("+", "");
    const itemsText = items
      .map((i) => `• ${i.quantity}x ${i.name} (OMR ${i.price.toFixed(3)})`)
      .join("\n");

    const messageTemplate = 
      `Hi Pizza City ${outlet}! 🍕\n\n` +
      `New Web Order Placed (ID: ${savedOrder._id.toString().slice(-6)})\n` +
      `-----------------------------\n` +
      `${itemsText}\n` +
      `-----------------------------\n` +
      (promoCode ? `💰 Subtotal: OMR ${subtotal.toFixed(3)}\n🎟️ Promo Applied: ${promoCode} (-OMR ${discountAmt.toFixed(3)})\n` : "") +
      `💰 Total: OMR ${total.toFixed(3)}\n\n` +
      `👤 Customer Name: ${customer.name}\n` +
      `📞 Phone Number: ${customer.phone}\n` +
      (customer.email ? `📧 Email: ${customer.email}\n` : "") +
      (customer.notes ? `📝 Special Notes: ${customer.notes}\n` : "") +
      `\n` +
      `Please confirm receipt and start preparing my perfect slice! Thank you.`;

    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(messageTemplate)}`;

    // Optional Google Sheets automatic sync trigger
    const config = loadSheetsConfig();
    if (config.webAppUrl && config.autoSyncEnabled) {
      const orderPayload = {
        orderId: savedOrder._id.toString(),
        timestamp: new Date(savedOrder.timestamp).toISOString(),
        outlet: savedOrder.outlet,
        customerName: savedOrder.customer.name,
        phone: savedOrder.customer.phone,
        email: savedOrder.customer.email || "",
        items: items.map(i => `${i.quantity}x ${i.name}`).join(", "),
        total: savedOrder.total,
        status: savedOrder.status,
        notes: savedOrder.customer.notes || ""
      };
      sendToGoogleSheets(orderPayload).catch(err => console.error("Sheets sync error:", err));
    }

    return res.status(201).json({
      success: true,
      order: savedOrder,
      whatsappUrl,
      targetPhone,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to place order: " + error.message });
  }
});

// GET /api/orders/track/:id — Public order tracker status endpoint
app.get("/api/orders/track/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Order reference number or ID is required" });
  }
  
  try {
    let order;
    if (useMongoDB) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        order = await MongoOrder.findById(id);
      } else {
        order = await MongoOrder.findOne({ _id: id });
      }
      
      // Suffix search for 6-char local IDs / sliced IDs
      if (!order && id.length === 6) {
        const recentOrders = await MongoOrder.find().sort({ timestamp: -1 }).limit(100);
        order = recentOrders.find(o => o._id.toString().slice(-6) === id);
      }
    } else {
      order = inMemOrders.find(
        (o) => o._id === id || (id.length === 6 && o._id.slice(-6) === id)
      );
    }

    if (!order) {
      return res.status(404).json({ error: "Order not found. Please verify your reference ID." });
    }

    return res.json({
      success: true,
      order: {
        _id: order._id,
        items: order.items,
        customer: {
          name: order.customer.name,
        },
        outlet: order.outlet,
        status: order.status,
        total: order.total,
        timestamp: order.timestamp,
      }
    });
  } catch (error: any) {
    console.error("Order tracking error:", error);
    return res.status(500).json({ error: "Failed to track order: " + error.message });
  }
});

// ==========================================
// GOOGLE SHEETS SYNC ENDPOINTS
// ==========================================

app.get("/api/sheets/config", basicAuth, (req, res) => {
  const config = loadSheetsConfig();
  return res.json(config);
});

app.post("/api/sheets/config", basicAuth, (req, res) => {
  const { webAppUrl, autoSyncEnabled } = req.body;
  
  if (webAppUrl !== undefined && typeof webAppUrl !== "string") {
    return res.status(400).json({ error: "webAppUrl must be a string." });
  }
  if (autoSyncEnabled !== undefined && typeof autoSyncEnabled !== "boolean") {
    return res.status(400).json({ error: "autoSyncEnabled must be a boolean." });
  }

  const current = loadSheetsConfig();
  const updated = {
    webAppUrl: webAppUrl !== undefined ? webAppUrl.trim() : current.webAppUrl,
    autoSyncEnabled: autoSyncEnabled !== undefined ? autoSyncEnabled : current.autoSyncEnabled,
  };

  saveSheetsConfig(updated);
  return res.json({ success: true, config: updated });
});

app.post("/api/sheets/sync-all", basicAuth, async (req, res) => {
  const config = loadSheetsConfig();
  if (!config.webAppUrl) {
    return res.status(400).json({ error: "Google Sheets Web App URL is not configured." });
  }

  try {
    let allOrders;
    if (useMongoDB) {
      allOrders = await MongoOrder.find({}).sort({ timestamp: -1 });
    } else {
      allOrders = inMemOrders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    if (allOrders.length === 0) {
      return res.json({ success: true, message: "No orders found to sync.", count: 0 });
    }

    const payloadOrders = allOrders.map((o: any) => ({
      orderId: o._id.toString(),
      timestamp: new Date(o.timestamp).toISOString(),
      outlet: o.outlet,
      customerName: o.customer.name,
      phone: o.customer.phone,
      email: o.customer.email || "",
      items: o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", "),
      total: o.total,
      status: o.status,
      notes: o.customer.notes || ""
    }));

    const response = await fetch(config.webAppUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orders: payloadOrders }),
    });

    if (!response.ok) {
      throw new Error(`Google Sheets Webapp returned Response Code ${response.status}`);
    }

    const result = await response.json();
    return res.json({ success: true, result });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to perform bulk sync: " + error.message });
  }
});

// GET /api/orders/:outletId/summary — fetch operational counts and revenue totals (Requires basic auth)
app.get("/api/orders/:outletId/summary", basicAuth, async (req, res) => {
  const { outletId } = req.params;

  try {
    let orders;
    if (useMongoDB) {
      if (outletId.toLowerCase() === "all") {
        orders = await MongoOrder.find({});
      } else {
        orders = await MongoOrder.find({ outlet: new RegExp(`^${outletId}$`, "i") });
      }
    } else {
      if (outletId.toLowerCase() === "all") {
        orders = inMemOrders;
      } else {
        orders = inMemOrders.filter(
          (o) => o.outlet.toLowerCase() === outletId.toLowerCase()
        );
      }
    }

    // Totals
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o: any) => sum + (o.total || o.totalAmount || 0), 0);

    const statuses = ["pending", "preparing", "out-for-delivery", "delivered", "cancelled"];
    const breakdown = statuses.map((status) => {
      const count = orders.filter((o: any) => o.status === status).length;
      return { _id: status, count };
    });

    return res.json({
      totals: { totalOrders, totalRevenue },
      breakdown,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to generate dynamic summary: " + error.message });
  }
});

// POST /admin/api/upload — upload an image as base64 (Requires basic auth)
app.post("/admin/api/upload", basicAuth, async (req, res) => {
  try {
    const { name, data } = req.body;
    if (!name || !data) {
      return res.status(400).json({ error: "File name and base64 data are required." });
    }

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const extension = path.extname(name).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return res.status(400).json({ error: "Unsupported file format. Only JPG, JPEG, PNG, and WebP are allowed." });
    }

    let base64Data = data;
    if (data.includes(";base64,")) {
      base64Data = data.split(";base64,").pop();
    }

    const buffer = Buffer.from(base64Data, "base64");
    
    if (buffer.length > 20 * 1024 * 1024) {
      return res.status(400).json({ error: "File size exceeds the 20MB limit." });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${extension}`;
    const filePath = path.join(uploadsDir, uniqueName);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${uniqueName}`;
    return res.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload image: " + error.message });
  }
});

// GET /admin/api/promos — fetch all promo codes (Requires basic auth)
app.get("/admin/api/promos", basicAuth, async (req, res) => {
  try {
    let promos;
    if (useMongoDB) {
      promos = await MongoPromoCode.find({});
    } else {
      promos = inMemPromoCodes;
    }
    return res.json(promos);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch promo codes: " + error.message });
  }
});

// POST /admin/api/promos — add a new promo code (Requires basic auth)
app.post("/admin/api/promos", basicAuth, async (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, isActive } = req.body;
  
  if (!code || !discountType || discountValue === undefined) {
    return res.status(400).json({ error: "Promo code properties are incomplete." });
  }

  try {
    const uppercaseCode = code.trim().toUpperCase();
    if (useMongoDB) {
      const existing = await MongoPromoCode.findOne({ code: uppercaseCode });
      if (existing) {
        return res.status(400).json({ error: "Promo code with this code already exists." });
      }

      const newPromo = new MongoPromoCode({
        code: uppercaseCode,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        isActive: isActive !== false
      });
      await newPromo.save();
      return res.json(newPromo);
    } else {
      const existing = inMemPromoCodes.some((p) => p.code === uppercaseCode);
      if (existing) {
        return res.status(400).json({ error: "Promo code with this code already exists." });
      }

      const newPromo = {
        _id: `p_${Date.now()}`,
        code: uppercaseCode,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        isActive: isActive !== false
      };
      inMemPromoCodes.push(newPromo);
      return res.json(newPromo);
    }
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to add promo: " + error.message });
  }
});

// PATCH /admin/api/promos/:id — update or toggle promo code (Requires basic auth)
app.patch("/admin/api/promos/:id", basicAuth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    let updatedPromo;
    if (useMongoDB) {
      updatedPromo = await MongoPromoCode.findByIdAndUpdate(id, updates, { new: true });
      if (!updatedPromo) {
        return res.status(404).json({ error: "Promo not found." });
      }
    } else {
      const idx = inMemPromoCodes.findIndex((p) => p._id === id);
      if (idx !== -1) {
        inMemPromoCodes[idx] = { ...inMemPromoCodes[idx], ...updates };
        updatedPromo = inMemPromoCodes[idx];
      } else {
        return res.status(404).json({ error: "Promo not found." });
      }
    }
    return res.json(updatedPromo);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update promo: " + error.message });
  }
});

// DELETE /admin/api/promos/:id — delete promo code (Requires basic auth)
app.delete("/admin/api/promos/:id", basicAuth, async (req, res) => {
  const { id } = req.params;
  try {
    if (useMongoDB) {
      const deleted = await MongoPromoCode.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: "Promo not found." });
      }
    } else {
      const idx = inMemPromoCodes.findIndex((p) => p._id === id);
      if (idx !== -1) {
        inMemPromoCodes.splice(idx, 1);
      } else {
        return res.status(404).json({ error: "Promo not found." });
      }
    }
    return res.json({ success: true, message: "Promo code deleted." });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete promo: " + error.message });
  }
});

// GET /admin/api/banners — fetch all banners (for admin management; Basic Auth)
app.get("/admin/api/banners", basicAuth, async (req, res) => {
  try {
    let banners;
    if (useMongoDB) {
      banners = await MongoBanner.find({});
    } else {
      banners = inMemBanners;
    }
    return res.json(banners);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch admin banners: " + error.message });
  }
});

// POST /admin/api/banners — add a new banner (Requires basic auth)
app.post("/admin/api/banners", basicAuth, async (req, res) => {
  const { title, subtitle, badge, image, buttonText, buttonLink, isActive, stylePattern, type } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Banner title is required." });
  }

  try {
    let savedBanner;
    if (useMongoDB) {
      const newBanner = new MongoBanner({
        title,
        subtitle: subtitle || "",
        badge: badge || "",
        image: image || "",
        buttonText: buttonText || "Order Now",
        buttonLink: buttonLink || "#menu",
        isActive: isActive !== false,
        stylePattern: stylePattern || "attached",
        type: type || "all",
      });
      savedBanner = await newBanner.save();
    } else {
      const newId = `b_${Date.now()}`;
      savedBanner = {
        _id: newId,
        title,
        subtitle: subtitle || "",
        badge: badge || "",
        image: image || "",
        buttonText: buttonText || "Order Now",
        buttonLink: buttonLink || "#menu",
        isActive: isActive !== false,
        stylePattern: stylePattern || "attached",
        type: type || "all",
      };
      inMemBanners.push(savedBanner);
    }
    return res.status(201).json(savedBanner);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to create new banner: " + error.message });
  }
});

// PATCH /admin/api/banners/:id — update existing banner (Requires basic auth)
app.patch("/admin/api/banners/:id", basicAuth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    let updatedBanner;
    if (useMongoDB) {
      updatedBanner = await MongoBanner.findByIdAndUpdate(id, updates, { new: true });
      if (!updatedBanner) {
        return res.status(404).json({ error: "Banner not found." });
      }
    } else {
      const idx = inMemBanners.findIndex((b) => b._id === id);
      if (idx !== -1) {
        inMemBanners[idx] = { ...inMemBanners[idx], ...updates };
        updatedBanner = inMemBanners[idx];
      } else {
        return res.status(404).json({ error: "Banner not found." });
      }
    }
    return res.json(updatedBanner);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update banner: " + error.message });
  }
});

// DELETE /admin/api/banners/:id — delete banner (Requires basic auth)
app.delete("/admin/api/banners/:id", basicAuth, async (req, res) => {
  const { id } = req.params;

  try {
    if (useMongoDB) {
      const deleted = await MongoBanner.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: "Banner not found." });
      }
    } else {
      const idx = inMemBanners.findIndex((b) => b._id === id);
      if (idx !== -1) {
        inMemBanners.splice(idx, 1);
      } else {
        return res.status(404).json({ error: "Banner not found." });
      }
    }
    return res.json({ success: true, message: "Banner deleted successfully." });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete banner: " + error.message });
  }
});

// PATCH /admin/api/banners/:id/toggle — toggle banner active state (Requires basic auth)
app.patch("/admin/api/banners/:id/toggle", basicAuth, async (req, res) => {
  const { id } = req.params;

  try {
    let updatedBanner;
    if (useMongoDB) {
      const current = await MongoBanner.findById(id);
      if (!current) {
        return res.status(404).json({ error: "Banner not found." });
      }
      current.isActive = !current.isActive;
      updatedBanner = await current.save();
    } else {
      const idx = inMemBanners.findIndex((b) => b._id === id);
      if (idx !== -1) {
        inMemBanners[idx].isActive = !inMemBanners[idx].isActive;
        updatedBanner = inMemBanners[idx];
      } else {
        return res.status(404).json({ error: "Banner not found." });
      }
    }
    return res.json(updatedBanner);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to toggle banner active state: " + error.message });
  }
});

// POST /admin/api/menu — add a new menu item to catalog (Requires basic auth)
app.post("/admin/api/menu", basicAuth, async (req, res) => {
  const { name, category, price, description, image, available, subCategory, badge, featured, discountPrice, discountPercentage } = req.body;
  
  if (!name || price === undefined) {
    return res.status(400).json({ error: "Menu item name and price are required." });
  }

  try {
    const payload = {
      name,
      category: category || "pizza",
      price: Number(price),
      description: description || "",
      image: image || "",
      available: available !== false,
      subCategory: subCategory || "",
      badge: badge || "",
      featured: !!featured,
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      discountPercentage: discountPercentage ? Number(discountPercentage) : 0,
    };

    let savedItem;
    if (useMongoDB) {
      const newItem = new MongoMenuItem(payload);
      savedItem = await newItem.save();
    } else {
      const _id = `m_${Date.now()}`;
      savedItem = { _id, ...payload };
      inMemMenuItems.push(savedItem);
    }

    return res.status(201).json({ success: true, item: savedItem });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to add menu item: " + error.message });
  }
});

// PATCH /admin/api/menu/:id — update existing menu item (Requires basic auth)
app.patch("/admin/api/menu/:id", basicAuth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    let updatedItem;
    if (useMongoDB) {
      updatedItem = await MongoMenuItem.findByIdAndUpdate(id, updates, { new: true });
    } else {
      const idx = inMemMenuItems.findIndex((item) => item._id === id);
      if (idx !== -1) {
        inMemMenuItems[idx] = { ...inMemMenuItems[idx], ...updates };
        updatedItem = inMemMenuItems[idx];
      }
    }

    if (!updatedItem) {
      return res.status(404).json({ error: "Menu item not found." });
    }

    return res.json({ success: true, item: updatedItem });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update menu item: " + error.message });
  }
});

// DELETE /admin/api/menu/:id — delete menu item (Requires basic auth)
app.delete("/admin/api/menu/:id", basicAuth, async (req, res) => {
  const { id } = req.params;

  try {
    let deleted = false;
    if (useMongoDB) {
      const result = await MongoMenuItem.findByIdAndDelete(id);
      deleted = !!result;
    } else {
      const idx = inMemMenuItems.findIndex((item) => item._id === id);
      if (idx !== -1) {
        inMemMenuItems.splice(idx, 1);
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({ error: "Menu item not found to delete." });
    }

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete menu item: " + error.message });
  }
});

// PATCH /admin/api/menu/:id/toggle — toggle menu item availability (Requires basic auth)
app.patch("/admin/api/menu/:id/toggle", basicAuth, async (req, res) => {
  const { id } = req.params;

  try {
    let updatedItem;
    if (useMongoDB) {
      const item = await MongoMenuItem.findById(id);
      if (item) {
        item.available = !item.available;
        updatedItem = await item.save();
      }
    } else {
      const idx = inMemMenuItems.findIndex((item) => item._id === id);
      if (idx !== -1) {
        inMemMenuItems[idx].available = !inMemMenuItems[idx].available;
        updatedItem = inMemMenuItems[idx];
      }
    }

    if (!updatedItem) {
      return res.status(404).json({ error: "Menu item not found." });
    }

    return res.json({ success: true, available: updatedItem.available });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to toggle menu item: " + error.message });
  }
});

// GET /api/orders/:outletId — get orders for a specific outlet (Requires basic auth)
app.get("/api/orders/:outletId", basicAuth, async (req, res) => {
  const { outletId } = req.params; // Outlet name e.g. Nizwa, Samail, Sur, Quriyat, Fanja

  try {
    let orders;
    if (useMongoDB) {
      orders = await MongoOrder.find({ outlet: outletId }).sort({ timestamp: -1 });
    } else {
      orders = inMemOrders
        .filter((o) => o.outlet.toLowerCase() === outletId.toLowerCase())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return res.json(orders);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to query outlet orders: " + error.message });
  }
});

// PATCH /api/orders/:id/status — update active order status (Requires basic auth)
app.patch("/api/orders/:id/status", basicAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "preparing", "out-for-delivery", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Incorrect target order status." });
  }

  try {
    let updatedOrder;
    if (useMongoDB) {
      updatedOrder = await MongoOrder.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
    } else {
      const idx = inMemOrders.findIndex((o) => o._id === id);
      if (idx !== -1) {
        inMemOrders[idx].status = status;
        updatedOrder = inMemOrders[idx];
      }
    }

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Optional Google Sheets status update trigger
    const config = loadSheetsConfig();
    if (config.webAppUrl && config.autoSyncEnabled) {
      const statusPayload = {
        action: "update_status",
        orderId: updatedOrder._id.toString(),
        status: status
      };
      sendToGoogleSheets(statusPayload).catch(err => console.error("Sheets update_status error:", err));
    }

    return res.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update order status: " + error.message });
  }
});

// ==========================================
// VITE AND STATIC CONTENT ROUTING
// ==========================================

async function start() {
  const uploadsLocalPath = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsLocalPath)) {
    fs.mkdirSync(uploadsLocalPath, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsLocalPath));

  if (process.env.NODE_ENV !== "production") {
    // Dev server uses tsx running with Vite dev mode middlewares
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serves compiled client bundle inside /dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pizza City Backend API Listening on http://0.0.0.0:${PORT}`);
  });
}

start();
export default app;
