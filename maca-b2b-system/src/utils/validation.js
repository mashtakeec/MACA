import { VALIDATION_RULES } from '../lib/constants.js'

/**
 * メールアドレスのバリデーション
 * @param {string} email - メールアドレス
 * @returns {boolean}
 */
export function validateEmail(email) {
  return VALIDATION_RULES.EMAIL.test(email)
}

/**
 * 電話番号のバリデーション
 * @param {string} phone - 電話番号
 * @returns {boolean}
 */
export function validatePhone(phone) {
  return VALIDATION_RULES.PHONE.test(phone)
}

/**
 * パスワードのバリデーション
 * @param {string} password - パスワード
 * @returns {Object}
 */
export function validatePassword(password) {
  const rules = VALIDATION_RULES.PASSWORD
  const errors = []

  if (password.length < rules.minLength) {
    errors.push(`パスワードは${rules.minLength}文字以上である必要があります`)
  }

  if (rules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('パスワードには大文字を含める必要があります')
  }

  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('パスワードには小文字を含める必要があります')
  }

  if (rules.requireNumbers && !/\d/.test(password)) {
    errors.push('パスワードには数字を含める必要があります')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 必須フィールドのバリデーション
 * @param {string} value - 値
 * @param {string} fieldName - フィールド名
 * @returns {string|null}
 */
export function validateRequired(value, fieldName) {
  if (!value || value.trim() === '') {
    return `${fieldName}は必須です`
  }
  return null
}

/**
 * 数値のバリデーション
 * @param {any} value - 値
 * @param {Object} options - オプション
 * @param {number} options.min - 最小値
 * @param {number} options.max - 最大値
 * @param {boolean} options.integer - 整数のみ許可
 * @returns {string|null}
 */
export function validateNumber(value, options = {}) {
  const num = Number(value)
  
  if (isNaN(num)) {
    return '数値を入力してください'
  }

  if (options.integer && !Number.isInteger(num)) {
    return '整数を入力してください'
  }

  if (options.min !== undefined && num < options.min) {
    return `${options.min}以上の値を入力してください`
  }

  if (options.max !== undefined && num > options.max) {
    return `${options.max}以下の値を入力してください`
  }

  return null
}

/**
 * 申込フォームのバリデーション
 * @param {Object} formData - フォームデータ
 * @returns {Object}
 */
export function validateApplicationForm(formData) {
  const errors = {}

  // 会社名
  const companyNameError = validateRequired(formData.company_name, '会社名')
  if (companyNameError) errors.company_name = companyNameError

  // 担当者名
  const contactNameError = validateRequired(formData.contact_name, '担当者名')
  if (contactNameError) errors.contact_name = contactNameError

  // メールアドレス
  const emailRequiredError = validateRequired(formData.email, 'メールアドレス')
  if (emailRequiredError) {
    errors.email = emailRequiredError
  } else if (!validateEmail(formData.email)) {
    errors.email = '正しいメールアドレスを入力してください'
  }

  // 電話番号（任意だが、入力されている場合はバリデーション）
  if (formData.phone && !validatePhone(formData.phone)) {
    errors.phone = '正しい電話番号を入力してください'
  }

  // 住所
  const addressError = validateRequired(formData.address, '住所')
  if (addressError) errors.address = addressError

  // 事業内容
  const businessTypeError = validateRequired(formData.business_type, '事業内容')
  if (businessTypeError) errors.business_type = businessTypeError

  // 利用規約同意
  if (!formData.terms_agreed) {
    errors.terms_agreed = '利用規約に同意してください'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * 顧客情報のバリデーション
 * @param {Object} customerData - 顧客データ
 * @returns {Object}
 */
export function validateCustomerData(customerData) {
  const errors = {}

  // 基本情報のバリデーション
  const applicationErrors = validateApplicationForm(customerData)
  Object.assign(errors, applicationErrors.errors)

  // 割引率
  const discountRateError = validateNumber(customerData.discount_rate, {
    min: 0,
    max: 50,
    integer: false
  })
  if (discountRateError) errors.discount_rate = discountRateError

  // 弥生ID（承認時に必須）
  if (customerData.status === 'approved') {
    const yayoiIdError = validateRequired(customerData.yayoi_id, '弥生ID')
    if (yayoiIdError) errors.yayoi_id = yayoiIdError
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * 注文データのバリデーション
 * @param {Object} orderData - 注文データ
 * @returns {Object}
 */
export function validateOrderData(orderData) {
  const errors = {}

  // 顧客ID
  const customerIdError = validateRequired(orderData.customer_id, '顧客')
  if (customerIdError) errors.customer_id = customerIdError

  // 注文アイテム
  if (!orderData.items || orderData.items.length === 0) {
    errors.items = '注文商品を選択してください'
  } else {
    orderData.items.forEach((item, index) => {
      const quantityError = validateNumber(item.quantity, {
        min: 1,
        integer: true
      })
      if (quantityError) {
        errors[`items.${index}.quantity`] = quantityError
      }
    })
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * フォームエラーメッセージを取得
 * @param {Object} errors - エラーオブジェクト
 * @param {string} fieldName - フィールド名
 * @returns {string|null}
 */
export function getFieldError(errors, fieldName) {
  return errors[fieldName] || null
}

/**
 * エラーメッセージの配列を文字列に変換
 * @param {string[]} errors - エラー配列
 * @returns {string}
 */
export function formatErrorMessages(errors) {
  return errors.join('\n')
}

