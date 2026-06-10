require('dotenv').config();

const path = require('path');
const express = require('express');
const { getAIReply, isOrderConfirmed, getPendingOrder, clearPendingOrder } = require('./gemini');
const { getProducts, getOrders, saveOrder } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const frontendDir = path.join(__dirname, '..', 'frontend');

app.use(express.json());
app.use(express.static(frontendDir));
app.use('/images', express.static(path.join(frontendDir, 'images')));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.get('/api/menu', async (req, res) => {
  try {
    const products = await getProducts();
    res.json({ products });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Menu error`, error);
    res.status(500).json({ error: 'Unable to load menu right now.' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await getOrders(10);
    res.json({ orders });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Orders error`, error);
    res.status(500).json({ error: 'Unable to load orders right now.' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;

    if (typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required.' });
    }

    const reply = await getAIReply(message, sessionId);
    const orderConfirmed = isOrderConfirmed(reply);

    if (orderConfirmed) {
      const pendingOrder = getPendingOrder(sessionId);
      await saveOrder({
        items: pendingOrder ? JSON.stringify(pendingOrder.items) : reply.replace('CONFIRMED_ORDER', '').trim(),
        totalPrice: pendingOrder?.totalPrice ?? null,
        status: 'pending',
      });
      clearPendingOrder(sessionId);
    }

    return res.json({
      reply,
      orderConfirmed,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Chat error`, error);
    return res.status(500).json({
      reply: "Sorry, I'm having a little trouble right now. Please try again in a moment!",
      orderConfirmed: false,
    });
  }
});

app.listen(PORT, () => {
  console.log(`BakeryMate is running at http://localhost:${PORT}`);
});
