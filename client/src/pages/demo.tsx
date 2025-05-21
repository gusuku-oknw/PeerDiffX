import React from 'react';

/**
 * 最小限のデモページ
 * 純粋な2カラムレイアウトをテストします
 */
export default function DemoPage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="h-12 bg-blue-500 text-white flex items-center px-4">
        <h1 className="text-base font-medium">シンプルデモページ</h1>
      </div>

      <div className="flex flex-1">
        <div className="w-48 bg-gray-100 border-r p-4">
          <h2 className="text-sm font-medium mb-4">左側のサイドバー</h2>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(num => (
              <div key={num} className="p-2 bg-white rounded shadow text-xs">
                項目 {num}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4 bg-white">
          <div className="w-full max-w-3xl bg-gray-50 border rounded p-8">
            <h2 className="text-xl font-bold mb-4">メインコンテンツ領域</h2>
            <p>これは右側の余白問題をテストするためのシンプルなデモページです。</p>
          </div>
        </div>
      </div>
    </div>
  );
}