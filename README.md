<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=200&section=header&text=BakeryMate%20🎂&fontSize=60&fontColor=fff&animation=fadeIn&fontAlignY=38&desc=AI-Powered%20Bakery%20Shopping%20%26%20Ordering%20Assistant&descAlignY=58&descSize=18" width="100%"/>

<!-- Badges -->
<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenRouter-6C47FF?style=for-the-badge&logo=openai&logoColor=white" />
  <img src="https://img.shields.io/badge/Meta%20Llama%203.3-0064E0?style=for-the-badge&logo=meta&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/Cost-₹0%20Free-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Learning%20Project-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-Llama%203.3%2070B-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Updated-June%202025-red?style=for-the-badge" />
</p>

<br/>

> 🍰 **A fully working AI bakery chatbot** — built with Node.js, OpenRouter (Llama 3.3 70B) & Supabase. Type naturally, get replies, place orders. All for ₹0.

<br/>

</div>

---

## 🆕 Recent Updates

> **Latest changes to the project — June 2025**

| # | Update |
|---|---|
| 🔄 | Migrated from Google Gemini API to **OpenRouter API** for greater model flexibility |
| 🤖 | Added support for **Meta Llama 3.3 70B Instruct** through OpenRouter |
| 💬 | Improved AI agent's conversational style and customer interactions |
| 🗂️ | Refactored AI integration into a dedicated **`backend/openrouter.js`** service module |
| 🔌 | Updated backend routing and API handling for the new AI provider |
| 🧠 | Enhanced **prompt engineering** for more natural and helpful responses |
| ⚙️ | Updated environment configuration to support OpenRouter credentials and model selection |
| 🏗️ | Improved overall project structure and maintainability |
| 🐛 | Fixed configuration and deployment issues encountered during development |
| 🛍️ | Continued refining the bakery ordering workflow and user experience |
| 📄 | Improved GitHub repository structure and documentation for easier setup |

------

## ✨ What is BakeryMate?

**BakeryMate** is an AI-powered chat assistant for a bakery. Customers can browse the menu, ask questions, and place orders — all through a simple chat interface in the browser. No WhatsApp, no payment gateway, no complexity. Just pure learning.

Built as a **beginner learning project** to understand how AI chatbots, REST APIs, and databases work together.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🤖 **AI Chat** | Powered by Meta Llama 3.3 70B via OpenRouter — replies feel natural and human |
| 🔀 **Model Flexibility** | Easily switch AI models via OpenRouter without changing core code |
| 🧾 **Order Taking** | Understands "I want 2 croissants and a cake" and calculates total |
| 💾 **Order Saving** | Confirmed orders automatically saved to Supabase PostgreSQL |
| 📋 **Menu Display** | Ask "show me the menu" — get all items with prices instantly |
| ❓ **FAQ Answers** | Hours, location, delivery info — bot knows it all |
| 💬 **Chat History** | Remembers the conversation context within a session |

---

## 🗂️ Project Structure

```
bakerymate/
├── 📁 backend/
│   ├── index.js           # Express server + all API routes
│   ├── openrouter.js      # ✨ NEW — OpenRouter AI service module
│   ├── database.js        # Supabase connection + queries
│   ├── menu.js            # Static menu config
│   └── package.json       # Dependencies
├── 📁 frontend/
│   ├── index.html         # Chat UI
│   ├── styles.css         # Warm bakery styling
│   └── app.js             # Frontend logic
├── 📁 data/
│   └── menu.csv           # 10 bakery products
├── .env                   # 🔒 Your secrets (never commit this)
└── .env.example           # Template for env variables
```

---

## 🧰 Tech Stack

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   Browser  →  Express.js  →  OpenRouter API    │
│                    ↓              ↓             │
│              Supabase DB    Llama 3.3 70B       │
│           (PostgreSQL orders)                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

| Layer | Technology | Why |
|---|---|---|
| **Backend** | Node.js + Express | Simple, beginner-friendly |
| **AI Provider** | OpenRouter API | Access many free models in one place |
| **AI Model** | Meta Llama 3.3 70B Instruct | Powerful, free tier available |
| **Database** | Supabase (PostgreSQL) | Free tier, easy setup |
| **Frontend** | Vanilla HTML/CSS/JS | No framework needed |

---

## ⚙️ Setup & Installation

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/bakerymate.git
cd bakerymate
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
DATABASE_URL=your_supabase_connection_string_here
PORT=3000
```

| Variable | Where to get it |
|---|---|
| `OPENROUTER_API_KEY` | [openrouter.ai](https://openrouter.ai) → Keys → Create Key |
| `OPENROUTER_MODEL` | Leave as shown above for Llama 3.3 70B free |
| `DATABASE_URL` | Supabase → Settings → Database → URI |
| `PORT` | Leave as `3000` |

### 4. Set up Supabase database

Run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT,
  items TEXT NOT NULL,
  total_price NUMERIC,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  product_id TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  available BOOLEAN DEFAULT true
);
```

### 5. Seed the database

```bash
npm run seed
```

### 6. Start the dev server

```bash
npm run dev
```

Open your browser at **http://localhost:3000** 🎉

---

## 💬 How to Use

Once the app is running, try these in the chat:

```
👋  "Hello"                              → Bot greets you
📋  "Show me the menu"                   → See all items + prices
🎂  "I want a chocolate truffle cake"    → Bot adds to order
🧺  "Also 2 croissants"                 → Bot updates order total
✅  "Yes confirm"                        → Order saved to database!
⏰  "What are your opening hours?"       → Bot answers from FAQ
📍  "Where are you located?"            → Bot gives address
```

---

## 🛒 Menu

| # | Item | Category | Price |
|---|---|---|---|
| B001 | Chocolate Truffle Cake | 🎂 Cakes | ₹650 |
| B002 | Vanilla Cream Cake | 🎂 Cakes | ₹550 |
| B003 | Black Forest Cake | 🎂 Cakes | ₹700 |
| B004 | Red Velvet Cake | 🎂 Cakes | ₹750 |
| B005 | Butter Croissant | 🥐 Pastries | ₹80 |
| B006 | Chocolate Éclair | 🥐 Pastries | ₹90 |
| B007 | Sourdough Loaf | 🍞 Breads | ₹200 |
| B008 | Garlic Herb Bread | 🍞 Breads | ₹120 |
| B009 | Choco Chip Cookies (6 pcs) | 🍪 Cookies | ₹120 |
| B010 | Almond Shortbread (6 pcs) | 🍪 Cookies | ₹150 |

---

## 🔌 API Endpoints

```
POST  /api/chat      →  Send message, get AI reply
GET   /api/menu      →  Get all products from DB
GET   /api/orders    →  View last 10 orders (debug)
GET   /              →  Serves the chat UI
```

---

## 🗺️ How It Works

```
User types message
       ↓
Frontend (app.js) sends POST /api/chat
       ↓
Express server (index.js) receives it
       ↓
openrouter.js calls OpenRouter API → Llama 3.3 70B generates reply
       ↓
If "CONFIRMED_ORDER" in reply → save to Supabase
       ↓
Reply sent back to browser
       ↓
Chat bubble appears on screen ✅
```

---

## 💸 Cost Breakdown

| Service | Free Tier Limit | Used |
|---|---|---|
| OpenRouter (Llama 3.3 70B) | Free tier available | ~500 tokens/chat |
| Supabase | 500MB database | ~1MB for testing |
| Node.js | Free, runs locally | ✅ |
| **Total** | — | **₹0** |

---

## 📦 Scripts

```bash
npm run dev     # Start with auto-reload (development)
npm run start   # Start normally (production)
npm run seed    # Populate database with menu items
```

---

## 🔮 What You Can Add Next

- [ ] Admin dashboard to view all orders
- [ ] WhatsApp integration via Twilio
- [ ] Razorpay payment link generation
- [ ] Order status tracking
- [ ] Image search with vision models via OpenRouter
- [ ] Switch models dynamically from the UI

---

##  Built With

- [OpenRouter](https://openrouter.ai) — AI model gateway
- [Meta Llama 3.3 70B](https://openrouter.ai/meta-llama/llama-3.3-70b-instruct) — AI model
- [Supabase](https://supabase.com) — Database
- [Express.js](https://expressjs.com) — Backend server
- [Render.com](https://render.com) — Free hosting (optional)

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=100&section=footer" width="100%"/>

**Made with ❤️ for learning purposes**

*If this helped you learn something new, give it a ⭐ on GitHub!*

</div>
