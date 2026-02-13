// 商品マスタ
export const PRODUCTS = [
  {
    id: 'genki',
    name: '元気の源ポーション',
    price: 1500,
    description: '疲労回復に効果的な基本ポーション',
    category: 'basic',
    minOrderQuantity: 10,
    image: '/images/genki-potion.jpg'
  },
  {
    id: 'maryoku',
    name: '魔力回復の薬',
    price: 2000,
    description: '魔法使いに人気の魔力回復薬',
    category: 'magic',
    minOrderQuantity: 5,
    image: '/images/maryoku-potion.jpg'
  },
  {
    id: 'kinryoku',
    name: '筋力増強剤',
    price: 2500,
    description: '戦士向けの筋力アップポーション',
    category: 'strength',
    minOrderQuantity: 5,
    image: '/images/kinryoku-potion.jpg'
  },
  {
    id: 'kaidoku',
    name: '解毒剤',
    price: 1200,
    description: '毒を中和する万能解毒剤',
    category: 'healing',
    minOrderQuantity: 20,
    image: '/images/kaidoku-potion.jpg'
  },
  {
    id: 'toumei',
    name: '透明化ポーション',
    price: 3000,
    description: '一時的に透明になれる特殊ポーション',
    category: 'special',
    minOrderQuantity: 3,
    image: '/images/toumei-potion.jpg'
  }
]

// アプリケーションステータス
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  ACCOUNTING_REVIEW: 'accounting_review',
  APPROVAL_PENDING: 'approval_pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// 注文ステータス
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}

// ユーザーロール
export const USER_ROLES = {
  CUSTOMER: 'customer',
  ACCOUNTING: 'accounting',
  ADMIN: 'admin',
  PRESIDENT: 'president'
}

// 割引タイプ
export const DISCOUNT_TYPES = {
  BASIC: 'basic',
  VOLUME: 'volume',
  SPECIAL: 'special'
}

// 数量割引設定
export const VOLUME_DISCOUNTS = [
  { minQuantity: 100, discountRate: 5 },
  { minQuantity: 500, discountRate: 10 },
  { minQuantity: 1000, discountRate: 15 },
  { minQuantity: 2000, discountRate: 20 }
]

// メールテンプレート
export const EMAIL_TEMPLATES = {
  APPLICATION_RECEIVED: {
    subject: 'MACA堂 - お申込みを受け付けました',
    template: 'application_received'
  },
  ACCOUNT_APPROVED: {
    subject: 'MACA堂 - アカウントが承認されました',
    template: 'account_approved'
  },
  ORDER_CONFIRMED: {
    subject: 'MACA堂 - ご注文を承りました',
    template: 'order_confirmed'
  },
  ORDER_SHIPPED: {
    subject: 'MACA堂 - 商品を発送いたしました',
    template: 'order_shipped'
  }
}

// バリデーションルール
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\-\(\)\+\s]+$/,
  PASSWORD: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true
  }
}

// ページネーション設定
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
}

// 通貨フォーマット
export const CURRENCY_FORMAT = {
  locale: 'ja-JP',
  currency: 'JPY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
}

// 日付フォーマット
export const DATE_FORMAT = {
  SHORT: 'yyyy/MM/dd',
  LONG: 'yyyy年MM月dd日',
  DATETIME: 'yyyy/MM/dd HH:mm'
}

