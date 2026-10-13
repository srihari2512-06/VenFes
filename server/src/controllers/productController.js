import { Product } from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';
import { assertOwnership } from '../middleware/auth.js';
import { parseAndValidateProductCSV } from '../utils/csvParser.js';

export async function getProducts(req, res, next) {
  try {
    const { page = 1, limit = 12, search, category, minPrice, maxPrice, vendorId } = req.query;
    const query = { isPublished: true, isFlagged: false };

    if (category) {
      query.category = category;
    }

    if (vendorId) {
      query.vendorId = vendorId;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search && search.trim()) {
      // Use text search index with fallback
      query.$text = { $search: search.trim() };
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const take = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('vendorId', 'name vendorProfile.storeName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: take,
          pages: Math.ceil(total / take)
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendorId', 'name vendorProfile.storeName vendorProfile.storeDescription');
    if (!product) {
      throw new AppError('Product not found', 404, 'NOT_FOUND');
    }
    res.json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, stock, lowStockThreshold, images, variants } = req.body;

    if (!name || !description || price === undefined || !category) {
      throw new AppError('Name, description, price, and category are required', 400, 'VALIDATION_ERROR');
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      stock: Number(stock || 0),
      lowStockThreshold: Number(lowStockThreshold || 5),
      images: Array.isArray(images) ? images : [],
      variants: Array.isArray(variants) ? variants : [],
      vendorId: req.user._id
    });

    res.status(201).json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new AppError('Product not found', 404, 'NOT_FOUND');
    }

    if (!assertOwnership(product.vendorId, req.user)) {
      throw new AppError('Forbidden: you do not own this product', 403, 'FORBIDDEN');
    }

    const allowedUpdates = ['name', 'description', 'price', 'category', 'stock', 'lowStockThreshold', 'images', 'variants', 'isPublished'];
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        product[key] = req.body[key];
      }
    }

    await product.save();
    res.json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new AppError('Product not found', 404, 'NOT_FOUND');
    }

    if (!assertOwnership(product.vendorId, req.user)) {
      throw new AppError('Forbidden: you do not own this product', 403, 'FORBIDDEN');
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function bulkUploadCSV(req, res, next) {
  try {
    let csvContent = '';
    if (req.file && req.file.buffer) {
      csvContent = req.file.buffer.toString('utf-8');
    } else if (req.body.csv) {
      csvContent = req.body.csv;
    } else {
      throw new AppError('CSV data or file is required', 400, 'VALIDATION_ERROR');
    }

    const { imported, errors } = parseAndValidateProductCSV(csvContent, req.user._id);

    let inserted = [];
    if (imported.length > 0) {
      inserted = await Product.insertMany(imported);
    }

    res.status(200).json({
      success: true,
      data: {
        totalProcessed: imported.length + errors.length,
        importedCount: inserted.length,
        errors
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getLowStockAlerts(req, res, next) {
  try {
    const query = { vendorId: req.user._id };
    const products = await Product.find({
      vendorId: req.user._id,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    });

    res.json({ success: true, data: { products, count: products.length } });
  } catch (err) {
    next(err);
  }
}

export async function getVendorProducts(req, res, next) {
  try {
    const products = await Product.find({ vendorId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: { products } });
  } catch (err) {
    next(err);
  }
}
