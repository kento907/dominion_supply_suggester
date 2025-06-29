// server/server.js (API追加後の完全版)

require('dotenv').config(); // .env ファイルから環境変数を読み込む
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js'); // Supabaseクライアントをインポート

// ▼▼▼ Supabaseクライアントの初期化 ▼▼▼
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
// ▲▲▲

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json()); // ★POSTリクエストのJSONボディを解析するために必要

// 静的ファイルの提供 (変更なし)
app.use(express.static(path.join(__dirname, '../client/build')));

// 既存のAPI: カード一覧を取得 (変更なし)
app.get('/api/cards', (req, res) => {
    fs.readFile(path.join(__dirname, 'cards.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading card data');
        }
        res.json(JSON.parse(data));
    });
});


// ▼▼▼ 【新設】サプライと評価を保存するAPIエンドポイント ▼▼▼
app.post('/api/ratings', async (req, res) => {
    try {
        const { cards, rating, comment } = req.body;

        // 1. suppliesテーブルに、カードの組み合わせを保存
        const { data: supplyData, error: supplyError } = await supabase
            .from('supplies')
            .insert({ cards: cards })
            .select()
            .single(); // insertした行のデータをすぐに取得する

        if (supplyError) {
            // もしエラーがあれば、ここでエラーを投げる
            throw supplyError;
        }

        // 2. 取得したsupplyのIDを使って、ratingsテーブルに評価を保存
        const supply_id = supplyData.id;
        const { error: ratingError } = await supabase
            .from('ratings')
            .insert({
                supply_id: supply_id,
                rating: rating,
                comment: comment
            });

        if (ratingError) {
            throw ratingError;
        }

        // 3. 成功レスポンスを返す
        res.status(201).json({ message: '評価が正常に保存されました。' });

    } catch (error) {
        console.error('評価の保存中にエラーが発生しました:', error);
        res.status(500).json({ error: error.message });
    }
});
// ▲▲▲


// Reactアプリを返すためのルート (変更なし)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});