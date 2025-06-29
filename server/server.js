require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabaseクライアントの初期化
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = process.env.PORT || 5001;

// --- 基本的なミドルウェアの設定 ---
app.use(cors());
app.use(express.json());

// --- ▼▼▼ ここからが重要な変更点 ▼▼▼ ---

// --- 1. APIルートの定義 (静的ファイルの提供より先に定義する) ---

// カード一覧を取得
app.get('/api/cards', (req, res) => {
    fs.readFile(path.join(__dirname, 'cards.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading card data');
        }
        res.json(JSON.parse(data));
    });
});

// サプライと評価を保存
app.post('/api/ratings', async (req, res) => {
    try {
        const { cards, rating, comment } = req.body;
        const { data: supplyData, error: supplyError } = await supabase.from('supplies').insert({ cards: cards }).select().single();
        if (supplyError) throw supplyError;

        const supply_id = supplyData.id;
        const { error: ratingError } = await supabase.from('ratings').insert({ supply_id: supply_id, rating: rating, comment: comment });
        if (ratingError) throw ratingError;

        res.status(201).json({ message: '評価が正常に保存されました。' });
    } catch (error) {
        console.error('評価の保存中にエラーが発生しました:', error);
        res.status(500).json({ error: error.message });
    }
});

// 人気サプライ一覧を取得
app.get('/api/supplies/popular', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_popular_supplies');
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('人気サプライの取得中にエラーが発生しました:', error);
    res.status(500).json({ error: error.message });
  }
});


// --- 2. 静的ファイルの提供 (APIルートの後に定義) ---
app.use(express.static(path.join(__dirname, '../client/build')));


// --- 3. Catch-allルート (必ず最後に定義) ---
// 上記のどのルートにも一致しなかったリクエストは、Reactアプリ本体を返す
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// --- ▲▲▲ ここまでが重要な変更点 ▲▲▲ ---


app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});