const axios = require('axios');

const products = [
  {
    name: 'Standard Website Package',
    sku: 'WEB-STD-001',
    price: 1500,
    description: '5-page responsive website with contact form',
    category: 'Service',
    stock: 100
  },
  {
    name: 'E-commerce Add-on',
    sku: 'WEB-ECOM-001',
    price: 2500,
    description: 'Shopping cart integration with payment gateway',
    category: 'Service',
    stock: 100
  },
  {
    name: 'Annual Maintenance',
    sku: 'MNT-YR-001',
    price: 500,
    description: 'Yearly server maintenance and updates',
    category: 'Subscription',
    stock: 1000
  },
  {
    name: 'CRM Premium License',
    sku: 'SW-CRM-PREM',
    price: 150,
    description: 'Per user monthly license for premium features',
    category: 'Software',
    stock: 9999
  }
];

const seedProducts = async () => {
  console.log('🌱 Starting to seed products...');
  
  try {
    for (const product of products) {
      try {
        await axios.post('http://localhost:5000/api/products', product);
        console.log(`✅ Created: ${product.name}`);
      } catch (error) {
        if (error.response && error.response.status === 400 && error.response.data.error.includes('duplicate')) {
             console.log(`⚠️  Skipped (Already exists): ${product.name}`);
        } else {
             console.log(`❌ Failed: ${product.name} - ${error.message}`);
        }
      }
    }
    console.log('✨ Seeding completed!');
  } catch (err) {
    console.error('Fatal Error:', err.message);
    console.log('👉 Make sure the server is running with "npm run start:all"');
  }
};

seedProducts();
