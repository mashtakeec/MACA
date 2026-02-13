import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { calculatePrice } from '../utils/pricing';

/**
 * 顧客向けポータル
 */
const CustomerPortal = () => {
  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('catalog');

  useEffect(() => {
    // 開発用: ローカルストレージから顧客情報を取得
    const storedCustomer = localStorage.getItem('customer');
    if (storedCustomer) {
      try {
        const customerData = JSON.parse(storedCustomer);
        setCustomer(customerData);
        fetchData(customerData.id);
      } catch (error) {
        console.error('顧客情報の取得エラー:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchData = async (customerId) => {
    try {
      const [productsResult, ordersResult] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('name'),
        supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              products (name, unit_price)
            )
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
      ]);

      if (productsResult.error) throw productsResult.error;
      if (ordersResult.error) throw ordersResult.error;

      setProducts(productsResult.data || []);
      setOrders(ordersResult.data || []);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity }]);
    }
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const calculateCartTotal = () => {
    if (!customer) return 0;
    
    return cart.reduce((total, item) => {
      const pricing = calculatePrice(
        item.product.unit_price,
        item.quantity,
        customer.discount_rate || 0,
        customer.special_prices?.find(sp => sp.product_id === item.product.id)
      );
      return total + pricing.finalPrice;
    }, 0);
  };

  const submitOrder = async () => {
    if (!customer || cart.length === 0) return;

    try {
      setLoading(true);

      // 注文作成
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customer.id,
          total_amount: calculateCartTotal(),
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 注文明細作成
      const orderItemsData = cart.map(item => {
        const pricing = calculatePrice(
          item.product.unit_price,
          item.quantity,
          customer.discount_rate || 0,
          customer.special_prices?.find(sp => sp.product_id === item.product.id)
        );

        return {
          order_id: order.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: pricing.finalPrice / item.quantity,
          subtotal: pricing.finalPrice
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      alert('注文を送信しました。確認後、ご連絡いたします。');
      setCart([]);
      setActiveTab('orders');
      fetchData(customer.id);
    } catch (error) {
      console.error('注文送信エラー:', error);
      alert('注文の送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return <CustomerLogin onLogin={setCustomer} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">MACA堂</h1>
              <span className="ml-2 text-lg text-gray-600">顧客ポータル</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {customer.company_name} ({customer.contact_name})
              </span>
              <div className="relative">
                <button
                  onClick={() => setActiveTab('cart')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 relative"
                >
                  カート
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('customer');
                  setCustomer(null);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'catalog', name: '商品カタログ' },
              { id: 'cart', name: `カート (${cart.length})` },
              { id: 'orders', name: '注文履歴' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'catalog' && (
            <ProductCatalog
              products={products}
              customer={customer}
              onAddToCart={addToCart}
            />
          )}
          {activeTab === 'cart' && (
            <ShoppingCart
              cart={cart}
              customer={customer}
              onUpdateQuantity={updateCartQuantity}
              onSubmitOrder={submitOrder}
              loading={loading}
            />
          )}
          {activeTab === 'orders' && (
            <OrderHistory orders={orders} />
          )}
        </div>
      </main>
    </div>
  );
};

/**
 * 顧客ログイン
 */
const CustomerLogin = ({ onLogin }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('status', 'active')
        .order('company_name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('顧客一覧取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (customer) => {
    localStorage.setItem('customer', JSON.stringify(customer));
    onLogin(customer);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          顧客ポータル ログイン
        </h2>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            ご利用の会社を選択してください（開発用）
          </p>
          
          {customers.map(customer => (
            <button
              key={customer.id}
              onClick={() => handleLogin(customer)}
              className="w-full text-left p-4 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-blue-500"
            >
              <div className="font-medium text-gray-900">{customer.company_name}</div>
              <div className="text-sm text-gray-500">{customer.contact_name}</div>
              <div className="text-xs text-gray-400">
                割引率: {customer.discount_rate || 0}% | 
                与信限度額: ¥{customer.credit_limit?.toLocaleString() || '未設定'}
              </div>
            </button>
          ))}
        </div>

        {customers.length === 0 && (
          <p className="text-center text-gray-500">
            利用可能な顧客アカウントがありません
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * 商品カタログ
 */
const ProductCatalog = ({ products, customer, onAddToCart }) => {
  const [quantities, setQuantities] = useState({});

  const getProductPrice = (product) => {
    const quantity = quantities[product.id] || 1;
    const specialPrice = customer.special_prices?.find(sp => sp.product_id === product.id);
    
    return calculatePrice(
      product.unit_price,
      quantity,
      customer.discount_rate || 0,
      specialPrice
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">商品カタログ</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => {
          const pricing = getProductPrice(product);
          const quantity = quantities[product.id] || 1;
          
          return (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{product.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>定価:</span>
                  <span className="line-through text-gray-500">¥{product.unit_price?.toLocaleString()}</span>
                </div>
                {pricing.discountRate > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>割引率:</span>
                    <span>{pricing.discountRate}%</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>お客様価格:</span>
                  <span className="text-blue-600">¥{pricing.unitPrice?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <label className="text-sm font-medium text-gray-700">数量:</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantities({
                    ...quantities,
                    [product.id]: parseInt(e.target.value) || 1
                  })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-700">小計:</span>
                <span className="text-lg font-bold text-gray-900">
                  ¥{pricing.finalPrice?.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => onAddToCart(product, quantity)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                カートに追加
              </button>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">商品がありません</p>
        </div>
      )}
    </div>
  );
};

/**
 * ショッピングカート
 */
const ShoppingCart = ({ cart, customer, onUpdateQuantity, onSubmitOrder, loading }) => {
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const pricing = calculatePrice(
        item.product.unit_price,
        item.quantity,
        customer.discount_rate || 0,
        customer.special_prices?.find(sp => sp.product_id === item.product.id)
      );
      return total + pricing.finalPrice;
    }, 0);
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">ショッピングカート</h2>
        <p className="text-gray-500">カートは空です</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">ショッピングカート</h2>
      
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商品名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  単価
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  数量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  小計
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cart.map((item, index) => {
                const pricing = calculatePrice(
                  item.product.unit_price,
                  item.quantity,
                  customer.discount_rate || 0,
                  customer.special_prices?.find(sp => sp.product_id === item.product.id)
                );
                
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{pricing.unitPrice?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onUpdateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{pricing.finalPrice?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 0)}
                        className="text-red-600 hover:text-red-900"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">合計金額</span>
            <span className="text-2xl font-bold text-gray-900">¥{calculateTotal().toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSubmitOrder}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '注文送信中...' : '注文を送信'}
        </button>
      </div>
    </div>
  );
};

/**
 * 注文履歴
 */
const OrderHistory = ({ orders }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: '確認中', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: '確定', color: 'bg-blue-100 text-blue-800' },
      processing: { label: '製造中', color: 'bg-purple-100 text-purple-800' },
      shipped: { label: '発送済み', color: 'bg-green-100 text-green-800' },
      delivered: { label: '配達完了', color: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'キャンセル', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">注文履歴</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">注文履歴がありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    注文 #{order.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(order.status)}
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ¥{order.total_amount?.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">注文商品</h4>
                <div className="space-y-1">
                  {order.order_items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.products?.name} × {item.quantity}</span>
                      <span>¥{item.subtotal?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;

