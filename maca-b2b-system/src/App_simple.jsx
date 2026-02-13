import React, { useState, useEffect } from 'react';

/**
 * シンプルなテスト用アプリケーション
 */
function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    setMessage('MACA堂B2Bシステム - テスト表示');
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>MACA堂 B2B注文管理システム</h1>
      <p>{message}</p>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => alert('テストボタンが動作しています')}>
          テストボタン
        </button>
      </div>
    </div>
  );
}

export default App;

