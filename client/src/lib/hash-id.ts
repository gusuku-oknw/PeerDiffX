/**
 * ID をハッシュ化・デコードする関数
 * プレゼンテーションIDをURLで使いやすい形式に変換するために使用
 */

// プレゼンテーションIDをハッシュ化（エンコード）
export function encodeHashId(id: number): string {
  // シンプルな実装: Base64エンコーディング + プレフィックス
  const encoded = Buffer.from(id.toString()).toString('base64');
  return `pdx-${encoded}`;
}

// ハッシュIDからプレゼンテーションIDをデコード
export function decodeHashId(hashId: string): number | null {
  try {
    // pdx- プレフィックスを削除
    if (hashId.startsWith('pdx-')) {
      const encoded = hashId.substring(4);
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      return parseInt(decoded, 10);
    }
    // プレフィックスがない場合は直接数値に変換
    return parseInt(hashId, 10);
  } catch (e) {
    console.error('Failed to decode hash ID:', e);
    return null;
  }
}