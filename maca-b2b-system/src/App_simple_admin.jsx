import React, { useState, useEffect } from 'react';
import ApplicationManagement from './components/ApplicationManagement';
import './App.css';

/**
 * MACA堂B2B注文管理システム - シンプル管理画面
 */
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 開発用: 自動ログイン
    const adminUser = {
      id: 'admin-001',
      email: 'admin@maca.com',
      role: 'admin',
      name: '管理者'
    };
    setUser(adminUser);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold text-center mb-6">MACA堂 管理画面</h1>
          <button
            onClick={() => setUser({
              id: 'admin-001',
              email: 'admin@maca.com',
              role: 'admin',
              name: '管理者'
            })}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            管理者としてログイン
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MACA堂 管理画面</h1>
              <p className="text-sm text-gray-600">申込管理システム</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.email} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">申込管理</h2>
            <ApplicationManagement />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

