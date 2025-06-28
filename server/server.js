// 必要なモジュールをインポート
const express = require('express');
const cors = require('cors');
const fs = require('fs'); // ファイルシステムを扱うモジュール

// Expressアプリを作成
const app = express();
const PORT = 5001; // サーバーを起動するポート番号

// CORSを有効にする (Reactアプリからのリクエストを許可)
app.use(cors());

// APIエンドポイントの作成
// '/api/cards' というURLにリクエストが来たら、カードデータを返す
app.get('/api/cards', (req, res) => {
  // cards.jsonファイルを読み込む
  fs.readFile('cards.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Error reading card data');
    }
    // 読み込んだデータをJSONとして送信
    res.json(JSON.parse(data));
  });
});

// サーバーを起動
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});