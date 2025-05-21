import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Branch } from "@shared/schema";
import { fetchBranches } from "@/features/branches/branch-manager";
import { GitBranch, GitMerge, Plus } from "lucide-react";

interface BranchSelectorProps {
  presentationId: number;
  currentBranchId: number | null;
  onBranchChange: (branchId: number) => void;
  onCreateBranch: (name: string, description: string, baseBranchId: number) => Promise<void>;
  onMergeBranch?: (sourceBranchId: number, targetBranchId: number, commitMessage: string) => Promise<void>;
}

export default function BranchSelector({
  presentationId,
  currentBranchId,
  onBranchChange,
  onCreateBranch,
  onMergeBranch
}: BranchSelectorProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  
  // 新しいブランチ作成用の状態
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchDescription, setNewBranchDescription] = useState("");
  
  // マージ用の状態
  const [sourceBranchId, setSourceBranchId] = useState<number | null>(null);
  const [targetBranchId, setTargetBranchId] = useState<number | null>(null);
  const [mergeCommitMessage, setMergeCommitMessage] = useState("Merge branch");

  useEffect(() => {
    if (presentationId) {
      loadBranches();
    }
  }, [presentationId]);

  useEffect(() => {
    if (branches.length > 0 && currentBranchId) {
      const branch = branches.find(b => b.id === currentBranchId);
      if (branch) {
        setCurrentBranch(branch);
      }
    }
  }, [branches, currentBranchId]);

  async function loadBranches() {
    setLoading(true);
    try {
      const branchData = await fetchBranches(presentationId);
      setBranches(branchData);
      
      if (branchData.length > 0) {
        const defaultBranch = branchData.find(b => b.isDefault) || branchData[0];
        
        if (!currentBranchId) {
          onBranchChange(defaultBranch.id);
        }
      }
    } catch (error) {
      console.error("ブランチ読み込みエラー:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) return;
    
    try {
      await onCreateBranch(
        newBranchName,
        newBranchDescription,
        currentBranchId || (branches[0]?.id || 0)
      );
      
      // ダイアログを閉じてフォームをリセット
      setCreateDialogOpen(false);
      setNewBranchName("");
      setNewBranchDescription("");
      
      // ブランチリストを更新
      await loadBranches();
    } catch (error) {
      console.error("ブランチ作成エラー:", error);
    }
  };

  const handleMergeBranch = async () => {
    if (!sourceBranchId || !targetBranchId || !onMergeBranch) return;
    
    try {
      await onMergeBranch(sourceBranchId, targetBranchId, mergeCommitMessage);
      
      // ダイアログを閉じてフォームをリセット
      setMergeDialogOpen(false);
      setSourceBranchId(null);
      setTargetBranchId(null);
      setMergeCommitMessage("Merge branch");
      
      // ブランチリストを更新
      await loadBranches();
    } catch (error) {
      console.error("ブランチマージエラー:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              {currentBranch ? currentBranch.name : "ブランチ"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {loading ? (
              <DropdownMenuItem disabled>
                <span className="animate-pulse">読み込み中...</span>
              </DropdownMenuItem>
            ) : (
              <>
                {branches.map(branch => (
                  <DropdownMenuItem 
                    key={branch.id}
                    onClick={() => onBranchChange(branch.id)}
                    className={branch.id === currentBranchId ? "bg-accent" : ""}
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    {branch.name}
                    {branch.isDefault && <span className="ml-2 text-xs opacity-70">(default)</span>}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Plus className="h-4 w-4 mr-2" />
                      新しいブランチ
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>新しいブランチを作成</DialogTitle>
                      <DialogDescription>
                        現在のブランチから新しいブランチを作成します。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="branch-name" className="text-right">
                          ブランチ名
                        </Label>
                        <Input
                          id="branch-name"
                          value={newBranchName}
                          onChange={(e) => setNewBranchName(e.target.value)}
                          placeholder="feature/new-design"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="branch-description" className="text-right">
                          説明
                        </Label>
                        <Input
                          id="branch-description"
                          value={newBranchDescription}
                          onChange={(e) => setNewBranchDescription(e.target.value)}
                          placeholder="新しいデザインの試作"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                          ベース
                        </Label>
                        <div className="col-span-3 text-sm">
                          {currentBranch ? currentBranch.name : "選択されたブランチ"}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateBranch}>
                        ブランチを作成
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {onMergeBranch && (
                  <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <GitMerge className="h-4 w-4 mr-2" />
                        ブランチをマージ
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>ブランチをマージ</DialogTitle>
                        <DialogDescription>
                          他のブランチの内容を現在のブランチにマージします。
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="source-branch" className="text-right">
                            マージ元
                          </Label>
                          <select
                            id="source-branch"
                            value={sourceBranchId || ""}
                            onChange={(e) => setSourceBranchId(parseInt(e.target.value))}
                            className="col-span-3 p-2 border rounded"
                          >
                            <option value="">選択してください</option>
                            {branches
                              .filter(b => b.id !== currentBranchId)
                              .map(branch => (
                                <option key={branch.id} value={branch.id}>
                                  {branch.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="target-branch" className="text-right">
                            マージ先
                          </Label>
                          <select
                            id="target-branch"
                            value={targetBranchId || ""}
                            onChange={(e) => setTargetBranchId(parseInt(e.target.value))}
                            className="col-span-3 p-2 border rounded"
                          >
                            <option value="">選択してください</option>
                            {branches.map(branch => (
                              <option 
                                key={branch.id} 
                                value={branch.id} 
                                selected={branch.id === currentBranchId}
                              >
                                {branch.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="commit-message" className="text-right">
                            コミットメッセージ
                          </Label>
                          <Input
                            id="commit-message"
                            value={mergeCommitMessage}
                            onChange={(e) => setMergeCommitMessage(e.target.value)}
                            placeholder="Merge branch 'feature/new-design' into 'main'"
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleMergeBranch}>
                          マージを実行
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}