// プレゼンテーション関連のフック
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { presentationService } from '../api/presentation-service';
import { useToast } from '@/hooks/use-toast';

export function usePresentations() {
  return useQuery({
    queryKey: ['presentations'],
    queryFn: presentationService.getAll,
  });
}

export function usePresentation(id: number) {
  return useQuery({
    queryKey: ['presentation', id],
    queryFn: () => presentationService.getById(id),
    enabled: !!id,
  });
}

export function usePresentationActions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPresentation = useMutation({
    mutationFn: presentationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentations'] });
      toast({
        title: "プレゼンテーションを作成しました",
        description: "新しいプレゼンテーションが正常に作成されました。",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "プレゼンテーションの作成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const updatePresentation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      presentationService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentations'] });
      queryClient.invalidateQueries({ queryKey: ['presentation'] });
      toast({
        title: "プレゼンテーションを更新しました",
        description: "プレゼンテーションが正常に更新されました。",
      });
    },
  });

  const deletePresentation = useMutation({
    mutationFn: presentationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentations'] });
      toast({
        title: "プレゼンテーションを削除しました",
        description: "プレゼンテーションが正常に削除されました。",
      });
    },
  });

  const uploadPptx = useMutation({
    mutationFn: presentationService.uploadPptx,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentations'] });
      toast({
        title: "PPTXファイルをアップロードしました",
        description: "ファイルが正常にアップロードされ、プレゼンテーションが作成されました。",
      });
    },
    onError: () => {
      toast({
        title: "アップロードエラー",
        description: "PPTXファイルのアップロードに失敗しました。",
        variant: "destructive",
      });
    },
  });

  return {
    createPresentation,
    updatePresentation,
    deletePresentation,
    uploadPptx,
  };
}

export function usePresentationLock(presentationId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: lockStatus } = useQuery({
    queryKey: ['presentation-lock', presentationId],
    queryFn: () => presentationService.getLockStatus(presentationId),
    enabled: !!presentationId,
    refetchInterval: 5000, // 5秒ごとにロック状態をチェック
  });

  const lockPresentation = useMutation({
    mutationFn: () => presentationService.lock(presentationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentation-lock', presentationId] });
      toast({
        title: "プレゼンテーションをロックしました",
        description: "他のユーザーからの編集をブロックしました。",
      });
    },
  });

  const unlockPresentation = useMutation({
    mutationFn: () => presentationService.unlock(presentationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentation-lock', presentationId] });
      toast({
        title: "プレゼンテーションのロックを解除しました",
        description: "他のユーザーが編集できるようになりました。",
      });
    },
  });

  return {
    lockStatus,
    lockPresentation,
    unlockPresentation,
  };
}