import mongoose from 'mongoose';
import { env } from './config/env.js';
import { User } from './models/User.js';
import { Product } from './models/Product.js';
import { Order } from './models/Order.js';
import { SubOrder } from './models/SubOrder.js';
import { PayoutLedger } from './models/PayoutLedger.js';
import { PlatformSetting } from './models/PlatformSetting.js';
import { Review } from './models/Review.js';

// Helper to generate 60 days of realistic daily price history
function generate60DayPriceHistory(currentPrice, mrp) {
  const history = [];
  const now = new Date();
  const maxPrice = mrp || Math.round(currentPrice * 1.25);
  const lowestPrice = Math.round(currentPrice * 0.92);

  for (let i = 60; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];

    let p = currentPrice;
    if (i > 45) {
      // 45-60 days ago: slightly closer to regular MRP
      p = Math.round(currentPrice * 1.08);
    } else if (i >= 20 && i <= 28) {
      // 20-28 days ago: Great Festival sale dip (lowest price period)
      p = lowestPrice + Math.round((i % 3) * 20);
    } else if (i > 5 && i < 20) {
      // steady post-sale price
      p = Math.round(currentPrice * 1.02);
    } else {
      // recent days: exact current price
      p = currentPrice;
    }
    history.push({ date: dateStr, price: Math.min(p, maxPrice) });
  }
  return history;
}

// Helper to generate competitor pricing data across Indian e-commerce platforms
function generateCompetitorPrices(price, category) {
  const isFashion = category === 'Clothing' || category === 'Footwear';
  const thirdStore = isFashion ? 'Myntra' : 'Croma';
  const amazonMarkup = Math.round(price * 0.07 + 60);
  const flipkartMarkup = Math.round(price * 0.09 + 80);
  const thirdMarkup = Math.round(price * 0.12 + 120);

  return [
    {
      store: 'Amazon.in',
      price: price + amazonMarkup,
      inStock: true,
      delivery: '2-3 Days (Prime)'
    },
    {
      store: 'Flipkart',
      price: price + flipkartMarkup,
      inStock: true,
      delivery: '3-4 Days (Assured)'
    },
    {
      store: thirdStore,
      price: price + thirdMarkup,
      inStock: true,
      delivery: '4-5 Days'
    }
  ];
}

export async function seedDatabase(targetUri = env.MONGODB_URI) {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 5000 });
    } catch (err) {
      const localUri = 'mongodb://127.0.0.1:27017/venfes';
      if (targetUri !== localUri) {
        console.warn(`[WARN] Seeding primary URI failed (${err.message}). Falling back to local MongoDB...`);
        await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
      } else {
        throw err;
      }
    }
  }
  console.log(`Connected to MongoDB (${mongoose.connection.host || 'database'}) for database seeding...`);

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

  // 1. Create Platform Admin (Password passed plain; User pre-save hook handles hashing properly)
  const admin = await User.create({
    name: 'Platform Admin',
    email: 'admin@venfes.com',
    password: 'admin123',
    role: 'admin'
  });

  // 2. Create Approved Vendors across distinct sectors
  const vendor1 = await User.create({
    name: 'Arjun Mehta',
    email: 'vendor@venfes.com',
    password: 'vendor123',
    role: 'vendor',
    vendorProfile: {
      storeName: 'Apex Audio & Gear',
      storeDescription: 'High-fidelity audio monitors, studio headphones, and ergonomic peripherals crafted in Bengaluru.',
      status: 'approved',
      kycDocumentUrl: 'https://docs.venfes.com/kyc/apex-license.pdf',
      handlingDays: 2
    }
  });

  const vendor2 = await User.create({
    name: 'Priya Sharma',
    email: 'fashion@venfes.com',
    password: 'vendor123',
    role: 'vendor',
    vendorProfile: {
      storeName: 'Urban Silhouette',
      storeDescription: 'Technical performance apparel, sustainable footwear, and durable everyday carry fashion.',
      status: 'approved',
      kycDocumentUrl: 'https://docs.venfes.com/kyc/urban-gst.pdf',
      handlingDays: 3
    }
  });

  const vendor3 = await User.create({
    name: 'Rohan Verma',
    email: 'coffee@venfes.com',
    password: 'vendor123',
    role: 'vendor',
    vendorProfile: {
      storeName: 'Monsoon Valley Roasters & Pantry',
      storeDescription: 'Single-origin artisanal coffee beans, manual brewing apparatus, and premium kitchen essentials.',
      status: 'approved',
      kycDocumentUrl: 'https://docs.venfes.com/kyc/monsoon-fssai.pdf',
      handlingDays: 1
    }
  });

  const vendor4 = await User.create({
    name: 'Neha Patel',
    email: 'technova@venfes.com',
    password: 'vendor123',
    role: 'vendor',
    vendorProfile: {
      storeName: 'TechNova Peripherals',
      storeDescription: 'Pro-grade computer components, desk accessories, mechanical keyboards, and precision tech.',
      status: 'approved',
      kycDocumentUrl: 'https://docs.venfes.com/kyc/technova-kyc.pdf',
      handlingDays: 2
    }
  });

  const vendor5 = await User.create({
    name: 'Vikram Singhania',
    email: 'heritage@venfes.com',
    password: 'vendor123',
    role: 'vendor',
    vendorProfile: {
      storeName: 'Heritage Leather & Stationery',
      storeDescription: 'Full-grain leather accessories, fountain pens, tech literature, and archival notebooks.',
      status: 'approved',
      kycDocumentUrl: 'https://docs.venfes.com/kyc/heritage-doc.pdf',
      handlingDays: 2
    }
  });

  // Pending vendor for KYC verification demo
  await User.create({
    name: 'Artisan Crafts Guild',
    email: 'artisan@venfes.com',
    password: 'vendor123',
    role: 'vendor',
    vendorProfile: {
      storeName: 'Artisan Crafts Guild',
      storeDescription: 'Handmade pottery and natural indigo garments awaiting admin KYC review.',
      status: 'pending',
      kycDocumentUrl: 'https://docs.venfes.com/kyc/artisan-audit.pdf',
      handlingDays: 4
    }
  });

  // 3. Create Demo Customers
  const customer1 = await User.create({
    name: 'Kavita Sundaram',
    email: 'customer@venfes.com',
    password: 'customer123',
    role: 'customer'
  });

  const customer2 = await User.create({
    name: 'Ananya Deshmukh',
    email: 'ananya@venfes.com',
    password: 'customer123',
    role: 'customer'
  });

  // 4. Products Master Catalog (30+ rich products across 6 major categories)
  const productDefinitions = [
    // --- ELECTRONICS (8 items) ---
    {
      name: 'Apex Studio Wireless Headphones',
      description: 'Active Noise Cancellation up to 35dB, 40mm beryllium drivers, 38-hour battery life and Bluetooth 5.3 multipoint.',
      price: 4999,
      mrp: 6999,
      brand: 'Apex Audio',
      category: 'Electronics',
      stock: 35,
      lowStockThreshold: 5,
      vendorId: vendor1._id,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80'
      ],
      highlights: [
        'Active Noise Cancellation up to 35dB with ambient mode',
        '40mm beryllium dynamic drivers for studio-grade bass',
        'Up to 38 hours continuous playback with Fast Fuel charge',
        'Dual-device Bluetooth 5.3 multipoint auto-switch',
        'Plush memory foam ear cushions engineered for Indian climates'
      ],
      specifications: [
        { label: 'Model', value: 'Apex ANC-Pro 2' },
        { label: 'Driver Size', value: '40 mm' },
        { label: 'Battery Life', value: '38 Hours' },
        { label: 'Weight', value: '245 g' },
        { label: 'Warranty', value: '1 Year Domestic Replacement' }
      ],
      variants: [
        { sku: 'APX-HP-BLK', color: 'Midnight Black', size: 'Standard', stock: 20, price: 4999 },
        { sku: 'APX-HP-SLV', color: 'Matte Silver', size: 'Standard', stock: 15, price: 4999 }
      ],
      averageRating: 4.8,
      numReviews: 24
    },
    {
      name: 'Custom 75% Mechanical Keyboard',
      description: 'Gasket-mounted hot-swappable tactile keyboard with factory-lubed switches and sound-dampening foam.',
      price: 6499,
      mrp: 7999,
      brand: 'KeyCrafter',
      category: 'Electronics',
      stock: 18,
      lowStockThreshold: 4,
      vendorId: vendor4._id,
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80'
      ],
      highlights: [
        '75% compact 82-key layout with CNC aluminum rotary knob',
        'Gasket mount structure with 5-layer Poron acoustic dampening',
        'Hot-swappable 3/5-pin PCB with south-facing RGB LEDs',
        'Pre-lubed tactile mechanical switches and screw-in stabilizers',
        'Tri-mode connectivity: 2.4GHz wireless, Bluetooth 5.1 & USB-C'
      ],
      specifications: [
        { label: 'Layout', value: '75% ANSI' },
        { label: 'Switch Type', value: 'Pre-lubed Tactile (45gf)' },
        { label: 'Keycaps', value: 'Double-shot PBT Cherry Profile' },
        { label: 'Battery', value: '4000 mAh rechargeable' }
      ],
      variants: [
        { sku: 'KC-75-WHT', color: 'Polar White', size: '75%', stock: 10, price: 6499 },
        { sku: 'KC-75-GRY', color: 'Slate Grey', size: '75%', stock: 8, price: 6499 }
      ],
      averageRating: 4.9,
      numReviews: 19
    },
    {
      name: 'Ultra-Wide 34-Inch Curved Monitor',
      description: 'WQHD 3440x1440 IPS 144Hz curved display with USB-C 90W power delivery and HDR400 color precision.',
      price: 28999,
      mrp: 34999,
      brand: 'TechNova',
      category: 'Electronics',
      stock: 8,
      lowStockThreshold: 3,
      vendorId: vendor4._id,
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80'
      ],
      highlights: [
        '34" UltraWide WQHD (3440 x 1440) 21:9 immersive 1900R curvature',
        '144Hz refresh rate with 1ms response and AMD FreeSync Premium',
        '90W USB Type-C single cable docking for laptops',
        'sRGB 99% factory color calibration report included'
      ],
      specifications: [
        { label: 'Resolution', value: '3440 x 1440 WQHD' },
        { label: 'Refresh Rate', value: '144 Hz' },
        { label: 'Curvature', value: '1900R' },
        { label: 'Ports', value: 'USB-C (90W), 2x HDMI 2.1, 1x DP 1.4' }
      ],
      variants: [],
      averageRating: 4.7,
      numReviews: 14
    },
    {
      name: 'Pro Streamer USB Condenser Microphone',
      description: 'Studio-grade cardioid microphone with zero-latency monitoring, onboard gain control, and magnetic desktop stand.',
      price: 3799,
      mrp: 4999,
      brand: 'Apex Audio',
      category: 'Electronics',
      stock: 22,
      lowStockThreshold: 5,
      vendorId: vendor1._id,
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80'
      ],
      highlights: [
        '24-bit / 96kHz broadcast recording resolution',
        'Cardioid pickup pattern rejecting background keyboard clicks',
        'Touch-sensitive mute sensor with LED status indicator',
        'Plug-and-play compatibility with PC, Mac, and PS5'
      ],
      specifications: [
        { label: 'Polar Pattern', value: 'Cardioid' },
        { label: 'Sample Rate', value: '96 kHz / 24-bit' },
        { label: 'Frequency Response', value: '20Hz - 20,000Hz' }
      ],
      variants: [],
      averageRating: 4.6,
      numReviews: 11
    },
    {
      name: 'Wireless Qi2 Fast Magnetic Power Bank',
      description: '10,000mAh ultra-slim magnetic battery pack with 15W Qi2 wireless and 20W PD Type-C fast input/output.',
      price: 1999,
      mrp: 2999,
      brand: 'TechNova',
      category: 'Electronics',
      stock: 45,
      lowStockThreshold: 10,
      vendorId: vendor4._id,
      images: [
        'https://images.unsplash.com/photo-1609592426815-568ea4658043?w=600&q=80'
      ],
      highlights: [
        'Official Qi2 15W wireless snap-on magnetic charging',
        '10,000mAh capacity provides up to 2 full phone charges',
        'Foldable aerospace aluminum kickstand for hands-free viewing',
        'Intelligent thermal management preventing overheating'
      ],
      specifications: [
        { label: 'Capacity', value: '10,000 mAh' },
        { label: 'Wireless Output', value: '15W Max' },
        { label: 'Wired Output', value: '20W Power Delivery' }
      ],
      variants: [],
      averageRating: 4.7,
      numReviews: 32
    },
    {
      name: 'Active Noise Cancelling Earbuds ANC-X',
      description: 'True wireless stereo earbuds with 11mm dynamic drivers, 6-mic clear call technology, and wireless charging case.',
      price: 2499,
      mrp: 3999,
      brand: 'Apex Audio',
      category: 'Electronics',
      stock: 30,
      lowStockThreshold: 6,
      vendorId: vendor1._id,
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80'
      ],
      highlights: [
        'Hybrid Active Noise Cancellation up to 32dB',
        'IPX5 water resistance for workouts and monsoon commutes',
        '32 hours combined playback with wireless charging case'
      ],
      specifications: [
        { label: 'Driver', value: '11mm Dynamic' },
        { label: 'IP Rating', value: 'IPX5 Sweatproof' },
        { label: 'Bluetooth', value: '5.3 Multipoint' }
      ],
      variants: [],
      averageRating: 4.5,
      numReviews: 28
    },
    {
      name: 'RGB Aluminum Laptop Cooling Stand',
      description: 'Ergonomic CNC aluminum riser with dual ultra-quiet fans and 7-mode RGB underglow lighting.',
      price: 1299,
      mrp: 1999,
      brand: 'TechNova',
      category: 'Electronics',
      stock: 40,
      lowStockThreshold: 8,
      vendorId: vendor4._id,
      images: [
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80'
      ],
      highlights: [
        'Solid 4mm sandblasted aluminum alloy construction',
        'Dual 120mm whisper-quiet hydraulic bearing cooling fans',
        '6-level adjustable ergonomic viewing angle up to 45 degrees'
      ],
      specifications: [
        { label: 'Material', value: 'Anodized Aluminum' },
        { label: 'Fan Speed', value: '1400 RPM' },
        { label: 'Supported Size', value: 'Laptops 11" to 17.3"' }
      ],
      variants: [],
      averageRating: 4.6,
      numReviews: 18
    },
    {
      name: 'Smart Health & Fitness Tracker Band',
      description: '1.47-inch AMOLED touch screen, 24/7 SpO2 and continuous heart rate tracking with 14-day battery life.',
      price: 1899,
      mrp: 2999,
      brand: 'TechNova',
      category: 'Electronics',
      stock: 50,
      lowStockThreshold: 10,
      vendorId: vendor4._id,
      images: [
        'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80'
      ],
      highlights: [
        'Vibrant curved AMOLED always-on display',
        'All-day blood oxygen (SpO2) and sleep stage monitoring',
        '5ATM water resistant up to 50 meters for swimming'
      ],
      specifications: [
        { label: 'Display', value: '1.47" AMOLED' },
        { label: 'Battery', value: '14 Days Typical Use' },
        { label: 'Sensors', value: 'Optical HR, SpO2, 3-Axis Accelerometer' }
      ],
      variants: [],
      averageRating: 4.7,
      numReviews: 45
    },

    // --- FOOTWEAR (6 items) ---
    {
      name: 'All-Terrain Trail Running Shoes',
      description: 'Breathable hydrophobic ripstop upper, carbon rock plate, and Vibram mega-grip outsole for rugged surfaces.',
      price: 3299,
      mrp: 4499,
      brand: 'TrailStride',
      category: 'Footwear',
      stock: 16,
      lowStockThreshold: 5,
      vendorId: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80'
      ],
      highlights: [
        'Vibram MegaGrip high-traction 5mm multidirectional lugs',
        'Dual-density EVA midsole with embedded rock protection plate',
        'Engineered hydrophobic ripstop mesh with reinforced TPU toe bumper',
        'Speed-lace tension system with integrated lace garage'
      ],
      specifications: [
        { label: 'Intended Use', value: 'Trail Running / Light Trekking' },
        { label: 'Drop', value: '6 mm' },
        { label: 'Outsole', value: 'Vibram MegaGrip Compound' },
        { label: 'Weight', value: '290g (Size UK 8)' }
      ],
      variants: [
        { sku: 'TRL-SH-8', size: 'UK 8', color: 'Orange Flame', stock: 8, price: 3299 },
        { sku: 'TRL-SH-9', size: 'UK 9', color: 'Orange Flame', stock: 8, price: 3299 }
      ],
      averageRating: 4.6,
      numReviews: 22
    },
    {
      name: 'Retro Suede Low-Top Street Sneakers',
      description: 'Crafted with premium Italian suede uppers, vulcanized gum rubber soles, and cushioned ortholite insoles.',
      price: 2799,
      mrp: 3999,
      brand: 'Urban Silhouette',
      category: 'Footwear',
      stock: 24,
      lowStockThreshold: 5,
      vendorId: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80'
      ],
      highlights: [
        '100% Genuine vegetable-tanned suede leather upper',
        'Anti-slip cupsole with reinforced heel counter',
        'Breathable cotton canvas lining for barefoot comfort'
      ],
      specifications: [
        { label: 'Upper', value: 'Genuine Cow Suede' },
        { label: 'Sole', value: 'Natural Gum Rubber' },
        { label: 'Insole', value: 'Ortholite Memory Foam' }
      ],
      variants: [
        { sku: 'RT-SNK-8', size: 'UK 8', color: 'Forest Green', stock: 12, price: 2799 },
        { sku: 'RT-SNK-9', size: 'UK 9', color: 'Forest Green', stock: 12, price: 2799 }
      ],
      averageRating: 4.7,
      numReviews: 17
    },
    {
      name: 'Orthopedic Memory Foam Daily Walkers',
      description: 'Feather-light walking shoes featuring arch support insole, shock-absorbing air cushion, and breathable stretch knit.',
      price: 1499,
      mrp: 2199,
      brand: 'Urban Silhouette',
      category: 'Footwear',
      stock: 35,
      lowStockThreshold: 8,
      vendorId: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80'
      ],
      highlights: [
        'Anatomical arch support relieves plantar pressure',
        'Zero-break-in elastic slip-on collar',
        'Machine washable with quick-dry textile fibers'
      ],
      specifications: [
        { label: 'Insole', value: 'High Rebound Orthopedic PU' },
        { label: 'Weight', value: '210g ultra-light' }
      ],
      variants: [],
      averageRating: 4.5,
      numReviews: 31
    },
    {
      name: 'Waterproof Carbon-Plate Marathon Racers',
      description: 'Elite racing shoe with full-length curved carbon fiber propulsion plate and Pebax super-critical foam midsole.',
      price: 5499,
      mrp: 7499,
      brand: 'TrailStride',
      category: 'Footwear',
      stock: 12,
      lowStockThreshold: 3,
      vendorId: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80'
      ],
      highlights: [
        'Full-length 3D carbon fiber spoon plate for explosive propulsion',
        '85% energy return superfoam cushioning',
        'Micro-perforated translucent mono-mesh upper'
      ],
      specifications: [
        { label: 'Drop', value: '8 mm' },
        { label: 'Stack Height', value: '39 mm (World Athletics compliant)' }
      ],
      variants: [],
      averageRating: 4.9,
      numReviews: 14
    },
    {
      name: 'Breathable Slip-On Mesh Knit Loafers',
      description: 'Versatile casual slip-on loafers engineered with flexible grooved outsole and moisture-wicking bamboo lining.',
      price: 1199,
      mrp: 1799,
      brand: 'Urban Silhouette',
      category: 'Footwear',
      stock: 28,
      lowStockThreshold: 5,
      vendorId: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80'
      ],
      highlights: [
        'Ultra-flexible grooved sole moves naturally with every step',
        'Foldable heel design converts easily to backless mule'
      ],
      specifications: [
        { label: 'Style', value: 'Slip-on Loafer' },
        { label: 'Lining', value: 'Anti-odor Bamboo Fiber' }
      ],
      variants: [],
      averageRating: 4.4,
      numReviews: 19
    },
    {
      name: 'Rugged Full-Grain Leather Hiking Boots',
      description: 'Waterproof Goodyear-welted outdoor boots with rustproof brass eyelets and oil-resistant lugged rubber soles.',
      price: 4299,
      mrp: 5999,
      brand: 'Heritage',
      category: 'Footwear',
      stock: 15,
      lowStockThreshold: 4,
      vendorId: vendor5._id,
      images: [
        'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&q=80'
      ],
      highlights: [
        '2.2mm waterproof waxed full-grain bovine leather',
        'Padded bellows tongue keeps out dirt, stones, and water',
        'Goodyear-welted rebuildable construction for decades of use'
      ],
      specifications: [
        { label: 'Shaft Height', value: '6 Inches' },
        { label: 'Hardware', value: 'Solid Antiqued Brass' }
      ],
      variants: [],
      averageRating: 4.8,
      numReviews: 16
    },

    // --- CLOTHING (6 items) ---
    {
      name: 'Merino Wool Heavyweight Hoodie',
      description: '100% ethically sourced Australian merino wool, temperature regulating, naturally antimicrobial and odor-resistant.',
      price: 2499,
      mrp: 3499,
      brand: 'Urban Silhouette',
      category: 'Clothing',
      stock: 40,
      lowStockThreshold: 5,
      vendorId: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80'
      ],
      highlights: [
        '320 GSM 100% superfine Australian merino wool french terry',
        'Natural thermoregulation keeping you comfortable from 10°C to 25°C',
        'Naturally antimicrobial and odor resistant for multi-day wear',
        'Raglan sleeves with hidden zip media pocket on left forearm'
      ],
      specifications: [
        { label: 'Material', value: '100% Merino Wool (19.5 micron)' },
        { label: 'Fabric Weight', value: '320 GSM Heavyweight' },
        { label: 'Origin', value: 'Knit in Tiruppur, India' }
      ],
      variants: [
        { sku: 'HD-MRN-M', size: 'M', color: 'Charcoal Grey', stock: 20, price: 2499 },
        { sku: 'HD-MRN-L', size: 'L', color: 'Charcoal Grey', stock: 20, price: 2499 }
      ],
      averageRating: 4.7,
      numReviews: 15
    },
    {
      name: 'Raw Selvedge Japanese Denim Jeans',
      description: '14oz shuttle-loomed raw selvedge denim with copper rivets, button fly, and red-line selvedge ID.',
      price: 3499,
      mrp: 4999,
      brand: 'Urban Silhouette',
      category: 'Clothing',
      stock: 25,
      lowStockThreshold: 5,
      vendorId: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80'
      ],
      highlights: [
        '14oz vintage shuttle-loomed raw selvedge denim',
        'Pure indigo rope-dyed yarn producing high-contrast fades',
        'Custom engraved solid copper rivets and donut buttons'
      ],
      specifications: [
        { label: 'Fit', value: 'Slim Straight' },
        { label: 'Denim Weight', value: '14 oz Sanforized' },
        { label: 'Selvedge ID', value: 'Classic Red Line' }
      ],
      variants: [],
      averageRating: 4.8,
      numReviews: 19
    },
    {
      name: 'Organic Supima Cotton Minimalist Tee',
      description: 'Pre-shrunk 220 GSM American-grown long-staple Supima cotton with taped shoulder seams and rib-knit crewneck.',
      price: 799,
      mrp: 1299,
      brand: 'Urban Silhouette',
      category: 'Clothing',
      stock: 60,
      lowStockThreshold: 10,
      vendorId: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80'
      ],
      highlights: [
        '100% Extra-long staple Supima cotton for silky handfeel',
        '220 GSM substantial weight that resists sheerness and warping',
        'Reactive dyed to maintain deep black color through 50+ washes'
      ],
      specifications: [
        { label: 'Fabric', value: '100% Organic Supima Cotton' },
        { label: 'Fit', value: 'True to Size Tailored Cut' }
      ],
      variants: [],
      averageRating: 4.6,
      numReviews: 42
    },
    {
      name: 'All-Weather Packable Technical Windbreaker',
      description: 'DWR water-repellent ripstop shell that packs into its own internal pocket, equipped with YKK storm zippers.',
      price: 2199,
      mrp: 3299,
      brand: 'Urban Silhouette',
      category: 'Clothing',
      stock: 30,
      lowStockThreshold: 6,
      vendorId: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80'
      ],
      highlights: [
        'Ultra-light 85g packable design fits in palms or backpacks',
        'Durable Water Repellent (DWR) finish sheds light rain',
        'Underarm laser-cut ventilation ports prevent clamminess'
      ],
      specifications: [
        { label: 'Material', value: '20D Mini-Ripstop Nylon' },
        { label: 'Weight', value: '140g' }
      ],
      variants: [],
      averageRating: 4.7,
      numReviews: 21
    },
    {
      name: 'Linen Relaxed-Fit Cuban Collar Shirt',
      description: 'Pure European flax linen shirt featuring camp collar, natural coconut shell buttons, and airy breathable weave.',
      price: 1599,
      mrp: 2299,
      brand: 'Urban Silhouette',
      category: 'Clothing',
      stock: 35,
      lowStockThreshold: 5,
      vendorId: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'
      ],
      highlights: [
        '100% Pure certified European flax linen',
        'Vintage vacation Cuban camp collar design',
        'Natural carved coconut buttons'
      ],
      specifications: [
        { label: 'Material', value: '100% Pure Linen' },
        { label: 'Care', value: 'Machine wash delicate, air dry' }
      ],
      variants: [],
      averageRating: 4.6,
      numReviews: 18
    },
    {
      name: 'Breathable Seamless Performance Gym Shorts',
      description: '4-way stretch moisture-wicking athletic shorts with built-in compression liner, towel loop, and zip phone pocket.',
      price: 899,
      mrp: 1399,
      brand: 'Urban Silhouette',
      category: 'Clothing',
      stock: 45,
      lowStockThreshold: 10,
      vendorId: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80'
      ],
      highlights: [
        '7" Inseam athletic cut for unrestricted squatting and running',
        'Bounce-free secure smartphone pocket on inner compression liner'
      ],
      specifications: [
        { label: 'Material', value: '90% Recycled Poly, 10% Spandex' },
        { label: 'Liner', value: 'Anti-chafing Compression' }
      ],
      variants: [],
      averageRating: 4.8,
      numReviews: 29
    },

    // --- ACCESSORIES (5 items) ---
    {
      name: 'Waterproof Roll-Top Commuter Backpack',
      description: '28-liter capacity with Fidlock magnetic buckle, padded 16-inch laptop compartment, and weatherproof YKK zippers.',
      price: 1899,
      mrp: 2699,
      brand: 'Nomad Crafted',
      category: 'Accessories',
      stock: 22,
      lowStockThreshold: 5,
      vendorId: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'
      ],
      highlights: [
        'Cordura 500D waterproof ballistic nylon shell',
        'Fidlock magnetic quick-release chest buckle',
        'Separate TSA-compliant suspended 16-inch laptop sleeve',
        'Ergonomic EVA molded back panel with airflow channels'
      ],
      specifications: [
        { label: 'Capacity', value: '28 Liters (expandable to 32L)' },
        { label: 'Dimensions', value: '48 x 30 x 16 cm' },
        { label: 'Zippers', value: 'YKK AquaGuard Waterproof' }
      ],
      variants: [],
      averageRating: 4.8,
      numReviews: 25
    },
    {
      name: 'RFID-Blocking Slim Minimalist Card Wallet',
      description: 'Aerospace-grade 6061 anodized aluminum cardholder with silicone cash strap and RFID signal blocking.',
      price: 699,
      mrp: 1199,
      brand: 'Heritage',
      category: 'Accessories',
      stock: 50,
      lowStockThreshold: 10,
      vendorId: vendor5._id,
      images: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80'
      ],
      highlights: [
        'Holds up to 12 credit/debit cards without stretching',
        'Built-in dual-layer aluminum plates block 13.56MHz RFID theft',
        'Integrated heavy-duty elastic cash strap for bank notes'
      ],
      specifications: [
        { label: 'Material', value: '6061 T6 Billet Aluminum' },
        { label: 'Thickness', value: '6 mm (Empty)' }
      ],
      variants: [],
      averageRating: 4.7,
      numReviews: 38
    },
    {
      name: 'Polarized Aviator Sunglasses (Titanium Alloy)',
      description: 'Ultralight Japanese titanium frame with TAC polarized UV400 lenses and shatterproof scratch-resistant coating.',
      price: 1499,
      mrp: 2499,
      brand: 'Heritage',
      category: 'Accessories',
      stock: 30,
      lowStockThreshold: 5,
      vendorId: vendor5._id,
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80'
      ],
      highlights: [
        'Weighs only 18g with flexible memory-metal titanium temples',
        '9-layer polarized lenses eliminate blinding road and water glare',
        '100% UV400 protection against UVA, UVB, and harmful blue light'
      ],
      specifications: [
        { label: 'Frame', value: 'Beta Titanium' },
        { label: 'Lens', value: 'Triacetate Cellulose (TAC) Polarized' }
      ],
      variants: [],
      averageRating: 4.6,
      numReviews: 22
    },
    {
      name: 'Classic Hand-Stitched Leather Watch Strap',
      description: 'Handcrafted Horween vegetable-tanned leather replacement watch band with quick-release spring bars and steel buckle.',
      price: 849,
      mrp: 1299,
      brand: 'Heritage',
      category: 'Accessories',
      stock: 40,
      lowStockThreshold: 8,
      vendorId: vendor5._id,
      images: [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80'
      ],
      highlights: [
        'Supple full-grain leather develops rich unique patina over time',
        'Tool-less quick release pins fit standard 20mm and 22mm watches'
      ],
      specifications: [
        { label: 'Lug Width', value: '20mm / 22mm interchangeable' },
        { label: 'Buckle', value: '316L Brushed Stainless Steel' }
      ],
      variants: [],
      averageRating: 4.7,
      numReviews: 19
    },
    {
      name: 'Magnetic Cord Organizer Desk Mat',
      description: 'Waterproof felt and vegan leather desk pad with embedded magnetic cable channel and non-slip rubberized backing.',
      price: 1099,
      mrp: 1699,
      brand: 'TechNova',
      category: 'Accessories',
      stock: 35,
      lowStockThreshold: 6,
      vendorId: vendor4._id,
      images: [
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80'
      ],
      highlights: [
        '90 x 40 cm generous surface accommodates full keyboard and mouse',
        'Hidden magnetic toolbar with 4 moveable magnetic cable holders',
        'Dual-sided design: Premium vegan leather front, wool felt reverse'
      ],
      specifications: [
        { label: 'Dimensions', value: '900 x 400 x 3 mm' },
        { label: 'Material', value: 'PU Leather + Recycled PET Felt' }
      ],
      variants: [],
      averageRating: 4.8,
      numReviews: 26
    },

    // --- BOOKS & STATIONERY (4 items) ---
    {
      name: 'Designing Data-Intensive Applications',
      description: 'The definitive guide to distributed systems architecture, reliable storage engines, streaming pipelines, and consensus.',
      price: 1850,
      mrp: 2400,
      brand: "O'Reilly Media",
      category: 'Books',
      stock: 25,
      lowStockThreshold: 5,
      vendorId: vendor5._id,
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80'
      ],
      highlights: [
        'Comprehensive breakdown of transactions, replication, and partitioning',
        'Essential reading for backend engineers and distributed systems design',
        'Hardcover student and library edition with durable binding'
      ],
      specifications: [
        { label: 'Author', value: 'Martin Kleppmann' },
        { label: 'Pages', value: '616 Pages' },
        { label: 'Format', value: 'Hardcover Deluxe' }
      ],
      variants: [],
      averageRating: 5.0,
      numReviews: 54
    },
    {
      name: 'The Clean Coder & Clean Architecture Set',
      description: 'Two-volume box set detailing software craftsmanship, discipline, testing fundamentals, and enterprise architecture.',
      price: 1299,
      mrp: 1899,
      brand: 'Prentice Hall',
      category: 'Books',
      stock: 30,
      lowStockThreshold: 5,
      vendorId: vendor5._id,
      images: [
        'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&q=80'
      ],
      highlights: [
        'Covers SOLID design principles, component decoupling, and test discipline',
        'Includes real-world case studies on system evolution and technical debt'
      ],
      specifications: [
        { label: 'Author', value: 'Robert C. Martin (Uncle Bob)' },
        { label: 'Format', value: 'Paperback 2-Book Boxed Set' }
      ],
      variants: [],
      averageRating: 4.8,
      numReviews: 33
    },
    {
      name: 'Handbound Dotted Grid Leather Journal',
      description: 'Refillable A5 journal wrapped in distressed oil-tanned leather, containing 120 GSM fountain-pen friendly paper.',
      price: 649,
      mrp: 999,
      brand: 'Heritage',
      category: 'Books',
      stock: 45,
      lowStockThreshold: 8,
      vendorId: vendor5._id,
      images: [
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80'
      ],
      highlights: [
        '192 pages of 120 GSM bleed-proof ivory dotted grid paper',
        'Lay-flat 180° binding for effortless writing across pages',
        'Elastic pen loop and expandable accordion back pocket'
      ],
      specifications: [
        { label: 'Size', value: 'A5 (148 x 210 mm)' },
        { label: 'Paper Weight', value: '120 GSM Acid-Free' }
      ],
      variants: [],
      averageRating: 4.9,
      numReviews: 27
    },
    {
      name: 'Minimalist Brass Fountain Pen with Extra Nibs',
      description: 'Machined solid brass EDC fountain pen with Schmidt German medium nib, piston converter, and 6 ink cartridges.',
      price: 1450,
      mrp: 2100,
      brand: 'Heritage',
      category: 'Books',
      stock: 20,
      lowStockThreshold: 4,
      vendorId: vendor5._id,
      images: [
        'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&q=80'
      ],
      highlights: [
        'Precision machined from raw solid brass stock',
        'Smooth writing German Schmidt Iridium-tipped medium nib',
        'Develops an exquisite organic patina through daily contact'
      ],
      specifications: [
        { label: 'Nib Size', value: 'Medium (0.5mm)' },
        { label: 'Weight', value: '44g balanced' }
      ],
      variants: [],
      averageRating: 4.7,
      numReviews: 16
    },

    // --- HOME & KITCHEN (4 items) ---
    {
      name: 'Precision Pour-Over Kettle with Gauge',
      description: 'Gooseneck stainless steel barista kettle with counterbalanced ergonomic wood handle and built-in thermometer.',
      price: 2299,
      mrp: 3199,
      brand: 'Monsoon Valley',
      category: 'Home & Kitchen',
      stock: 25,
      lowStockThreshold: 5,
      vendorId: vendor3._id,
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80'
      ],
      highlights: [
        'Curved gooseneck spout provides exact water flow rate control',
        'Integrated lid thermometer highlights optimal 90°C - 96°C brew range',
        'Triple-layer stainless steel base compatible with all induction stovetops'
      ],
      specifications: [
        { label: 'Capacity', value: '1.0 Liter' },
        { label: 'Material', value: 'Food-Grade 304 Stainless Steel' }
      ],
      variants: [],
      averageRating: 4.8,
      numReviews: 24
    },
    {
      name: 'Manual Conical Burr Coffee Hand Grinder',
      description: 'CNC stainless steel conical burr grinder with dual ball-bearing stabilization and 36 grind click adjustments.',
      price: 1799,
      mrp: 2599,
      brand: 'Monsoon Valley',
      category: 'Home & Kitchen',
      stock: 20,
      lowStockThreshold: 4,
      vendorId: vendor3._id,
      images: [
        'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80'
      ],
      highlights: [
        '38mm hardened stainless steel conical burr for uniform particle size',
        'Dual-bearing fixed central axis eliminates burr wobble during grinding',
        'Compact aluminum ribbed body for effortless grip'
      ],
      specifications: [
        { label: 'Burr Material', value: '420 Stainless Steel (55HRC)' },
        { label: 'Hopper Capacity', value: '25g Coffee Beans' }
      ],
      variants: [],
      averageRating: 4.9,
      numReviews: 35
    },
    {
      name: 'Cast Iron Pre-Seasoned Skillet (10-inch)',
      description: 'Heavy-duty 10-inch cast iron frying pan pre-seasoned with 100% natural organic flaxseed oil for non-stick cooking.',
      price: 1399,
      mrp: 1999,
      brand: 'Monsoon Valley',
      category: 'Home & Kitchen',
      stock: 30,
      lowStockThreshold: 6,
      vendorId: vendor3._id,
      images: [
        'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80'
      ],
      highlights: [
        'Pre-seasoned with natural plant oils, zero synthetic chemical coatings',
        'Even heat retention and searing capabilities on gas, induction, or campfire',
        'Dual pour spouts for mess-free draining of oils and gravies'
      ],
      specifications: [
        { label: 'Diameter', value: '10 Inches (26 cm)' },
        { label: 'Weight', value: '2.4 kg' }
      ],
      variants: [],
      averageRating: 4.7,
      numReviews: 40
    },
    {
      name: 'Double-Walled Borosilicate Glass Mugs (Set of 2)',
      description: 'Hand-blown thermal insulated 350ml glass coffee mugs that keep drinks hot without burning hands.',
      price: 749,
      mrp: 1099,
      brand: 'Monsoon Valley',
      category: 'Home & Kitchen',
      stock: 50,
      lowStockThreshold: 10,
      vendorId: vendor3._id,
      images: [
        'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&q=80'
      ],
      highlights: [
        'Dual-wall insulation prevents condensation sweating on table surfaces',
        'Thermal shock resistant borosilicate glass handles -20°C to 150°C'
      ],
      specifications: [
        { label: 'Capacity', value: '350 ml each' },
        { label: 'Set Includes', value: '2 Mugs' }
      ],
      variants: [],
      averageRating: 4.8,
      numReviews: 28
    }
  ];

  // Enrich each product definition with 60-day price history and competitor prices
  const enrichedProducts = productDefinitions.map(p => ({
    ...p,
    priceHistory: generate60DayPriceHistory(p.price, p.mrp),
    competitorPrices: generateCompetitorPrices(p.price, p.category)
  }));

  const createdProducts = await Product.create(enrichedProducts);
  console.log(`Successfully created ${createdProducts.length} catalog products!`);

  // 5. Seed Realistic Orders, SubOrders, PayoutLedgers & Reviews (FR-15, FR-16, FR-25, FR-26, FR-31)
  console.log('Seeding realistic multi-vendor orders, suborders, and customer reviews...');

  const pApex = createdProducts[0];
  const pKeyboard = createdProducts[1];
  const pLoafers = createdProducts.find(p => p.category === 'Footwear') || createdProducts[8];
  const pTee = createdProducts.find(p => p.category === 'Clothing') || createdProducts[12];
  const pCoffee = createdProducts.find(p => p.category === 'Home & Kitchen') || createdProducts[16];
  const pWallet = createdProducts.find(p => p.category === 'Accessories') || createdProducts[20];

  const addr1 = { street: '42 MG Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', zip: '560038', country: 'India' };
  const addr2 = { street: '18 Anna Salai, T. Nagar', city: 'Chennai', state: 'Tamil Nadu', zip: '600017', country: 'India' };

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  // Order 1: Multi-vendor completed order (Apex Headphones + Urban Loafers)
  const order1Total = pApex.price + pLoafers.price;
  const order1 = await Order.create({
    orderNumber: 'ORD-2026-1001',
    customerId: customer1._id,
    subOrderIds: [],
    totalAmount: order1Total,
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    paymentDetails: { transactionId: 'pay_mock_1001', orderId: 'order_mock_1001', signature: 'sig_mock_1001' },
    shippingAddress: addr1,
    createdAt: new Date(now - 12 * day)
  });

  const subOrder1A = await SubOrder.create({
    subOrderNumber: 'SUB-2026-1001-A',
    parentOrderId: order1._id,
    vendorId: pApex.vendorId,
    customerId: customer1._id,
    items: [{
      productId: pApex._id,
      productName: pApex.name,
      variantSku: pApex.variants?.[0]?.sku || '',
      variantInfo: pApex.variants?.[0]?.color || '',
      price: pApex.price,
      quantity: 1,
      subtotal: pApex.price
    }],
    subtotal: pApex.price,
    commissionRate: 0.10,
    commissionAmount: Math.round(pApex.price * 0.10),
    vendorPayoutAmount: Math.round(pApex.price * 0.90),
    status: 'delivered',
    statusHistory: [
      { status: 'placed', changedAt: new Date(now - 12 * day) },
      { status: 'processing', changedAt: new Date(now - 11 * day) },
      { status: 'shipped', changedAt: new Date(now - 9 * day) },
      { status: 'delivered', changedAt: new Date(now - 7 * day) }
    ],
    createdAt: new Date(now - 12 * day)
  });

  const subOrder1B = await SubOrder.create({
    subOrderNumber: 'SUB-2026-1001-B',
    parentOrderId: order1._id,
    vendorId: pLoafers.vendorId,
    customerId: customer1._id,
    items: [{
      productId: pLoafers._id,
      productName: pLoafers.name,
      variantSku: pLoafers.variants?.[0]?.sku || '',
      variantInfo: pLoafers.variants?.[0]?.color || '',
      price: pLoafers.price,
      quantity: 1,
      subtotal: pLoafers.price
    }],
    subtotal: pLoafers.price,
    commissionRate: 0.10,
    commissionAmount: Math.round(pLoafers.price * 0.10),
    vendorPayoutAmount: Math.round(pLoafers.price * 0.90),
    status: 'delivered',
    statusHistory: [
      { status: 'placed', changedAt: new Date(now - 12 * day) },
      { status: 'processing', changedAt: new Date(now - 10 * day) },
      { status: 'shipped', changedAt: new Date(now - 8 * day) },
      { status: 'delivered', changedAt: new Date(now - 6 * day) }
    ],
    createdAt: new Date(now - 12 * day)
  });

  order1.subOrderIds = [subOrder1A._id, subOrder1B._id];
  await order1.save();

  // Payout ledgers for Order 1 (settled)
  await PayoutLedger.create([
    {
      vendorId: pApex.vendorId,
      subOrderId: subOrder1A._id,
      amount: subOrder1A.vendorPayoutAmount,
      commission: subOrder1A.commissionAmount,
      status: 'settled',
      settledAt: new Date(now - 5 * day),
      settledBy: admin._id
    },
    {
      vendorId: pLoafers.vendorId,
      subOrderId: subOrder1B._id,
      amount: subOrder1B.vendorPayoutAmount,
      commission: subOrder1B.commissionAmount,
      status: 'settled',
      settledAt: new Date(now - 5 * day),
      settledBy: admin._id
    }
  ]);

  // Reviews for Order 1 products
  await Review.create([
    {
      productId: pApex._id,
      customerId: customer1._id,
      subOrderId: subOrder1A._id,
      rating: 5,
      comment: 'Exceptional sound staging and active noise cancellation. The battery life easily surpasses 35 hours on long commutes. Highly recommended!',
      isFlagged: false,
      createdAt: new Date(now - 6 * day)
    },
    {
      productId: pLoafers._id,
      customerId: customer1._id,
      subOrderId: subOrder1B._id,
      rating: 5,
      comment: 'Super comfortable for everyday wear. The bamboo knit lining keeps feet cool even during warm humid days.',
      isFlagged: false,
      createdAt: new Date(now - 5 * day)
    }
  ]);

  // Order 2: In-transit order (Custom 75% Mechanical Keyboard)
  const order2 = await Order.create({
    orderNumber: 'ORD-2026-1002',
    customerId: customer1._id,
    subOrderIds: [],
    totalAmount: pKeyboard.price,
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    paymentDetails: { transactionId: 'pay_mock_1002', orderId: 'order_mock_1002' },
    shippingAddress: addr1,
    createdAt: new Date(now - 3 * day)
  });

  const subOrder2A = await SubOrder.create({
    subOrderNumber: 'SUB-2026-1002-A',
    parentOrderId: order2._id,
    vendorId: pKeyboard.vendorId,
    customerId: customer1._id,
    items: [{
      productId: pKeyboard._id,
      productName: pKeyboard.name,
      variantSku: pKeyboard.variants?.[0]?.sku || '',
      price: pKeyboard.price,
      quantity: 1,
      subtotal: pKeyboard.price
    }],
    subtotal: pKeyboard.price,
    commissionRate: 0.10,
    commissionAmount: Math.round(pKeyboard.price * 0.10),
    vendorPayoutAmount: Math.round(pKeyboard.price * 0.90),
    status: 'shipped',
    statusHistory: [
      { status: 'placed', changedAt: new Date(now - 3 * day) },
      { status: 'processing', changedAt: new Date(now - 2 * day) },
      { status: 'shipped', changedAt: new Date(now - 1 * day) }
    ],
    createdAt: new Date(now - 3 * day)
  });

  order2.subOrderIds = [subOrder2A._id];
  await order2.save();

  await PayoutLedger.create({
    vendorId: pKeyboard.vendorId,
    subOrderId: subOrder2A._id,
    amount: subOrder2A.vendorPayoutAmount,
    commission: subOrder2A.commissionAmount,
    status: 'accrued'
  });

  // Order 3: Multi-vendor completed order for customer2 (Ananya Deshmukh)
  const order3Total = pTee.price + pWallet.price;
  const order3 = await Order.create({
    orderNumber: 'ORD-2026-1003',
    customerId: customer2._id,
    subOrderIds: [],
    totalAmount: order3Total,
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    paymentDetails: { transactionId: 'pay_mock_1003', orderId: 'order_mock_1003' },
    shippingAddress: addr2,
    createdAt: new Date(now - 8 * day)
  });

  const subOrder3A = await SubOrder.create({
    subOrderNumber: 'SUB-2026-1003-A',
    parentOrderId: order3._id,
    vendorId: pTee.vendorId,
    customerId: customer2._id,
    items: [{
      productId: pTee._id,
      productName: pTee.name,
      variantSku: pTee.variants?.[0]?.sku || '',
      price: pTee.price,
      quantity: 1,
      subtotal: pTee.price
    }],
    subtotal: pTee.price,
    commissionRate: 0.10,
    commissionAmount: Math.round(pTee.price * 0.10),
    vendorPayoutAmount: Math.round(pTee.price * 0.90),
    status: 'delivered',
    statusHistory: [
      { status: 'placed', changedAt: new Date(now - 8 * day) },
      { status: 'processing', changedAt: new Date(now - 7 * day) },
      { status: 'shipped', changedAt: new Date(now - 5 * day) },
      { status: 'delivered', changedAt: new Date(now - 3 * day) }
    ],
    createdAt: new Date(now - 8 * day)
  });

  const subOrder3B = await SubOrder.create({
    subOrderNumber: 'SUB-2026-1003-B',
    parentOrderId: order3._id,
    vendorId: pWallet.vendorId,
    customerId: customer2._id,
    items: [{
      productId: pWallet._id,
      productName: pWallet.name,
      variantSku: pWallet.variants?.[0]?.sku || '',
      price: pWallet.price,
      quantity: 1,
      subtotal: pWallet.price
    }],
    subtotal: pWallet.price,
    commissionRate: 0.10,
    commissionAmount: Math.round(pWallet.price * 0.10),
    vendorPayoutAmount: Math.round(pWallet.price * 0.90),
    status: 'delivered',
    statusHistory: [
      { status: 'placed', changedAt: new Date(now - 8 * day) },
      { status: 'processing', changedAt: new Date(now - 6 * day) },
      { status: 'shipped', changedAt: new Date(now - 4 * day) },
      { status: 'delivered', changedAt: new Date(now - 2 * day) }
    ],
    createdAt: new Date(now - 8 * day)
  });

  order3.subOrderIds = [subOrder3A._id, subOrder3B._id];
  await order3.save();

  await PayoutLedger.create([
    {
      vendorId: pTee.vendorId,
      subOrderId: subOrder3A._id,
      amount: subOrder3A.vendorPayoutAmount,
      commission: subOrder3A.commissionAmount,
      status: 'settled',
      settledAt: new Date(now - 2 * day),
      settledBy: admin._id
    },
    {
      vendorId: pWallet.vendorId,
      subOrderId: subOrder3B._id,
      amount: subOrder3B.vendorPayoutAmount,
      commission: subOrder3B.commissionAmount,
      status: 'settled',
      settledAt: new Date(now - 2 * day),
      settledBy: admin._id
    }
  ]);

  await Review.create({
    productId: pTee._id,
    customerId: customer2._id,
    subOrderId: subOrder3A._id,
    rating: 5,
    comment: 'Supreme quality cotton, retains shape even after multiple washes. The fabric is wonderfully soft.',
    isFlagged: false,
    createdAt: new Date(now - 2 * day)
  });

  // Order 4: Fresh active order (Artisanal Coffee Beans)
  const order4 = await Order.create({
    orderNumber: 'ORD-2026-1004',
    customerId: customer1._id,
    subOrderIds: [],
    totalAmount: pCoffee.price * 2,
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    paymentDetails: { transactionId: 'pay_mock_1004', orderId: 'order_mock_1004' },
    shippingAddress: addr1,
    createdAt: new Date(now - 1 * day)
  });

  const subOrder4A = await SubOrder.create({
    subOrderNumber: 'SUB-2026-1004-A',
    parentOrderId: order4._id,
    vendorId: pCoffee.vendorId,
    customerId: customer1._id,
    items: [{
      productId: pCoffee._id,
      productName: pCoffee.name,
      price: pCoffee.price,
      quantity: 2,
      subtotal: pCoffee.price * 2
    }],
    subtotal: pCoffee.price * 2,
    commissionRate: 0.10,
    commissionAmount: Math.round(pCoffee.price * 2 * 0.10),
    vendorPayoutAmount: Math.round(pCoffee.price * 2 * 0.90),
    status: 'processing',
    statusHistory: [
      { status: 'placed', changedAt: new Date(now - 1 * day) },
      { status: 'processing', changedAt: new Date(now - 4 * 60 * 60 * 1000) }
    ],
    createdAt: new Date(now - 1 * day)
  });

  order4.subOrderIds = [subOrder4A._id];
  await order4.save();

  await PayoutLedger.create({
    vendorId: pCoffee.vendorId,
    subOrderId: subOrder4A._id,
    amount: subOrder4A.vendorPayoutAmount,
    commission: subOrder4A.commissionAmount,
    status: 'accrued'
  });

  console.log('Successfully seeded 4 realistic multi-vendor orders, 6 sub-orders, 6 payout ledgers, and verified reviews!');
  console.log('Seeding complete!');
  console.log('Demo Credentials:');
  console.log('  Admin:    admin@venfes.com / admin123');
  console.log('  Vendor:   vendor@venfes.com / vendor123');
  console.log('  Customer: customer@venfes.com / customer123');
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}
