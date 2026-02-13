import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * 顧客管理画面
 * 承認済み顧客の管理を行う
 */
const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // 顧客一覧を取得
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('顧客一覧取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filterStatus]);

  // 顧客情報更新
  const updateCustomer = async (id, updateData) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchCustomers();
      setEditMode(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('顧客情報更新エラー:', error);
      alert('顧客情報の更新に失敗しました');
    }
  };

  // フィルタリングされた顧客一覧
  const filteredCustomers = customers.filter(customer => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        customer.company_name.toLowerCase().includes(term) ||
        customer.contact_name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        (customer.yayoi_id && customer.yayoi_id.toLowerCase().includes(term))
      );
    }
    return true;
  });

  // ステータス表示用のスタイル
  const getStatusStyle = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  // ステータス表示用のテキスト
  const getStatusText = (status) => {
    const texts = {
      active: 'アクティブ',
      inactive: '非アクティブ',
      suspended: '停止中'
    };
    return texts[status] || status;
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
        <h1 className="text-2xl font-bold text-gray-900">顧客管理</h1>
        <div className="flex space-x-4">
          {/* ステータスフィルター */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全ステータス</option>
            <option value="active">アクティブ</option>
            <option value="inactive">非アクティブ</option>
            <option value="suspended">停止中</option>
          </select>

          {/* 検索 */}
          <input
            type="text"
            placeholder="会社名・担当者名・メール・弥生IDで検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 顧客一覧 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                会社名・担当者
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                メールアドレス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                弥生ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                割引率
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                登録日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{customer.company_name}</div>
                    <div className="text-sm text-gray-500">{customer.contact_name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {customer.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {customer.yayoi_id || '未設定'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {customer.discount_rate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(customer.status)}`}>
                    {getStatusText(customer.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(customer.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    詳細
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            顧客が見つかりません
          </div>
        )}
      </div>

      {/* 詳細・編集モーダル */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          editMode={editMode}
          onClose={() => {
            setSelectedCustomer(null);
            setEditMode(false);
          }}
          onEdit={() => setEditMode(true)}
          onSave={(updateData) => updateCustomer(selectedCustomer.id, updateData)}
        />
      )}
    </div>
  );
};

/**
 * 顧客詳細・編集モーダル
 */
const CustomerDetailModal = ({ customer, editMode, onClose, onEdit, onSave }) => {
  const [formData, setFormData] = useState({
    company_name: customer.company_name,
    contact_name: customer.contact_name,
    email: customer.email,
    phone: customer.phone || '',
    address: customer.address || '',
    business_type: customer.business_type,
    yayoi_id: customer.yayoi_id || '',
    discount_rate: customer.discount_rate,
    credit_limit: customer.credit_limit,
    payment_terms: customer.payment_terms,
    status: customer.status,
    notes: customer.notes || ''
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editMode ? '顧客情報編集' : '顧客詳細'}
            </h3>
            <div className="flex space-x-2">
              {!editMode && (
                <button
                  onClick={onEdit}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  編集
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">会社名</label>
                {editMode ? (
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{customer.company_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">担当者名</label>
                {editMode ? (
                  <input
                    type="text"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{customer.contact_name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                {editMode ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{customer.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">電話番号</label>
                {editMode ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{customer.phone || '未入力'}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">住所</label>
              {editMode ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="2"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{customer.address || '未入力'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">業種</label>
                {editMode ? (
                  <select
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="冒険者ギルド">冒険者ギルド</option>
                    <option value="魔法学院">魔法学院</option>
                    <option value="騎士団">騎士団</option>
                    <option value="商会">商会</option>
                    <option value="医療機関">医療機関</option>
                    <option value="研究機関">研究機関</option>
                    <option value="その他">その他</option>
                  </select>
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{customer.business_type}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">弥生ID</label>
                {editMode ? (
                  <input
                    type="text"
                    name="yayoi_id"
                    value={formData.yayoi_id}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{customer.yayoi_id || '未設定'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">割引率 (%)</label>
                {editMode ? (
                  <input
                    type="number"
                    name="discount_rate"
                    value={formData.discount_rate}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{customer.discount_rate}%</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">与信限度額</label>
                {editMode ? (
                  <input
                    type="number"
                    name="credit_limit"
                    value={formData.credit_limit}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">¥{customer.credit_limit.toLocaleString()}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">支払条件 (日)</label>
                {editMode ? (
                  <input
                    type="number"
                    name="payment_terms"
                    value={formData.payment_terms}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{customer.payment_terms}日</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ステータス</label>
              {editMode ? (
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">アクティブ</option>
                  <option value="inactive">非アクティブ</option>
                  <option value="suspended">停止中</option>
                </select>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{customer.status}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">備考</label>
              {editMode ? (
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{customer.notes || '未入力'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">登録日時</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(customer.created_at).toLocaleString('ja-JP')}
              </p>
            </div>
          </div>

          {editMode && (
            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                保存
              </button>
              <button
                onClick={onClose}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                キャンセル
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;

