import { useState, useEffect, createContext, useContext } from 'react'
import { PRODUCTS } from '../lib/constants.js'
import { calculateCustomerPrice, calculateOrderTotal } from '../utils/pricing.js'
import toast from 'react-hot-toast'

const CartContext = createContext({})

export function CartProvider({ children, customer }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  // ローカルストレージからカートを復元
  useEffect(() => {
    if (customer?.id) {
      const savedCart = localStorage.getItem(`cart_${customer.id}`)
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          setItems(parsedCart)
        } catch (err) {
          console.error('Failed to parse saved cart:', err)
        }
      }
    }
  }, [customer?.id])

  // カートをローカルストレージに保存
  useEffect(() => {
    if (customer?.id) {
      localStorage.setItem(`cart_${customer.id}`, JSON.stringify(items))
    }
  }, [items, customer?.id])

  const addItem = (productId, quantity = 1) => {
    const product = PRODUCTS.find(p => p.id === productId)
    if (!product) {
      toast.error('商品が見つかりません')
      return
    }

    if (quantity < product.minOrderQuantity) {
      toast.error(`${product.name}の最小発注数量は${product.minOrderQuantity}個です`)
      return
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === productId)
      
      if (existingItem) {
        // 既存アイテムの数量を更新
        return prevItems.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // 新しいアイテムを追加
        return [...prevItems, {
          productId,
          quantity,
          product,
          addedAt: new Date().toISOString()
        }]
      }
    })

    toast.success(`${product.name}をカートに追加しました`)
  }

  const updateQuantity = (productId, quantity) => {
    const product = PRODUCTS.find(p => p.id === productId)
    if (!product) return

    if (quantity < 1) {
      removeItem(productId)
      return
    }

    if (quantity < product.minOrderQuantity) {
      toast.error(`${product.name}の最小発注数量は${product.minOrderQuantity}個です`)
      return
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const removeItem = (productId) => {
    setItems(prevItems => prevItems.filter(item => item.productId !== productId))
    
    const product = PRODUCTS.find(p => p.id === productId)
    if (product) {
      toast.success(`${product.name}をカートから削除しました`)
    }
  }

  const clearCart = () => {
    setItems([])
    toast.success('カートを空にしました')
  }

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getUniqueItemCount = () => {
    return items.length
  }

  // 価格計算付きのアイテム一覧を取得
  const getItemsWithPricing = () => {
    if (!customer) return []

    return items.map(item => {
      const pricing = calculateCustomerPrice(
        item.product.price,
        customer,
        item.productId,
        item.quantity
      )

      return {
        ...item,
        pricing,
        itemTotal: pricing.finalPrice * item.quantity,
        itemDiscountAmount: pricing.discountAmount * item.quantity
      }
    })
  }

  // 注文合計を計算
  const getOrderSummary = () => {
    if (!customer || items.length === 0) {
      return {
        items: [],
        subtotal: 0,
        totalDiscountAmount: 0,
        totalAmount: 0,
        averageDiscountRate: 0
      }
    }

    return calculateOrderTotal(items, customer)
  }

  // カートが空かどうか
  const isEmpty = items.length === 0

  // 特定の商品がカートに入っているかチェック
  const hasItem = (productId) => {
    return items.some(item => item.productId === productId)
  }

  // 特定の商品の数量を取得
  const getItemQuantity = (productId) => {
    const item = items.find(item => item.productId === productId)
    return item ? item.quantity : 0
  }

  const value = {
    items,
    loading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemCount,
    getUniqueItemCount,
    getItemsWithPricing,
    getOrderSummary,
    isEmpty,
    hasItem,
    getItemQuantity
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default useCart

