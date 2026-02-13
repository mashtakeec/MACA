/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} role
 * @property {string} name
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Customer
 * @property {string} id
 * @property {string} company_name
 * @property {string} contact_name
 * @property {string} email
 * @property {string} phone
 * @property {string} address
 * @property {string} business_type
 * @property {number} discount_rate
 * @property {Object} special_pricing
 * @property {string} yayoi_id
 * @property {string} status
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Application
 * @property {string} id
 * @property {string} company_name
 * @property {string} contact_name
 * @property {string} email
 * @property {string} phone
 * @property {string} address
 * @property {string} business_type
 * @property {string} status
 * @property {string} yayoi_id
 * @property {number} discount_rate
 * @property {Object} special_pricing
 * @property {string} notes
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {string} description
 * @property {string} category
 * @property {number} minOrderQuantity
 * @property {string} image
 */

/**
 * @typedef {Object} OrderItem
 * @property {string} product_id
 * @property {number} quantity
 * @property {number} unit_price
 * @property {number} total_price
 * @property {string} discount_type
 * @property {number} discount_rate
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} customer_id
 * @property {Customer} customer
 * @property {OrderItem[]} items
 * @property {number} subtotal
 * @property {number} discount_amount
 * @property {number} total_amount
 * @property {string} status
 * @property {string} notes
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} PriceCalculation
 * @property {number} basePrice
 * @property {number} finalPrice
 * @property {number} discountAmount
 * @property {string} discountType
 * @property {number} appliedDiscount
 */

/**
 * @typedef {Object} CartItem
 * @property {string} productId
 * @property {number} quantity
 * @property {Product} product
 * @property {PriceCalculation} pricing
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} user
 * @property {boolean} loading
 * @property {string|null} error
 */

export {}

