const products = [
  {
    product_id: 'B001',
    product_name: 'Chocolate Truffle Cake',
    category: 'Cakes',
    price: 650,
    description: 'Rich chocolate sponge layered with silky truffle ganache.',
    image_filename: 'choco_truffle.jpg',
    available: true,
  },
  {
    product_id: 'B002',
    product_name: 'Vanilla Cream Cake',
    category: 'Cakes',
    price: 550,
    description: 'Soft vanilla sponge with whipped cream and delicate vanilla notes.',
    image_filename: 'vanilla_cream.jpg',
    available: true,
  },
  {
    product_id: 'B003',
    product_name: 'Black Forest Cake',
    category: 'Cakes',
    price: 700,
    description: 'Chocolate cake with cream, cherries, and chocolate shavings.',
    image_filename: 'black_forest.jpg',
    available: true,
  },
  {
    product_id: 'B004',
    product_name: 'Red Velvet Cake',
    category: 'Cakes',
    price: 750,
    description: 'Velvety cocoa cake with smooth cream cheese frosting.',
    image_filename: 'red_velvet.jpg',
    available: true,
  },
  {
    product_id: 'B005',
    product_name: 'Butter Croissant',
    category: 'Pastries',
    price: 80,
    description: 'Flaky, golden croissant made with buttery laminated dough.',
    image_filename: 'croissant.jpg',
    available: true,
  },
  {
    product_id: 'B006',
    product_name: 'Chocolate Eclair',
    category: 'Pastries',
    price: 90,
    description: 'Choux pastry filled with cream and finished with chocolate glaze.',
    image_filename: 'eclair.jpg',
    available: true,
  },
  {
    product_id: 'B007',
    product_name: 'Sourdough Loaf',
    category: 'Breads',
    price: 200,
    description: 'Naturally fermented loaf with a crisp crust and tangy crumb.',
    image_filename: 'sourdough.jpg',
    available: true,
  },
  {
    product_id: 'B008',
    product_name: 'Garlic Herb Bread',
    category: 'Breads',
    price: 120,
    description: 'Fresh bread baked with garlic butter and fragrant herbs.',
    image_filename: 'garlic_bread.jpg',
    available: true,
  },
  {
    product_id: 'B009',
    product_name: 'Choco Chip Cookies (6 pcs)',
    category: 'Cookies',
    price: 120,
    description: 'Six crisp-edged cookies packed with chocolate chips.',
    image_filename: 'choco_cookies.jpg',
    available: true,
  },
  {
    product_id: 'B010',
    product_name: 'Almond Shortbread (6 pcs)',
    category: 'Cookies',
    price: 150,
    description: 'Six buttery shortbread cookies with toasted almond crunch.',
    image_filename: 'almond_shortbread.jpg',
    available: true,
  },
];

function groupedProducts() {
  return products.reduce((groups, product) => {
    groups[product.category] ||= [];
    groups[product.category].push(product);
    return groups;
  }, {});
}

function menuText() {
  const groups = groupedProducts();

  return Object.entries(groups)
    .map(([category, items]) => {
      const lines = items.map((item) => `- ${item.product_name}: Rs.${item.price}`);
      return `*${category}*\n${lines.join('\n')}`;
    })
    .join('\n\n');
}

function findProductByName(text) {
  const normalized = text.toLowerCase();
  return products.find((product) => {
    const name = product.product_name.toLowerCase();
    const searchableParts = name
      .replace(/\([^)]*\)/g, '')
      .split(/\s+/)
      .filter((part) => part.length > 4 && !['chocolate', 'choco'].includes(part));
    return normalized.includes(name) || searchableParts.some((part) => normalized.includes(part));
  });
}

module.exports = {
  products,
  groupedProducts,
  menuText,
  findProductByName,
};
