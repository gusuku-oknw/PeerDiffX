# PeerDiffX コードガイド

## フロントエンド

### データ取得パターン
フロントエンドでのデータ取得は、`@tanstack/react-query`を使用して一貫したパターンで行います：

```tsx
// カスタムフック例（コミット取得）
export function useCommits(branchId?: number) {
  return useQuery<Commit[]>({ 
    queryKey: [`/api/branches/${branchId}/commits`],
    enabled: !!branchId,
    queryFn: async () => {
      // 必要に応じてカスタム取得ロジック
      const response = await fetch(`/api/branches/${branchId}/commits`, {
        headers: {
          'Cache-Control': 'no-cache' // キャッシュバイパス対策
        }
      });
      
      if (!response.ok) {
        // エラーハンドリング
      }
      
      return await response.json();
    },
  });
}
```

### コンポーネント設計
コンポーネントは以下のパターンに従って実装します：

1. フックをコンポーネント上部で宣言
2. イベントハンドラ関数を定義
3. 派生状態を計算
4. 条件分岐によるレンダリング（ローディング、エラー、メインコンテンツ）

```tsx
export default function ComponentName() {
  // 1. フック宣言
  const [state, setState] = useState(initialValue);
  const { data, isLoading } = useQuery(...);
  
  // 2. イベントハンドラ
  const handleEvent = () => {
    // 処理
  };
  
  // 3. 派生状態
  const derivedValue = useMemo(() => {
    if (data) {
      return data.map(item => ...);
    }
    return [];
  }, [data]);
  
  // 4. 条件分岐レンダリング
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!data) {
    return <EmptyState />;
  }
  
  return (
    <div>
      {/* メインコンテンツ */}
    </div>
  );
}
```

### エラー処理
エラー処理は以下のパターンで行います：

```tsx
try {
  // 処理
} catch (error) {
  console.error("エラー:", error);
  // ユーザーへの通知
  toast({
    title: "エラーが発生しました",
    description: error instanceof Error ? error.message : "不明なエラー",
    variant: "destructive"
  });
}
```

## バックエンド

### API エンドポイント設計
APIエンドポイントは以下のパターンで実装します：

```typescript
apiRouter.get("/api/resource/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const result = await storage.getResource(id);
    
    if (!result) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    res.json(result);
  } catch (error) {
    console.error("Error fetching resource:", error);
    res.status(500).json({ 
      message: "An error occurred while fetching the resource" 
    });
  }
});
```

### ストレージインターフェース
すべてのデータアクセスは`storage.ts`で定義されたインターフェースを通じて行います：

```typescript
export interface IStorage {
  // メソッド定義
  getResource(id: number): Promise<Resource | undefined>;
  createResource(data: InsertResource): Promise<Resource>;
  // ...
}
```

## エラー対応ガイド

### データロードの問題

#### 問題: プレゼンテーションがロードされない
- **原因**: デフォルトブランチがない
- **解決策**: 自動的にデフォルトブランチを作成する

```tsx
// ブランチ自動作成
if (isAutoRefreshEnabled && presentation && !defaultBranch) {
  const createDefaultBranch = async () => {
    try {
      const response = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "main",
          description: "Default branch",
          presentationId: presentation.id,
          isDefault: true
        })
      });
      
      if (response.ok) {
        console.log("デフォルトブランチを作成しました");
      }
    } catch (error) {
      console.error("ブランチ作成エラー:", error);
    }
  };
  
  createDefaultBranch();
}
```

#### 問題: スライドがロードされない
- **原因**: コミットは存在するがスライドがない
- **解決策**: スライドを自動的に作成する

```tsx
// スライド自動作成
if (latestCommit && (!slides || slides.length === 0)) {
  const createSlide = async () => {
    try {
      await fetch("/api/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commitId: latestCommit.id,
          slideNumber: 1,
          title: "テストスライド",
          content: "これはテストスライドです。",
          xmlContent: "<p:sld></p:sld>"
        })
      });
      console.log("スライドを作成しました");
    } catch (error) {
      console.error("スライド作成エラー:", error);
    }
  };
  
  createSlide();
}
```

### Reactフックの問題

#### 問題: フックの順序エラー
- **原因**: 条件分岐内でのフック呼び出し
- **解決策**: すべてのフックをコンポーネントのトップレベルに移動

```tsx
// 正しいパターン
const [state1, setState1] = useState(null);
const [state2, setState2] = useState(null);
const { data } = useQuery(...);

useEffect(() => {
  // 条件分岐はフック内で行う
  if (condition) {
    // 処理
  }
}, [dependency]);

// 条件付きレンダリングはreturn内で
return condition ? <ComponentA /> : <ComponentB />;
```

## 命名規則

### ファイル名
- **コンポーネント**: PascalCase (`Button.tsx`, `UserProfile.tsx`)
- **ユーティリティ/フック**: camelCase (`useAuth.ts`, `formatDate.ts`)
- **定数/設定**: kebab-case (`api-endpoints.ts`, `color-scheme.ts`)

### 変数/関数名
- **変数**: camelCase (`userId`, `presentationData`)
- **関数**: camelCase、動詞で開始 (`handleClick`, `fetchData`)
- **フック**: `use`で開始 (`useSlides`, `usePresentation`)
- **コンポーネント**: PascalCase (`Button`, `Sidebar`)

### CSS クラス
- TailwindCSS クラス名の順序:
  1. レイアウト (`flex`, `grid`, etc.)
  2. 寸法 (`w-`, `h-`, etc.)
  3. スペーシング (`p-`, `m-`, `gap-`, etc.)
  4. 装飾 (`bg-`, `text-`, `border-`, etc.)
  5. 状態 (`hover:`, `focus:`, etc.)

## パフォーマンス最適化

### メモ化
パフォーマンスが重要なコンポーネントでは、以下のパターンを使用します：

```tsx
// 派生データのメモ化
const processedData = useMemo(() => {
  return expensiveComputation(data);
}, [data]);

// コールバックのメモ化
const handleClick = useCallback(() => {
  // 処理
}, [dependencies]);

// コンポーネントのメモ化
const MemoizedComponent = memo(MyComponent);
```

### データ取得の最適化
- **並列取得**: 複数のデータを同時に取得
- **ページネーション**: 大量のデータを分割取得
- **キャッシュ制御**: 適切なstaleTimeとcacheTimeの設定

```tsx
// 並列取得の例
const { data: users } = useQuery({ queryKey: ['users'], ... });
const { data: posts } = useQuery({ queryKey: ['posts'], ... });

// ページネーションの例
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['items'],
  queryFn: ({ pageParam = 1 }) => fetchPage(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

## この文書について
このコードガイドは、PeerDiffXプロジェクトの開発を一貫性のあるものにするために作成されました。新機能の追加やバグ修正を行う際には、このガイドのパターンと規則に従ってください。

*最終更新: 2025年5月21日*