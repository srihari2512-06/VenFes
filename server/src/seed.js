import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from './config/env.js';
import { User } from './models/User.js';
import { Product } from './models/Product.js';
import { Order } from './models/Order.js';
import { SubOrder } from './models/SubOrder.js';
import { PayoutLedger } from './models/PayoutLedger.js';
import { PlatformSetting } from './models/PlatformSetting.js';
import { Review } from './models/Review.js';

export async function seedDatabase() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB for database seeding...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    SubOrder.deleteMany({}),
    PayoutLedger.deleteMany({}),
    PlatformSetting.deleteMany({}),
    Review.deleteMany({})
  ]);

  // Set default platform commission rate (10%)
  await PlatformSetting.create({ key: 'commissionRate', value: 0.10 });

  // 1. Create Admin
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await User.create({
    name: 'Platform Admin',
    email: 'admin@venfes.com',
    password: adminPasswordHash,
    role: 'admin'
  });

  // 2. Create Vendors
  const vendorPasswordHash = await bcrypt.hash('vendor123', 10);

  const vendor1 = await User.create({
    name: 'Arjun Mehta',
    email: 'vendor@venfes.com',
    password: vendorPasswordHash,
    role: 'vendor',
    vendorProfile: {
      storeName: 'Apex Audio & Gear',
      storeDescription: 'High-fidelity audio monitors and ergonomic mechanical peripherals crafted in Bengaluru.',
      status: 'approved',
      kycDocumentUrl: 'https://docs.venfes.com/kyc/apex-license.pdf',
      handlingDays: 2
    }
  });

  const vendor2 = await User.create({
    name: 'Priya Sharma',
    email: 'fashion@venfes.com',
    password: vendorPasswordHash,
    role: 'vendor',
    vendorProfile: {
      storeName: 'Urban Silhouette',
      storeDescription: 'Technical performance apparel, sustainable footwear, and durable everyday carry gear.',
      status: 'approved',
      kycDocumentUrl: 'https://docs.venfes.com/kyc/urban-gst.pdf',
      handlingDays: 3
    }
  });

  const pendingVendor = await User.create({
    name: 'Rohan Verma',
    email: 'coffee@venfes.com',
    password: vendorPasswordHash,
    role: 'vendor',
    vendorProfile: {
      storeName: 'Monsoon Valley Roasters',
      storeDescription: 'Single-origin artisanal coffee beans and pour-over brewing gear from Coorg.',
      status: 'pending',
      kycDocumentUrl: 'https://docs.venfes.com/kyc/monsoon-fssai.pdf',
      handlingDays: 1
    }
  });

  // 3. Create Customer
  const customerPasswordHash = await bcrypt.hash('customer123', 10);
  const customer = await User.create({
    name: 'Kavita Sundaram',
    email: 'customer@venfes.com',
    password: customerPasswordHash,
    role: 'customer'
  });

  // 4. Create Products (Enriched with MRP, brand, highlights and specifications)
  const products = await Product.create([
    {
      name: 'Apex Studio Wireless Headphones',
      description: 'Active Noise Cancellation, 40mm beryllium drivers, 38-hour battery life and Bluetooth 5.3 multipoint.',
      price: 4999,
      mrp: 6999, // ~28% discount
      brand: 'Apex Audio',
      highlights: [
        'Active Noise Cancellation up to 35dB with Transparency Mode',
        '40mm beryllium dynamic drivers for studio-grade bass',
        'Up to 38 hours playback with Type-C Fast Fuel charge',
        'Dual-device Bluetooth 5.3 multipoint auto-switch',
        'Plush memory foam ear cushions engineered for Indian climates'
      ],
      specifications: [
        { label: 'Model', value: 'Apex ANC-Pro 2' },
        { label: 'Driver Size', value: '40 mm' },
        { label: 'Frequency Response', value: '20Hz - 40,000Hz' },
        { label: 'Battery Life', value: '38 Hours' },
        { label: 'Charging Interface', value: 'USB Type-C' },
        { label: 'Weight', value: '245 g' },
        { label: 'Warranty', value: '1 Year Domestic Replacement' }
      ],
      category: 'Electronics',
      stock: 35,
      lowStockThreshold: 5,
      vendorId: vendor1._id,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80'
      ],
      variants: [
        { sku: 'APX-HP-BLK', color: 'Midnight Black', size: 'Standard', stock: 20, price: 4999 },
        { sku: 'APX-HP-SLV', color: 'Matte Silver', size: 'Standard', stock: 15, price: 4999 }
      ],
      averageRating: 4.8,
      numReviews: 12
    },
    {
      name: 'Custom 75% Mechanical Keyboard',
      description: 'Gasket-mounted hot-swappable tactile keyboard with factory-lubed switches and sound-dampening foam.',
      price: 6499,
      mrp: 7999, // ~19% discount
      brand: 'KeyCrafter',
      highlights: [
        '75% compact 82-key layout with CNC aluminum rotary knob',
        'Gasket mount structure with 5-layer Poron acoustic dampening',
        'Hot-swappable 3/5-pin PCB with south-facing RGB LEDs',
        'Pre-lubed tactile mechanical switches and screw-in stabilizers',
        'Tri-mode connectivity: 2.4GHz wireless, Bluetooth 5.1 & USB-C'
      ],
      specifications: [
        { label: 'Layout', value: '75% ANSI' },
        { label: 'Switch Type', value: 'Factory Lubed Tactile (45gf)' },
        { label: 'Keycaps', value: 'Double-shot PBT Cherry Profile' },
        { label: 'Battery', value: '4000 mAh rechargeable' },
        { label: 'Case Material', value: 'Anodized Aluminum + ABS' },
        { label: 'Compatibility', value: 'Windows, macOS, Linux, Android' }
      ],
      category: 'Electronics',
      stock: 12,
      lowStockThreshold: 4,
      vendorId: vendor1._id,
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80'
      ],
      averageRating: 4.9,
      numReviews: 8
    },
    {
      name: 'All-Terrain Trail Running Shoes',
      description: 'Breathable ripstop upper, carbon stability plate, and vibram mega-grip outsole for demanding trails.',
      price: 3299,
      mrp: 4499, // ~27% discount
      brand: 'TrailStride',
      highlights: [
        'Vibram MegaGrip high-traction 5mm multidirectional lugs',
        'Dual-density EVA midsole with embedded carbon rock protection plate',
        'Engineered hydrophobic ripstop mesh with reinforced TPU toe bumper',
        'Quick-lace tension system with integrated lace garage'
      ],
      specifications: [
        { label: 'Intended Use', value: 'Trail Running / Light Trekking' },
        { label: 'Drop', value: '6 mm' },
        { label: 'Upper', value: 'Recycled Poly Ripstop + TPU' },
        { label: 'Outsole', value: 'Vibram MegaGrip Compound' },
        { label: 'Closure', value: 'Speed Lacing' },
        { label: 'Weight', value: '290g (Size UK 8)' }
      ],
      category: 'Footwear',
      stock: 4, // Below low stock threshold
      lowStockThreshold: 5,
      vendorId: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80'
      ],
      variants: [
        { sku: 'TRL-SH-8', size: 'UK 8', color: 'Orange Flame', stock: 2, price: 3299 },
        { sku: 'TRL-SH-9', size: 'UK 9', color: 'Orange Flame', stock: 2, price: 3299 }
      ],
      averageRating: 4.6,
      numReviews: 15
    },
    {
      name: 'Merino Wool Heavyweight Hoodie',
      description: '100% ethically sourced Australian merino wool, temperature regulating and odor-resistant.',
      price: 2499,
      brand: 'Urban Silhouette',
      highlights: [
        '320 GSM 100% superfine Australian merino wool terry',
        'Natural thermoregulation keeping you comfortable from 10°C to 25°C',
        'Naturally antimicrobial and odor resistant for multi-day wear',
        'Raglan sleeves with hidden zip media pocket on sleeve'
      ],
      specifications: [
        { label: 'Material', value: '100% Merino Wool (19.5 micron)' },
        { label: 'Fabric Weight', value: '320 GSM Heavyweight' },
        { label: 'Fit', value: 'Relaxed Athleisure' },
        { label: 'Care', value: 'Machine wash cold wool cycle, lay flat' },
        { label: 'Origin', value: 'Knit in Tiruppur, India' }
      ],
      category: 'Clothing',
      stock: 40,
      lowStockThreshold: 5,
      vendorId: vendor2._id,
      images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80'],
      averageRating: 4.7,
      numReviews: 6
    },
    {
      name: 'Waterproof Roll-Top Commuter Backpack',
      description: '28-liter capacity with magnetic buckle, dedicated padded 16-inch laptop compartment, and weatherproof zippers.',
      price: 1899,
      brand: 'Nomad Crafted',
      highlights: [
        'Cordura 500D waterproof ballistic nylon shell',
        'Fidlock magnetic quick-release chest buckle',
        'Separate TSA-compliant suspended 16-inch laptop compartment',
        'Ergonomic EVA molded back panel with airflow channels'
      ],
      specifications: [
        { label: 'Capacity', value: '28 Liters (expandable to 32L)' },
        { label: 'Dimensions', value: '48 x 30 x 16 cm' },
        { label: 'Shell Material', value: 'Cordura 500D Nylon PU Coated' },
        { label: 'Zippers', value: 'YKK AquaGuard Waterproof' },
        { label: 'Laptop Sleeve', value: 'Fits up to MacBook Pro 16"' }
      ],
      category: 'Accessories',
      stock: 22,
      lowStockThreshold: 5,
      vendorId: vendor2._id,
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'],
      averageRating: 4.5,
      numReviews: 9
    }
  ]);

  // 5. Create Sample Historical Orders for Aggregation Dashboards
  const sampleOrder = await Order.create({
    orderNumber: 'ORD-20261013-1001',
    customerId: customer._id,
    totalAmount: 8298,
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    paymentDetails: { transactionId: 'pay_demo_seeded_123', signature: 'simulated_valid_signature' },
    shippingAddress: { street: '12 IT Highway, OMR', city: 'Chennai', state: 'Tamil Nadu', zip: '600089', country: 'India' }
  });

  const subOrder1 = await SubOrder.create({
    subOrderNumber: 'SUB-20261013-1001-1',
    parentOrderId: sampleOrder._id,
    vendorId: vendor1._id,
    customerId: customer._id,
    items: [{
      productId: products[0]._id,
      productName: products[0].name,
      price: 4999,
      quantity: 1,
      subtotal: 4999
    }],
    subtotal: 4999,
    commissionRate: 0.10,
    commissionAmount: 499.90,
    vendorPayoutAmount: 4499.10,
    status: 'delivered'
  });

  const subOrder2 = await SubOrder.create({
    subOrderNumber: 'SUB-20261013-1001-2',
    parentOrderId: sampleOrder._id,
    vendorId: vendor2._id,
    customerId: customer._id,
    items: [{
      productId: products[2]._id,
      productName: products[2].name,
      price: 3299,
      quantity: 1,
      subtotal: 3299
    }],
    subtotal: 3299,
    commissionRate: 0.10,
    commissionAmount: 329.90,
    vendorPayoutAmount: 2969.10,
    status: 'shipped'
  });

  sampleOrder.subOrderIds = [subOrder1._id, subOrder2._id];
  await sampleOrder.save();

  await PayoutLedger.create([
    {
      vendorId: vendor1._id,
      subOrderId: subOrder1._id,
      amount: 4499.10,
      commission: 499.90,
      status: 'accrued'
    },
    {
      vendorId: vendor2._id,
      subOrderId: subOrder2._id,
      amount: 2969.10,
      commission: 329.90,
      status: 'accrued'
    }
  ]);

  // Seed verified review for delivered product
  await Review.create({
    productId: products[0]._id,
    customerId: customer._id,
    subOrderId: subOrder1._id,
    rating: 5,
    comment: 'Exceptional sound stage and pristine noise cancellation. Arrived promptly from Apex Audio.'
  });

  console.log('Seeding complete!');
  console.log('Demo Credentials:');
  console.log('Admin:    admin@venfes.com / admin123');
  console.log('Vendor:   vendor@venfes.com / vendor123');
  console.log('Customer: customer@venfes.com / customer123');
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}
