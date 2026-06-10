# BakeryMate — AI-Powered Bakery Shopping & Ordering Assistant

## Project Overview

An AI-powered bakery assistant called **BakeryMate** for an online bakery store. Customers can browse the menu, ask questions about products, and place orders using natural language text queries. The system uses Google's Gemini Flash model for conversational responses and PostgreSQL via Supabase to store orders and product data.

---

## Tech Stack

- **Backend:** Node.js with Express.js
- **Database:** Supabase (PostgreSQL)
- **AI/LLM:** Google Gemini 1.5 Flash (`gemini-1.5-flash`) for generating conversational responses
- **Frontend:** Simple HTML + CSS + JavaScript (no framework — single page app)
- **API Client:** Google Generative AI Node.js SDK (`@google/generative-ai`)

---

## Project Structure

```
bakerymate/
├── backend/
│   ├── index.js                  # Express app entry point with all routes
│   ├── gemini.js                 # Gemini AI helper — chat + order extraction
│   ├── database.js               # Supabase/PostgreSQL connection and queries
│   ├── menu.js                   # Static menu config with products and prices
│   └── package.json              # Node dependencies
├── frontend/
│   ├── index.html                # Chat interface
│   ├── styles.css                # Styling
│   └── app.js                    # Frontend logic
├── data/
│   └── menu.csv                  # Product catalog (10 bakery items)
├── .env                          # Environment variables (not committed)
└── .env.example                  # Example env file (committed)
```

---

## Environment Variables

Create a `.env` file in the project root:

```
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_supabase_postgres_connection_string_here
PORT=3000
```

---

## Database Structure

### Supabase Setup

Run this in the Supabase SQL editor:

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_phone TEXT,
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
  image_filename TEXT,
  available BOOLEAN DEFAULT true
);
```

---

## Product Catalog (menu.csv)

10 products across categories: Cakes, Pastries, Breads, Cookies.

| ID   | Name                          | Category | Price (₹) | Image File              |
|------|-------------------------------|----------|-----------|-------------------------|
| B001 | Chocolate Truffle Cake        | Cakes    | 650       | choco_truffle.jpg       |
| B002 | Vanilla Cream Cake            | Cakes    | 550       | vanilla_cream.jpg       |
| B003 | Black Forest Cake             | Cakes    | 700       | black_forest.jpg        |
| B004 | Red Velvet Cake               | Cakes    | 750       | red_velvet.jpg          |
| B005 | Butter Croissant              | Pastries | 80        | croissant.jpg           |
| B006 | Chocolate Éclair              | Pastries | 90        | eclair.jpg              |
| B007 | Sourdough Loaf                | Breads   | 200       | sourdough.jpg           |
| B008 | Garlic Herb Bread             | Breads   | 120       | garlic_bread.jpg        |
| B009 | Choco Chip Cookies (6 pcs)    | Cookies  | 120       | choco_cookies.jpg       |
| B010 | Almond Shortbread (6 pcs)     | Cookies  | 150       | almond_shortbread.jpg   |

**Product images** should be real food photos (sourced from free stock sites like Unsplash or Pexels). Place them in `frontend/images/`. Recommended size: 400x400px, clean white/neutral background.

---

## Menu Config (menu.js)

Export a structured menu object and a `menuText()` function that returns the full menu formatted as a WhatsApp/chat-friendly string with categories, names, and prices.

---

## Gemini AI Service (gemini.js)

Use Gemini 1.5 Flash (`gemini-1.5-flash`) to generate conversational responses with a bakery assistant system prompt.

### System Prompt

```
You are a friendly and helpful customer service assistant for "Sweet Dreams Bakery".
Your job is to:
1. Help customers view the menu when asked
2. Take their orders politely and confirm item names + prices
3. Answer questions about the bakery (hours, location, delivery)
4. Summarize the order and ask for confirmation before finalizing

Bakery details:
- Name: Sweet Dreams Bakery
- Hours: 8am to 9pm, Monday to Saturday
- Location: MG Road, Hyderabad
- Delivery: Available within 5km radius, minimum order ₹300
- Payment: UPI, Cash on delivery

Rules:
- Always be warm, friendly, and professional
- When a customer wants to order, list what they've ordered with individual prices and give a total
- If they confirm the order, say "Order confirmed! ✅" and include the word CONFIRMED_ORDER in your reply
- Keep replies concise — use bullet points for menus and order summaries
- If asked something you don't know, politely say you'll check and get back
```

### Conversation History

- Keep conversation history per session in memory (JS object keyed by session ID)
- Trim history to the last 20 messages to avoid hitting token limits
- Initialize fresh history for each new session

### Order Detection

Export an `isOrderConfirmed(reply)` function that returns `true` if the AI reply contains the string `CONFIRMED_ORDER`.

---

## Backend Routes (index.js)

```
POST /api/chat        — Handle text chat messages, return AI reply
GET  /api/menu        — Return full product list from database
GET  /api/orders      — Return last 10 orders (for admin/debug view)
GET  /                — Serve the frontend index.html
```

Serve `frontend/` as static files. Serve `frontend/images/` at `/images/`.

### POST /api/chat

Request body:
```json
{
  "message": "I want to order a chocolate truffle cake",
  "sessionId": "user_abc123"
}
```

Response:
```json
{
  "reply": "Great choice! One Chocolate Truffle Cake at ₹650. Shall I confirm this order?",
  "orderConfirmed": false
}
```

Flow:
1. Receive message + sessionId
2. Pass to Gemini with conversation history for that session
3. Check if reply contains `CONFIRMED_ORDER`
4. If confirmed → save order to Supabase with status `pending`
5. Return the AI reply and `orderConfirmed` boolean

---

## Frontend (index.html + app.js + styles.css)

### Chat Interface Features

- Clean chat bubble UI (user messages on right, bot on left)
- Bot avatar with bakery logo/icon
- Text input at bottom with send button
- Support pressing Enter to send
- Auto-scroll to latest message
- Loading indicator (typing dots) while waiting for AI reply
- Session ID generated once per page load using `crypto.randomUUID()`
- On page load, send a greeting trigger so bot says hello first

### Design Style

- Warm, inviting color palette: cream background (`#FFF8F0`), brown accent (`#6B3F1F`), soft pink highlights
- Clean sans-serif font (Google Fonts: Poppins or Nunito)
- Rounded chat bubbles
- Product menu displayed as cards with image, name, and price when user asks for menu
- Mobile-friendly layout (max-width 480px centered on desktop)

---

## Rate Limit Handling

- Wrap all Gemini API calls in try/catch
- On error, return a friendly fallback message: `"Sorry, I'm having a little trouble right now. Please try again in a moment! 🙏"`
- Log all errors to console with timestamp

---

## Seed Script (seed.js)

Create a script that:
1. Reads `data/menu.csv`
2. Inserts all products into the Supabase `products` table
3. Logs: "Seeded X products successfully"

Run with: `node backend/seed.js`

---

## package.json Scripts

```json
{
  "scripts": {
    "start": "node backend/index.js",
    "dev": "nodemon backend/index.js",
    "seed": "node backend/seed.js"
  }
}
```

---

## Dependencies

```
npm install express @google/generative-ai pg dotenv
npm install --save-dev nodemon
```

---

## Step-by-Step Build Order

1. Set up folder structure and install dependencies
2. Create `.env` with all keys
3. Write `menu.js` with full product catalog
4. Write `database.js` with Supabase connection, `saveOrder()`, `getOrders()` functions
5. Write `gemini.js` with `getAIReply(message, sessionId)` and `isOrderConfirmed(reply)`
6. Write `index.js` with all routes
7. Write `seed.js` and run it to populate the database
8. Build `frontend/index.html`, `styles.css`, `app.js`
9. Start dev server with `npm run dev`
10. Test in browser — send messages, place an order, verify it saves in Supabase

---

## What Success Looks Like

- User opens browser, sees a chat UI with a warm greeting from the bot
- User types "show me your menu" → bot shows all items with prices
- User types "I want 2 croissants and a vanilla cake" → bot confirms items and total
- User types "yes confirm" → bot says Order confirmed ✅ and row appears in Supabase `orders` table
- User asks "what are your hours?" → bot answers correctly from the system prompt
