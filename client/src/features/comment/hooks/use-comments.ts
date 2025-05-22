// コメント関連のフック
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../api/comment-service';
import { useToast } from '@/hooks/use-toast';

export function useComments(slideId: number) {
  return useQuery({
    queryKey: ['comments', slideId],
    queryFn: () => commentService.getBySlideId(slideId),
    enabled: !!slideId,
  });
}

export function useCommentActions(slideId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createComment = useMutation({
    mutationFn: commentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', slideId] });
      toast({
        title: "コメントを追加しました",
        description: "新しいコメントが正常に追加されました。",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "コメントの追加に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const updateComment = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      commentService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', slideId] });
      toast({
        title: "コメントを更新しました",
        description: "コメントが正常に更新されました。",
      });
    },
  });

  const deleteComment = useMutation({
    mutationFn: commentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', slideId] });
      toast({
        title: "コメントを削除しました",
        description: "コメントが正常に削除されました。",
      });
    },
  });

  const resolveComment = useMutation({
    mutationFn: commentService.resolve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', slideId] });
      toast({
        title: "コメントを解決済みにしました",
        description: "コメントが解決済みとしてマークされました。",
      });
    },
  });

  return {
    createComment,
    updateComment,
    deleteComment,
    resolveComment,
  };
}

export function useCommentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState('');

  const resetForm = () => {
    setContent('');
    setIsSubmitting(false);
  };

  const handleSubmit = async (
    slideId: number,
    onSubmit: (data: any) => Promise<void>
  ) => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        slideId,
        message: content.trim(),
        userId: null, // 認証システムから取得する必要がある
      });
      resetForm();
    } catch (error) {
      console.error('Comment submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    content,
    setContent,
    isSubmitting,
    handleSubmit,
    resetForm,
  };
}