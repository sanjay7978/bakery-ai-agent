const { Pool } = require('pg');
const { products } = require('./menu');

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
    });
  }

  return pool;
}

async function query(sql, params = []) {
  const db = getPool();
  if (!db) {
    return null;
  }

  return db.query(sql, params);
}

async function getProducts() {
  try {
    const result = await query(
      `SELECT product_id, product_name, category, price, description, image_filename, available
       FROM products
       WHERE available = true
       ORDER BY id ASC`
    );

    return result?.rows?.length ? result.rows : products;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Product database error`, error);
    return products;
  }
}

async function saveOrder({ customerPhone = null, customerName = null, items, totalPrice = null, status = 'pending' }) {
  try {
    const result = await query(
      `INSERT INTO orders (customer_phone, customer_name, items, total_price, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [customerPhone, customerName, items, totalPrice, status]
    );

    return result?.rows?.[0] ?? null;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Order database error`, error);
    return null;
  }
}

async function getOrders(limit = 10) {
  try {
    const result = await query(
      `SELECT id, customer_phone, customer_name, items, total_price, status, created_at
       FROM orders
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result?.rows ?? [];
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Orders database error`, error);
    return [];
  }
}

async function upsertProducts(items) {
  const db = getPool();
  if (!db) {
    throw new Error('DATABASE_URL is required to seed products.');
  }

  for (const item of items) {
    await db.query(
      `INSERT INTO products (product_id, product_name, category, price, description, image_filename, available)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (product_id)
       DO UPDATE SET
         product_name = EXCLUDED.product_name,
         category = EXCLUDED.category,
         price = EXCLUDED.price,
         description = EXCLUDED.description,
         image_filename = EXCLUDED.image_filename,
         available = EXCLUDED.available`,
      [
        item.product_id,
        item.product_name,
        item.category,
        item.price,
        item.description,
        item.image_filename,
        item.available,
      ]
    );
  }

  return items.length;
}

module.exports = {
  getPool,
  getProducts,
  saveOrder,
  getOrders,
  upsertProducts,
};
