import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isPasswordReset) {
        // パスワードリセット
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) throw error;
        
        setMessage('パスワードリセット用のメールを送信しました。メールをご確認ください。');
      } else if (isLogin) {
        // ログイン
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        setMessage('ログインしました');
        // 顧客画面にリダイレクト
        window.location.href = '/customer-portal';
      } else {
        // 新規登録
        if (password !== confirmPassword) {
          throw new Error('パスワードが一致しません');
        }
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        setMessage('新規登録後、確認メールをお送りします。メール内のリンクをクリックして認証を完了してください。');
      }
    } catch (error) {
      setMessage(`エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
          {isPasswordReset ? (
            // パスワードリセット画面
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">パスワードリセット</h2>
                <p className="text-sm text-gray-600">
                  登録されているメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
                </p>
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

                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordReset(false);
                    setMessage('');
                    setEmail('');
                  }}
                  className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  ← ログイン画面に戻る
                </button>
              </form>
            </>
          ) : (
            // ログイン・新規登録画面
            <>
              <div className="mb-6">
                <div className="flex rounded-lg bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
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
                    onClick={() => setIsLogin(false)}
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
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      パスワード（確認）
                    </label>
                    <input
                      id="confirmPassword"
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

                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordReset(true);
                      setMessage('');
                      setPassword('');
                    }}
                    className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    パスワードを忘れた方はこちら
                  </button>
                )}
              </form>

              {!isLogin && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    新規登録後、確認メールをお送りします。メール内のリンクをクリックして認証を完了してください。
                  </p>
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  アカウントをお持ちでない方は、
                  <br />
                  まず申込フォームからお申し込みください。
                </p>
                <a
                  href="/"
                  className="mt-2 inline-block text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  申込フォームへ
                </a>
              </div>
            </>
          )}
        </div>

        {/* フッター */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 MACA堂. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

