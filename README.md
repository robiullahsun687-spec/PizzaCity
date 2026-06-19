# 🍕 Pizza City Oman — Full-Stack Ordering System

This is the robust Node.js + Express + MongoDB full-stack application for the Pizza City restaurant chain in Oman, featuring live database ordering, automatic menu seeding, an outlet administrative dashboard, and direct WhatsApp invoice notification routing.

Designed using the brand identity metrics: Red `#D72B2B`, Orange `#F26522`, and Cream `#FFF8F2`, paired with **Playfair Display** (headings) and **Nunito** (body) typography.

---

## 🚀 Key Modules & Capabilities

1. **Vite React Frontend SPA**: Handcrafted, highly responsive desktop/mobile UI with frosted glass navigations, live menu item tabs, FAQ searches, quick contact forms, animate triggers, and a unified cart state.
2. **MongoDB Database Persistence**: Stores client details, ordered items, subtotals, and preparation statuses under robust high-performing Mongoose models. Runs on a resilient **In-Memory Mock Store fallback** if no cluster string is assigned so the servers never crash!
3. **Branch Admin Control Panel**: Secured via Basic HTTP Auth. Staff can filter incoming requests per branch and update prep coordinates (e.g. `pending`, `preparing`, `out-for-delivery`, `delivered`, `cancelled`) directly on MongoDB clusters!
4. **WhatsApp Invoice Routing**: Tapping checkouts automatically computes item lists and opens WhatsApp pre-filled with formatted invoices addressed directly to the selected branch phone line.

---

## 🛠️ Environmental Settings (`.env`)

Declare these variables inside your active deployment platforms or local development environment:

```env
# MongoDB Connection String (Atlas, Railway or local host)
# Leave blank to fall back to a fully functional in-memory storage manager
MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/pizzacity"

# Credentials for the simple HTTP Basic Auth Admin portal
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="pizzacityadmin2026"

# Optional App URL injected automatically on Cloud Run ports
APP_URL="https://pizzacity-production.up.railway.app"
```

---

## 🚅 Local Development Commands

Retrieve dependencies and boot the developer instance:

```bash
# 1. Install dependencies
npm install

# 2. Fire up the developer server
npm run dev

# 3. Compile the application production bundles
npm run build

# 4. Spin up the static production server CJS bundle
npm run start
```

---

## 🔗 REST API Endpoints

| Method | Endpoint | Description | Protected? |
|--------|----------|-------------|------------|
| **GET** | `/api/health` | Service status, database type, and active connections | No |
| **GET** | `/api/menu` | Retrieves the list of gourmet menu items with optional category filters | No |
| **POST** | `/api/orders` | Places a new order, saves records to MongoDB, and returns WhatsApp deep-links | No |
| **GET** | `/api/orders/:outletId` | Chronological list of orders placed for a branch (e.g. `Nizwa`, `Samail`) | **Yes (Basic Auth)** |
| **PATCH** | `/api/orders/:id/status` | Updates prep progress state of an active saved invoice | **Yes (Basic Auth)** |

---

## 📦 Railway Deployment Steps

Railway is a brilliant, zero-coldstart cloud deployment platform perfect for full-stack Node.js + Express instances. Follow this blueprint to publish:

### Step 1: Connect Codebase to GitHub
Push your Pizza City code to a repository on **GitHub.com**:
```bash
git init
git add .
git commit -m "feat: scaffold Pizza City full stack backend and admin"
# ... create GitHub repository and push main branch
```

### Step 2: Set up a MongoDB Database on Railway (Optional)
If you want a dedicated relational database running live inside your Railway cluster:
1. Log in to your account at **https://railway.app**
2. Click **New Project** → **Provision MongoDB**.
3. Railway instantly creates a private MongoDB database container.
4. Drag-select and copy your database connection variable string: `mongodb://mongo:password@containers.railway.app:XXXX`.

### Step 3: Deploy the Express Applet
1. Inside your Railway dashboard, click **New Project** → **Deploy from GitHub repo**.
2. Select your `pizza-city` repository.
3. Click **Add Variables** inside the deployment panel and supply:
   - `MONGODB_URI`: *Paste your MongoDB cluster connection url here* (or leave blank to use the robust in-memory SQLite/JSON mock).
   - `ADMIN_USERNAME`: `admin` (or custom staff username)
   - `ADMIN_PASSWORD`: `pizzacityadmin2026` (or custom secure key)
4. Click **Deploy**. Railway will run `npm run build` to compile the frontend and CJS CJSX module dependencies, then execute `npm run start` to host it.
5. In **Settings**, click **Generate Domain** to get a free public secure `https://xxx.up.railway.app` URL for Pizza City Oman!
