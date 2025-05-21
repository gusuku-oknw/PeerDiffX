import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useBranches } from "@/hooks/use-branches";
import { usePresentation } from "@/hooks/use-pptx";
import BranchCreationModal from "@/components/modals/branch-creation-modal";
import { Branch } from "@shared/schema";
import { FaCodeBranch, FaArrowLeft, FaTags, FaGithub, FaCircle, FaCheck, FaTrash, FaExchangeAlt } from "react-icons/fa";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Branches() {
  const [, params] = useRoute("/branches/:presentationId");
  const presentationId = parseInt(params?.presentationId || "0");
  
  const { data: presentation, isLoading: isLoadingPresentation } = usePresentation(presentationId);
  const { data: branches, isLoading: isLoadingBranches } = useBranches(presentationId);
  
  const [showCreateBranchModal, setShowCreateBranchModal] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [targetBranch, setTargetBranch] = useState<Branch | null>(null);
  
  const { toast } = useToast();
  
  const handleCreateBranch = () => {
    if (!branches || branches.length === 0) return;
    
    // Find default branch to use as base
    const defaultBranch = branches.find(branch => branch.isDefault) || branches[0];
    setSelectedBranch(defaultBranch);
    setShowCreateBranchModal(true);
  };
  
  const handleOpenMergeDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    
    // Find default branch as target
    if (branches) {
      const defaultBranch = branches.find(b => b.isDefault && b.id !== branch.id);
      if (defaultBranch) {
        setTargetBranch(defaultBranch);
      } else {
        // If no default branch or if selected branch is default, pick the first other branch
        const otherBranch = branches.find(b => b.id !== branch.id);
        setTargetBranch(otherBranch || null);
      }
    }
    
    setShowMergeDialog(true);
  };
  
  const handleOpenDeleteAlert = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowDeleteAlert(true);
  };
  
  const handleSetDefaultBranch = async (branch: Branch) => {
    try {
      await apiRequest('PATCH', `/api/branches/${branch.id}`, {
        isDefault: true
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/presentations/${presentationId}/branches`] });
      
      toast({
        title: "Default branch updated",
        description: `${branch.name} is now the default branch`,
      });
    } catch (error) {
      console.error("Error setting default branch:", error);
      toast({
        title: "Failed to update default branch",
        description: "An error occurred while setting the default branch",
        variant: "destructive"
      });
    }
  };
  
  const handleMergeBranch = async () => {
    if (!selectedBranch || !targetBranch) return;
    
    // In a real app, would call API to merge the branches
    // This is a simplified mock implementation
    try {
      toast({
        title: "Branches merged",
        description: `${selectedBranch.name} has been merged into ${targetBranch.name}`,
      });
      
      setShowMergeDialog(false);
    } catch (error) {
      console.error("Error merging branches:", error);
      toast({
        title: "Failed to merge branches",
        description: "An error occurred while merging the branches",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteBranch = async () => {
    if (!selectedBranch) return;
    
    try {
      await apiRequest('DELETE', `/api/branches/${selectedBranch.id}`, undefined);
      
      queryClient.invalidateQueries({ queryKey: [`/api/presentations/${presentationId}/branches`] });
      
      toast({
        title: "Branch deleted",
        description: `${selectedBranch.name} has been deleted`,
      });
      
      setShowDeleteAlert(false);
    } catch (error) {
      console.error("Error deleting branch:", error);
      toast({
        title: "Failed to delete branch",
        description: "An error occurred while deleting the branch",
        variant: "destructive"
      });
    }
  };
  
  const getBranchColor = (branch: Branch) => {
    if (branch.name === 'main') return 'bg-blue-500';
    if (branch.name.startsWith('feature/')) return 'bg-green-500';
    if (branch.name.startsWith('design/')) return 'bg-purple-500';
    return 'bg-gray-500';
  };
  
  if (isLoadingPresentation || isLoadingBranches) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!presentation) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Presentation Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The specified presentation could not be found.
              </p>
              <Link href="/">
                <Button>Return to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/">
          <Button variant="outline" className="mb-4">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Branch Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Manage branches for <span className="font-medium">{presentation.name}</span>
        </p>
        <Button onClick={handleCreateBranch}>
          <FaCodeBranch className="mr-2" />
          Create New Branch
        </Button>
      </div>
      
      {!branches || branches.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <FaCodeBranch className="mx-auto text-5xl text-gray-400 dark:text-gray-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Branches Available</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This presentation doesn't have any branches yet.
              </p>
              <Button onClick={handleCreateBranch}>Create First Branch</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {branches.map((branch) => (
            <Card key={branch.id} className={branch.isDefault ? 'border-blue-500 dark:border-blue-400' : ''}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${getBranchColor(branch)} mr-3 flex-shrink-0`}></div>
                    <div>
                      <CardTitle className="text-xl">{branch.name}</CardTitle>
                      <CardDescription>
                        {branch.description || 'No description provided'}
                      </CardDescription>
                    </div>
                  </div>
                  {branch.isDefault && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded flex items-center">
                      <FaCheck className="mr-1" />
                      Default
                    </span>
                  )}
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <FaTags className="mr-2" />
                  <span>Created on {new Date(branch.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <FaGithub className="mr-2" />
                  <span>Last updated {new Date(branch.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <Link href={`/history/${branch.id}`}>
                  <Button variant="outline" size="sm">View History</Button>
                </Link>
                
                {!branch.isDefault && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSetDefaultBranch(branch)}
                  >
                    Set as Default
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenMergeDialog(branch)}
                >
                  <FaExchangeAlt className="mr-2" />
                  Merge
                </Button>
                
                {!branch.isDefault && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenDeleteAlert(branch)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <FaTrash className="mr-2" />
                    Delete
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create Branch Modal */}
      {selectedBranch && (
        <BranchCreationModal 
          isOpen={showCreateBranchModal}
          onClose={() => setShowCreateBranchModal(false)}
          presentationId={presentationId}
          baseBranch={selectedBranch}
        />
      )}
      
      {/* Merge Branch Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge Branch</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-4">
              Merge changes from <span className="font-medium">{selectedBranch?.name}</span> into another branch.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Source Branch</label>
                <div className="flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
                  <div className={`w-4 h-4 rounded-full ${selectedBranch ? getBranchColor(selectedBranch) : 'bg-gray-500'} mr-2`}></div>
                  <span>{selectedBranch?.name}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Target Branch</label>
                <select 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  value={targetBranch?.id || ""}
                  onChange={(e) => {
                    const selected = branches?.find(b => b.id === parseInt(e.target.value));
                    if (selected) setTargetBranch(selected);
                  }}
                >
                  {branches?.filter(b => b.id !== selectedBranch?.id).map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} {branch.isDefault ? '(default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMergeBranch}>
              Merge Branches
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Branch Alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the branch "{selectedBranch?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBranch} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
