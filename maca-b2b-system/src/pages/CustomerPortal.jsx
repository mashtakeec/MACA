import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function CustomerPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // 認証状態を確認
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/customer-login';
        return;
      }
      setUser(user);
      setLoading(false);
      
      // 商品データを取得
      fetchProducts();
      fetchOrders(user.id);
    };

    checkAuth();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('商品データの取得に失敗:', error);
    }
  };

  const fetchOrders = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, unit_price)
          )
        `)
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('注文履歴の取得に失敗:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/customer-login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">MACA堂</h1>
              <span className="ml-4 text-sm text-gray-500">お客様ポータル</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ウェルカムメッセージ */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ようこそ、MACA堂お客様ポータルへ
          </h2>
          <p className="text-gray-600">
            こちらから商品のご注文や注文履歴の確認ができます。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 商品カタログ */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">商品カタログ</h3>
            </div>
            <div className="p-6">
              {products.length > 0 ? (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ¥{product.unit_price?.toLocaleString()}
                          </p>
                          <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                            注文する
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  商品データを読み込み中...
                </p>
              )}
            </div>
          </div>

          {/* 注文履歴 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">注文履歴</h3>
            </div>
            <div className="p-6">
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            注文番号: {order.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ¥{order.total_amount?.toLocaleString()}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'delivered' ? '配達完了' :
                             order.status === 'shipped' ? '発送済み' :
                             order.status === 'processing' ? '製造中' :
                             order.status === 'confirmed' ? '確定' : '処理中'}
                          </span>
                        </div>
                      </div>
                      {order.order_items && (
                        <div className="mt-2 text-sm text-gray-600">
                          {order.order_items.map((item, index) => (
                            <p key={index}>
                              {item.products?.name} × {item.quantity}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  まだ注文履歴がありません
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

