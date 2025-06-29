// client/src/pages/RankingPage.js (完成版)
import React, { useState, useEffect } from 'react';
import Card from '../Card'; // Cardコンポーネントを再利用
import '../App.css'; // 共有スタイル

function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch('/api/supplies/popular');
        if (!response.ok) {
          throw new Error('データの読み込みに失敗しました。');
        }
        const data = await response.json();
        setRanking(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRanking();
  }, []);

  if (isLoading) {
    return <div className="loading-message">ランキングを読み込み中...</div>;
  }
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="ranking-container">
      <h1>人気サプライランキング</h1>
      <p>評価の平均点が高い順に表示されています。</p>
      
      {ranking.length === 0 ? (
        <p>まだ評価されたサプライがありません。最初の評価者になりましょう！</p>
      ) : (
        <div className="ranking-list">
          {ranking.map((item, index) => (
            <div key={item.id} className="ranking-item">
              <div className="ranking-info">
                <span className="rank-badge">#{index + 1}</span>
                <span className="avg-rating">
                  ★ {item.average_rating}
                </span>
                <span className="total-ratings">
                  ({item.total_ratings}件の評価)
                </span>
              </div>
              <div className="supply-display-mini">
                {item.cards.map(cardName => (
                  <div key={cardName} className="card-name-chip">{cardName}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RankingPage;