import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getCart(req, res, next) {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate({
      path: 'items.productId',
      select: 'name price images stock variants vendorId isPublished isFlagged'
    });

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    res.json({ success: true, data: { cart } });
  } catch (err) {
    next(err);
  }
}

export async function addToCart(req, res, next) {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    if (!productId) {
      throw new AppError('ProductId is required', 400, 'VALIDATION_ERROR');
    }

    const product = await Product.findById(productId);
    if (!product || !product.isPublished || product.isFlagged) {
      throw new AppError('Product not available', 404, 'NOT_FOUND');
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      item => item.productId.toString() === productId.toString() &&
              (variantId ? item.variantId?.toString() === variantId.toString() : !item.variantId)
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        productId,
        variantId: variantId || null,
        quantity: Number(quantity)
      });
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.productId');

    res.json({ success: true, data: { cart: populated } });
  } catch (err) {
    next(err);
  }
}

export async function updateCartItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) throw new AppError('Cart not found', 404, 'NOT_FOUND');

    const item = cart.items.id(itemId);
    if (!item) throw new AppError('Item not found in cart', 404, 'NOT_FOUND');

    if (Number(quantity) <= 0) {
      cart.items.pull(itemId);
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.productId');

    res.json({ success: true, data: { cart: populated } });
  } catch (err) {
    next(err);
  }
}

export async function removeFromCart(req, res, next) {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) throw new AppError('Cart not found', 404, 'NOT_FOUND');

    cart.items.pull(itemId);
    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.productId');

    res.json({ success: true, data: { cart: populated } });
  } catch (err) {
    next(err);
  }
}
