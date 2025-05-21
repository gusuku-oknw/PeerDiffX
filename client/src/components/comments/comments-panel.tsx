import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Comment {
  id: number;
  slideId: number;
  userId: number | null;
  parentId: number | null;
  message: string;
  createdAt: string;
  updatedAt: string;
  resolved: boolean;
  user?: {
    username: string;
  };
}

interface CommentsPanelProps {
  slideId: number;
}

export function CommentsPanel({ slideId }: CommentsPanelProps) {
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();
  
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['/api/slides', slideId, 'comments'],
    queryFn: async () => {
      const response = await fetch(`/api/slides/${slideId}/comments`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      return response.json();
    },
    enabled: !!slideId
  });

  const createCommentMutation = useMutation({
    mutationFn: async (comment: { slideId: number; message: string; userId: number | null }) => {
      return apiRequest('/api/comments', 'POST', comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/slides', slideId, 'comments'] });
      setNewComment("");
    }
  });

  const resolveCommentMutation = useMutation({
    mutationFn: async ({ id, resolved }: { id: number; resolved: boolean }) => {
      return apiRequest(`/api/comments/${id}`, 'PATCH', { resolved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/slides', slideId, 'comments'] });
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/comments/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/slides', slideId, 'comments'] });
    }
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    
    createCommentMutation.mutate({
      slideId,
      message: newComment,
      userId: 1 // Demo user ID - in a real app, this would come from auth context
    });
  };

  const handleResolve = (id: number, currentResolved: boolean) => {
    resolveCommentMutation.mutate({ id, resolved: !currentResolved });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("このコメントを削除してもよろしいですか？")) {
      deleteCommentMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="p-4">コメントを読み込み中...</div>;
  }

  return (
    <div className="comments-panel flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            このスライドにはまだコメントがありません
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment: Comment) => (
              <CommentCard 
                key={comment.id} 
                comment={comment} 
                onResolve={handleResolve}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-2 border-t">
        <Textarea
          placeholder="コメントを追加..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-2 min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={createCommentMutation.isPending || !newComment.trim()}
          >
            {createCommentMutation.isPending ? "送信中..." : "コメントを送信"}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface CommentCardProps {
  comment: Comment;
  onResolve: (id: number, resolved: boolean) => void;
  onDelete: (id: number) => void;
}

function CommentCard({ comment, onResolve, onDelete }: CommentCardProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const queryClient = useQueryClient();

  const { data: replies = [], isLoading } = useQuery({
    queryKey: ['/api/comments', comment.id, 'replies'],
    queryFn: async () => {
      const response = await fetch(`/api/comments/${comment.id}/replies`);
      if (!response.ok) {
        throw new Error("Failed to fetch replies");
      }
      return response.json();
    },
    enabled: showReplies
  });

  const createReplyMutation = useMutation({
    mutationFn: async (reply: { slideId: number; parentId: number; message: string; userId: number | null }) => {
      return apiRequest('/api/comments', 'POST', reply);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments', comment.id, 'replies'] });
      setReplyText("");
    }
  });

  const handleReply = () => {
    if (!replyText.trim()) return;
    
    createReplyMutation.mutate({
      slideId: comment.slideId,
      parentId: comment.id,
      message: replyText,
      userId: 1 // Demo user ID
    });
  };

  return (
    <Card className={comment.resolved ? "opacity-60" : ""}>
      <CardHeader className="p-3 pb-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback>{comment.user?.username?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-sm">
              {comment.user?.username || "ユーザー"} 
              <span className="text-xs font-normal text-muted-foreground ml-2">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </CardTitle>
          </div>
          
          <div className="flex gap-1">
            {comment.resolved && <Badge variant="outline">解決済み</Badge>}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onResolve(comment.id, comment.resolved)}
              className="h-6 px-2"
            >
              {comment.resolved ? "再開" : "解決"}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(comment.id)}
              className="h-6 px-2 text-destructive"
            >
              削除
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 pt-1">
        <p className="whitespace-pre-wrap">{comment.message}</p>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex-col items-start">
        <div className="w-full flex justify-between">
          <Button 
            variant="link" 
            size="sm" 
            className="h-6 p-0"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? "返信を隠す" : "返信を表示"}
          </Button>
          
          <Button 
            variant="link" 
            size="sm" 
            className="h-6 p-0"
            onClick={() => setShowReplies(true)}
          >
            返信する
          </Button>
        </div>
        
        {showReplies && (
          <div className="mt-2 w-full">
            <Separator className="my-2" />
            
            {isLoading ? (
              <div className="text-center py-2 text-xs text-muted-foreground">
                返信を読み込み中...
              </div>
            ) : replies.length > 0 ? (
              <div className="space-y-3 ml-4 pl-2 border-l">
                {replies.map((reply: Comment) => (
                  <div key={reply.id} className="text-sm">
                    <div className="flex items-center gap-1">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback>{reply.user?.username?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{reply.user?.username || "ユーザー"}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{reply.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-muted-foreground">
                返信はまだありません
              </div>
            )}
            
            <div className="mt-3">
              <Textarea
                placeholder="返信を入力..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="text-sm min-h-[80px]"
              />
              <div className="flex justify-end mt-2">
                <Button 
                  size="sm"
                  onClick={handleReply} 
                  disabled={createReplyMutation.isPending || !replyText.trim()}
                >
                  {createReplyMutation.isPending ? "送信中..." : "返信"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}