import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { ShoppingCart, Package } from 'lucide-react'
import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      // モックデータを使用
      const mockProducts = [
        {
          id: 1,
          name: '体力回復ポーション',
          description: '疲労回復に効果的な基本ポーション',
          base_price: 1000
        },
        {
          id: 2,
          name: '魔力増強ポーション',
          description: '集中力と思考力を高める特別なポーション',
          base_price: 1500
        },
        {
          id: 3,
          name: '治癒ポーション',
          description: '傷の治癒を促進する医療用ポーション',
          base_price: 2000
        },
        {
          id: 4,
          name: '敏捷性向上ポーション',
          description: '反射神経と運動能力を向上させるポーション',
          base_price: 1200
        },
        {
          id: 5,
          name: '知恵のポーション',
          description: '記憶力と学習能力を高める学習用ポーション',
          base_price: 1800
        }
      ]
      setProducts(mockProducts)
    } catch (error) {
      console.error('商品データの取得に失敗しました:', error)
    }
  }

  const addToCart = (product, quantity) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity }])
    }
  }

  const updateCartQuantity = (productId, quantity) => {
    if (quantity === 0) {
      setCart(cart.filter(item => item.id !== productId))
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.base_price * item.quantity), 0)
  }

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      alert('カートに商品を追加してください')
      return
    }

    setLoading(true)
    try {
      // 注文データを作成（顧客情報なし）
      const orderData = {
        status: 'pending',
        total_amount: getTotalAmount(),
        order_items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.base_price,
          total_price: item.base_price * item.quantity
        })),
        created_at: new Date().toISOString()
      }

      // 注文を保存（実際の実装では適切なテーブルに保存）
      console.log('注文データ:', orderData)
      
      // 成功メッセージ
      setSubmitted(true)
      setCart([])

    } catch (error) {
      console.error('注文の送信に失敗しました:', error)
      alert('注文の送信に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-green-600">注文完了</CardTitle>
            <CardDescription>
              ご注文ありがとうございました。<br />
              内容を確認後、担当者よりご連絡いたします。
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setSubmitted(false)} className="w-full">
              新しい注文を作成
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MACA堂 新規注文ポータル</h1>
          <p className="text-gray-600">高品質なポーションをお選びください</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 商品一覧 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2" />
                  商品カタログ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {products.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={addToCart} 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* カート */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2" />
                  カート ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">カートは空です</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">¥{item.base_price.toLocaleString()} × {item.quantity}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                          <span className="font-semibold">¥{(item.base_price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>合計金額:</span>
                        <span>¥{getTotalAmount().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 注文送信ボタン */}
            <div className="mt-4">
              <Button 
                onClick={handleSubmitOrder} 
                disabled={loading || cart.length === 0}
                className="w-full"
              >
                {loading ? '送信中...' : '注文を送信'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <p className="text-gray-600 mt-1">{product.description}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">¥{product.base_price?.toLocaleString()}</p>
            <p className="text-sm text-gray-500">税込価格</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Label htmlFor={`quantity-${product.id}`}>数量:</Label>
          <Input
            id={`quantity-${product.id}`}
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-20"
          />
          <Button 
            onClick={() => onAddToCart(product, quantity)}
            className="flex-1"
          >
            カートに追加
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default App

