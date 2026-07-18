import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import mongoose, { Mongoose } from "mongoose";
import fs from "fs";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase/app";
import { 
  getFirestore as getClientFirestore, 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { MongoDBCollectionNamespace } from "mongodb";

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

app.use(helmet({
  contentSecurityPolicy: false, // Vite requires inline scripts/eval in dev, and external images
  crossOriginEmbedderPolicy: false // Allows external images to load without issues
}));
app.use(compression());
app.use(cors()); // TODO: Restrict in production: cors({ origin: 'https://yourdomain.com' })
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Rate limiting for order creation endpoint
const orderRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 orders per window
  message: { error: "Too many orders placed from this IP, please try again after 15 minutes." }
});

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
    category: "drinks",
    price: 1.2,
    description: "Rich tomato-based refresher blended with herbs, spices & a squeeze of lemon. Chilled.",
    image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=400&q=80",
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

const SEED_BRANCHES = [
  { name: "Nizwa", phone: "+968 96928714", whatsapp: "+968 96928714", address: "Near Nizwa Souq, Nizwa City Center, Nizwa, Oman", map: "https://maps.google.com/maps?q=Nizwa,Oman&t=&z=13&ie=UTF8&iwloc=&output=embed", geo: "Nizwa", hours: "Daily 11 AM – 11 PM", delivery: true, isActive: true, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80" },
  { name: "Samail", phone: "+968 96928716", whatsapp: "+968 96928716", address: "Main Shopping High Street Plaza, Samail, Oman", map: "https://maps.google.com/maps?q=Samail,Oman&t=&z=13&ie=UTF8&iwloc=&output=embed", geo: "Samail", hours: "Daily 11 AM – 11 PM", delivery: true, isActive: true, image: "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=400&q=80" },
  { name: "Sur", phone: "+968 96928717", whatsapp: "+968 96928717", address: "Al-Muraj Street Commercial Corridor, Sur, Oman", map: "https://maps.google.com/maps?q=Sur,Oman&t=&z=13&ie=UTF8&iwloc=&output=embed", geo: "Sur", hours: "Daily 11 AM – 11 PM", delivery: true, isActive: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80" },
  { name: "Quriyat", phone: "+968 96928719", whatsapp: "+968 96928719", address: "Coastal Expressway High Road, Quriyat, Oman", map: "https://maps.google.com/maps?q=Quriyat,Oman&t=&z=13&ie=UTF8&iwloc=&output=embed", geo: "Quriyat", hours: "Daily 11 AM – 11 PM", delivery: true, isActive: true, image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=1200&q=80" },
  { name: "Fanja", phone: "+968 96749772", whatsapp: "+968 96749772", address: "Main Highway Intersection Plaza Road, Fanja, Oman", map: "https://maps.google.com/maps?q=Fanja,Oman&t=&z=13&ie=UTF8&iwloc=&output=embed", geo: "Fanja", hours: "Daily 11 AM – 11 PM", delivery: true, isActive: true, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80" },
];

let inMemBranches = [...SEED_BRANCHES].map((branch, idx) => ({
  _id: `br_${idx + 1}`,
  ...branch
}));

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

const BranchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: { type: String, required: true },
  address: { type: String, required: true },
  map: { type: String, default: "" },
  geo: { type: String, default: "" },
  hours: { type: String, default: "Daily 11 AM – 11 PM" },
  delivery: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  image: { type: String, default: "" },
});

const MongoBranch = mongoose.model("Branch", BranchSchema);

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["superadmin", "moderator"], default: "moderator" },
  outletAccess: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
});

const MongoUser = mongoose.model("User", UserSchema);

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

mongoose.connection.on("reconnected", () => {
  console.log("🟢 [Database Mongoose Informative]: Reconnected to MongoDB.");
  useMongoDB = true;
});

async function seedMongoIfEmpty() {
  try {
    const count = await MongoMenuItem.countDocuments();
    if (count === 0) {
      await MongoMenuItem.insertMany(SEED_MENU_ITEMS);
      console.log("Seeded database with default Pizza City menu items.");
    }

    const bannerCount = await MongoBanner.countDocuments();
    if (bannerCount === 0) {
      await MongoBanner.insertMany(SEED_BANNERS);
      console.log("Seeded database with default Pizza City live advertising banners.");
    }

    const promoCount = await MongoPromoCode.countDocuments();
    if (promoCount === 0) {
      await MongoPromoCode.insertMany(SEED_PROMOS);
      console.log("Seeded database with default Pizza City promo codes.");
    }

    const branchCount = await MongoBranch.countDocuments();
    if (branchCount === 0) {
      await MongoBranch.insertMany(SEED_BRANCHES);
      console.log("Seeded database with default Pizza City branches.");
    }

    if ((await MongoUser.countDocuments()) === 0) {
      const superUsername = process.env.ADMIN_USERNAME;
      const superPassword = process.env.ADMIN_PASSWORD;
      if (superUsername && superPassword) {
        const passwordHash = await bcrypt.hash(superPassword, 12);
        await MongoUser.create({
          username: superUsername,
          passwordHash,
          role: "superadmin",
          outletAccess: [],
          isActive: true,
        });
        console.log("Seeded database with default superadmin user.");
      } else {
        console.warn("No ADMIN_USERNAME / ADMIN_PASSWORD env vars; cannot seed superadmin.");
      }
    }
  } catch (seedErr) {
    console.error("Warning: DB Seed operation ran into data constraints:", seedErr);
  }
}

async function connectMongoDBWithRetry() {
  try {
    await mongoose.connect(MONGODB_URI as string, {
      serverSelectionTimeoutMS: 4000,
      maxPoolSize: 50,
      tls: true,
      tlsAllowInvalidCertificates: true
    } as mongoose.ConnectOptions);
    console.log("Connected to MongoDB successfully!");
    useMongoDB = true;

    await seedMongoIfEmpty();
  } catch (err) {
    console.error("MongoDB Connection Failed! Retrying in 10 seconds...", err);
    useMongoDB = false;
    setTimeout(connectMongoDBWithRetry, 10000);
  }
}

if (isUriValid) {
  connectMongoDBWithRetry();
} else {
  console.log("No valid MONGODB_URI set in environmental secrets. Running on robust, active local mock-store.");
  useMongoDB = false;
}

// Client-side SDK adapter for firebase-admin compatibility with local JSON file fallback
const LOCAL_DATA_DIR = path.join(process.cwd(), "data-local");

function ensureLocalDataDir() {
  if (!fs.existsSync(LOCAL_DATA_DIR)) {
    fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
  }
}

function getLocalFile(colName: string): string {
  ensureLocalDataDir();
  return path.join(LOCAL_DATA_DIR, `${colName}.json`);
}

function readLocalDocs(colName: string): any[] {
  try {
    const file = getLocalFile(colName);
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    }
  } catch (err) {
    console.error(`Error reading local docs for ${colName}:`, err);
  }
  return [];
}

function writeLocalDocs(colName: string, docs: any[]) {
  try {
    const file = getLocalFile(colName);
    fs.writeFileSync(file, JSON.stringify(docs, null, 2), "utf8");
  } catch (err) {
    console.error(`Error writing local docs for ${colName}:`, err);
  }
}

class ClientDocRef {
  private db: any;
  private colName: string;
  private docId: string;

  constructor(db: any, colName: string, docId: string) {
    this.db = db;
    this.colName = colName;
    this.docId = docId;
  }
  
  get id() { return this.docId; }

  async get() {
    // Check local first
    const locals = readLocalDocs(this.colName);
    const localDoc = locals.find((d: any) => d._id === this.docId || d.id === this.docId);
    if (localDoc) {
      const data = { ...localDoc };
      delete data._id;
      delete data.id;
      return {
        exists: true,
        id: this.docId,
        data: () => data
      };
    }

    try {
      const d = await getDoc(doc(this.db, this.colName, this.docId));
      return {
        exists: d.exists(),
        id: d.id,
        data: () => d.data()
      };
    } catch (err) {
      return {
        exists: false,
        id: this.docId,
        data: () => null
      };
    }
  }

  async update(updates: any) {
    const locals = readLocalDocs(this.colName);
    const idx = locals.findIndex((d: any) => d._id === this.docId || d.id === this.docId);
    if (idx !== -1) {
      locals[idx] = { ...locals[idx], ...updates };
      writeLocalDocs(this.colName, locals);
      return;
    }

    try {
      await updateDoc(doc(this.db, this.colName, this.docId), updates);
    } catch (err: any) {
      console.warn(`Firestore update failed for ${this.colName}/${this.docId}, updating locally:`, err.message);
      const d = await this.get();
      const currentData = d.exists ? d.data() : {};
      const newDoc = { _id: this.docId, ...currentData, ...updates };
      locals.push(newDoc);
      writeLocalDocs(this.colName, locals);
    }
  }

  async delete() {
    const locals = readLocalDocs(this.colName);
    const idx = locals.findIndex((d: any) => d._id === this.docId || d.id === this.docId);
    if (idx !== -1) {
      locals.splice(idx, 1);
      writeLocalDocs(this.colName, locals);
    }

    try {
      await deleteDoc(doc(this.db, this.colName, this.docId));
    } catch (err: any) {
      console.warn(`Firestore delete failed for ${this.colName}/${this.docId}:`, err.message);
    }
  }
}

class ClientColRef {
  private db: any;
  private colName: string;

  constructor(db: any, colName: string) {
    this.db = db;
    this.colName = colName;
  }

  doc(id: string) {
    return new ClientDocRef(this.db, this.colName, id);
  }

  async add(payload: any) {
    try {
      const d = await addDoc(collection(this.db, this.colName), payload);
      return { id: d.id };
    } catch (err: any) {
      console.warn(`Firestore add failed for ${this.colName}, saving locally:`, err.message);
      const localId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const locals = readLocalDocs(this.colName);
      locals.push({ _id: localId, ...payload });
      writeLocalDocs(this.colName, locals);
      return { id: localId };
    }
  }

  async get() {
    let cloudDocs: any[] = [];
    try {
      const snap = await getDocs(collection(this.db, this.colName));
      cloudDocs = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
    } catch (err: any) {
      console.warn(`Firestore read failed for ${this.colName}:`, err.message);
    }

    const locals = readLocalDocs(this.colName);
    const mergedMap = new Map<string, any>();

    // If both are empty and we have default seeds for these collections, initialize the local JSON file
    if (cloudDocs.length === 0 && locals.length === 0) {
      let seed: any[] = [];
      if (this.colName === "menuItems") seed = SEED_MENU_ITEMS;
      else if (this.colName === "banners") seed = SEED_BANNERS;
      else if (this.colName === "promos") seed = SEED_PROMOS;
      else if (this.colName === "branches") seed = SEED_BRANCHES;

      if (seed.length > 0) {
        console.log(`[Local Fallback]: Seeding local storage for ${this.colName}`);
        const seededDocs = seed.map((item, idx) => ({
          _id: `local_seed_${idx + 1}`,
          ...item
        }));
        writeLocalDocs(this.colName, seededDocs);
        locals.push(...seededDocs);
      }
    }

    for (const doc of cloudDocs) {
      mergedMap.set(doc.id, doc);
    }

    for (const doc of locals) {
      const id = doc._id || doc.id;
      const cleanDoc = { ...doc };
      delete cleanDoc._id;
      mergedMap.set(id, { id, ...cleanDoc });
    }

    const mergedDocs = Array.from(mergedMap.values()).map(doc => {
      const cleanDoc = { ...doc };
      const id = doc.id;
      delete cleanDoc.id;
      return {
        id,
        exists: true,
        data: () => cleanDoc
      };
    });

    return {
      empty: mergedDocs.length === 0,
      docs: mergedDocs
    };
  }
}

class ClientFirestoreAdapter {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  collection(colName: string) {
    return new ClientColRef(this.db, colName);
  }
}

// Firebase initialization and connection
let firebaseDb: any = null;
let useFirebase = false;

/**
 * Test Firestore access by attempting a direct read on a known collection.
 * Uses the raw Firestore client SDK directly (bypasses the ClientColRef adapter
 * which silently catches errors). Returns true if read succeeds, false on permission errors.
 */
async function testFirestoreAccess(clientDb: any): Promise<boolean> {
  try {
    const testCol = collection(clientDb, "menuItems");
    await getDocs(testCol);
    return true;
  } catch (err: any) {
    if (err?.message?.includes?.("Missing or insufficient permissions") || err?.code === "permission-denied") {
      console.warn("🔴 [Firestore Access]: Permission denied — Firestore security rules block reads.");
      console.warn("   ➜ Deploy your firestore.rules to the Firebase project or use the Admin SDK.");
      console.warn("   ➜ See: firebase deploy --only firestore:rules");
    }
    return false;
  }
}

/**
 * Try to initialize the Firebase Admin SDK and verify the connection works.
 * Returns admin Firestore instance if successful, null otherwise.
 * Uses a timeout to avoid hanging when no credentials are available.
 */
async function tryInitAdmin(configData: any): Promise<any | null> {
  const TIMEOUT_MS = 5000;

  // Pick the best credential strategy
  let initConfig: any = { projectId: configData.projectId };

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    try {
      const sa = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      initConfig.credential = admin.credential.cert(sa);
    } catch (_) { /* fall through */ }
  }

  try {
    admin.initializeApp(initConfig);
    const adminDb = getFirestore(configData.firestoreDatabaseId);
    await Promise.race([
      adminDb.collection("menuItems").limit(1).get(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS))
    ]);
    const source = initConfig.credential ? "service account" : "ADC";
    console.log(`🟢 [Firebase Admin]: Connected via ${source} — bypasses security rules.`);
    return { db: adminDb, isAdmin: true };
  } catch (err: any) {
    const msg = err?.message || err;
    if (msg !== "timeout") {
      console.warn("🟡 [Firebase Admin]: Not available:", msg);
    } else {
      console.warn("🟡 [Firebase Admin]: Credential lookup timed out — no credentials found.");
    }
    return null;
  }
}

async function initializeFirebaseAndSeed() {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      console.log("🟢 [Firebase Setup]: Config file firebase-applet-config.json not found.");
      return;
    }

    const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));

    // 1. Try Admin SDK first (credentials verified with a real query)
    const adminResult = await tryInitAdmin(configData);
    if (adminResult) {
      firebaseDb = adminResult.db;
      useFirebase = true;
      await seedFirestoreData(adminResult.db, true);
      return;
    }

    // 2. Fall back to Client SDK (web SDK, subject to Firestore rules).
    //    The ClientColRef adapter gracefully falls back to local JSON files
    //    if Firestore permissions fail — preserving admin-added custom data.
    const clientApp = initializeApp(configData);
    const clientDb = getClientFirestore(clientApp, configData.firestoreDatabaseId);
    const adapter = new ClientFirestoreAdapter(clientDb);

    firebaseDb = adapter;
    useFirebase = true;
    console.log("🟢 [Firebase]: Using Client SDK adapter (local file fallback). databaseId:", configData.firestoreDatabaseId || "(default)");
    try {
      await seedFirestoreData(adapter, false);
    } catch (seedErr) {
      console.warn("🟡 [Firebase]: Seeding note:", (seedErr as any)?.message || seedErr);
    }
  } catch (err) {
    console.error("🔴 [Firebase Setup]: Failed to initialize Firebase:", err);
    useFirebase = false;
  }
}

/**
 * Seed initial data into Firestore collections if they're empty.
 * @param db - Firestore db instance (admin or client adapter)
 * @param isAdmin - whether using Admin SDK (different API shape)
 */
async function seedFirestoreData(db: any, isAdmin: boolean) {
  const seedCollection = async (colName: string, seedData: any[]) => {
    const snapshot = isAdmin
      ? await db.collection(colName).limit(1).get()
      : await db.collection(colName).get();

    if (snapshot.empty) {
      console.log(`🟢 [Firebase Seeding]: Seeding Firestore with default ${colName}...`);
      for (const item of seedData) {
        await db.collection(colName).add(item);
      }
      console.log(`🟢 [Firebase Seeding]: ${colName} seeding complete.`);
    }
  };

  await seedCollection("menuItems", SEED_MENU_ITEMS);
  await seedCollection("banners", SEED_BANNERS);
  await seedCollection("promos", SEED_PROMOS);
  await seedCollection("branches", SEED_BRANCHES);
}

initializeFirebaseAndSeed();

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

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        role: "superadmin" | "moderator";
        outletAccess: string[];
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_pizzacity_oman_backend_key_2026";

function getCookie(req: express.Request, name: string): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const cookies = cookieHeader.split(";").reduce((acc, c) => {
    const [k, v] = c.trim().split("=");
    acc[k] = v;
    return acc;
  }, {} as Record<string, string>);
  return cookies[name];
}

// Token Verification Middleware
const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access Denied. Authorization token required." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Superadmin Role Guard Middleware
const requireSuperAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Access Denied. Superadmin privileges required." });
  }
  next();
};

// Outlet Access Guard Middleware
const checkOutletAccess = (paramKey: string) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (req.user.role === "superadmin") {
      return next();
    }
    const outlet = req.params[paramKey];
    if (!outlet) {
      return res.status(400).json({ error: "Outlet parameter missing." });
    }
    const hasAccess = req.user.outletAccess.some(
      (accessible) => accessible.toLowerCase() === outlet.toLowerCase()
    );
    if (!hasAccess) {
      return res.status(403).json({ error: `Access Denied. You do not have access to the ${outlet} outlet.` });
    }
    next();
  };
};

// ==========================================
// REST API ROUTES
// ==========================================

// POST /auth/login — authenticate user and issue JWT
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    if (useMongoDB) {
      const user = await MongoUser.findOne({ username: { $regex: new RegExp(`^${username}$`, "i") } });
      if (!user || !user.isActive) {
        return res.status(401).json({ error: "Invalid username or password, or user is inactive." });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid username or password." });
      }

      user.lastLogin = new Date();
      await user.save();

      const payload = {
        userId: user._id.toString(),
        username: user.username,
        role: user.role as "superadmin" | "moderator",
        outletAccess: user.outletAccess,
      };

      const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
      const refreshToken = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.json({ token: accessToken, user: payload });
    } else {
      // In-memory / simulation login fallback (or if mongo disconnected)
      const expectedUsername = process.env.ADMIN_USERNAME || "admin";
      const expectedPassword = process.env.ADMIN_PASSWORD || "pizzacityadmin2026";
      
      if (username.toLowerCase() === expectedUsername.toLowerCase() && password === expectedPassword) {
        const payload = {
          userId: "fallback-admin-id",
          username: expectedUsername,
          role: "superadmin" as const,
          outletAccess: [] as string[],
        };
        const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
        return res.json({ token: accessToken, user: payload });
      }
      return res.status(401).json({ error: "Invalid username or password." });
    }
  } catch (err: any) {
    return res.status(500).json({ error: "Server login error: " + err.message });
  }
});

// POST /auth/refresh — issue new accessToken using refreshToken cookie
app.post("/auth/refresh", async (req, res) => {
  const refreshToken = getCookie(req, "refreshToken");
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required." });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
    const userId = decoded.userId;

    if (useMongoDB) {
      const user = await MongoUser.findById(userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: "Invalid user or inactive." });
      }

      const payload = {
        userId: user._id.toString(),
        username: user.username,
        role: user.role as "superadmin" | "moderator",
        outletAccess: user.outletAccess,
      };

      const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
      return res.json({ token: accessToken, user: payload });
    } else {
      if (userId === "fallback-admin-id") {
        const payload = {
          userId: "fallback-admin-id",
          username: process.env.ADMIN_USERNAME || "admin",
          role: "superadmin" as const,
          outletAccess: [] as string[],
        };
        const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
        return res.json({ token: accessToken, user: payload });
      }
      return res.status(401).json({ error: "Invalid session." });
    }
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired refresh token." });
  }
});

// ==========================================
// USER MANAGEMENT ROUTES (superadmin only)
// ==========================================

// GET /admin/api/users — list all users
app.get("/admin/api/users", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    if (useMongoDB) {
      const users = await MongoUser.find({}, { passwordHash: 0 }).sort({ username: 1 });
      return res.json(users);
    } else {
      return res.json([{
        _id: "fallback-admin-id",
        username: process.env.ADMIN_USERNAME || "admin",
        role: "superadmin",
        outletAccess: [],
        isActive: true,
      }]);
    }
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch users: " + err.message });
  }
});

// POST /admin/api/users — create a new user
app.post("/admin/api/users", verifyToken, requireSuperAdmin, async (req, res) => {
  const { username, password, role, outletAccess } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: "Username, password and role are required." });
  }

  try {
    if (useMongoDB) {
      const existingUser = await MongoUser.findOne({ username: { $regex: new RegExp(`^${username}$`, "i") } });
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists." });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await MongoUser.create({
        username,
        passwordHash,
        role,
        outletAccess: outletAccess || [],
        isActive: true,
      });

      const userObj = user.toObject() as any;
      delete userObj.passwordHash;
      return res.json({ success: true, user: userObj });
    } else {
      return res.status(400).json({ error: "Cannot create user in local simulation mode." });
    }
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to create user: " + err.message });
  }
});

// PATCH /admin/api/users/:id — update user
app.patch("/admin/api/users/:id", verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const { username, password, role, outletAccess, isActive } = req.body;

  try {
    if (useMongoDB) {
      const user = await MongoUser.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      if (username) {
        const existingUser = await MongoUser.findOne({
          username: { $regex: new RegExp(`^${username}$`, "i") },
          _id: { $ne: id }
        });
        if (existingUser) {
          return res.status(400).json({ error: "Username already exists." });
        }
        user.username = username;
      }

      if (password) {
        user.passwordHash = await bcrypt.hash(password, 12);
      }

      if (role) user.role = role;
      if (outletAccess) user.outletAccess = outletAccess;
      if (isActive !== undefined) user.isActive = isActive;

      await user.save();
      const userObj = user.toObject() as any;
      delete userObj.passwordHash;
      return res.json({ success: true, user: userObj });
    } else {
      return res.status(400).json({ error: "Cannot update user in local simulation mode." });
    }
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to update user: " + err.message });
  }
});

// DELETE /admin/api/users/:id — delete user
app.delete("/admin/api/users/:id", verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (useMongoDB) {
      const user = await MongoUser.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      return res.json({ success: true, message: "User deleted successfully." });
    } else {
      return res.status(400).json({ error: "Cannot delete user in local simulation mode." });
    }
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to delete user: " + err.message });
  }
});

// PATCH /admin/api/users/:id/toggle — toggle user active status
app.patch("/admin/api/users/:id/toggle", verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (useMongoDB) {
      const user = await MongoUser.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      user.isActive = !user.isActive;
      await user.save();
      return res.json({ success: true, isActive: user.isActive });
    } else {
      return res.status(400).json({ error: "Cannot toggle user in local simulation mode." });
    }
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to toggle user status: " + err.message });
  }
});

// Server configuration health check & setup diagnostics
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: useMongoDB ? "MongoDB Atlas" : (useFirebase ? "Firebase Firestore" : "In-Memory/Local Fallback Mock Mode"),
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
    } else if (useFirebase) {
      const menuRef = firebaseDb.collection("menuItems");
      const menuSnapshot = await menuRef.get();
      items = menuSnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
      if (category) {
        items = items.filter((item: any) => item.category === category);
      }
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
    } else if (useFirebase) {
      const promosRef = firebaseDb.collection("promos");
      const snapshot = await promosRef.get();
      promos = snapshot.docs
        .map(doc => ({ _id: doc.id, ...doc.data() }))
        .filter((promo: any) => promo.isActive !== false);
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
    } else if (useFirebase) {
      const promosRef = firebaseDb.collection("promos");
      const snapshot = await promosRef.get();
      promo = snapshot.docs
        .map(doc => ({ _id: doc.id, ...doc.data() }))
        .find((p: any) => p.code.toLowerCase() === code.trim().toLowerCase() && p.isActive !== false);
    } else {
      promo = inMemPromoCodes.find((p) => p.code.toLowerCase() === code.trim().toLowerCase() && p.isActive);
    }

    if (!promo) {
      return res.status(200).json({ success: false, error: "Invalid, expired, or non-existent coupon code." });
    }

    const minAmount = (promo as any).minOrderAmount || 0;
    if (cartTotal < minAmount) {
      return res.status(200).json({
        success: false,
        error: `Cart total must be at least OMR ${minAmount.toFixed(3)} to apply "${(promo as any).code}".`
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
    } else if (useFirebase) {
      const bannersRef = firebaseDb.collection("banners");
      const snapshot = await bannersRef.get();
      banners = snapshot.docs
        .map(doc => ({ _id: doc.id, ...doc.data() }))
        .filter((banner: any) => banner.isActive !== false);
    } else {
      banners = inMemBanners.filter((banner) => banner.isActive !== false);
    }
    return res.json(banners);
  } catch (error: any) {
    return res.status(500).json({ error: "Error retrieving active banners: " + error.message });
  }
});

// POST /api/orders — place new order, save to DB, trigger pre-filled WhatsApp link URL (with rate limiting)
app.post("/api/orders", orderRateLimiter, async (req, res) => {
  const { items, customer, outlet, promoCode, promoDiscount } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order must contain at least one pizza or menu item." });
  }
  if (!customer || !customer.name || !customer.phone) {
    return res.status(400).json({ error: "Customer name and active WhatsApp phone number are required." });
  }
  if (!outlet) {
    return res.status(400).json({ error: "Outlet/Branch name is required." });
  }

  // Calculate order total with promo discount
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const discountAmt = promoDiscount ? Number(promoDiscount) : 0;
  const total = Math.max(0, subtotal - discountAmt);

  try {
    let targetPhone = "";
    let foundBranchName = outlet;

    // Look up branch in Mongo / Firestore / InMem to get WhatsApp/Phone number
    if (useMongoDB) {
      const dbBranch = await MongoBranch.findOne({ name: { $regex: new RegExp(`^${outlet}$`, "i") } });
      if (dbBranch) {
        targetPhone = dbBranch.whatsapp || dbBranch.phone;
        foundBranchName = dbBranch.name;
      }
    } else if (useFirebase) {
      const snapshot = await firebaseDb.collection("branches").get();
      const dbBranch = snapshot.docs
        .map((d: any) => d.data())
        .find((b: any) => b.name.toLowerCase() === outlet.toLowerCase());
      if (dbBranch) {
        targetPhone = dbBranch.whatsapp || dbBranch.phone;
        foundBranchName = dbBranch.name;
      }
    } else {
      const inMemBranch = inMemBranches.find(b => b.name.toLowerCase() === outlet.toLowerCase());
      if (inMemBranch) {
        targetPhone = inMemBranch.whatsapp || inMemBranch.phone;
        foundBranchName = inMemBranch.name;
      }
    }

    // Fallback to static OUTLET_MAPPINGS
    if (!targetPhone) {
      const match = Object.keys(OUTLET_MAPPINGS).find(k => k.toLowerCase() === outlet.toLowerCase());
      if (match) {
        targetPhone = OUTLET_MAPPINGS[match];
        foundBranchName = match;
      }
    }

    if (!targetPhone) {
      return res.status(400).json({ error: `Valid branch is required. Could not find active branch matching "${outlet}".` });
    }

    let savedOrder;
    if (useMongoDB) {
      const newOrder = new MongoOrder({
        items,
        customer,
        outlet: foundBranchName,
        total,
        status: "pending",
        timestamp: new Date(),
      });
      savedOrder = await newOrder.save();
    } else if (useFirebase) {
      const ordersRef = firebaseDb.collection("orders");
      const docRef = await ordersRef.add({
        items,
        customer,
        outlet: foundBranchName,
        total,
        status: "pending",
        timestamp: new Date().toISOString(),
      });
      savedOrder = {
        _id: docRef.id,
        items,
        customer,
        outlet: foundBranchName,
        total,
        status: "pending",
        timestamp: new Date().toISOString(),
      };
    } else {
      const newId = `ord_${Date.now()}`;
      const inMemOrder: InMemOrder = {
        _id: newId,
        items,
        customer,
        outlet: foundBranchName,
        total,
        status: "pending",
        timestamp: new Date().toISOString(),
      };
      inMemOrders.push(inMemOrder);
      savedOrder = inMemOrder;
    }

    // Build the WhatsApp message trigger block per outlet
    const cleanPhone = targetPhone.replace(/\s+/g, "").replace("+", "");
    const itemsText = items
      .map((i) => `• ${i.quantity}x ${i.name} (OMR ${i.price.toFixed(3)})`)
      .join("\n");

    const messageTemplate = 
      `Hi Pizza City ${foundBranchName}! 🍕\n\n` +
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

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageTemplate)}`;

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
    } else if (useFirebase) {
      const orderRef = firebaseDb.collection("orders").doc(id);
      const orderDoc = await orderRef.get();
      if (orderDoc.exists) {
        order = { _id: orderDoc.id, ...orderDoc.data() };
      } else {
        // Fallback suffix search for 6-char IDs
      if (id.length === 6) {

       order = await MongoOrder.findOne({
       _id: new RegExp(`${id}$`)
      });
    }
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

app.get("/api/sheets/config", verifyToken, requireSuperAdmin, (req, res) => {
  const config = loadSheetsConfig();
  return res.json(config);
});

app.post("/api/sheets/config", verifyToken, requireSuperAdmin, (req, res) => {
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

app.post("/api/sheets/sync-all", verifyToken, requireSuperAdmin, async (req, res) => {
  const config = loadSheetsConfig();
  if (!config.webAppUrl) {
    return res.status(400).json({ error: "Google Sheets Web App URL is not configured." });
  }

  try {
    let allOrders: any[];
    if (useMongoDB) {
      allOrders = await MongoOrder.find({}).sort({ timestamp: -1 });
    } else if (useFirebase) {
      const snapshot = await firebaseDb.collection("orders").get();
      allOrders = snapshot.docs
        .map((d: any) => ({ _id: d.id, ...d.data() }))
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
app.get("/api/orders/:outletId/summary", verifyToken, checkOutletAccess("outletId"), async (req, res) => {
  const { outletId } = req.params;

  try {
    let orders;
    if (useMongoDB) {
      if (outletId.toLowerCase() === "all") {
        orders = await MongoOrder.find({});
      } else {
        orders = await MongoOrder.find({ outlet: new RegExp(`^${outletId}$`, "i") });
      }
    } else if (useFirebase) {
      const ordersRef = firebaseDb.collection("orders");
      const snapshot = await ordersRef.get();
      orders = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() as any }));
      if (outletId.toLowerCase() !== "all") {
        orders = orders.filter(
          (o: any) => o.outlet.toLowerCase() === outletId.toLowerCase()
        );
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

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage engine using Cloudinary
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "restaurant_banners",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  } as any,
});

const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// POST /admin/api/upload — upload an image to Cloudinary (Requires JWT auth)
app.post(
  "/admin/api/upload",
  verifyToken,
  requireSuperAdmin,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("Multer/Cloudinary error:", err);
        return res.status(400).json({ error: "Upload failed: " + err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
      }

      const secureUrl = (req.file as any).path || (req.file as any).secure_url;

      if (!secureUrl) {
        return res.status(500).json({ error: "Cloudinary upload succeeded but no URL was returned." });
      }

      return res.json({ success: true, url: secureUrl });
    } catch (error: any) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: "Failed to upload image: " + error.message });
    }
  }
);

// GET /admin/api/promos — fetch all promo codes (Requires basic auth)
app.get("/admin/api/promos", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    let promos;
    if (useMongoDB) {
      promos = await MongoPromoCode.find({});
    } else if (useFirebase) {
      const promosRef = firebaseDb.collection("promos");
      const snapshot = await promosRef.get();
      promos = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    } else {
      promos = inMemPromoCodes;
    }
    return res.json(promos);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch promo codes: " + error.message });
  }
});

// POST /admin/api/promos — add a new promo code (Requires basic auth)
app.post("/admin/api/promos", verifyToken, requireSuperAdmin, async (req, res) => {
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
    } else if (useFirebase) {
      const promosRef = firebaseDb.collection("promos");
      const snapshot = await promosRef.get();
      const existing = snapshot.docs.some(doc => (doc.data() as any).code === uppercaseCode);
      if (existing) {
        return res.status(400).json({ error: "Promo code with this code already exists." });
      }

      const payload = {
        code: uppercaseCode,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        isActive: isActive !== false
      };
      const docRef = await promosRef.add(payload);
      const newPromo = { _id: docRef.id, ...payload };
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
app.patch("/admin/api/promos/:id", verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    let updatedPromo;
    if (useMongoDB) {
      updatedPromo = await MongoPromoCode.findByIdAndUpdate(id, updates, { new: true });
      if (!updatedPromo) {
        return res.status(404).json({ error: "Promo not found." });
      }
    } else if (useFirebase) {
      const promoRef = firebaseDb.collection("promos").doc(id);
      const checkDoc = await promoRef.get();
      if (!checkDoc.exists) {
        return res.status(404).json({ error: "Promo not found." });
      }
      await promoRef.update(updates);
      const updatedDoc = await promoRef.get();
      updatedPromo = { _id: updatedDoc.id, ...updatedDoc.data() };
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
app.delete("/admin/api/promos/:id", verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (useMongoDB) {
      const deleted = await MongoPromoCode.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: "Promo not found." });
      }
    } else if (useFirebase) {
      const promoRef = firebaseDb.collection("promos").doc(id);
      const checkDoc = await promoRef.get();
      if (!checkDoc.exists) {
        return res.status(404).json({ error: "Promo not found." });
      }
      await promoRef.delete();
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
app.get("/admin/api/banners", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    let banners;
    if (useMongoDB) {
      banners = await MongoBanner.find({});
    } else if (useFirebase) {
      const bannersRef = firebaseDb.collection("banners");
      const snapshot = await bannersRef.get();
      banners = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    } else {
      banners = inMemBanners;
    }
    return res.json(banners);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch admin banners: " + error.message });
  }
});

// PATCH /admin/api/banners/:id/toggle — toggle banner active state (Requires basic auth)
app.patch("/admin/api/banners/:id/toggle", verifyToken, requireSuperAdmin, async (req, res) => {
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
    } else if (useFirebase) {
      const bannerRef = firebaseDb.collection("banners").doc(id);
      const checkDoc = await bannerRef.get();
      if (!checkDoc.exists) {
        return res.status(404).json({ error: "Banner not found." });
      }
      const currentActive = (checkDoc.data() as any).isActive;
      await bannerRef.update({ isActive: !currentActive });
      const updatedDoc = await bannerRef.get();
      updatedBanner = { _id: updatedDoc.id, ...updatedDoc.data() };
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

// POST /admin/api/banners — add a new banner (Requires basic auth)
app.post("/admin/api/banners", verifyToken, requireSuperAdmin, async (req, res) => {
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
    } else if (useFirebase) {
      const bannersRef = firebaseDb.collection("banners");
      const payload = {
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
      const docRef = await bannersRef.add(payload);
      savedBanner = { _id: docRef.id, ...payload };
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
app.patch("/admin/api/banners/:id", verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    let updatedBanner;
    if (useMongoDB) {
      updatedBanner = await MongoBanner.findByIdAndUpdate(id, updates, { new: true });
      if (!updatedBanner) {
        return res.status(404).json({ error: "Banner not found." });
      }
    } else if (useFirebase) {
      const bannerRef = firebaseDb.collection("banners").doc(id);
      const checkDoc = await bannerRef.get();
      if (!checkDoc.exists) {
        return res.status(404).json({ error: "Banner not found." });
      }
      await bannerRef.update(updates);
      const updatedDoc = await bannerRef.get();
      updatedBanner = { _id: updatedDoc.id, ...updatedDoc.data() };
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
app.delete("/admin/api/banners/:id", verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    if (useMongoDB) {
      const deleted = await MongoBanner.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: "Banner not found." });
      }
    } else if (useFirebase) {
      const bannerRef = firebaseDb.collection("banners").doc(id);
      const checkDoc = await bannerRef.get();
      if (!checkDoc.exists) {
        return res.status(404).json({ error: "Banner not found." });
      }
      await bannerRef.delete();
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
app.patch("/admin/api/banners/:id/toggle", verifyToken, requireSuperAdmin, async (req, res) => {
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
    } else if (useFirebase) {
      const bannerRef = firebaseDb.collection("banners").doc(id);
      const checkDoc = await bannerRef.get();
      if (!checkDoc.exists) {
        return res.status(404).json({ error: "Banner not found." });
      }
      const currentActive = (checkDoc.data() as any).isActive;
      await bannerRef.update({ isActive: !currentActive });
      const updatedDoc = await bannerRef.get();
      updatedBanner = { _id: updatedDoc.id, ...updatedDoc.data() };
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

// PATCH /admin/api/menu/:id/toggle — toggle menu item availability (Requires basic auth)
app.patch("/admin/api/menu/:id/toggle", verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    let updatedItem;
    if (useMongoDB) {
      const item = await MongoMenuItem.findById(id);
      if (item) {
        item.available = !item.available;
        updatedItem = await item.save();
      }
    } else if (useFirebase) {
      const itemRef = firebaseDb.collection("menuItems").doc(id);
      const checkDoc = await itemRef.get();
      if (checkDoc.exists) {
        const currentActive = (checkDoc.data() as any).available;
        await itemRef.update({ available: !currentActive });
        const updatedDoc = await itemRef.get();
        updatedItem = { _id: updatedDoc.id, ...updatedDoc.data() };
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

// POST /admin/api/menu — add a new menu item to catalog (Requires basic auth)
app.post("/admin/api/menu", verifyToken, requireSuperAdmin, async (req, res) => {
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
    } else if (useFirebase) {
      const menuRef = firebaseDb.collection("menuItems");
      const docRef = await menuRef.add(payload);
      savedItem = { _id: docRef.id, ...payload };
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
app.patch("/admin/api/menu/:id", verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    let updatedItem;
    if (useMongoDB) {
      updatedItem = await MongoMenuItem.findByIdAndUpdate(id, updates, { new: true });
    } else if (useFirebase) {
      const itemRef = firebaseDb.collection("menuItems").doc(id);
      const checkDoc = await itemRef.get();
      if (checkDoc.exists) {
        await itemRef.update(updates);
        const updatedDoc = await itemRef.get();
        updatedItem = { _id: updatedDoc.id, ...updatedDoc.data() };
      }
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
app.delete("/admin/api/menu/:id", verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    let deleted = false;
    if (useMongoDB) {
      const result = await MongoMenuItem.findByIdAndDelete(id);
      deleted = !!result;
    } else if (useFirebase) {
      const itemRef = firebaseDb.collection("menuItems").doc(id);
      const checkDoc = await itemRef.get();
      if (checkDoc.exists) {
        await itemRef.delete();
        deleted = true;
      }
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

// GET /api/branches — get active branches for public customer site
app.get("/api/branches", async (req, res) => {
  try {
    let branches;
    if (useMongoDB) {
      branches = await MongoBranch.find({ isActive: true });
    } else if (useFirebase) {
      const branchesRef = firebaseDb.collection("branches");
      const snapshot = await branchesRef.get();
      branches = snapshot.docs
        .map(doc => ({ _id: doc.id, ...doc.data() }))
        .filter(b => b.isActive === true || b.isActive === undefined);
    } else {
      branches = inMemBranches.filter(b => b.isActive !== false);
    }
    return res.json(branches);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch branches: " + error.message });
  }
});

// GET /admin/api/branches — get all branches for admin console (Requires basic auth)
app.get("/admin/api/branches", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    let branches;
    if (useMongoDB) {
      branches = await MongoBranch.find({});
    } else if (useFirebase) {
      const branchesRef = firebaseDb.collection("branches");
      const snapshot = await branchesRef.get();
      branches = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    } else {
      branches = inMemBranches;
    }
    return res.json(branches);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch admin branches: " + error.message });
  }
});

// PATCH /admin/api/branches/:id/toggle — toggle branch active status (Requires basic auth)
app.patch("/admin/api/branches/:id/toggle", verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    let updatedBranch;
    if (useMongoDB) {
      const branch = await MongoBranch.findById(id);
      if (branch) {
        branch.isActive = !branch.isActive;
        updatedBranch = await branch.save();
      }
    } else if (useFirebase) {
      const branchRef = firebaseDb.collection("branches").doc(id);
      const checkDoc = await branchRef.get();
      if (checkDoc.exists) {
        const currentActive = (checkDoc.data() as any).isActive !== false;
        await branchRef.update({ isActive: !currentActive });
        const updatedDoc = await branchRef.get();
        updatedBranch = { _id: updatedDoc.id, ...updatedDoc.data() };
      }
    } else {
      const idx = inMemBranches.findIndex(b => b._id === id);
      if (idx !== -1) {
        inMemBranches[idx].isActive = !inMemBranches[idx].isActive;
        updatedBranch = inMemBranches[idx];
      }
    }

    if (!updatedBranch) {
      return res.status(404).json({ error: "Branch not found." });
    }
    return res.json({ success: true, isActive: updatedBranch.isActive });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to toggle branch status: " + error.message });
  }
});

// POST /admin/api/branches — add a new branch (Requires basic auth)
app.post("/admin/api/branches", verifyToken, requireSuperAdmin, async (req, res) => {
  const { name, phone, whatsapp, address, map, geo, hours, delivery, isActive, image } = req.body;
  if (!name || !phone || !whatsapp || !address) {
    return res.status(400).json({ error: "Branch name, phone, whatsapp, and address are required." });
  }

  try {
    let savedBranch;
    const payload = {
      name,
      phone,
      whatsapp,
      address,
      map: map || "",
      geo: geo || "",
      hours: hours || "Daily 11 AM – 11 PM",
      delivery: delivery !== false,
      isActive: isActive !== false,
      image: image || "",
    };

    if (useMongoDB) {
      const newBranch = new MongoBranch(payload);
      savedBranch = await newBranch.save();
    } else if (useFirebase) {
      const branchesRef = firebaseDb.collection("branches");
      const docRef = await branchesRef.add(payload);
      savedBranch = { _id: docRef.id, ...payload };
    } else {
      const newId = `br_${Date.now()}`;
      savedBranch = { _id: newId, ...payload };
      inMemBranches.push(savedBranch);
    }
    return res.status(201).json(savedBranch);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to create new branch: " + error.message });
  }
});

// PATCH /admin/api/branches/:id — update existing branch (Requires basic auth)
app.patch("/admin/api/branches/:id", verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    let updatedBranch;
    if (useMongoDB) {
      updatedBranch = await MongoBranch.findByIdAndUpdate(id, updates, { new: true });
    } else if (useFirebase) {
      const branchRef = firebaseDb.collection("branches").doc(id);
      await branchRef.update(updates);
      const updatedDoc = await branchRef.get();
      updatedBranch = { _id: updatedDoc.id, ...updatedDoc.data() };
    } else {
      const idx = inMemBranches.findIndex(b => b._id === id);
      if (idx !== -1) {
        inMemBranches[idx] = { ...inMemBranches[idx], ...updates };
        updatedBranch = inMemBranches[idx];
      }
    }

    if (!updatedBranch) {
      return res.status(404).json({ error: "Branch not found." });
    }
    return res.json(updatedBranch);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update branch: " + error.message });
  }
});

// DELETE /admin/api/branches/:id — delete branch (Requires basic auth)
app.delete("/admin/api/branches/:id", verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    let deleted = false;
    if (useMongoDB) {
      const result = await MongoBranch.findByIdAndDelete(id);
      deleted = !!result;
    } else if (useFirebase) {
      const branchRef = firebaseDb.collection("branches").doc(id);
      const checkDoc = await branchRef.get();
      if (checkDoc.exists) {
        await branchRef.delete();
        deleted = true;
      }
    } else {
      const idx = inMemBranches.findIndex(b => b._id === id);
      if (idx !== -1) {
        inMemBranches.splice(idx, 1);
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({ error: "Branch not found to delete." });
    }
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete branch: " + error.message });
  }
});

// GET /api/orders/:outletId — get orders for a specific outlet (Requires basic auth)
app.get("/api/orders/:outletId", verifyToken, checkOutletAccess("outletId"), async (req, res) => {
  const { outletId } = req.params; // Outlet name e.g. Nizwa, Samail, Sur, Quriyat, Fanja

  try {
    let orders;
    if (useMongoDB) {
      orders = await MongoOrder.find({ outlet: outletId }).sort({ timestamp: -1 });
    } else if (useFirebase) {
      const ordersRef = firebaseDb.collection("orders");
      const snapshot = await ordersRef.get();
      orders = snapshot.docs
        .map(doc => ({ _id: doc.id, ...doc.data() as any }))
        .filter((o: any) => o.outlet.toLowerCase() === outletId.toLowerCase())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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

// PATCH /api/orders/:id/status — update active order status
app.patch("/api/orders/:id/status", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "preparing", "out-for-delivery", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Incorrect target order status." });
  }

  try {
    let orderDoc: any;

    // First fetch the order to check outlet access
    if (useMongoDB) {
      orderDoc = await MongoOrder.findById(id);
    } else if (useFirebase) {
      const snap = await firebaseDb.collection("orders").doc(id).get();
      if (snap.exists) orderDoc = { _id: snap.id, ...snap.data() };
    } else {
      orderDoc = inMemOrders.find((o) => o._id === id);
    }

    if (!orderDoc) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Check outlet access for moderator role
    if (req.user && req.user.role !== "superadmin") {
      const orderOutlet = orderDoc.outlet || orderDoc.branch || "";
      const hasAccess = req.user.outletAccess.some(
        (o: string) => o.toLowerCase() === orderOutlet.toLowerCase()
      );
      if (!hasAccess) {
        return res.status(403).json({ error: "Access Denied. You do not have access to this order's outlet." });
      }
    }

    let updatedOrder;
    if (useMongoDB) {
      updatedOrder = await MongoOrder.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
    } else if (useFirebase) {
      await firebaseDb.collection("orders").doc(id).update({ status });
      const updatedDoc = await firebaseDb.collection("orders").doc(id).get();
      updatedOrder = { _id: updatedDoc.id, ...updatedDoc.data() };
    } else {
      const idx = inMemOrders.findIndex((o) => o._id === id);
      if (idx !== -1) {
        inMemOrders[idx].status = status;
        updatedOrder = inMemOrders[idx];
      }
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
    // Serve static files with a strong cache-control header
    app.use(express.static(distPath, { maxAge: "1y", etag: true }));
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
