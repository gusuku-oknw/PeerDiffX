// プレゼンテーションカードコンポーネント
import React from 'react';
import { Link } from 'wouter';
import { Button, Card } from '@/shared/ui';
import { FaEdit, FaTrash, FaEye, FaLock } from 'react-icons/fa';
import { encodeId } from '@/lib/hash-utils';
import type { Presentation } from '@shared/schema';

interface PresentationCardProps {
  presentation: Presentation;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

export function PresentationCard({ 
  presentation, 
  onEdit, 
  onDelete, 
  showActions = true 
}: PresentationCardProps) {
  const encodedId = encodeId(presentation.id);

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{presentation.name}</h3>
          {presentation.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              {presentation.description}
            </p>
          )}
          <div className="text-xs text-gray-500 space-y-1">
            <p>作成日: {new Date(presentation.createdAt).toLocaleDateString('ja-JP')}</p>
            <p>更新日: {new Date(presentation.updatedAt).toLocaleDateString('ja-JP')}</p>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2 ml-4">
            <Button asChild variant="outline" size="sm">
              <Link href={`/public-preview/${encodedId}`}>
                <FaEye className="h-3.5 w-3.5 mr-1" />
                開く
              </Link>
            </Button>
            
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(presentation.id)}
              >
                <FaEdit className="h-3.5 w-3.5" />
              </Button>
            )}
            
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(presentation.id)}
                className="text-red-600 hover:text-red-700"
              >
                <FaTrash className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-500">利用可能</span>
        </div>
        
        <div className="text-xs text-gray-500">
          ID: {encodedId}
        </div>
      </div>
    </Card>
  );
}

// プレゼンテーション一覧表示コンポーネント
interface PresentationListProps {
  presentations: Presentation[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  loading?: boolean;
}

export function PresentationList({ 
  presentations, 
  onEdit, 
  onDelete, 
  loading = false 
}: PresentationListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (presentations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          <FaEye className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>プレゼンテーションがありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {presentations.map((presentation) => (
        <PresentationCard
          key={presentation.id}
          presentation={presentation}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}