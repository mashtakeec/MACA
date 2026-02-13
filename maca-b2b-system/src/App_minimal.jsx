import React, { useState } from 'react';
import './App.css';

/**
 * 最小限のMACA堂B2Bシステム
 */
function App() {
  const [currentView, setCurrentView] = useState('application');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">MACA堂</h1>
              <span className="ml-2 text-lg text-gray-600">B2B注文管理システム</span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentView('application')}
                className={`px-4 py-2 rounded-md ${
                  currentView === 'application'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                申込フォーム
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-4 py-2 rounded-md ${
                  currentView === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                管理画面
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentView === 'application' ? (
            <ApplicationFormPlaceholder />
          ) : (
            <AdminPanelPlaceholder />
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * 申込フォームプレースホルダー
 */
const ApplicationFormPlaceholder = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    business_type: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('申込フォーム送信（開発中）');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        MACA堂 B2B取引申込
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            会社名 *
          </label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => setFormData({...formData, company_name: e.target.value})}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="株式会社○○○"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            担当者名 *
          </label>
          <input
            type="text"
            value={formData.contact_name}
            onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="山田 太郎"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="yamada@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            業種 *
          </label>
          <select
            value={formData.business_type}
            onChange={(e) => setFormData({...formData, business_type: e.target.value})}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            <option value="冒険者ギルド">冒険者ギルド</option>
            <option value="魔法学院">魔法学院</option>
            <option value="騎士団">騎士団</option>
            <option value="商会">商会</option>
            <option value="医療機関">医療機関</option>
            <option value="研究機関">研究機関</option>
            <option value="その他">その他</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium"
        >
          申込を送信
        </button>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-medium mb-2">ご注意</h3>
        <ul className="space-y-1">
          <li>• 審査には3-5営業日程度お時間をいただきます</li>
          <li>• 審査結果はメールにてご連絡いたします</li>
          <li>• 法人のお客様のみご利用いただけます</li>
          <li>• 最小注文金額は10,000円からとなります</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * 管理画面プレースホルダー
 */
const AdminPanelPlaceholder = () => {
  const [activeTab, setActiveTab] = useState('applications');

  return (
    <div className="space-y-6">
      {/* ログインボタン（開発用） */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-800 mb-2">開発用ダミーログイン:</p>
        <div className="flex space-x-2">
          <button
            onClick={() => alert('社長としてログイン（開発中）')}
            className="bg-purple-600 text-white py-1 px-3 rounded text-sm hover:bg-purple-700"
          >
            社長
          </button>
          <button
            onClick={() => alert('経理としてログイン（開発中）')}
            className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700"
          >
            経理
          </button>
          <button
            onClick={() => alert('管理者としてログイン（開発中）')}
            className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700"
          >
            管理者
          </button>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'applications', name: '申込管理' },
            { id: 'customers', name: '顧客管理' },
            { id: 'approval', name: '社長承認' },
            { id: 'pricing', name: '価格計算' },
            { id: 'discounts', name: '割引設定' },
            { id: 'orders', name: '注文管理' },
            { id: 'portal', name: '顧客ポータル' }
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

      {/* タブコンテンツ */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {activeTab === 'applications' && '申込管理'}
          {activeTab === 'customers' && '顧客管理'}
          {activeTab === 'approval' && '社長承認'}
          {activeTab === 'pricing' && '価格計算'}
          {activeTab === 'discounts' && '割引設定'}
          {activeTab === 'orders' && '注文管理'}
          {activeTab === 'portal' && '顧客ポータル'}
        </h3>
        
        <div className="text-gray-600">
          <p>この機能は開発中です。</p>
          <p className="mt-2">実装予定の機能:</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            {activeTab === 'applications' && (
              <>
                <li>申込一覧表示・検索・フィルタリング</li>
                <li>申込詳細表示・ステータス更新</li>
                <li>承認ワークフロー管理</li>
              </>
            )}
            {activeTab === 'customers' && (
              <>
                <li>顧客一覧表示・検索・フィルタリング</li>
                <li>顧客詳細表示・編集</li>
                <li>割引率・与信限度額管理</li>
              </>
            )}
            {activeTab === 'approval' && (
              <>
                <li>承認待ち申込一覧</li>
                <li>承認設定（割引率・与信限度額）</li>
                <li>特別単価設定</li>
              </>
            )}
            {activeTab === 'pricing' && (
              <>
                <li>顧客別価格計算</li>
                <li>割引・特別単価適用</li>
                <li>与信限度額チェック</li>
              </>
            )}
            {activeTab === 'discounts' && (
              <>
                <li>顧客別基本割引率設定</li>
                <li>商品別特別単価設定</li>
                <li>価格計算プレビュー</li>
              </>
            )}
            {activeTab === 'orders' && (
              <>
                <li>注文一覧表示・管理</li>
                <li>注文詳細・ステータス更新</li>
                <li>売上分析・レポート</li>
              </>
            )}
            {activeTab === 'portal' && (
              <>
                <li>顧客向け商品カタログ</li>
                <li>オンライン注文機能</li>
                <li>注文履歴・ステータス確認</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;

