import React, { useState } from 'react';

/**
 * 経理確認フォーム
 * 弥生ID、割引率、与信限度額、支払条件を入力
 */
const AccountingReviewForm = ({ application, onUpdate, onStatusChange }) => {
  const [formData, setFormData] = useState({
    yayoi_id: application.yayoi_id || '',
    discount_rate: application.discount_rate || 0,
    credit_limit: application.credit_limit || 0,
    payment_terms: application.payment_terms || 30
  });
  
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(formData);
      alert('経理情報を保存しました');
    } catch (error) {
      alert('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalPending = async () => {
    setLoading(true);
    try {
      await onUpdate(formData);
      await onStatusChange('approval_pending');
      alert('承認待ちステータスに変更しました');
    } catch (error) {
      alert('ステータス変更に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (confirm('この申込を却下しますか？')) {
      await onStatusChange('rejected');
    }
  };

  return (
    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h4 className="text-lg font-medium text-gray-900 mb-4">経理確認情報</h4>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              弥生ID
            </label>
            <input
              type="text"
              value={formData.yayoi_id}
              onChange={(e) => handleInputChange('yayoi_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="未設定"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              割引率 (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.discount_rate}
              onChange={(e) => handleInputChange('discount_rate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              与信限度額 (¥)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.credit_limit}
              onChange={(e) => handleInputChange('credit_limit', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              ¥{formData.credit_limit.toLocaleString()}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              支払条件 (日)
            </label>
            <select
              value={formData.payment_terms}
              onChange={(e) => handleInputChange('payment_terms', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15日</option>
              <option value={30}>30日</option>
              <option value={45}>45日</option>
              <option value={60}>60日</option>
              <option value={90}>90日</option>
            </select>
          </div>
        </div>

        {/* 現在の設定値表示 */}
        <div className="p-3 bg-gray-50 rounded-md">
          <h5 className="text-sm font-medium text-gray-700 mb-2">設定内容確認</h5>
          <div className="text-sm text-gray-600 space-y-1">
            <div>弥生ID: {formData.yayoi_id || '未設定'}</div>
            <div>割引率: {formData.discount_rate}%</div>
            <div>与信限度額: ¥{formData.credit_limit.toLocaleString()}</div>
            <div>支払条件: {formData.payment_terms}日</div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '保存中...' : '情報を保存'}
          </button>
          
          <button
            onClick={handleApprovalPending}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? '処理中...' : '承認待ちへ'}
          </button>
          
          <button
            onClick={handleReject}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            却下
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountingReviewForm;

