require('dotenv').config();
console.log('Seed script started');

const fs = require('fs');
const path = require('path');
const { upsertProducts } = require('./database');

function parseCsv(content) {
  const [headerLine, ...rows] = content.trim().split(/\r?\n/);
  const headers = headerLine.split(',');

  return rows.map((row) => {
    const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g).map((value) => value.replace(/^"|"$/g, ''));
    return headers.reduce((item, header, index) => {
      item[header] = values[index];
      return item;
    }, {});
  });
}

async function main() {
  const csvPath = path.join(__dirname, '..', 'data', 'menu.csv');
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCsv(content).map((row) => ({
    product_id: row.product_id,
    product_name: row.product_name,
    category: row.category,
    price: Number(row.price),
    description: row.description,
    image_filename: row.image_filename,
    available: row.available === 'true',
  }));

  const count = await upsertProducts(rows);
  console.log(`Seeded ${count} products successfully`);
}

main().catch((error) => {
  console.error(`[${new Date().toISOString()}] Seed error`, error);
  process.exit(1);
});
