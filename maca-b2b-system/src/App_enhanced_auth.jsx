import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'portal', 'reset'
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  // 認証状態の監視
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentView('portal');
      } else {
        setUser(null);
        setCurrentView('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // ログイン
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        setMessage('ログインしました');
      } else {
        // 新規登録
        if (password !== confirmPassword) {
          throw new Error('パスワードが一致しません');
        }

        if (password.length < 6) {
          throw new Error('パスワードは6文字以上で入力してください');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        
        if (error) throw error;
        
        setMessage('確認メールを送信しました。メールをご確認いただき、認証リンクをクリックしてください。');
      }
    } catch (error) {
      setMessage(`エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin
      });
      
      if (error) throw error;
      
      setMessage('パスワードリセット用のメールを送信しました。メールをご確認ください。');
      setResetEmail('');
    } catch (error) {
      setMessage(`エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentView('login');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setMessage('');
  };

  // パスワードリセット画面
  if (currentView === 'reset') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* ロゴ・ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MACA堂</h1>
            <p className="text-gray-600">パスワードリセット</p>
          </div>

          {/* パスワードリセットフォーム */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">パスワードを忘れた方</h2>
              <p className="text-sm text-gray-600">
                登録されているメールアドレスを入力してください。<br />
                パスワードリセット用のリンクをお送りします。
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your-email@example.com"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-md text-sm ${
                  message.includes('エラー') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '送信中...' : 'リセットメールを送信'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setCurrentView('login')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← ログイン画面に戻る
              </button>
            </div>
          </div>

          {/* フッター */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2024 MACA堂. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  // ログイン画面
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* ロゴ・ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MACA堂</h1>
            <p className="text-gray-600">お客様専用ログイン</p>
          </div>

          {/* ログインフォーム */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setMessage('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    isLogin
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ログイン
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setMessage('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    !isLogin
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  新規登録
                </button>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your-email@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="6文字以上のパスワード"
                />
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                    パスワード（確認）
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="パスワードを再入力"
                  />
                </div>
              )}

              {message && (
                <div className={`p-3 rounded-md text-sm ${
                  message.includes('エラー') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '処理中...' : (isLogin ? 'ログイン' : '新規登録')}
              </button>
            </form>

            {/* パスワードを忘れた場合のリンク */}
            {isLogin && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setCurrentView('reset')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  パスワードを忘れた方はこちら
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? (
                  <>
                    初回ご利用の方は、まず申込フォームから<br />
                    お申し込みください。
                  </>
                ) : (
                  <>
                    新規登録後、確認メールをお送りします。<br />
                    メール内のリンクをクリックして認証を完了してください。
                  </>
                )}
              </p>
              <a
                href="https://dcxlthfc.manus.space"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                申込フォームへ
              </a>
            </div>
          </div>

          {/* フッター */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2024 MACA堂. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  // お客様ポータル画面
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">MACA堂</h1>
              <span className="ml-4 text-sm text-gray-500">お客様ポータル</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ウェルカムメッセージ */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ようこそ、MACA堂お客様ポータルへ
          </h2>
          <p className="text-gray-600">
            こちらから商品のご注文や注文履歴の確認ができます。
          </p>
          {user?.email_confirmed_at ? (
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ メール認証済み
            </div>
          ) : (
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              ⚠ メール認証が必要です
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 商品カタログ */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">商品カタログ</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">体力回復ポーション</h4>
                      <p className="text-sm text-gray-600 mt-1">疲労回復に効果的な基本ポーション</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">¥1,000</p>
                      <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                        注文する
                      </button>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">魔力増強ポーション</h4>
                      <p className="text-sm text-gray-600 mt-1">集中力と思考力を高める特別なポーション</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">¥1,500</p>
                      <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                        注文する
                      </button>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">治癒ポーション</h4>
                      <p className="text-sm text-gray-600 mt-1">傷の治癒を促進する医療用ポーション</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">¥2,000</p>
                      <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                        注文する
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 注文履歴 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">注文履歴</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-center py-8">
                まだ注文履歴がありません
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

