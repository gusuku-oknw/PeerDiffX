# PeerDiffX プロジェクト概要

## プロジェクト説明
PeerDiffXは、PowerPointプレゼンテーション用のGitライクなバージョン管理システムです。プレゼンテーションのスライドレベルでの変更追跡、ブランチ管理、差分表示などの機能を提供します。

## 主要機能
- プレゼンテーションのアップロードとバージョン管理
- スライドレベルでの変更追跡
- ブランチによる異なるバージョンの管理
- コミット履歴の表示
- XMLレベルでの差分表示
- スナップショット共有機能
- 協調編集サポート

## 技術スタック
- **フロントエンド**: React, TypeScript, TailwindCSS, shadcn/ui
- **バックエンド**: Express.js
- **データベース**: PostgreSQL with Drizzle ORM
- **認証**: Replit Auth
- **ファイル処理**: XML, JSZip

## プロジェクト構造

### データベースモデル
`shared/schema.ts`で定義されているモデルの概要：
- **users**: ユーザー情報
- **presentations**: プレゼンテーション情報
- **branches**: プレゼンテーションのブランチ
- **commits**: ブランチにおけるコミット
- **slides**: コミットに含まれるスライド
- **diffs**: コミット間の差分
- **snapshots**: 共有用スナップショット
- **comments**: スライドへのコメント
- **sessions**: ユーザーセッション

### 主要なディレクトリ構造
- `/client/src/`: フロントエンドコード
  - `/components/`: UI コンポーネント
  - `/hooks/`: カスタムReactフック
  - `/lib/`: ユーティリティ関数
  - `/pages/`: ページコンポーネント
- `/server/`: バックエンドコード
  - `/routes/`: API エンドポイント
  - `/services/`: ビジネスロジック
  - `/middleware/`: ミドルウェア
  - `/utils/`: ユーティリティ関数
- `/shared/`: 共有コード (スキーマ定義など)

### 主要なフロントエンドファイル
- `client/src/App.tsx`: メインコンポーネントとルーティング
- `client/src/pages/home.tsx`: ホームページ
- `client/src/pages/preview.tsx`: プレゼンテーションプレビュー
- `client/src/pages/diff-view.tsx`: 差分表示
- `client/src/pages/history.tsx`: コミット履歴
- `client/src/pages/branches.tsx`: ブランチ管理

### 主要なバックエンドファイル
- `server/index.ts`: メインサーバーファイル
- `server/routes.ts`: API ルート定義
- `server/storage.ts`: ストレージインターフェイス
- `server/db.ts`: データベース接続

### APIエンドポイント
- `/api/presentations`: プレゼンテーション関連
- `/api/branches`: ブランチ関連
- `/api/commits`: コミット関連
- `/api/slides`: スライド関連
- `/api/diffs`: 差分関連
- `/api/snapshots`: スナップショット関連
- `/api/comments`: コメント関連

## データフロー
1. ユーザーがプレゼンテーションをアップロード
2. バックエンドでPPTXファイルを解析し、スライドに分解
3. データベースに保存（プレゼンテーション→ブランチ→コミット→スライド）
4. フロントエンドで取得・表示（プレビュー、履歴、差分表示など）

## 最近行われた主要な修正
- Reactフックの順序問題を修正
- データ取得処理を強化してキャッシュバイパス対策を実装
- ブランチやコミットが見つからない場合の自動補完機能の追加
- スライドがない場合の自動作成機能の追加
- クエリパラメータからパスパラメータへURLルーティングの変更
- プレゼンテーション初期化画面の最適化

## 今後の改善点
- パフォーマンスの最適化
- UIの国際化（多言語対応）
- ユーザー権限管理の強化
- リアルタイム協調編集機能
- マークダウン変換機能の強化

## 既知の問題
- 特定のPPTXファイルでのXML解析エラー
- LSP（Language Server Protocol）型チェックエラー（実行には影響なし）
- 大きなプレゼンテーションでのパフォーマンス低下

*最終更新: 2025年5月21日*