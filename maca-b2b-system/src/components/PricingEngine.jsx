import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { calculatePrice } from '../utils/pricing';

/**
 * 価格計算エンジン
 * 顧客別の価格計算とプレビュー機能
 */
const PricingEngine = ({ customerId, onPriceCalculated }) => {
  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);

  // 顧客情報と商品一覧を取得
  useEffect(() => {
    if (customerId) {
      fetchCustomerAndProducts();
    }
  }, [customerId]);

  const fetchCustomerAndProducts = async () => {
    try {
      setLoading(true);
      
      // 顧客情報取得
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (customerError) throw customerError;

      // 商品一覧取得
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (productsError) throw productsError;

      setCustomer(customerData);
      setProducts(productsData || []);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 商品選択・数量変更
  const handleItemChange = (productId, quantity) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.product_id === productId);
      if (existing) {
        if (quantity <= 0) {
          return prev.filter(item => item.product_id !== productId);
        }
        return prev.map(item =>
          item.product_id === productId
            ? { ...item, quantity }
            : item
        );
      } else if (quantity > 0) {
        return [...prev, { product_id: productId, quantity }];
      }
      return prev;
    });
  };

  // 価格計算実行
  useEffect(() => {
    if (customer && selectedItems.length > 0) {
      calculatePricing();
    } else {
      setPriceBreakdown(null);
    }
  }, [customer, selectedItems]);

  const calculatePricing = () => {
    if (!customer || selectedItems.length === 0) return;

    const breakdown = {
      items: [],
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      total: 0,
      specialPricing: {}
    };

    selectedItems.forEach(item => {
      const product = products.find(p => p.id === item.product_id);
      if (!product) return;

      // 基本価格計算
      let unitPrice = product.base_price;
      let discountRate = customer.discount_rate || 0;

      // 特別単価の適用
      if (customer.special_pricing && customer.special_pricing[product.id]) {
        const specialPrice = customer.special_pricing[product.id];
        if (specialPrice.type === 'fixed') {
          unitPrice = specialPrice.price;
          discountRate = 0; // 特別単価の場合は割引なし
        } else if (specialPrice.type === 'discount') {
          discountRate = specialPrice.discount_rate;
        }
      }

      // 数量割引の適用
      const volumeDiscount = calculateVolumeDiscount(product, item.quantity);
      if (volumeDiscount > discountRate) {
        discountRate = volumeDiscount;
      }

      const discountedPrice = unitPrice * (1 - discountRate / 100);
      const lineTotal = discountedPrice * item.quantity;
      const lineDiscount = (unitPrice - discountedPrice) * item.quantity;

      breakdown.items.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        discount_rate: discountRate,
        discounted_price: discountedPrice,
        line_total: lineTotal,
        line_discount: lineDiscount
      });

      breakdown.subtotal += lineTotal;
      breakdown.discountAmount += lineDiscount;
    });

    // 消費税計算
    breakdown.taxAmount = breakdown.subtotal * 0.1;
    breakdown.total = breakdown.subtotal + breakdown.taxAmount;

    setPriceBreakdown(breakdown);
    
    if (onPriceCalculated) {
      onPriceCalculated(breakdown);
    }
  };

  // 数量割引計算
  const calculateVolumeDiscount = (product, quantity) => {
    if (!product.volume_discounts) return 0;

    let maxDiscount = 0;
    product.volume_discounts.forEach(tier => {
      if (quantity >= tier.min_quantity && tier.discount_rate > maxDiscount) {
        maxDiscount = tier.discount_rate;
      }
    });

    return maxDiscount;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-8 text-gray-500">
        顧客を選択してください
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 顧客情報表示 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">顧客情報</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">会社名:</span> {customer.company_name}
          </div>
          <div>
            <span className="font-medium">担当者:</span> {customer.contact_name}
          </div>
          <div>
            <span className="font-medium">基本割引率:</span> {customer.discount_rate}%
          </div>
          <div>
            <span className="font-medium">与信限度額:</span> ¥{customer.credit_limit.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 商品選択 */}
      <div className="bg-white border rounded-lg">
        <div className="px-4 py-3 border-b">
          <h3 className="text-lg font-medium text-gray-900">商品選択</h3>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {products.map(product => {
              const selectedItem = selectedItems.find(item => item.product_id === product.id);
              const quantity = selectedItem ? selectedItem.quantity : 0;

              return (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <p className="text-sm font-medium text-gray-900">
                      基本価格: ¥{product.base_price.toLocaleString()}
                    </p>
                    {product.volume_discounts && product.volume_discounts.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        数量割引: {product.volume_discounts.map(tier => 
                          `${tier.min_quantity}個以上 ${tier.discount_rate}%OFF`
                        ).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleItemChange(product.id, Math.max(0, quantity - 1))}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => handleItemChange(product.id, quantity + 1)}
                      className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 価格計算結果 */}
      {priceBreakdown && (
        <div className="bg-white border rounded-lg">
          <div className="px-4 py-3 border-b">
            <h3 className="text-lg font-medium text-gray-900">価格計算結果</h3>
          </div>
          <div className="p-4">
            {/* 明細 */}
            <div className="space-y-2 mb-4">
              {priceBreakdown.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-sm text-gray-600">
                      ¥{item.unit_price.toLocaleString()} × {item.quantity}個
                      {item.discount_rate > 0 && (
                        <span className="text-red-600 ml-2">
                          ({item.discount_rate}% OFF)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">¥{item.line_total.toLocaleString()}</div>
                    {item.line_discount > 0 && (
                      <div className="text-sm text-red-600">
                        -¥{item.line_discount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 合計 */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span>小計:</span>
                <span>¥{priceBreakdown.subtotal.toLocaleString()}</span>
              </div>
              {priceBreakdown.discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>割引額:</span>
                  <span>-¥{priceBreakdown.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>消費税 (10%):</span>
                <span>¥{priceBreakdown.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>合計:</span>
                <span>¥{priceBreakdown.total.toLocaleString()}</span>
              </div>
            </div>

            {/* 与信チェック */}
            {priceBreakdown.total > customer.credit_limit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-red-800">与信限度額超過</h4>
                    <p className="text-sm text-red-700">
                      注文金額が与信限度額 (¥{customer.credit_limit.toLocaleString()}) を超えています。
                      承認が必要です。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingEngine;

