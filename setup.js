import db from './database.js';

// Sample products for Toko Roti
const sampleProducts = [
  // Roti Manis
  { name: 'Croissant', description: 'Roti mentega renyah', price: 15000, stock: 20, category: 'Roti Manis' },
  { name: 'Donat Coklat', description: 'Donat dengan topping coklat', price: 8000, stock: 30, category: 'Roti Manis' },
  { name: 'Donat Gula', description: 'Donat dengan taburan gula', price: 7000, stock: 30, category: 'Roti Manis' },
  { name: 'Roti Coklat', description: 'Roti isi coklat', price: 10000, stock: 25, category: 'Roti Manis' },
  { name: 'Roti Keju', description: 'Roti isi keju', price: 12000, stock: 25, category: 'Roti Manis' },
  { name: 'Kue Lapis', description: 'Kue lapis legit', price: 25000, stock: 10, category: 'Roti Manis' },

  // Roti Gurih
  { name: 'Roti Abon', description: 'Roti dengan topping abon', price: 12000, stock: 20, category: 'Roti Gurih' },
  { name: 'Roti Sosis', description: 'Roti isi sosis', price: 15000, stock: 20, category: 'Roti Gurih' },
  { name: 'Roti Telur', description: 'Roti isi telur', price: 10000, stock: 25, category: 'Roti Gurih' },

  // Kue Kering
  { name: 'Kue Putri Salju', description: 'Kue kering putri salju', price: 35000, stock: 15, category: 'Kue Kering' },
  { name: 'Kue Nastar', description: 'Kue nastar nanas', price: 40000, stock: 15, category: 'Kue Kering' },
  { name: 'Kue Kastengel', description: 'Kue kastengel keju', price: 45000, stock: 10, category: 'Kue Kering' },

  // Minuman
  { name: 'Kopi Susu', description: 'Kopi susu segar', price: 18000, stock: 50, category: 'Minuman' },
  { name: 'Teh Manis', description: 'Teh manis dingin', price: 8000, stock: 50, category: 'Minuman' },
  { name: 'Jus Jeruk', description: 'Jus jeruk segar', price: 12000, stock: 30, category: 'Minuman' },
];

// Insert products
console.log('🍞 Setting up database...');

const insert = db.prepare(`
  INSERT OR IGNORE INTO products (name, description, price, stock, category)
  VALUES (?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((products) => {
  for (const product of products) {
    insert.run(product.name, product.description, product.price, product.stock, product.category);
  }
});

insertMany(sampleProducts);

console.log(`✅ ${sampleProducts.length} products added!`);
console.log('\n📋 Menu Summary:');

const categories = [...new Set(sampleProducts.map(p => p.category))];
for (const category of categories) {
  console.log(`\n${category}:`);
  const items = sampleProducts.filter(p => p.category === category);
  for (const item of items) {
    console.log(`  - ${item.name}: Rp ${item.price.toLocaleString('id-ID')}`);
  }
}

console.log('\n✅ Setup complete! Run "npm start" to start the bot.');
