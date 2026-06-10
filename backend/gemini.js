const { GoogleGenerativeAI } = require('@google/generative-ai');
const { menuText, products, findProductByName } = require('./menu');

const histories = {};
const pendingOrders = {};

const systemPrompt = `You are a friendly and helpful customer service assistant for "Sweet Dreams Bakery".
Your job is to:
1. Help customers view the menu when asked
2. Take their orders politely and confirm item names + prices
3. Answer questions about the bakery (hours, location, delivery)
4. Summarize the order and ask for confirmation before finalizing

Bakery details:
- Name: Sweet Dreams Bakery
- Hours: 8am to 9pm, Monday to Saturday
- Location: MG Road, Hyderabad
- Delivery: Available within 5km radius, minimum order Rs.300
- Payment: UPI, Cash on delivery

Rules:
- Always be warm, friendly, and professional
- When a customer wants to order, list what they've ordered with individual prices and give a total
- If they confirm the order, say "Order confirmed!" and include the word CONFIRMED_ORDER in your reply
- Keep replies concise and use bullet points for menus and order summaries
- If asked something you don't know, politely say you'll check and get back

Current menu:
${menuText()}`;

function getHistory(sessionId) {
  histories[sessionId] ||= [];
  return histories[sessionId];
}

function trimHistory(sessionId) {
  histories[sessionId] = getHistory(sessionId).slice(-20);
}

function isOrderConfirmed(reply) {
  return reply.includes('CONFIRMED_ORDER');
}

function getPendingOrder(sessionId = 'default') {
  return pendingOrders[sessionId] || null;
}

function clearPendingOrder(sessionId = 'default') {
  delete pendingOrders[sessionId];
}

function extractLocalOrder(message) {
  const normalized = message.toLowerCase();
  const selected = products
    .map((product) => {
      const productName = product.product_name.toLowerCase();
      const searchableParts = productName
        .replace(/\([^)]*\)/g, '')
        .split(/\s+/)
        .filter((part) => part.length > 4 && !['chocolate', 'choco'].includes(part));
      const hit = normalized.includes(productName)
        || searchableParts.some((part) => normalized.includes(part));

      if (!hit) return null;

      const quantityMatch = normalized.match(new RegExp(`(\\d+)\\s+(?:${product.product_name.split(' ')[0].toLowerCase()}|${product.category.toLowerCase()})`));
      return {
        ...product,
        quantity: quantityMatch ? Number(quantityMatch[1]) : 1,
      };
    })
    .filter(Boolean);

  return selected;
}

function fallbackReply(message, sessionId) {
  const normalized = message.toLowerCase();
  const history = getHistory(sessionId);
  const lastAssistant = [...history].reverse().find((entry) => entry.role === 'model')?.parts?.[0]?.text || '';

  if (!message.trim() || normalized.includes('hello') || normalized.includes('hi')) {
    return 'Hi! Welcome to Sweet Dreams Bakery. I can show you our menu, answer bakery questions, or help place an order.';
  }

  if (normalized.includes('menu') || normalized.includes('items') || normalized.includes('catalog')) {
    return `Here is today's menu:\n\n${menuText()}`;
  }

  if (normalized.includes('hour') || normalized.includes('open') || normalized.includes('timing')) {
    return 'We are open from 8am to 9pm, Monday to Saturday.';
  }

  if (normalized.includes('location') || normalized.includes('where')) {
    return 'Sweet Dreams Bakery is on MG Road, Hyderabad.';
  }

  if (normalized.includes('delivery')) {
    return 'Delivery is available within a 5km radius with a minimum order of Rs.300.';
  }

  if (normalized.includes('payment') || normalized.includes('upi') || normalized.includes('cash')) {
    return 'We accept UPI and cash on delivery.';
  }

  if (normalized.includes('confirm') || normalized === 'yes' || normalized.includes('yes please')) {
    if (lastAssistant.toLowerCase().includes('shall i confirm') || lastAssistant.toLowerCase().includes('confirm this order')) {
      const pendingOrder = getPendingOrder(sessionId);
      if (pendingOrder) {
        const lines = pendingOrder.items.map((item) => `- ${item.quantity} x ${item.product_name}: Rs.${item.lineTotal}`);
        return `Order confirmed! CONFIRMED_ORDER\n${lines.join('\n')}\nTotal: Rs.${pendingOrder.totalPrice}\nWe will start preparing it right away.`;
      }

      return 'Order confirmed! CONFIRMED_ORDER We will start preparing it right away.';
    }
  }

  const orderItems = extractLocalOrder(message);
  if (orderItems.length) {
    const items = orderItems.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unitPrice: item.price,
      lineTotal: item.price * item.quantity,
    }));
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
    pendingOrders[sessionId] = {
      items,
      totalPrice: total,
    };

    const lines = items.map((item) => `- ${item.quantity} x ${item.product_name}: Rs.${item.lineTotal}`);
    return `Lovely choice. Here is your order summary:\n${lines.join('\n')}\nTotal: Rs.${total}\nShall I confirm this order?`;
  }

  const product = findProductByName(message);
  if (product) {
    return `${product.product_name} is Rs.${product.price}. ${product.description}`;
  }

  return "Sorry, I'm having a little trouble right now. Please try again in a moment!";
}

async function getAIReply(message, sessionId = 'default') {
  const history = getHistory(sessionId);

  if (!process.env.GEMINI_API_KEY) {
    const reply = fallbackReply(message, sessionId);
    history.push({ role: 'user', parts: [{ text: message }] });
    history.push({ role: 'model', parts: [{ text: reply }] });
    trimHistory(sessionId);
    return reply;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    history.push({ role: 'user', parts: [{ text: message }] });
    history.push({ role: 'model', parts: [{ text: reply }] });
    trimHistory(sessionId);

    return reply;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Gemini error`, error);
    const reply = fallbackReply(message, sessionId);
    history.push({ role: 'user', parts: [{ text: message }] });
    history.push({ role: 'model', parts: [{ text: reply }] });
    trimHistory(sessionId);
    return reply;
  }
}

module.exports = {
  getAIReply,
  isOrderConfirmed,
  getPendingOrder,
  clearPendingOrder,
};
