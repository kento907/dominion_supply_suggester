import React, { useState, useEffect } from 'react';
import './App.css';
import Card from './Card';

const MIN_COST = 2;
const MAX_COST = 6;

function App() {
  // 既存のstate
  const [appState, setAppState] = useState('loading');
  const [allCards, setAllCards] = useState([]);
  const [selectedSupply, setSelectedSupply] = useState([]);
  const [selectedTags, setSelectedTags] = useState({});
  const [costRange, setCostRange] = useState({ min: MIN_COST, max: MAX_COST });
  const [availableTags, setAvailableTags] = useState([]);
  const [cardStatuses, setCardStatuses] = useState({});

  // ▼▼▼ 【今回追加】評価フォームと投稿状態のためのstate ▼▼▼
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('idle'); // idle | submitting | success | error

  // ... (fetchData, handleTagChange, handleCostChange, handleCardStatusChange は変更なし)

  const handleGenerateSupply = () => {
    // ... (生成ロジックは変更なし)

    // ▼▼▼ サプライが新しく生成されたら、前の評価をリセットする ▼▼▼
    setRating(0);
    setComment('');
    setSubmissionStatus('idle');
  };

  // ▼▼▼ 【新設】評価をサーバーに送信する関数 ▼▼▼
  const handleRatingSubmit = async () => {
    if (rating === 0) {
      alert('星評価を選択してください。');
      return;
    }
    if (selectedSupply.length === 0) {
      alert('評価対象のサプライがありません。');
      return;
    }

    setSubmissionStatus('submitting');

    const payload = {
      cards: selectedSupply.map(card => card.name_jp), // カード名の配列を送信
      rating: rating,
      comment: comment
    };

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('サーバーとの通信に失敗しました。');
      }

      setSubmissionStatus('success');

    } catch (error) {
      console.error('評価の投稿に失敗しました:', error);
      setSubmissionStatus('error');
    }
  };


  // ... (renderButton は変更なし)

  return (
    <div className="App">
      <header className="App-header">
        {/* ... (変更なし) ... */}
      </header>
      
      <div className="filter-container">
        {/* ... (フィルター部分は変更なし) ... */}
      </div>
      
      <main className="supply-display">
        {/* ... (読み込み中やエラー表示は変更なし) ... */}

        {selectedSupply.map(card => (
          <Card key={card.name_en} cardData={card} />
        ))}
      </main>

      {/* ▼▼▼ 【今回追加】評価フォームのUI ▼▼▼ */}
      {selectedSupply.length > 0 && (
        <div className="rating-container">
          {submissionStatus === 'success' ? (
            <div className="rating-feedback success">
              <h3>評価ありがとうございます！</h3>
              <p>あなたの評価は、今後のアプリ改善に役立てられます。</p>
            </div>
          ) : (
            <>
              <h2>このサプライを評価する</h2>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={star <= rating ? 'star active' : 'star'}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea
                className="comment-box"
                placeholder="コメントがあれば入力してください（任意）"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                className="submit-button"
                onClick={handleRatingSubmit}
                disabled={submissionStatus === 'submitting'}
              >
                {submissionStatus === 'submitting' ? '送信中...' : '評価を投稿する'}
              </button>
              {submissionStatus === 'error' && (
                <p className="rating-feedback error">投稿に失敗しました。時間をおいて再度お試しください。</p>
              )}
            </>
          )}
        </div>
      )}
      {/* ▲▲▲ */}
    </div>
  );
}

// -------------------------------------------------------------------
// 以下、変更のない部分も含めた最終的なコードです。
// -------------------------------------------------------------------
function AppFinal() {
    const [appState, setAppState] = useState('loading');
    const [allCards, setAllCards] = useState([]);
    const [selectedSupply, setSelectedSupply] = useState([]);
    const [selectedTags, setSelectedTags] = useState({});
    const [costRange, setCostRange] = useState({ min: MIN_COST, max: MAX_COST });
    const [availableTags, setAvailableTags] = useState([]);
    const [cardStatuses, setCardStatuses] = useState({});
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState('idle');

    const fetchData = () => { /* ... */ };
    useEffect(() => { fetchData(); }, []);
    const handleTagChange = (event) => { /* ... */ };
    const handleCostChange = (event) => { /* ... */ };
    const handleCardStatusChange = (cardName) => { /* ... */ };
    
    const handleGenerateSupply = () => {
        if (appState !== 'success') return;
        const bannedCards = Object.keys(cardStatuses).filter(cardName => cardStatuses[cardName] === 'banned');
        const requiredCards = Object.keys(cardStatuses).filter(cardName => cardStatuses[cardName] === 'required');
        if (requiredCards.length > 10) { alert('必須カードは10枚までしか選択できません。'); return; }
        let supply = allCards.filter(card => requiredCards.includes(card.name_jp));
        const activeTags = Object.keys(selectedTags).filter(tag => selectedTags[tag]);
        let candidatePool = allCards.filter(c => !bannedCards.includes(c.name_jp)).filter(c => !requiredCards.includes(c.name_jp)).filter(c => c.cost >= costRange.min && c.cost <= costRange.max).filter(c => { if (activeTags.length === 0) return true; return activeTags.every(tag => c.tags.includes(tag)); });
        while (supply.length < 10 && candidatePool.length > 0) {
            let weightedPool = candidatePool.map(card => {
                let weight = 1.0;
                const isAttackInSupply = supply.some(c => c.meta.attack_type);
                const isTerminalInSupply = supply.some(c => c.meta.is_terminal);
                if (isAttackInSupply && card.meta.is_reaction) { weight += 50.0; }
                if (isTerminalInSupply && card.meta.is_village) { weight += 30.0; }
                if (supply.length < 5 && card.meta.is_trasher) { weight += 20.0; }
                return { card: card, weight: weight };
            });
            const nextCard = pickWeightedRandom(weightedPool);
            if (nextCard) { supply.push(nextCard); candidatePool = candidatePool.filter(c => c.name_jp !== nextCard.name_jp); } else { break; }
        }
        while (supply.length < 10 && candidatePool.length > 0) { const randomIndex = Math.floor(Math.random() * candidatePool.length); const randomCard = candidatePool.splice(randomIndex, 1)[0]; supply.push(randomCard); }
        if (supply.length < 10) { alert(`条件に合うカードが足りなかったため、${supply.length}枚のサプライを生成しました。`); }
        setSelectedSupply(supply.sort(() => 0.5 - Math.random()));
        setRating(0); setComment(''); setSubmissionStatus('idle');
    };

    const handleRatingSubmit = async () => {
        if (rating === 0) { alert('星評価を選択してください。'); return; }
        if (selectedSupply.length === 0) { alert('評価対象のサプライがありません。'); return; }
        setSubmissionStatus('submitting');
        const payload = { cards: selectedSupply.map(card => card.name_jp), rating: rating, comment: comment };
        try {
            const response = await fetch('/api/ratings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) { throw new Error('サーバーとの通信に失敗しました。'); }
            setSubmissionStatus('success');
        } catch (error) {
            console.error('評価の投稿に失敗しました:', error);
            setSubmissionStatus('error');
        }
    };

    const renderButton = () => { /* ... */ };

    return (
        <div className="App">
            <header className="App-header"><h1>ドミニオン サプライ推奨アプリ</h1></header>
            <div className="filter-container">
                {/* ... filters ... */}
                <div className="generate-button-wrapper">{renderButton()}</div>
            </div>
            <main className="supply-display">
                {appState === 'loading' && <p>...</p>}
                {appState === 'error' && ( <div className="error-message">...</div> )}
                {appState === 'success' && selectedSupply.length === 0 && ( <p>...</p> )}
                {selectedSupply.map(card => ( <Card key={card.name_en} cardData={card} /> ))}
            </main>
            {selectedSupply.length > 0 && (
                <div className="rating-container">
                    {submissionStatus === 'success' ? (
                        <div className="rating-feedback success"><h3>評価ありがとうございます！</h3><p>あなたの評価は、今後のアプリ改善に役立てられます。</p></div>
                    ) : (
                        <>
                            <h2>このサプライを評価する</h2>
                            <div className="star-rating">{[1, 2, 3, 4, 5].map(star => (<span key={star} className={star <= rating ? 'star active' : 'star'} onClick={() => setRating(star)}>★</span>))}</div>
                            <textarea className="comment-box" placeholder="コメントがあれば入力してください（任意）" value={comment} onChange={(e) => setComment(e.target.value)} />
                            <button className="submit-button" onClick={handleRatingSubmit} disabled={submissionStatus === 'submitting'}>{submissionStatus === 'submitting' ? '送信中...' : '評価を投稿する'}</button>
                            {submissionStatus === 'error' && (<p className="rating-feedback error">投稿に失敗しました。時間をおいて再度お試しください。</p>)}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
// Helper and other functions from previous version
function pickWeightedRandom(weightedPool) { /*...*/ }
// ... other functions ...
export default App;