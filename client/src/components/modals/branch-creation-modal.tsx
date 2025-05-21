import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useBranches } from "@/hooks/use-branches";
import { Branch } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BranchCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  presentationId: number;
  baseBranch: Branch;
}

export default function BranchCreationModal({
  isOpen,
  onClose,
  presentationId,
  baseBranch
}: BranchCreationModalProps) {
  const { toast } = useToast();
  const [branchName, setBranchName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { refetch } = useBranches(presentationId);
  
  const handleSubmit = async () => {
    if (!branchName.trim()) {
      toast({
        title: "Branch name required",
        description: "Please enter a name for the new branch",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiRequest('POST', '/api/branches', {
        name: branchName,
        description,
        presentationId,
        isDefault: false
      });
      
      // Refetch branches to update the list
      await refetch();
      
      toast({
        title: "Branch created",
        description: `Branch "${branchName}" has been created`,
      });
      
      setBranchName("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Error creating branch:", error);
      toast({
        title: "Error creating branch",
        description: "An error occurred while creating the branch",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Branch</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="branchName">Branch Name</Label>
            <Input
              id="branchName"
              placeholder="feature/new-branch-name"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Create From</Label>
            <div className="flex items-center space-x-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
              <div className={`w-4 h-4 rounded-full ${baseBranch.name === 'main' ? 'bg-blue-500' : baseBranch.name.startsWith('feature/') ? 'bg-green-500' : 'bg-purple-500'}`}></div>
              <span>{baseBranch.name} {baseBranch.isDefault && '(current)'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="branchDescription">Description (optional)</Label>
            <Textarea
              id="branchDescription"
              placeholder="Describe the purpose of this branch"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Branch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
