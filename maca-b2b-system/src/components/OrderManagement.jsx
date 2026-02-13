import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { calculatePrice } from '../utils/pricing';

/**
 * 注文管理コンポーネント
 */
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersResult, customersResult, productsResult] = await Promise.all([
        supabase
          .from('orders')
          .select(`
            *,
            customers (company_name, contact_name),
            order_items (
              *,
              products (name, unit_price)
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('customers')
          .select('*')
          .eq('status', 'active')
          .order('company_name'),
        supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('name')
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (customersResult.error) throw customersResult.error;
      if (productsResult.error) throw productsResult.error;

      setOrders(ordersResult.data || []);
      setCustomers(customersResult.data || []);
      setProducts(productsResult.data || []);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: '注文確認中', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: '注文確定', color: 'bg-blue-100 text-blue-800' },
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">注文管理</h2>
        <button
          onClick={() => setShowNewOrderForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          新規注文作成
        </button>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '総注文数', value: orders.length, color: 'bg-blue-500' },
          { label: '確認中', value: orders.filter(o => o.status === 'pending').length, color: 'bg-yellow-500' },
          { label: '製造中', value: orders.filter(o => o.status === 'processing').length, color: 'bg-purple-500' },
          { label: '発送済み', value: orders.filter(o => o.status === 'shipped').length, color: 'bg-green-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-md p-3`}>
                <div className="text-white text-2xl font-bold">{stat.value}</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 注文一覧 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">注文一覧</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注文ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注文日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{order.customers?.company_name}</div>
                      <div className="text-gray-500">{order.customers?.contact_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ¥{order.total_amount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      詳細
                    </button>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="text-green-600 hover:text-green-900"
                      >
                        確定
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        製造開始
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        発送
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">注文がありません</p>
          </div>
        )}
      </div>

      {/* 注文詳細モーダル */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={updateOrderStatus}
        />
      )}

      {/* 新規注文フォーム */}
      {showNewOrderForm && (
        <NewOrderForm
          customers={customers}
          products={products}
          onClose={() => setShowNewOrderForm(false)}
          onOrderCreated={fetchData}
        />
      )}
    </div>
  );
};

/**
 * 注文詳細モーダル
 */
const OrderDetailModal = ({ order, onClose, onStatusUpdate }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            注文詳細 #{order.id.slice(-8)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* 基本情報 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">顧客</label>
              <p className="mt-1 text-sm text-gray-900">{order.customers?.company_name}</p>
              <p className="text-sm text-gray-500">{order.customers?.contact_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">注文日</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(order.created_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>

          {/* 注文商品 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">注文商品</label>
            <div className="border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">商品名</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">数量</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">単価</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">小計</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.order_items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.products?.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">¥{item.unit_price?.toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">¥{item.subtotal?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 合計金額 */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">合計金額</span>
              <span className="text-lg font-bold text-gray-900">¥{order.total_amount?.toLocaleString()}</span>
            </div>
          </div>

          {/* ステータス更新ボタン */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">ステータス更新</label>
            <div className="flex space-x-2">
              {order.status === 'pending' && (
                <button
                  onClick={() => {
                    onStatusUpdate(order.id, 'confirmed');
                    onClose();
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  注文確定
                </button>
              )}
              {order.status === 'confirmed' && (
                <button
                  onClick={() => {
                    onStatusUpdate(order.id, 'processing');
                    onClose();
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  製造開始
                </button>
              )}
              {order.status === 'processing' && (
                <button
                  onClick={() => {
                    onStatusUpdate(order.id, 'shipped');
                    onClose();
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  発送完了
                </button>
              )}
              {order.status === 'shipped' && (
                <button
                  onClick={() => {
                    onStatusUpdate(order.id, 'delivered');
                    onClose();
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  配達完了
                </button>
              )}
              <button
                onClick={() => {
                  onStatusUpdate(order.id, 'cancelled');
                  onClose();
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 新規注文フォーム
 */
const NewOrderForm = ({ customers, products, onClose, onOrderCreated }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);

  const addOrderItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const removeOrderItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index, field, value) => {
    const updated = orderItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setOrderItems(updated);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.product_id);
      return total + (product ? product.unit_price * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 注文作成
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: selectedCustomerId,
          total_amount: calculateTotal(),
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 注文明細作成
      const orderItemsData = orderItems
        .filter(item => item.product_id && item.quantity > 0)
        .map(item => {
          const product = products.find(p => p.id === item.product_id);
          return {
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: product.unit_price,
            subtotal: product.unit_price * item.quantity
          };
        });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      alert('注文を作成しました');
      onOrderCreated();
      onClose();
    } catch (error) {
      console.error('注文作成エラー:', error);
      alert('注文の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">新規注文作成</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 顧客選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              顧客 *
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">顧客を選択...</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.company_name} ({customer.contact_name})
                </option>
              ))}
            </select>
          </div>

          {/* 注文商品 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              注文商品 *
            </label>
            {orderItems.map((item, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <select
                  value={item.product_id}
                  onChange={(e) => updateOrderItem(index, 'product_id', e.target.value)}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">商品を選択...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (¥{product.unit_price?.toLocaleString()})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="数量"
                />
                {orderItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOrderItem(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    削除
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOrderItem}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + 商品を追加
            </button>
          </div>

          {/* 合計金額 */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">合計金額</span>
              <span className="text-lg font-bold text-gray-900">¥{calculateTotal().toLocaleString()}</span>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '作成中...' : '注文作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderManagement;

