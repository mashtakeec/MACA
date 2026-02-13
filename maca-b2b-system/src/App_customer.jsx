import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomerLogin from './pages/CustomerLogin';
import CustomerPortal from './pages/CustomerPortal';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* お客様専用ルート */}
          <Route path="/customer-login" element={<CustomerLogin />} />
          <Route path="/customer-portal" element={<CustomerPortal />} />
          
          {/* デフォルトはお客様ログインにリダイレクト */}
          <Route path="/" element={<Navigate to="/customer-login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

