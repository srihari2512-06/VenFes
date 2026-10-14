import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';
import { assertOwnership } from '../middleware/auth.js';
import { parseAndValidateProductCSV } from '../utils/csvParser.js';
import { getCache, setCache } from '../services/cacheService.js';

function escapeRegex(text) {
  return String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export async function getProducts(req, res, next) {
  try {
    const {
      q,
      search,
      category,
      brand,
      store,
      vendorId,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      minDiscount,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const searchTerm = (q || search || '').trim();
    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const cappedLimit = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (currentPage - 1) * cappedLimit;

    // 1. Initial Match & Join Approved Stores
    const baseMatch = {
      isPublished: true,
      isFlagged: false
    };

    // Category filter for the base facet set
    if (category && category !== 'All') {
      baseMatch.category = category.trim();
    }

    // Search query matching (safely escaped)
    if (searchTerm) {
      const escaped = escapeRegex(searchTerm);
      const searchRegex = new RegExp(escaped, 'i');
      baseMatch.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { category: searchRegex }
      ];
    }

    // Pipeline to enrich with vendor and calculate discount percent
    const basePipeline = [
      { $match: baseMatch },
      {
        $lookup: {
          from: 'users',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      { $unwind: '$vendor' },
      {
        $match: {
          'vendor.role': 'vendor',
          'vendor.vendorProfile.status': 'approved'
        }
      },
      {
        $addFields: {
          discountPercent: {
            $cond: [
              { $and: [{ $gt: ['$mrp', '$price'] }, { $gt: ['$mrp', 0] }] },
              { $round: [{ $multiply: [{ $divide: [{ $subtract: ['$mrp', '$price'] }, '$mrp'] }, 100] }, 0] },
              0
            ]
          }
        }
      }
    ];

    // Compute facets from the base set matching q and category only
    // Trade-off: Facets are computed from the base set matching q and category only (not other dynamic filters).
    // This gives shoppers a stable, predictable sidebar where available options remain visible without collapsing.
    const facetPipeline = [
      ...basePipeline,
      {
        $facet: {
          brands: [
            { $match: { brand: { $exists: true, $nin: ['', null] } } },
            { $group: { _id: '$brand', count: { $sum: 1 } } },
            { $project: { _id: 0, value: '$_id', count: 1 } },
            { $sort: { count: -1, value: 1 } }
          ],
          stores: [
            {
              $group: {
                _id: '$vendor._id',
                name: { $first: '$vendor.vendorProfile.storeName' },
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                _id: 0,
                id: { $toString: '$_id' },
                name: { $ifNull: ['$name', 'Store'] },
                count: 1
              }
            },
            { $sort: { count: -1, name: 1 } }
          ],
          categories: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $project: { _id: 0, value: '$_id', count: 1 } },
            { $sort: { count: -1, value: 1 } }
          ],
          price: [
            {
              $group: {
                _id: null,
                min: { $min: '$price' },
                max: { $max: '$price' }
              }
            },
            {
              $project: {
                _id: 0,
                min: { $ifNull: ['$min', 0] },
                max: { $ifNull: ['$max', 0] }
              }
            }
          ],
          ratings: [
            {
              $group: {
                _id: null,
                fourAndUp: {
                  $sum: { $cond: [{ $gte: ['$averageRating', 4] }, 1, 0] }
                },
                threeAndUp: {
                  $sum: { $cond: [{ $gte: ['$averageRating', 3] }, 1, 0] }
                },
                twoAndUp: {
                  $sum: { $cond: [{ $gte: ['$averageRating', 2] }, 1, 0] }
                }
              }
            },
            {
              $project: {
                _id: 0,
                fourAndUp: { $ifNull: ['$fourAndUp', 0] },
                threeAndUp: { $ifNull: ['$threeAndUp', 0] },
                twoAndUp: { $ifNull: ['$twoAndUp', 0] }
              }
            }
          ]
        }
      }
    ];

    // Filter pipeline for product results
    const productMatch = {};

    // Brand filter
    if (brand) {
      const brandList = Array.isArray(brand) ? brand : [brand];
      productMatch.brand = { $in: brandList };
    }

    // Store / vendorId filter
    const storeFilters = [];
    if (vendorId) {
      if (mongoose.Types.ObjectId.isValid(vendorId)) {
        storeFilters.push({ 'vendor._id': new mongoose.Types.ObjectId(vendorId) });
      }
    }
    if (store) {
      const storeList = Array.isArray(store) ? store : [store];
      for (const s of storeList) {
        if (mongoose.Types.ObjectId.isValid(s)) {
          storeFilters.push({ 'vendor._id': new mongoose.Types.ObjectId(s) });
        } else {
          storeFilters.push({ 'vendor.vendorProfile.storeName': s });
        }
      }
    }
    if (storeFilters.length > 0) {
      productMatch.$or = storeFilters;
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      productMatch.price = {};
      if (minPrice !== undefined && minPrice !== '') productMatch.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') productMatch.price.$lte = Number(maxPrice);
    }

    // Min rating
    if (minRating !== undefined && minRating !== '') {
      const clampedRating = Math.min(4, Math.max(1, Number(minRating)));
      productMatch.averageRating = { $gte: clampedRating };
    }

    // In stock
    if (inStock === 'true' || inStock === true) {
      productMatch.stock = { $gt: 0 };
    }

    // Min discount
    if (minDiscount !== undefined && minDiscount !== '') {
      productMatch.discountPercent = { $gte: Number(minDiscount) };
    }

    // Determine Sort Order
    let sortStage = { createdAt: -1 };
    if (sort === 'price_asc') sortStage = { price: 1, _id: 1 };
    else if (sort === 'price_desc') sortStage = { price: -1, _id: 1 };
    else if (sort === 'rating') sortStage = { averageRating: -1, numReviews: -1, _id: 1 };
    else if (sort === 'discount') sortStage = { discountPercent: -1, price: 1, _id: 1 };
    else if (sort === 'popular') sortStage = { numReviews: -1, averageRating: -1, _id: 1 };
    else if (sort === 'newest') sortStage = { createdAt: -1, _id: 1 };
    else if (sort === 'relevance' && searchTerm) sortStage = { averageRating: -1, createdAt: -1 };

    // Run aggregation for results and facets concurrently
    const [facetResults, productsAndTotal] = await Promise.all([
      Product.aggregate(facetPipeline),
      Product.aggregate([
        ...basePipeline,
        ...(Object.keys(productMatch).length > 0 ? [{ $match: productMatch }] : []),
        {
          $facet: {
            items: [
              { $sort: sortStage },
              { $skip: skip },
              { $limit: cappedLimit },
              {
                $project: {
                  name: 1,
                  description: 1,
                  price: 1,
                  mrp: 1,
                  brand: 1,
                  highlights: 1,
                  specifications: 1,
                  category: 1,
                  images: 1,
                  stock: 1,
                  lowStockThreshold: 1,
                  variants: 1,
                  isPublished: 1,
                  isFlagged: 1,
                  averageRating: 1,
                  numReviews: 1,
                  discountPercent: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  vendorId: {
                    _id: '$vendor._id',
                    name: '$vendor.name',
                    vendorProfile: {
                      storeName: '$vendor.vendorProfile.storeName',
                      storeDescription: '$vendor.vendorProfile.storeDescription',
                      handlingDays: '$vendor.vendorProfile.handlingDays'
                    }
                  }
                }
              }
            ],
            totalCount: [{ $count: 'count' }]
          }
        }
      ])
    ]);

    const facetsRaw = facetResults[0] || {};
    const items = productsAndTotal[0]?.items || [];
    const total = productsAndTotal[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / cappedLimit);

    const priceFacet = facetsRaw.price?.[0] || { min: 0, max: 0 };
    const ratingsFacet = facetsRaw.ratings?.[0] || { fourAndUp: 0, threeAndUp: 0, twoAndUp: 0 };

    res.json({
      success: true,
      data: {
        products: items,
        meta: {
          page: currentPage,
          limit: cappedLimit,
          total,
          totalPages
        },
        pagination: {
          page: currentPage,
          limit: cappedLimit,
          total,
          pages: totalPages
        },
        facets: {
          brands: facetsRaw.brands || [],
          stores: facetsRaw.stores || [],
          categories: facetsRaw.categories || [],
          price: priceFacet,
          ratings: {
            4: ratingsFacet.fourAndUp,
            3: ratingsFacet.threeAndUp,
            2: ratingsFacet.twoAndUp
          }
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getProductSuggestions(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: { products: [], categories: [], brands: [] }
      });
    }

    const searchTerm = q.trim();
    const cacheKey = `suggest:${searchTerm.toLowerCase()}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const escaped = escapeRegex(searchTerm);
    const regex = new RegExp(escaped, 'i');

    // Only active products of approved vendors
    const matchingProducts = await Product.aggregate([
      {
        $match: {
          isPublished: true,
          isFlagged: false,
          $or: [
            { name: regex },
            { brand: regex },
            { category: regex }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      { $unwind: '$vendor' },
      {
        $match: {
          'vendor.role': 'vendor',
          'vendor.vendorProfile.status': 'approved'
        }
      },
      { $limit: 20 }
    ]);

    // Top 6 products: id, title, thumbnail, price
    const products = matchingProducts.slice(0, 6).map(p => ({
      id: p._id.toString(),
      title: p.name,
      thumbnail: p.images?.[0] || '',
      price: p.price
    }));

    // Categories matching q (up to 3)
    const categorySet = new Set();
    for (const p of matchingProducts) {
      if (p.category && regex.test(p.category)) {
        categorySet.add(p.category);
        if (categorySet.size >= 3) break;
      }
    }

    // Brands matching q (up to 3)
    const brandSet = new Set();
    for (const p of matchingProducts) {
      if (p.brand && regex.test(p.brand)) {
        brandSet.add(p.brand);
        if (brandSet.size >= 3) break;
      }
    }

    const result = {
      products,
      categories: Array.from(categorySet),
      brands: Array.from(brandSet)
    };

    await setCache(cacheKey, result, 60);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendorId', 'name vendorProfile.storeName vendorProfile.storeDescription vendorProfile.handlingDays');
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
    const { name, description, price, mrp, brand, highlights, specifications, category, stock, lowStockThreshold, images, variants } = req.body;

    if (!name || !description || price === undefined || !category) {
      throw new AppError('Name, description, price, and category are required', 400, 'VALIDATION_ERROR');
    }

    const numPrice = Number(price);
    let numMrp = undefined;
    if (mrp !== undefined && mrp !== null && mrp !== '') {
      numMrp = Number(mrp);
      if (isNaN(numMrp) || numMrp < numPrice) {
        throw new AppError('MRP must be greater than or equal to price', 400, 'VALIDATION_ERROR');
      }
    }

    if (highlights && Array.isArray(highlights)) {
      if (highlights.length > 6) {
        throw new AppError('Highlights cannot exceed 6 items', 400, 'VALIDATION_ERROR');
      }
      if (highlights.some(h => typeof h === 'string' && h.length > 120)) {
        throw new AppError('Each highlight must be 120 characters or fewer', 400, 'VALIDATION_ERROR');
      }
    }

    if (specifications && Array.isArray(specifications) && specifications.length > 15) {
      throw new AppError('Specifications cannot exceed 15 items', 400, 'VALIDATION_ERROR');
    }

    if (images && Array.isArray(images) && images.length > 6) {
      throw new AppError('A product can have at most 6 images', 400, 'VALIDATION_ERROR');
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      mrp: numMrp,
      brand: brand ? brand.trim() : '',
      highlights: Array.isArray(highlights) ? highlights : [],
      specifications: Array.isArray(specifications) ? specifications : [],
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

    const targetPrice = req.body.price !== undefined ? Number(req.body.price) : product.price;
    const targetMrp = req.body.mrp !== undefined ? (req.body.mrp !== null && req.body.mrp !== '' ? Number(req.body.mrp) : undefined) : product.mrp;

    if (targetMrp !== undefined && targetMrp !== null && targetMrp < targetPrice) {
      throw new AppError('MRP must be greater than or equal to price', 400, 'VALIDATION_ERROR');
    }

    if (req.body.highlights && Array.isArray(req.body.highlights)) {
      if (req.body.highlights.length > 6) {
        throw new AppError('Highlights cannot exceed 6 items', 400, 'VALIDATION_ERROR');
      }
      if (req.body.highlights.some(h => typeof h === 'string' && h.length > 120)) {
        throw new AppError('Each highlight must be 120 characters or fewer', 400, 'VALIDATION_ERROR');
      }
    }

    if (req.body.specifications && Array.isArray(req.body.specifications) && req.body.specifications.length > 15) {
      throw new AppError('Specifications cannot exceed 15 items', 400, 'VALIDATION_ERROR');
    }

    if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 6) {
      throw new AppError('A product can have at most 6 images', 400, 'VALIDATION_ERROR');
    }

    const allowedUpdates = ['name', 'description', 'price', 'mrp', 'brand', 'highlights', 'specifications', 'category', 'stock', 'lowStockThreshold', 'images', 'variants', 'isPublished'];
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
    let csvString = '';
    if (req.file) {
      csvString = req.file.buffer.toString('utf-8');
    } else if (req.body.csv) {
      csvString = req.body.csv;
    } else {
      throw new AppError('No CSV file or data provided', 400, 'BAD_REQUEST');
    }

    const { imported, errors } = parseAndValidateProductCSV(csvString, req.user._id);

    let createdProducts = [];
    if (imported.length > 0) {
      createdProducts = await Product.insertMany(imported);
    }

    res.json({
      success: true,
      data: {
        successCount: createdProducts.length,
        errorCount: errors.length,
        errors,
        createdProducts
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getLowStockAlerts(req, res, next) {
  try {
    const products = await Product.find({
      vendorId: req.user._id,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    });
    res.json({ success: true, data: { products } });
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
