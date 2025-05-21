import React from 'react';

/**
 * 基本的な2カラムレイアウトのみのデモページ
 */
export default function DemoSimplePage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* ヘッダー */}
      <div style={{
        height: '60px',
        backgroundColor: '#3b82f6',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px'
      }}>
        <h1 style={{ fontSize: '18px', fontWeight: 500 }}>最小限デモページ</h1>
      </div>

      {/* メインコンテンツ */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* 左カラム */}
        <div style={{
          width: '200px',
          backgroundColor: '#f3f4f6',
          padding: '16px',
          borderRight: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>左カラム</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map(num => (
              <div key={num} style={{
                padding: '8px',
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                fontSize: '12px'
              }}>
                項目 {num}
              </div>
            ))}
          </div>
        </div>
        
        {/* 右カラム（コンテンツエリア） */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '800px',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>メインコンテンツ</h2>
            <p>このページは右側の余白問題を診断するためのシンプルなデモです。</p>
            <p>インラインスタイルのみを使用し、余分なCSSクラスやコンポーネントを使っていません。</p>
          </div>
        </div>
      </div>
    </div>
  );
}