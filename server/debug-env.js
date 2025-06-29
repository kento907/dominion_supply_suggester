// server/debug-env.js
console.log('--- 環境変数のデバッグを開始します ---');

// 1. dotenvがファイルをどう解析しているか確認
const result = require('dotenv').config();

if (result.error) {
  console.log('エラー: .env ファイルの読み込みに失敗しました。');
  console.error(result.error);
} else {
  console.log('成功: .env ファイルの読み込みが完了しました。');
  console.log('解析された変数:', result.parsed);
}

// 2. 実際にprocess.envに値が入っているか確認
console.log('\n--- process.env の中身を確認します ---');
console.log('process.env.SUPABASE_URL:', process.env.SUPABASE_URL);

// パスワードのように長いキーは、存在するかどうかだけ確認
const keyExists = process.env.SUPABASE_SERVICE_KEY ? '存在します' : '存在しません (undefined)';
console.log('process.env.SUPABASE_SERVICE_KEY:', keyExists);

console.log('\n--- デバッグを終了します ---');