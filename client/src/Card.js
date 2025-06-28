// src/Card.js

import React from 'react';
import './Card.css'; // カード専用のCSSファイルをインポート

function Card({ cardData }) {
  // cardDataが未定義の場合は何も表示しない
  if (!cardData) {
    return null;
  }

  return (
    <div className="card-item">
      <header className="card-header">
        <span className="card-cost">{cardData.cost}</span>
        <h2 className="card-name">{cardData.name_jp}</h2>
      </header>
      <div className="card-body">
        <p className="card-type">{cardData.type.join(' / ')}</p>
        <p className="card-text">{cardData.text}</p>
      </div>
      <footer className="card-footer">
        {cardData.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </footer>
    </div>
  );
}

export default Card;