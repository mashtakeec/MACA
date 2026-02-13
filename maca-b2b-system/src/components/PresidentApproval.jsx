import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * 社長承認画面
 * 申込の最終承認と顧客設定を行う
 */
const PresidentApproval = () => {
  const [pendingApplications, setPendingApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [approvalSettings, setApprovalSettings] = useState({
    discount_rate: 0,
    credit_limit: 100000,
    payment_terms: 30,
    special_pricing: {},
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  // 承認待ち申込一覧を取得
  const fetchPendingApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('status', 'approval_pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingApplications(data || []);
    } catch (error) {
      console.error('承認待ち申込取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 商品一覧を取得
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('商品一覧取得エラー:', error);
    }
  };

  useEffect(() => {
    fetchPendingApplications();
    fetchProducts();
  }, []);

  // 申込選択時の処理
  const handleApplicationSelect = (application) => {
    setSelectedApp(application);
    // デフォルト設定をリセット
    setApprovalSettings({
      discount_rate: 0,
      credit_limit: 100000,
      payment_terms: 30,
      special_pricing: {},
      notes: ''
    });
  };

  // 承認設定の変更
  const handleSettingChange = (field, value) => {
    setApprovalSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 特別単価設定の変更
  const handleSpecialPricingChange = (productId, type, value) => {
    setApprovalSettings(prev => ({
      ...prev,
      special_pricing: {
        ...prev.special_pricing,
        [productId]: {
          type,
          ...(type === 'fixed' ? { price: parseFloat(value) || 0 } : { discount_rate: parseFloat(value) || 0 })
        }
      }
    }));
  };

  // 特別単価設定の削除
  const removeSpecialPricing = (productId) => {
    setApprovalSettings(prev => {
      const newSpecialPricing = { ...prev.special_pricing };
      delete newSpecialPricing[productId];
      return {
        ...prev,
        special_pricing: newSpecialPricing
      };
    });
  };

  // 承認実行
  const handleApprove = async () => {
    if (!selectedApp) return;

    try {
      // 申込ステータスを承認済みに更新
      const { error: appError } = await supabase
        .from('applications')
        .update({
          status: 'approved',
          notes: approvalSettings.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedApp.id);

      if (appError) throw appError;

      // 顧客テーブルに登録
      const { error: customerError } = await supabase
        .from('customers')
        .insert([{
          application_id: selectedApp.id,
          company_name: selectedApp.company_name,
          contact_name: selectedApp.contact_name,
          email: selectedApp.email,
          phone: selectedApp.phone,
          address: selectedApp.address,
          business_type: selectedApp.business_type,
          discount_rate: approvalSettings.discount_rate,
          credit_limit: approvalSettings.credit_limit,
          payment_terms: approvalSettings.payment_terms,
          special_pricing: approvalSettings.special_pricing,
          status: 'active',
          notes: approvalSettings.notes
        }]);

      if (customerError) throw customerError;

      alert('申込を承認しました');
      await fetchPendingApplications();
      setSelectedApp(null);
    } catch (error) {
      console.error('承認エラー:', error);
      alert('承認に失敗しました');
    }
  };

  // 却下実行
  const handleReject = async () => {
    if (!selectedApp) return;

    const reason = prompt('却下理由を入力してください:');
    if (!reason) return;

    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status: 'rejected',
          notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedApp.id);

      if (error) throw error;

      alert('申込を却下しました');
      await fetchPendingApplications();
      setSelectedApp(null);
    } catch (error) {
      console.error('却下エラー:', error);
      alert('却下に失敗しました');
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">社長承認</h1>
        <div className="text-sm text-gray-600">
          承認待ち: {pendingApplications.length}件
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 承認待ち一覧 */}
        <div className="bg-white border rounded-lg">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-medium text-gray-900">承認待ち申込</h2>
          </div>
          <div className="divide-y">
            {pendingApplications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                承認待ちの申込はありません
              </div>
            ) : (
              pendingApplications.map(app => (
                <div
                  key={app.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedApp?.id === app.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => handleApplicationSelect(app)}
                >
                  <div className="font-medium text-gray-900">{app.company_name}</div>
                  <div className="text-sm text-gray-600">{app.contact_name}</div>
                  <div className="text-sm text-gray-500">{app.business_type}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(app.created_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 承認設定 */}
        {selectedApp && (
          <div className="bg-white border rounded-lg">
            <div className="px-4 py-3 border-b">
              <h2 className="text-lg font-medium text-gray-900">承認設定</h2>
              <p className="text-sm text-gray-600">{selectedApp.company_name}</p>
            </div>
            <div className="p-4 space-y-4">
              {/* 基本設定 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    基本割引率 (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={approvalSettings.discount_rate}
                    onChange={(e) => handleSettingChange('discount_rate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    与信限度額 (円)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={approvalSettings.credit_limit}
                    onChange={(e) => handleSettingChange('credit_limit', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  支払条件 (日)
                </label>
                <select
                  value={approvalSettings.payment_terms}
                  onChange={(e) => handleSettingChange('payment_terms', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15日</option>
                  <option value={30}>30日</option>
                  <option value={45}>45日</option>
                  <option value={60}>60日</option>
                </select>
              </div>

              {/* 特別単価設定 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  特別単価設定
                </label>
                <div className="space-y-2">
                  {products.map(product => {
                    const specialPrice = approvalSettings.special_pricing[product.id];
                    return (
                      <div key={product.id} className="flex items-center space-x-2 p-2 border rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            標準価格: ¥{product.base_price.toLocaleString()}
                          </div>
                        </div>
                        {specialPrice ? (
                          <div className="flex items-center space-x-2">
                            <select
                              value={specialPrice.type}
                              onChange={(e) => handleSpecialPricingChange(product.id, e.target.value, specialPrice.type === 'fixed' ? specialPrice.price : specialPrice.discount_rate)}
                              className="px-2 py-1 border rounded text-sm"
                            >
                              <option value="fixed">固定価格</option>
                              <option value="discount">割引率</option>
                            </select>
                            <input
                              type="number"
                              min="0"
                              step={specialPrice.type === 'fixed' ? '1' : '0.01'}
                              value={specialPrice.type === 'fixed' ? specialPrice.price : specialPrice.discount_rate}
                              onChange={(e) => handleSpecialPricingChange(product.id, specialPrice.type, e.target.value)}
                              className="w-20 px-2 py-1 border rounded text-sm"
                            />
                            <span className="text-sm text-gray-500">
                              {specialPrice.type === 'fixed' ? '円' : '%'}
                            </span>
                            <button
                              onClick={() => removeSpecialPricing(product.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              削除
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSpecialPricingChange(product.id, 'discount', 0)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            設定
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 備考 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備考
                </label>
                <textarea
                  value={approvalSettings.notes}
                  onChange={(e) => handleSettingChange('notes', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="承認に関する備考を入力..."
                />
              </div>

              {/* アクションボタン */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium"
                >
                  承認
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 font-medium"
                >
                  却下
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 申込詳細表示 */}
      {selectedApp && (
        <div className="bg-white border rounded-lg">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-medium text-gray-900">申込詳細</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">会社名</label>
                <p className="mt-1 text-sm text-gray-900">{selectedApp.company_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">担当者名</label>
                <p className="mt-1 text-sm text-gray-900">{selectedApp.contact_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                <p className="mt-1 text-sm text-gray-900">{selectedApp.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">電話番号</label>
                <p className="mt-1 text-sm text-gray-900">{selectedApp.phone || '未入力'}</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">住所</label>
                <p className="mt-1 text-sm text-gray-900">{selectedApp.address || '未入力'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">業種</label>
                <p className="mt-1 text-sm text-gray-900">{selectedApp.business_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">申込日時</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedApp.created_at).toLocaleString('ja-JP')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresidentApproval;

