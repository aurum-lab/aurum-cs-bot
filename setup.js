import { initDatabase, getDb, saveDatabase } from './database.js';

// Sample products for Toko Roti with images
const sampleProducts = [
  // Roti Manis
  { 
    name: 'Croissant', 
    description: 'Roti mentega renyah', 
    price: 15000, 
    stock: 20, 
    category: 'Roti Manis',
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400'
  },
  { 
    name: 'Donat Coklat', 
    description: 'Donat dengan topping coklat', 
    price: 8000, 
    stock: 30, 
    category: 'Roti Manis',
    image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400'
  },
  { 
    name: 'Donat Gula', 
    description: 'Donat dengan taburan gula', 
    price: 7000, 
    stock: 30, 
    category: 'Roti Manis',
    image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400'
  },
  { 
    name: 'Roti Coklat', 
    description: 'Roti isi coklat', 
    price: 10000, 
    stock: 25, 
    category: 'Roti Manis',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'
  },
  { 
    name: 'Roti Keju', 
    description: 'Roti isi keju', 
    price: 12000, 
    stock: 25, 
    category: 'Roti Manis',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'
  },
  { 
    name: 'Kue Lapis', 
    description: 'Kue lapis legit', 
    price: 25000, 
    stock: 10, 
    category: 'Roti Manis',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'
  },

  // Roti Gurih
  { 
    name: 'Roti Abon', 
    description: 'Roti dengan topping abon', 
    price: 12000, 
    stock: 20, 
    category: 'Roti Gurih',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'
  },
  { 
    name: 'Roti Sosis', 
    description: 'Roti isi sosis', 
    price: 15000, 
    stock: 20, 
    category: 'Roti Gurih',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'
  },
  { 
    name: 'Roti Telur', 
    description: 'Roti isi telur', 
    price: 10000, 
    stock: 25, 
    category: 'Roti Gurih',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'
  },

  // Kue Kering
  { 
    name: 'Kue Putri Salju', 
    description: 'Kue kering putri salju', 
    price: 35000, 
    stock: 15, 
    category: 'Kue Kering',
    image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400'
  },
  { 
    name: 'Kue Nastar', 
    description: 'Kue nastar nanas', 
    price: 40000, 
    stock: 15, 
    category: 'Kue Kering',
    image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400'
  },
  { 
    name: 'Kue Kastengel', 
    description: 'Kue kastengel keju', 
    price: 45000, 
    stock: 10, 
    category: 'Kue Kering',
    image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400'
  },

  // Minuman
  { 
    name: 'Kopi Susu', 
    description: 'Kopi susu segar', 
    price: 18000, 
    stock: 50, 
    category: 'Minuman',
    image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400'
  },
  { 
    name: 'Teh Manis', 
    description: 'Teh manis dingin', 
    price: 8000, 
    stock: 50, 
    category: 'Minuman',
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'
  },
  { 
    name: 'Jus Jeruk', 
    description: 'Jus jeruk segar', 
    price: 12000, 
    stock: 30, 
    category: 'Minuman',
    image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400'
  },
];

// Initialize database and insert products
async function setup() {
  console.log('🍞 Setting up database...');
  
  await initDatabase();
  const db = getDb();
  
  // Insert products
  for (const product of sampleProducts) {
    db.run(`
      INSERT OR IGNORE INTO products (name, description, price, stock, category, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [product.name, product.description, product.price, product.stock, product.category, product.image_url]);
  }
  
  saveDatabase();
  
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
}

setup().catch(console.error);
