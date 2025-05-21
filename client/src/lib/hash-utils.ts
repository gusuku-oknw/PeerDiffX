/**
 * プレゼンテーションIDをハッシュ化する関数
 * URLで直接IDを表示せず、セキュリティを向上させる
 */
export function encodeId(id: number): string {
  // IDのみをエンコードする（一貫性のため）
  const dataToEncode = `${id}`;
  
  // Base64エンコード
  const encodedData = btoa(dataToEncode);
  
  // 識別用プレフィックスを追加
  return `pdx-${encodedData}`;
}

/**
 * ハッシュ化されたURLパラメータからプレゼンテーションIDを復元する関数
 */
export function decodeId(hash: string): number | null {
  try {
    // 直接数値の場合は変換して返す（下位互換性のため）
    if (!isNaN(Number(hash))) {
      return Number(hash);
    }
    
    // pdx- プレフィックスを確認
    if (hash.startsWith('pdx-')) {
      // プレフィックスを削除
      const encodedData = hash.substring(4);
      
      // Base64デコード
      const decodedData = atob(encodedData);
      
      // IDを取得（タイムスタンプ部分は無視）
      const originalId = parseInt(decodedData.split('-')[0], 10);
      
      if (isNaN(originalId)) return null;
      return originalId;
    }
    
    // 古い形式のハッシュを処理（互換性のため）
    const parts = hash.split('-');
    if (parts.length >= 2) {
      // 最後の部分がエンコードされたID
      const encodedData = parts[parts.length - 1];
      
      // デコードして元のIDを取得
      try {
        const decodedData = atob(encodedData);
        const originalId = parseInt(decodedData.split('-')[0], 10);
        
        if (!isNaN(originalId)) return originalId;
      } catch (e) {
        console.log('Failed to decode old hash format');
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to decode hash:', error);
    return null;
  }
}