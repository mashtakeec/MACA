import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import ApplicationForm from './components/ApplicationForm';
import ApplicationManagement from './components/ApplicationManagement';
import CustomerManagement from './components/CustomerManagement';
import PricingEngine from './components/PricingEngine';
import PresidentApproval from './components/PresidentApproval';
import DiscountSettings from './components/DiscountSettings';
import './App.css';

/**
 * MACA堂B2B注文管理システム メインアプリケーション
 */
function App() {
  const [currentView, setCurrentView] = useState('application'); // application, admin
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 認証状態の監視
  useEffect(() => {
    // 初期セッション確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 認証状態変更の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ユーザーロールを取得
  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // レコードが見つからない場合以外のエラー
        throw error;
      }

      setUserRole(data?.role || null);
    } catch (error) {
      console.error('ユーザーロール取得エラー:', error);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  // ログイン
  const handleLogin = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
    } catch (error) {
      console.error('ログインエラー:', error);
      throw error;
    }
  };

  // ログアウト
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentView('application');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">MACA堂 B2Bシステム</h1>
            </div>
            
            <nav className="flex space-x-8">
              <button
                onClick={() => setCurrentView('application')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'application'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                申込フォーム
              </button>
              
              {user && userRole && ['admin', 'accounting', 'president'].includes(userRole) && (
                <>
                  <button
                    onClick={() => setCurrentView('admin')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'admin'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    管理画面
                  </button>
                </>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {user.email} ({userRole || 'ゲスト'})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <LoginForm onLogin={handleLogin} />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentView === 'application' && <ApplicationForm />}
          
          {currentView === 'admin' && user && userRole && ['admin', 'accounting', 'president'].includes(userRole) && (
            <AdminPanel userRole={userRole} />
          )}
          
          {currentView === 'admin' && (!user || !userRole || !['admin', 'accounting', 'president'].includes(userRole)) && (
            <div className="text-center py-12">
              <p className="text-gray-500">管理画面にアクセスするには管理者権限が必要です</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * ログインフォーム
 */
const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onLogin(email, password);
    } catch (error) {
      setError('ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? '...' : 'ログイン'}
      </button>
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </form>
  );
};

/**
 * 価格計算エンジンラッパー
 */
const PricingEngineWrapper = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, company_name, contact_name')
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          顧客を選択してください
        </label>
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
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

      {selectedCustomerId && (
        <PricingEngine
          customerId={selectedCustomerId}
          onPriceCalculated={(breakdown) => {
            console.log('価格計算結果:', breakdown);
          }}
        />
      )}
    </div>
  );
};

/**
 * 管理パネル
 */
const AdminPanel = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState('applications');

  return (
    <div className="space-y-6">
      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            申込管理
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'customers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            顧客管理
          </button>
          {userRole === 'president' && (
            <button
              onClick={() => setActiveTab('approval')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approval'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              社長承認
            </button>
          )}
          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pricing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            価格計算
          </button>
          <button
            onClick={() => setActiveTab('discounts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'discounts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            割引設定
          </button>
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div>
        {activeTab === 'applications' && <ApplicationManagement />}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'approval' && userRole === 'president' && <PresidentApproval />}
        {activeTab === 'pricing' && <PricingEngineWrapper />}
        {activeTab === 'discounts' && <DiscountSettings />}
      </div>
    </div>
  );
};

export default App;
