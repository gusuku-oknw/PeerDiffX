import React from 'react';
import { Link } from 'wouter';
import { FaLayerGroup } from 'react-icons/fa';
import { Home, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header({ title }: { title: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b p-3 flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/" className="mr-4 flex items-center">
          <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center text-white mr-2">
            <FaLayerGroup className="w-4 h-4" />
          </div>
          <span className="font-semibold text-gray-800 dark:text-gray-200">PeerDiffX</span>
        </Link>
        <div className="text-sm text-gray-600 dark:text-gray-400 ml-2">{title}</div>
      </div>
      <div className="flex space-x-2">
        <Button asChild size="sm" variant="ghost">
          <Link href="/">
            <Home className="mr-1.5 h-3.5 w-3.5" /> ホーム
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/settings">
            <Settings className="mr-1.5 h-3.5 w-3.5" /> 設定
          </Link>
        </Button>
      </div>
    </div>
  );
}
