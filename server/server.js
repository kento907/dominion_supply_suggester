// server/server.js (デバッグログ追加版)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// ▼▼▼【デバッグ用ログ1】すべてのリクエストをログに出力するミドルウェア ▼▼▼
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Received ${req.method} request for ${req.originalUrl}`);
  next(); // 次の処理へ
});
// ▲▲▲

app.use(express.static(path.join(__dirname, '../client/build')));

// --- APIルート定義 ---

app.get('/api/cards', (req, res) => { /* ... (変更なし) ... */ });
app.post('/api/ratings', async (req, res) => { /* ... (変更なし) ... */ });

app.get('/api/supplies/popular', async (req, res) => {
  // ▼▼▼【デバッグ用ログ2】このAPIが呼ばれたことを記録 ▼▼▼
  console.log('--> Matched /api/supplies/popular route!');
  // ▲▲▲
  try {
    const { data, error } = await supabase.rpc('get_popular_supplies');
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('人気サプライの取得中にエラーが発生しました:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  // ▼▼▼【デバッグ用ログ3】catch-allルートが呼ばれたことを記録 ▼▼▼
  console.log(`--> Matched catch-all route (*). Sending index.html for ${req.originalUrl}`);
  // ▲▲▲
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});