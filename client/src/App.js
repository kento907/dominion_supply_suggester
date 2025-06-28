import React, { useState, useEffect } from 'react';
import './App.css';
import Card from './Card';

// 定数としてコストの最小・最大を定義
const MIN_COST = 2; // 基本セットの最低コスト
const MAX_COST = 6; // 基本セットの最高コスト

function App() {
  // 既存のstate
  const [appState, setAppState] = useState('loading');
  const [allCards, setAllCards] = useState([]);
  const [selectedSupply, setSelectedSupply] = useState([]);

  // フィルター機能のために追加するstate
  const [selectedTags, setSelectedTags] = useState({});
  const [costRange, setCostRange] = useState({ min: MIN_COST, max: MAX_COST });
  const [availableTags, setAvailableTags] = useState([]);

  // データ取得ロジック
  const fetchData = () => {
    setAppState('loading');
    fetch('http://localhost:5001/api/cards')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setAllCards(data);
        setAppState('success');
        
        const allTags = new Set();
        data.forEach(card => {
          card.tags.forEach(tag => allTags.add(tag));
        });
        setAvailableTags(Array.from(allTags).sort());
      })
      .catch(err => {
        setAppState('error');
        console.error('データの取得に失敗:', err);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // タグのチェックボックスが変更されたときの処理
  const handleTagChange = (event) => {
    const { name, checked } = event.target;
    setSelectedTags(prevTags => ({
      ...prevTags,
      [name]: checked,
    }));
  };

  // コストのスライダーが変更されたときの処理
  const handleCostChange = (event) => {
    const { name, value } = event.target;
    setCostRange(prevRange => {
      const newRange = { ...prevRange, [name]: Number(value) };
      if (name === 'min' && newRange.min > newRange.max) {
        newRange.max = newRange.min;
      }
      if (name === 'max' && newRange.max < newRange.min) {
        newRange.min = newRange.max;
      }
      return newRange;
    });
  };

  // サプライを生成する関数
  const handleGenerateSupply = () => {
    if (appState !== 'success') return;

    const activeTags = Object.keys(selectedTags).filter(tag => selectedTags[tag]);

    let filteredCards = allCards
      .filter(card => card.cost >= costRange.min && card.cost <= costRange.max)
      .filter(card => {
        if (activeTags.length === 0) return true;
        return activeTags.every(tag => card.tags.includes(tag));
      });

    const shuffled = [...filteredCards].sort(() => 0.5 - Math.random());
    const newSupply = shuffled.slice(0, 10);

    if (newSupply.length < 10 && filteredCards.length > 0) {
        alert(`条件に合うカードが ${filteredCards.length} 枚しか見つかりませんでした。`);
    } else if (filteredCards.length === 0) {
        alert('条件に合うカードが見つかりませんでした。フィルター条件を緩めてみてください。');
    }

    setSelectedSupply(newSupply);
  };
  
  // ボタンの表示を切り替える関数
  const renderButton = () => {
    switch (appState) {
      case 'loading':
        return <button disabled>データ読込中...</button>;
      case 'success':
        return <button onClick={handleGenerateSupply}>サプライを生成する！</button>;
      case 'error':
        return <button onClick={fetchData}>再試行</button>;
      default:
        return <button disabled>状態不明</button>;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ドミニオン サプライ推奨アプリ</h1>
      </header>
      
      <div className="filter-container">
        <div className="filter-section">
          <h3>テーマ (Tags)</h3>
          <div className="tag-filters">
            {availableTags.map(tag => (
              <label key={tag} className="checkbox-label">
                <input
                  type="checkbox"
                  name={tag}
                  checked={selectedTags[tag] || false}
                  onChange={handleTagChange}
                />
                {tag}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3>コスト範囲 (Cost Range)</h3>
          <div className="cost-filters">
            <div className="slider-wrapper">
              <label>最小: {costRange.min}</label>
              <input
                type="range"
                name="min"
                min={MIN_COST}
                max={MAX_COST}
                value={costRange.min}
                onChange={handleCostChange}
              />
            </div>
            <div className="slider-wrapper">
              <label>最大: {costRange.max}</label>
              <input
                type="range"
                name="max"
                min={MIN_COST}
                max={MAX_COST}
                value={costRange.max}
                onChange={handleCostChange}
              />
            </div>
          </div>
        </div>
        
        <div className="generate-button-wrapper">
          {renderButton()}
        </div>
      </div>
      
      <main className="supply-display">
        {appState === 'loading' && <p>バックエンドからカードデータを読み込んでいます...</p>}
        {appState === 'error' && (
          <div className="error-message">
            <p>データの読み込みに失敗しました。</p>
            <p>バックエンドサーバーが起動しているか、ターミナルを確認してください。</p>
          </div>
        )}
        {appState === 'success' && selectedSupply.length === 0 && (
          <p>フィルター条件を設定して、サプライを生成してください。</p>
        )}

        {selectedSupply.map(card => (
          <Card key={card.name_en} cardData={card} />
        ))}
      </main>
    </div>
  );
}

export default App;