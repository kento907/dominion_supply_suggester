// // 必要なモジュールをインポート
// const express = require('express');
// const cors = require('cors');
// const fs = require('fs'); // ファイルシステムを扱うモジュール

// // Expressアプリを作成
// const app = express();
// const PORT = 5001; // サーバーを起動するポート番号

// // CORSを有効にする (Reactアプリからのリクエストを許可)
// app.use(cors());

// // APIエンドポイントの作成
// // '/api/cards' というURLにリクエストが来たら、カードデータを返す
// app.get('/api/cards', (req, res) => {
//   // cards.jsonファイルを読み込む
//   fs.readFile('cards.json', 'utf8', (err, data) => {
//     if (err) {
//       console.error('Error reading file:', err);
//       return res.status(500).send('Error reading card data');
//     }
//     // 読み込んだデータをJSONとして送信
//     res.json(JSON.parse(data));
//   });
// });

// // サーバーを起動
// app.listen(PORT, () => {
//     console.log(`Backend server is running on http://localhost:${PORT}`);
// });




// // server/server.js
// deploy用

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path'); // ← pathモジュールをインポート

const app = express();
const PORT = process.env.PORT || 5001; // ← Renderが指定するポートに対応

app.use(cors());

// ▼▼▼ ここからが重要な追加部分 ▼▼▼

// 完成版のReactアプリが置かれる'client/build'フォルダを静的ファイルとして提供
app.use(express.static(path.join(__dirname, '../client/build')));

// ▲▲▲

// APIエンドポイント (変更なし)
app.get('/api/cards', (req, res) => {
  fs.readFile(path.join(__dirname, 'cards.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Error reading card data');
    }
    res.json(JSON.parse(data));
  });
});

// ▼▼▼ API以外のすべてのリクエストに対してReactアプリを返す ▼▼▼
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// ▲▲▲

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});