// client/src/App.js (ルーティング対応版)
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage'; // これから作成
import RankingPage from './pages/RankingPage'; // これから作成

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1><Link to="/" className="header-link">Dominion Supply Suggester</Link></h1>
        <nav>
          <Link to="/ranking" className="nav-link">人気サプライ一覧</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ranking" element={<RankingPage />} />
      </Routes>
    </div>
  );
}

export default App;