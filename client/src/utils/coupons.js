export const AVAILABLE_COUPONS = [
  {
    code: 'WELCOME50',
    title: 'New Shopper Welcome',
    discountType: 'flat',
    discountValue: 50,
    minOrderValue: 499,
    description: 'Flat ₹50 discount on your first Venfes order above ₹499',
    badge: 'Popular',
    expiry: 'Valid all month',
    category: 'All'
  },
  {
    code: 'FESTIVE20',
    title: 'Great Festival Savings',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 1000,
    minOrderValue: 1999,
    description: 'Save 20% up to ₹1,000 on orders above ₹1,999 across all verified stores',
    badge: 'Top Deal',
    expiry: 'Limited Time',
    category: 'All'
  },
  {
    code: 'TECH10',
    title: 'Audio & Tech Super Saver',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 1500,
    minOrderValue: 2999,
    description: 'Get 10% instant rebate up to ₹1,500 on electronics and peripherals',
    badge: 'Electronics',
    expiry: 'Valid till Sunday',
    category: 'Electronics'
  },
  {
    code: 'VENFES100',
    title: 'Marketplace Special',
    discountType: 'flat',
    discountValue: 100,
    minOrderValue: 999,
    description: 'Flat ₹100 discount on orders containing items from 2 or more vendors',
    badge: 'Multi-Vendor',
    expiry: 'Always Active',
    category: 'All'
  },
  {
    code: 'SAVE500',
    title: 'Mega Cart Voucher',
    discountType: 'flat',
    discountValue: 500,
    minOrderValue: 4999,
    description: 'Flat ₹500 off on high-value carts over ₹4,999',
    badge: 'Mega Value',
    expiry: 'Seasonal',
    category: 'All'
  },
  {
    code: 'FREESHIP',
    title: 'Free Express Delivery',
    discountType: 'flat',
    discountValue: 99,
    minOrderValue: 799,
    description: 'Waiver of standard shipping fee (₹99) on orders above ₹799',
    badge: 'Shipping',
    expiry: 'Ongoing',
    category: 'All'
  }
];

export function validateCoupon(code, cartSubtotal) {
  if (!code) return { valid: false, message: 'Please enter a coupon code' };
  const normalized = code.trim().toUpperCase();
  const coupon = AVAILABLE_COUPONS.find(c => c.code === normalized);
  if (!coupon) {
    return { valid: false, message: `Coupon "${normalized}" is not recognized or has expired` };
  }

  if (cartSubtotal < coupon.minOrderValue) {
    return {
      valid: false,
      message: `Coupon "${coupon.code}" requires a minimum cart value of ₹${coupon.minOrderValue.toLocaleString()}`
    };
  }

  let discountAmount = 0;
  if (coupon.discountType === 'flat') {
    discountAmount = coupon.discountValue;
  } else if (coupon.discountType === 'percentage') {
    discountAmount = Math.round((cartSubtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  }

  return {
    valid: true,
    coupon,
    discountAmount: Math.min(discountAmount, cartSubtotal),
    message: `Coupon applied: ${coupon.title}! You saved ₹${discountAmount.toLocaleString()}`
  };
}
