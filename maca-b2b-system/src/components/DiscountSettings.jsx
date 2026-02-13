import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * 割引率設定画面
 * 顧客別の割引率と特別単価を管理
 */
const DiscountSettings = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 顧客一覧と商品一覧を取得
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 顧客一覧取得
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('status', 'active')
        .order('company_name');

      if (customersError) throw customersError;

      // 商品一覧取得
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (productsError) throw productsError;

      setCustomers(customersData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 顧客の割引設定を更新
  const updateCustomerDiscount = async (customerId, discountRate) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          discount_rate: discountRate,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId);

      if (error) throw error;

      // ローカル状態を更新
      setCustomers(prev => prev.map(customer =>
        customer.id === customerId
          ? { ...customer, discount_rate: discountRate }
          : customer
      ));

      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(prev => ({ ...prev, discount_rate: discountRate }));
      }
    } catch (error) {
      console.error('割引率更新エラー:', error);
      alert('割引率の更新に失敗しました');
    }
  };

  // 特別単価を更新
  const updateSpecialPricing = async (customerId, specialPricing) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          special_pricing: specialPricing,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId);

      if (error) throw error;

      // ローカル状態を更新
      setCustomers(prev => prev.map(customer =>
        customer.id === customerId
          ? { ...customer, special_pricing: specialPricing }
          : customer
      ));

      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(prev => ({ ...prev, special_pricing: specialPricing }));
      }
    } catch (error) {
      console.error('特別単価更新エラー:', error);
      alert('特別単価の更新に失敗しました');
    }
  };

  // 特別単価設定の変更
  const handleSpecialPricingChange = (productId, type, value) => {
    if (!selectedCustomer) return;

    const newSpecialPricing = { ...selectedCustomer.special_pricing };
    
    if (value === '' || value === null) {
      delete newSpecialPricing[productId];
    } else {
      newSpecialPricing[productId] = {
        type,
        ...(type === 'fixed' ? { price: parseFloat(value) || 0 } : { discount_rate: parseFloat(value) || 0 })
      };
    }

    updateSpecialPricing(selectedCustomer.id, newSpecialPricing);
  };

  // フィルタリングされた顧客一覧
  const filteredCustomers = customers.filter(customer => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        customer.company_name.toLowerCase().includes(term) ||
        customer.contact_name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">割引設定管理</h1>
        <input
          type="text"
          placeholder="顧客検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 顧客一覧 */}
        <div className="bg-white border rounded-lg">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-medium text-gray-900">顧客一覧</h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {filteredCustomers.map(customer => (
              <div
                key={customer.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedCustomer?.id === customer.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="font-medium text-gray-900">{customer.company_name}</div>
                <div className="text-sm text-gray-600">{customer.contact_name}</div>
                <div className="text-sm text-gray-500">
                  基本割引率: {customer.discount_rate}%
                </div>
                {customer.special_pricing && Object.keys(customer.special_pricing).length > 0 && (
                  <div className="text-xs text-blue-600 mt-1">
                    特別単価設定あり ({Object.keys(customer.special_pricing).length}商品)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 基本割引率設定 */}
        {selectedCustomer && (
          <div className="bg-white border rounded-lg">
            <div className="px-4 py-3 border-b">
              <h2 className="text-lg font-medium text-gray-900">基本割引率設定</h2>
              <p className="text-sm text-gray-600">{selectedCustomer.company_name}</p>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    基本割引率 (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={selectedCustomer.discount_rate}
                    onChange={(e) => updateCustomerDiscount(selectedCustomer.id, parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    全商品に適用される基本的な割引率
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    与信限度額
                  </label>
                  <div className="text-sm text-gray-900">
                    ¥{selectedCustomer.credit_limit.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    与信限度額の変更は顧客管理画面から行ってください
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    支払条件
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedCustomer.payment_terms}日
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 特別単価設定 */}
        {selectedCustomer && (
          <div className="bg-white border rounded-lg">
            <div className="px-4 py-3 border-b">
              <h2 className="text-lg font-medium text-gray-900">特別単価設定</h2>
              <p className="text-sm text-gray-600">商品別の個別価格設定</p>
            </div>
            <div className="p-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {products.map(product => {
                  const specialPrice = selectedCustomer.special_pricing?.[product.id];
                  return (
                    <div key={product.id} className="border rounded-lg p-3">
                      <div className="font-medium text-sm text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        標準価格: ¥{product.base_price.toLocaleString()}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <select
                            value={specialPrice?.type || ''}
                            onChange={(e) => {
                              if (e.target.value === '') {
                                handleSpecialPricingChange(product.id, null, null);
                              } else {
                                handleSpecialPricingChange(product.id, e.target.value, 0);
                              }
                            }}
                            className="flex-1 px-2 py-1 border rounded text-sm"
                          >
                            <option value="">設定なし</option>
                            <option value="fixed">固定価格</option>
                            <option value="discount">個別割引率</option>
                          </select>
                        </div>

                        {specialPrice && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              step={specialPrice.type === 'fixed' ? '1' : '0.01'}
                              value={specialPrice.type === 'fixed' ? specialPrice.price : specialPrice.discount_rate}
                              onChange={(e) => handleSpecialPricingChange(product.id, specialPrice.type, e.target.value)}
                              className="flex-1 px-2 py-1 border rounded text-sm"
                              placeholder={specialPrice.type === 'fixed' ? '価格' : '割引率'}
                            />
                            <span className="text-sm text-gray-500">
                              {specialPrice.type === 'fixed' ? '円' : '%'}
                            </span>
                          </div>
                        )}

                        {specialPrice && (
                          <div className="text-xs text-gray-600">
                            {specialPrice.type === 'fixed' ? (
                              <>実売価格: ¥{specialPrice.price.toLocaleString()}</>
                            ) : (
                              <>
                                実売価格: ¥{(product.base_price * (1 - specialPrice.discount_rate / 100)).toLocaleString()}
                                <br />
                                (標準価格から{specialPrice.discount_rate}%割引)
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 価格計算プレビュー */}
      {selectedCustomer && (
        <div className="bg-white border rounded-lg">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-medium text-gray-900">価格計算プレビュー</h2>
            <p className="text-sm text-gray-600">{selectedCustomer.company_name}の価格表</p>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商品名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      標準価格
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      適用割引
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      実売価格
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map(product => {
                    const specialPrice = selectedCustomer.special_pricing?.[product.id];
                    let finalPrice;
                    let discountInfo;

                    if (specialPrice) {
                      if (specialPrice.type === 'fixed') {
                        finalPrice = specialPrice.price;
                        discountInfo = '特別単価';
                      } else {
                        finalPrice = product.base_price * (1 - specialPrice.discount_rate / 100);
                        discountInfo = `個別割引 ${specialPrice.discount_rate}%`;
                      }
                    } else {
                      finalPrice = product.base_price * (1 - selectedCustomer.discount_rate / 100);
                      discountInfo = `基本割引 ${selectedCustomer.discount_rate}%`;
                    }

                    return (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ¥{product.base_price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {discountInfo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ¥{finalPrice.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountSettings;

