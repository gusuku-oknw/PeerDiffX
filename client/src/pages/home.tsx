import { useState } from "react";
import { Link } from "wouter";
import { usePresentations } from "@/hooks/use-pptx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaUpload, FaFilePowerpoint, FaPlus, FaClock, FaEllipsisV, FaCog, FaTrash } from "react-icons/fa";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { encodeId } from "@/lib/hash-utils";

export default function Home() {
  const { data: presentations, isLoading, isError } = usePresentations();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newPresentationDialog, setNewPresentationDialog] = useState(false);
  const [newPresentationName, setNewPresentationName] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<any>(null);
  const [editPresentationName, setEditPresentationName] = useState("");
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Create a FormData object
    const formData = new FormData();
    formData.append("file", file);
    
    // Upload the file
    fetch("/api/presentations/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      })
      .then(data => {
        queryClient.invalidateQueries({ queryKey: ["/api/presentations"] });
        setUploadDialogOpen(false);
        toast({
          title: "Upload successful",
          description: "Your presentation has been uploaded",
        });
      })
      .catch(err => {
        console.error("Error uploading file:", err);
        toast({
          title: "Upload failed",
          description: "There was an error uploading your presentation",
          variant: "destructive",
        });
      });
  };

  const handleCreatePresentation = async () => {
    if (!newPresentationName.trim()) {
      toast({
        title: "名前が必要です",
        description: "プレゼンテーションの名前を入力してください",
        variant: "destructive",
      });
      return;
    }

    // 進捗ID (一意の識別子)
    const progressId = Date.now().toString();
    
    // 初期進捗表示
    toast({
      title: "初期化中...",
      description: "プレゼンテーションの作成を準備しています",
    });

    try {
      const fileName = newPresentationName.endsWith('.pptx') 
        ? newPresentationName 
        : `${newPresentationName}.pptx`;
      
      // 段階的な進捗通知
      setTimeout(() => {
        toast({
          title: "プレゼンテーション作成中...",
          description: "メタデータを登録中 (1/4)",
        });
      }, 300);
      
      // プレゼンテーション作成リクエスト
      const response = await apiRequest('POST', '/api/presentations', {
        name: fileName
      });
      
      // 次の進捗通知
      setTimeout(() => {
        toast({
          title: "ブランチ作成中...",
          description: "バージョン管理情報を設定中 (2/4)",
        });
      }, 600);
      
      const newPresentation = await response.json();
      
      // 次の進捗通知
      setTimeout(() => {
        toast({
          title: "コミット作成中...",
          description: "ベースバージョンを準備中 (3/4)",
        });
      }, 900);
      
      // キャッシュを無効化して確実に再取得する
      await queryClient.invalidateQueries({ queryKey: ["/api/presentations"] });
      await queryClient.refetchQueries({ queryKey: ["/api/presentations"] });
      
      // 次の進捗通知
      setTimeout(() => {
        toast({
          title: "スライド初期化中...",
          description: "テンプレートスライドを追加中 (4/4)",
        });
      }, 1200);
      
      setNewPresentationDialog(false);
      setNewPresentationName("");
      
      // 完了トースト
      setTimeout(() => {
        toast({
          title: "作成完了！",
          description: "新しいプレゼンテーションを開きます",
        });
      }, 1500);
      
      // 作成したプレゼンテーションを自動的に開く - 進捗表示のあとに遷移
      setTimeout(() => {
        console.log("リダイレクト先:", `/preview/${newPresentation.id}`);
        window.location.href = `/preview/${newPresentation.id}`;
      }, 1800);
    } catch (error) {
      console.error("Error creating presentation:", error);
      toast({
        title: "作成に失敗しました",
        description: "プレゼンテーションの作成中にエラーが発生しました",
        variant: "destructive",
      });
    }
  };
  
  const handleEditClick = (presentation: any) => {
    setSelectedPresentation(presentation);
    setEditPresentationName(presentation.name);
    setEditDialogOpen(true);
  };
  
  const handleDeleteClick = (presentation: any) => {
    setSelectedPresentation(presentation);
    setDeleteDialogOpen(true);
  };
  
  const handleUpdatePresentation = async () => {
    if (!editPresentationName.trim() || !selectedPresentation) {
      toast({
        title: "Name required",
        description: "Please enter a name for the presentation",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest('PATCH', `/api/presentations/${selectedPresentation.id}`, {
        name: editPresentationName.endsWith('.pptx') 
          ? editPresentationName 
          : `${editPresentationName}.pptx`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/presentations"] });
      setEditDialogOpen(false);
      setSelectedPresentation(null);
      toast({
        title: "Presentation updated",
        description: "Your presentation has been updated",
      });
    } catch (error) {
      console.error("Error updating presentation:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your presentation",
        variant: "destructive",
      });
    }
  };
  
  const handleDeletePresentation = async () => {
    if (!selectedPresentation) return;
    
    try {
      // Show a loading toast
      toast({
        title: "Deleting presentation...",
        description: "Please wait while we delete your presentation",
      });
      
      // Send the delete request
      const response = await fetch(`/api/presentations/${selectedPresentation.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.status} ${response.statusText}`);
      }
      
      // Force reload data
      await queryClient.invalidateQueries({ queryKey: ["/api/presentations"] });
      setTimeout(() => {
        // Refetch again after a short delay to ensure we get the latest data
        queryClient.invalidateQueries({ queryKey: ["/api/presentations"] });
      }, 500);
      
      setDeleteDialogOpen(false);
      setSelectedPresentation(null);
      
      toast({
        title: "Presentation deleted",
        description: "Your presentation has been deleted successfully",
      });
      
      // Force refresh the page to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error("Error deleting presentation:", error);
      toast({
        title: "Deletion failed",
        description: "There was an error deleting your presentation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Presentations</h1>
        <div className="flex space-x-4">
          <Button onClick={() => setNewPresentationDialog(true)}>
            <FaPlus className="mr-2" />
            New Presentation
          </Button>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <FaUpload className="mr-2" />
            Upload PPTX
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-t-lg"></div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-b-lg border border-t-0 border-gray-200 dark:border-gray-700">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-xl mb-4">Failed to load presentations</div>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/presentations"] })}>
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !isError && presentations?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <FaFilePowerpoint className="text-5xl text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-medium mb-2">No presentations yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
            Upload a PowerPoint file or create a new presentation to get started with version control.
          </p>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => setNewPresentationDialog(true)}>
              <FaPlus className="mr-2" />
              New Presentation
            </Button>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <FaUpload className="mr-2" />
              Upload PPTX
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !isError && presentations && presentations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presentations.map((presentation) => (
            <Card key={presentation.id} className="overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-700 h-48 flex items-center justify-center">
                <FaFilePowerpoint className="text-6xl text-blue-500 dark:text-blue-400" />
              </div>
              <CardHeader>
                <CardTitle className="truncate">
                  {/* Remove .pptx extension if present */}
                  {presentation.name.replace(/\.pptx$/i, '')}
                </CardTitle>
                <CardDescription className="flex items-center">
                  <FaClock className="mr-1" />
                  Updated {formatDate(presentation.updatedAt)}
                </CardDescription>
              </CardHeader>
              <CardFooter className="border-t bg-gray-50 dark:bg-gray-800 p-4 flex justify-between items-center">
                <Link href={`/public-preview/${encodeId(presentation.id)}`}>
                  <Button>Open</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <FaEllipsisV />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditClick(presentation)}>
                      <FaCog className="mr-2" />
                      設定
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(presentation)}>
                      <FaTrash className="mr-2" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload PPTX Presentation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <label className="w-full flex flex-col items-center px-4 py-6 bg-white dark:bg-gray-800 text-blue-500 rounded-lg shadow-lg tracking-wide uppercase border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600">
                <FaUpload className="w-8 h-8" />
                <span className="mt-2 text-base">Select PPTX file</span>
                <input type='file' accept=".pptx" className="hidden" onChange={handleFileUpload} />
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The file will be uploaded and parsed for version control.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Presentation Dialog */}
      <Dialog open={newPresentationDialog} onOpenChange={setNewPresentationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Presentation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Presentation Name</Label>
              <Input
                id="name"
                value={newPresentationName}
                onChange={(e) => setNewPresentationName(e.target.value)}
                placeholder="My Presentation.pptx"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setNewPresentationDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePresentation}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Presentation Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Presentation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Presentation Name</Label>
              <Input
                id="edit-name"
                value={editPresentationName}
                onChange={(e) => setEditPresentationName(e.target.value)}
                placeholder="My Presentation.pptx"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleUpdatePresentation}>
                更新
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>プレゼンテーションを削除</DialogTitle>
            <DialogDescription>
              本当に「{selectedPresentation?.name}」を削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDeletePresentation}>
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
