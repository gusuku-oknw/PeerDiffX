import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function DummySlide() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl aspect-[16/9] overflow-hidden">
        <CardContent 
          className="p-6 relative w-full h-full flex flex-col items-center justify-center"
          style={{ backgroundColor: '#ffffff' }}
        >
          <h1 className="text-3xl font-bold mb-4">テストプレゼンテーション</h1>
          <p className="text-xl mb-8">共有スナップショット</p>
          <div className="text-gray-600 text-center">
            <p>このスライドはスナップショット機能のデモです。</p>
            <p className="mt-2">リンクを共有して他のユーザーとプレゼンテーションを共有できます。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}