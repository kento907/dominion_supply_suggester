import React, { useState, useEffect } from 'react';
import './App.css';
import Card from './Card';

const MIN_COST = 2;
const MAX_COST = 6;

function App() {
  const [appState, setAppState] = useState('loading');
  const [allCards, setAllCards] = useState([]);
  const [selectedSupply, setSelectedSupply] = useState([]);
  const [selectedTags, setSelectedTags] = useState({});
  const [costRange, setCostRange] = useState({ min: MIN_COST, max: MAX_COST });
  const [availableTags, setAvailableTags] = useState([]);
  const [cardStatuses, setCardStatuses] = useState({});

  const fetchData = () => {
    setAppState('loading');
    fetch('http://localhost:5001/api/cards')
      .then(res => { if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`); return res.json(); })
      .then(data => {
        setAllCards(data);
        setAppState('success');
        const allTags = new Set();
        data.forEach(card => card.tags.forEach(tag => allTags.add(tag)));
        setAvailableTags(Array.from(allTags).sort());
        const initialStatuses = {};
        data.forEach(card => { initialStatuses[card.name_jp] = 'none'; });
        setCardStatuses(initialStatuses);
      })
      .catch(err => { setAppState('error'); console.error('データの取得に失敗:', err); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleTagChange = (event) => {
    const { name, checked } = event.target;
    setSelectedTags(prevTags => ({ ...prevTags, [name]: checked }));
  };

  const handleCostChange = (event) => {
    const { name, value } = event.target;
    setCostRange(prevRange => {
      const newRange = { ...prevRange, [name]: Number(value) };
      if (name === 'min' && newRange.min > newRange.max) newRange.max = newRange.min;
      if (name === 'max' && newRange.max < newRange.min) newRange.min = newRange.max;
      return newRange;
    });
  };

  const handleCardStatusChange = (cardName) => {
    setCardStatuses(prevStatuses => {
      const currentStatus = prevStatuses[cardName];
      let nextStatus;
      if (currentStatus === 'none') {
        nextStatus = 'required';
      } else if (currentStatus === 'required') {
        nextStatus = 'banned';
      } else {
        nextStatus = 'none';
      }
      return { ...prevStatuses, [cardName]: nextStatus };
    });
  };

  const handleGenerateSupply = () => {
    if (appState !== 'success') return;

    // --- ▼▼▼ ここからが賢いロジック ▼▼▼ ---

    // === 1. 初期化 ===
    const bannedCards = Object.keys(cardStatuses).filter(cardName => cardStatuses[cardName] === 'banned');
    const requiredCardNames = Object.keys(cardStatuses).filter(cardName => cardStatuses[cardName] === 'required');

    if (requiredCardNames.length > 10) {
      alert('必須カードは10枚までしか選択できません。');
      return;
    }

    // 【修正点】必須カードを名前(string)ではなく、完全なオブジェクト(object)の配列として取得
    let supply = allCards.filter(card => requiredCardNames.includes(card.name_jp));

    const activeTags = Object.keys(selectedTags).filter(tag => selectedTags[tag]);
    
    let candidatePool = allCards
      .filter(card => !bannedCards.includes(card.name_jp))
      .filter(card => !requiredCardNames.includes(card.name_jp))
      .filter(card => card.cost >= costRange.min && card.cost <= costRange.max)
      .filter(card => {
        if (activeTags.length === 0) return true;
        return activeTags.every(tag => card.tags.includes(tag));
      });

    // === 2. 生成ループ (サプライが10枚になるまで) ===
    while (supply.length < 10 && candidatePool.length > 0) {
        let weightedPool = candidatePool.map(card => {
            let weight = 1.0;

            // 【修正点】現在のサプライの状況を分析
            const isAttackInSupply = supply.some(c => c.meta.attack_type);
            const isTerminalInSupply = supply.some(c => c.meta.is_terminal);
            
            if (isAttackInSupply && card.meta.is_reaction) {
                weight += 50.0;
            }
            if (isTerminalInSupply && card.meta.is_village) {
                weight += 30.0;
            }
            if (supply.length < 5 && card.meta.is_trasher) {
                weight += 20.0;
            }
            
            return { card: card, weight: weight };
        });

        const nextCard = pickWeightedRandom(weightedPool);

        if (nextCard) {
            supply.push(nextCard);
            candidatePool = candidatePool.filter(c => c.name_jp !== nextCard.name_jp);
        } else {
            break;
        }
    }

    // === 3. 最終処理 ===
    while (supply.length < 10 && candidatePool.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidatePool.length);
        const randomCard = candidatePool.splice(randomIndex, 1)[0];
        supply.push(randomCard);
    }
    
    if (supply.length < 10) {
      alert(`条件に合うカードが足りなかったため、${supply.length}枚のサプライを生成しました。`);
    }

    setSelectedSupply(supply.sort(() => 0.5 - Math.random()));
  };
  
  // 重み付きランダム選択を行うヘルパー関数 (Appコンポーネントの外に定義)
  function pickWeightedRandom(weightedPool) {
      const totalWeight = weightedPool.reduce((sum, item) => sum + item.weight, 0);
      if (totalWeight <= 0) return null; //重みがない場合は何も返さない
      let randomValue = Math.random() * totalWeight;
  
      for (const item of weightedPool) {
          randomValue -= item.weight;
          if (randomValue <= 0) {
              return item.card;
          }
      }
      return null;
  }

  const renderButton = () => {
    switch (appState) {
      case 'loading': return <button disabled>データ読込中...</button>;
      case 'success': return <button onClick={handleGenerateSupply}>サプライを生成する！</button>;
      case 'error': return <button onClick={fetchData}>再試行</button>;
      default: return <button disabled>状態不明</button>;
    }
  };

  return (
    <div className="App">
      <header className="App-header"><h1>Dominion Supply Suggester</h1></header>
      <div className="filter-container">
        <div className="filter-section">
          <h3>テーマ (Tags)</h3>
          <div className="tag-filters">{availableTags.map(tag => (<label key={tag} className="checkbox-label"><input type="checkbox" name={tag} checked={selectedTags[tag] || false} onChange={handleTagChange} />{tag}</label>))}</div>
        </div>
        <div className="filter-section">
          <h3>コスト範囲 (Cost Range)</h3>
          <div className="cost-filters">
            <div className="slider-wrapper"><label>最小: {costRange.min}</label><input type="range" name="min" min={MIN_COST} max={MAX_COST} value={costRange.min} onChange={handleCostChange} /></div>
            <div className="slider-wrapper"><label>最大: {costRange.max}</label><input type="range" name="max" min={MIN_COST} max={MAX_COST} value={costRange.max} onChange={handleCostChange} /></div>
          </div>
        </div>
        <div className="filter-section">
          <h3>禁止・必須カード</h3>
          <p>クリックで状態を切替 (白: 通常 → 緑: 必須 → 赤: 禁止)</p>
          <div className="card-status-list">
            {allCards.map(card => (
              <div
                key={card.name_en}
                className={`card-status-item ${cardStatuses[card.name_jp]}`}
                onClick={() => handleCardStatusChange(card.name_jp)}
              >
                {card.name_jp}
              </div>
            ))}
          </div>
        </div>
        <div className="generate-button-wrapper">{renderButton()}</div>
      </div>
      <main className="supply-display">
        {appState === 'loading' && <p>バックエンドからカードデータを読み込んでいます...</p>}
        {appState === 'error' && (<div className="error-message"><p>データの読み込みに失敗しました。</p><p>バックエンドサーバーが起動しているか、ターミナルを確認してください。</p></div>)}
        {appState === 'success' && selectedSupply.length === 0 && (<p>フィルター条件を設定して、サプライを生成してください。</p>)}
        {selectedSupply.map(card => (<Card key={card.name_en} cardData={card} />))}
      </main>
    </div>
  );
}

export default App;