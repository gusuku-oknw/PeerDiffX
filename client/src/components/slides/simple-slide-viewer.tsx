import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface SimpleSlideViewerProps {
  slide: any;
}

export function SimpleSlideViewer({ slide }: SimpleSlideViewerProps) {
  if (!slide) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">スライドデータがありません</p>
      </div>
    );
  }

  const { content } = slide;
  const { elements = [], background = '#ffffff' } = content || {};

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl aspect-[16/9] overflow-hidden">
        <CardContent 
          className="p-0 relative w-full h-full"
          style={{ backgroundColor: background }}
        >
          {elements.map((element: any) => {
            if (element.type === 'text') {
              return (
                <div
                  key={element.id}
                  className="absolute"
                  style={{
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    width: `${element.width}px`,
                    height: `${element.height}px`,
                    color: element.style?.color || '#000000',
                    fontSize: `${element.style?.fontSize || 16}px`,
                    fontWeight: element.style?.fontWeight || 'normal',
                  }}
                >
                  {element.content}
                </div>
              );
            }
            
            // 他の要素タイプ（画像、図形など）のレンダリングは省略

            return null;
          })}
        </CardContent>
      </Card>
    </div>
  );
}