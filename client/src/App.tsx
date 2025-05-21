import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { LanguageProvider } from "@/components/i18n/language-context";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/ui/navbar";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Profile from "@/pages/profile";
// プレビューページ
import PublicPreview from "@/pages/public-preview";
import DiffView from "@/pages/diff-view";
import History from "@/pages/history";
import Branches from "@/pages/branches";
import SettingsPage from "@/pages/settings";
import AdminDashboard from "@/pages/admin/dashboard";
// シンプルなデモページの追加
import DemoPage from "@/pages/demo";
import DemoSimplePage from "@/pages/demo-simple";

function Router() {
  const [location] = useLocation();
  // 公開プレビューページの場合はNavbarを表示しない
  const isPublicPreview = location.startsWith('/public-preview');
  
  // プレビューページは現在はpublic-previewに統合された

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/profile" component={Profile} />
      <Route path="/public-preview/:presentationId/:commitId?" component={PublicPreview} />
      <Route path="/preview/:id" component={() => {
        // 古いプレビューパスから新しいパブリックプレビューにリダイレクト
        window.location.href = window.location.href.replace('/preview/', '/public-preview/pdx-');
        return <div>リダイレクト中...</div>;
      }} />
      <Route path="/diff/:baseCommitId/:compareCommitId" component={DiffView} />
      <Route path="/history/:branchId" component={History} />
      <Route path="/branches/:presentationId" component={Branches} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/demo" component={DemoPage} />
      <Route path="/demo-simple" component={DemoSimplePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  // 公開プレビューページの場合はNavbarを表示しない
  const isPublicPreview = location.startsWith('/public-preview');
  
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <div className="h-screen flex flex-col">
            {!isPublicPreview && <Navbar />}
            <div className={`flex-1 flex overflow-hidden ${isPublicPreview ? 'pt-0' : ''}`}>
              <Router />
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
