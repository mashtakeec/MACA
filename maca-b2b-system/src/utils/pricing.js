import { VOLUME_DISCOUNTS, DISCOUNT_TYPES } from '../lib/constants.js'

/**
 * 価格計算（CustomerPortal用の簡易版）
 * @param {number} unitPrice - 単価
 * @param {number} quantity - 数量
 * @param {number} discountRate - 割引率（%）
 * @param {Object} specialPrice - 特別単価設定
 * @returns {Object}
 */
export function calculatePrice(unitPrice, quantity, discountRate = 0, specialPrice = null) {
  let finalUnitPrice = unitPrice;
  let appliedDiscountRate = discountRate;

  // 特別単価が設定されている場合
  if (specialPrice) {
    if (specialPrice.type === 'fixed') {
      finalUnitPrice = specialPrice.price;
      appliedDiscountRate = ((unitPrice - specialPrice.price) / unitPrice) * 100;
    } else if (specialPrice.type === 'discount') {
      appliedDiscountRate = specialPrice.discount_rate;
      finalUnitPrice = unitPrice * (1 - appliedDiscountRate / 100);
    }
  } else {
    // 基本割引率を適用
    finalUnitPrice = unitPrice * (1 - discountRate / 100);
  }

  const finalPrice = finalUnitPrice * quantity;

  return {
    unitPrice: Math.floor(finalUnitPrice),
    finalPrice: Math.floor(finalPrice),
    discountRate: Math.round(appliedDiscountRate * 100) / 100,
    discountAmount: Math.floor((unitPrice - finalUnitPrice) * quantity)
  };
}

/**
 * 顧客向け価格を計算する
 * @param {number} basePrice - 基本価格
 * @param {import('../types/index.js').Customer} customer - 顧客情報
 * @param {string} productId - 商品ID
 * @param {number} quantity - 数量
 * @returns {import('../types/index.js').PriceCalculation}
 */
export function calculateCustomerPrice(basePrice, customer, productId, quantity) {
  let finalPrice = basePrice
  let appliedDiscount = 0
  let discountType = DISCOUNT_TYPES.BASIC

  // 1. 特別単価チェック
  if (customer.special_pricing && customer.special_pricing[productId]) {
    finalPrice = customer.special_pricing[productId]
    discountType = DISCOUNT_TYPES.SPECIAL
    appliedDiscount = ((basePrice - finalPrice) / basePrice) * 100
  } else {
    // 2. 数量割引チェック
    const volumeDiscount = getVolumeDiscount(quantity)
    if (volumeDiscount > customer.discount_rate) {
      appliedDiscount = volumeDiscount
      discountType = DISCOUNT_TYPES.VOLUME
    } else {
      // 3. 基本割引率適用
      appliedDiscount = customer.discount_rate || 0
      discountType = DISCOUNT_TYPES.BASIC
    }
    
    finalPrice = basePrice * (1 - appliedDiscount / 100)
  }

  const discountAmount = basePrice - finalPrice

  return {
    basePrice,
    finalPrice: Math.floor(finalPrice),
    discountAmount: Math.floor(discountAmount),
    discountType,
    appliedDiscount: Math.round(appliedDiscount * 100) / 100
  }
}

/**
 * 数量に基づく割引率を取得
 * @param {number} quantity - 数量
 * @returns {number} 割引率（%）
 */
export function getVolumeDiscount(quantity) {
  // 数量の多い順にソートして、適用可能な最大割引を見つける
  const sortedDiscounts = [...VOLUME_DISCOUNTS].sort((a, b) => b.minQuantity - a.minQuantity)
  
  for (const discount of sortedDiscounts) {
    if (quantity >= discount.minQuantity) {
      return discount.discountRate
    }
  }
  
  return 0
}

/**
 * 注文全体の価格を計算
 * @param {import('../types/index.js').CartItem[]} items - カートアイテム
 * @param {import('../types/index.js').Customer} customer - 顧客情報
 * @returns {Object}
 */
export function calculateOrderTotal(items, customer) {
  let subtotal = 0
  let totalDiscountAmount = 0
  const calculatedItems = []

  items.forEach(item => {
    const pricing = calculateCustomerPrice(
      item.product.price,
      customer,
      item.productId,
      item.quantity
    )
    
    const itemTotal = pricing.finalPrice * item.quantity
    const itemDiscountAmount = pricing.discountAmount * item.quantity
    
    subtotal += pricing.basePrice * item.quantity
    totalDiscountAmount += itemDiscountAmount
    
    calculatedItems.push({
      ...item,
      pricing,
      itemTotal,
      itemDiscountAmount
    })
  })

  const totalAmount = subtotal - totalDiscountAmount

  return {
    items: calculatedItems,
    subtotal,
    totalDiscountAmount,
    totalAmount,
    averageDiscountRate: subtotal > 0 ? (totalDiscountAmount / subtotal) * 100 : 0
  }
}

/**
 * 価格をフォーマット
 * @param {number} price - 価格
 * @param {boolean} showCurrency - 通貨記号を表示するか
 * @returns {string}
 */
export function formatPrice(price, showCurrency = true) {
  const formatted = new Intl.NumberFormat('ja-JP').format(Math.floor(price))
  return showCurrency ? `¥${formatted}` : formatted
}

/**
 * 割引率をフォーマット
 * @param {number} rate - 割引率（%）
 * @returns {string}
 */
export function formatDiscountRate(rate) {
  return `${Math.round(rate * 100) / 100}%`
}

/**
 * 最小発注数量をチェック
 * @param {import('../types/index.js').Product} product - 商品情報
 * @param {number} quantity - 数量
 * @returns {boolean}
 */
export function validateMinOrderQuantity(product, quantity) {
  return quantity >= (product.minOrderQuantity || 1)
}

/**
 * 最小発注数量エラーメッセージを取得
 * @param {import('../types/index.js').Product} product - 商品情報
 * @returns {string}
 */
export function getMinOrderQuantityMessage(product) {
  const minQty = product.minOrderQuantity || 1
  return `${product.name}の最小発注数量は${minQty}個です`
}

