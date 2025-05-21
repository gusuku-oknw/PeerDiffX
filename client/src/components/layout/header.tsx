import { useState } from "react";
import { Link } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/components/i18n/language-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePresentations } from "@/hooks/use-pptx";
import { useBranches } from "@/hooks/use-branches";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FaCode, FaCodeBranch, FaHistory, FaBars, FaBell, FaSun, FaMoon, FaUpload, FaSignOutAlt, FaUser, FaCog } from "react-icons/fa";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { data: presentations } = usePresentations();
  const { data: branches } = useBranches(presentations?.[0]?.id);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // Find the default branch
  const defaultBranch = branches?.find(branch => branch.isDefault);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Create a FormData object
    const formData = new FormData();
    formData.append("file", file);
    
    // In a real app, would use react-query mutation to upload
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
      })
      .catch(err => {
        console.error("Error uploading file:", err);
      });
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
            PeerDiffX
          </Link>
          <div className="hidden md:flex items-center space-x-2">
            {branches && branches.length > 0 && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="px-3 py-1.5 rounded-md text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <span className="font-medium">{defaultBranch ? defaultBranch.name : "main"}</span>
                      <span className="ml-2 text-xs">▼</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {branches.map((branch) => (
                      <DropdownMenuItem key={branch.id} className="cursor-pointer">
                        {branch.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Link href={`/branches/${presentations?.[0]?.id}`}>
                  <Button variant="ghost" size="sm" className="flex items-center px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <FaCodeBranch className="mr-2" />
                    <span>{t('branches')}</span>
                  </Button>
                </Link>
                
                <Link href={`/history/${defaultBranch?.id}`}>
                  <Button variant="ghost" size="sm" className="flex items-center px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <FaHistory className="mr-2" />
                    <span>{t('history')}</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="hidden md:flex items-center px-3 py-1.5 rounded-md text-sm bg-blue-500 hover:bg-blue-600 text-white transition-colors">
                <FaUpload className="mr-2" />
                <span>Upload PPTX</span>
              </Button>
            </DialogTrigger>
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
          
          <Button variant="ghost" size="icon" className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            <FaBars />
          </Button>
          
          <div className="hidden md:block relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md relative">
                  <FaBell />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    <Button variant="ghost" size="sm" className="text-xs text-blue-500 hover:text-blue-700">
                      Mark all as read
                    </Button>
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-semibold mr-3">
                        TK
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">New comment on slide 2</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Takashi K. commented on your presentation "Q4_Presentation.pptx"</p>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 minutes ago</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex-shrink-0 flex items-center justify-center text-green-600 dark:text-green-400 text-xs font-semibold mr-3">
                        YN
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Branch merged</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your branch "feature-new-slide" was merged into "main"</p>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Yesterday</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex-shrink-0 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-semibold mr-3">
                        SJ
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Presentation shared with you</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sara J. shared "Q1 Planning" presentation with you</p>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 days ago</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="ghost" size="sm" className="w-full text-sm text-center text-blue-500 hover:text-blue-700">
                    View all notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="p-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                  JD
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FaUser className="mr-2 text-gray-500" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FaCog className="mr-2 text-gray-500" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                {theme === "light" ? <FaMoon className="mr-2" /> : <FaSun className="mr-2" />}
                {theme === "light" ? t("darkMode") : t("lightMode")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage(language === "ja" ? "en" : "ja")}>
                <span className="w-5 h-5 inline-flex items-center justify-center mr-2 text-xs font-bold bg-gray-100 dark:bg-gray-700 rounded">
                  {language === "ja" ? "EN" : "JA"}
                </span>
                {language === "ja" ? "English" : "日本語"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                <FaSignOutAlt className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2">
            <Link href={`/branches/${presentations?.[0]?.id}`}>
              <a className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <FaCodeBranch className="inline mr-2" />
                Branches
              </a>
            </Link>
            <Link href={`/history/${defaultBranch?.id}`}>
              <a className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <FaHistory className="inline mr-2" />
                History
              </a>
            </Link>
            <Link href="#">
              <a className="block py-2 px-4 text-sm text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <FaUpload className="inline mr-2" />
                Upload PPTX
              </a>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// Import queryClient for invalidating queries
import { queryClient } from "@/lib/queryClient";
