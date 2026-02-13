import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AccountingReviewForm from './AccountingReviewForm';

/**
 * 申込管理画面
 * 管理者が申込の確認・承認・却下を行う
 */
const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 申込一覧を取得
  const fetchApplications = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('申込一覧取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  // 経理確認情報付きで申込を更新
  const updateApplicationWithAccountingInfo = async (id, accountingData) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          yayoi_id: accountingData.yayoi_id,
          discount_rate: accountingData.discount_rate,
          credit_limit: accountingData.credit_limit,
          payment_terms: accountingData.payment_terms,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await fetchApplications();
    } catch (error) {
      console.error('経理情報更新エラー:', error);
      alert('経理情報の更新に失敗しました');
    }
  };

  // 申込ステータス更新
  const updateApplicationStatus = async (id, newStatus, notes = '') => {
    try {
      const updateData = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updateData.notes = notes;
      }

      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // 承認の場合は顧客テーブルにも登録
      if (newStatus === 'approved') {
        const application = applications.find(app => app.id === id);
        if (application) {
          await createCustomerFromApplication(application);
        }
      }

      await fetchApplications();
      setSelectedApp(null);
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  // 承認時に顧客テーブルに登録
  const createCustomerFromApplication = async (application) => {
    try {
      const { error } = await supabase
        .from('customers')
        .insert([{
          application_id: application.id,
          company_name: application.company_name,
          contact_name: application.contact_name,
          email: application.email,
          phone: application.phone,
          address: application.address,
          business_type: application.business_type,
          yayoi_id: application.yayoi_id,
          discount_rate: application.discount_rate || 0,
          special_pricing: application.special_pricing || {},
          status: 'active'
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('顧客登録エラー:', error);
    }
  };

  // フィルタリングされた申込一覧
  const filteredApplications = applications.filter(app => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        app.company_name.toLowerCase().includes(term) ||
        app.contact_name.toLowerCase().includes(term) ||
        app.email.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // ステータス表示用のスタイル
  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accounting_review: 'bg-blue-100 text-blue-800',
      approval_pending: 'bg-purple-100 text-purple-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  // ステータス表示用のテキスト
  const getStatusText = (status) => {
    const texts = {
      pending: '申込受付',
      accounting_review: '経理確認中',
      approval_pending: '承認待ち',
      approved: '承認済み',
      rejected: '却下'
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
        <h1 className="text-2xl font-bold text-gray-900">申込管理</h1>
        <div className="flex space-x-4">
          {/* ステータスフィルター */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全ステータス</option>
            <option value="pending">申込受付</option>
            <option value="accounting_review">経理確認中</option>
            <option value="approval_pending">承認待ち</option>
            <option value="approved">承認済み</option>
            <option value="rejected">却下</option>
          </select>

          {/* 検索 */}
          <input
            type="text"
            placeholder="会社名・担当者名・メールで検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 申込一覧 */}
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
                業種
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                申込日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredApplications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{app.company_name}</div>
                    <div className="text-sm text-gray-500">{app.contact_name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {app.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {app.business_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(app.status)}`}>
                    {getStatusText(app.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(app.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    詳細
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredApplications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            申込が見つかりません
          </div>
        )}
      </div>

      {/* 詳細モーダル */}
      {selectedApp && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">申込詳細</h3>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">会社名</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApp.company_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">担当者名</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApp.contact_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApp.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">電話番号</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApp.phone || '未入力'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">住所</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApp.address || '未入力'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">業種</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApp.business_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">現在のステータス</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(selectedApp.status)}`}>
                      {getStatusText(selectedApp.status)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">申込日時</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedApp.created_at).toLocaleString('ja-JP')}
                  </p>
                </div>

                {selectedApp.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">備考</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApp.notes}</p>
                  </div>
                )}
              </div>

              {/* アクションボタン */}
              {selectedApp.status === 'pending' && (
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => updateApplicationStatus(selectedApp.id, 'accounting_review')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    経理確認へ
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApp.id, 'rejected')}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    却下
                  </button>
                </div>
              )}

              {selectedApp.status === 'accounting_review' && (
                <AccountingReviewForm 
                  application={selectedApp}
                  onUpdate={(updatedData) => updateApplicationWithAccountingInfo(selectedApp.id, updatedData)}
                  onStatusChange={(status) => updateApplicationStatus(selectedApp.id, status)}
                />
              )}

              {selectedApp.status === 'approval_pending' && (
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => updateApplicationStatus(selectedApp.id, 'approved')}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    承認
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApp.id, 'rejected')}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    却下
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;

