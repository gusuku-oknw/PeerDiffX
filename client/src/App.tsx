import { Switch, Route } from "wouter";
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
import Preview from "@/pages/preview";
import DiffView from "@/pages/diff-view";
import History from "@/pages/history";
import Branches from "@/pages/branches";
import SnapshotPage from "@/pages/snapshot";
import SettingsPage from "@/pages/settings";
import AdminDashboard from "@/pages/admin/dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/profile" component={Profile} />
      <Route path="/preview/:id" component={Preview} />
      <Route path="/diff/:baseCommitId/:compareCommitId" component={DiffView} />
      <Route path="/history/:branchId" component={History} />
      <Route path="/branches/:presentationId" component={Branches} />
      <Route path="/snapshot/:id" component={SnapshotPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <div className="h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 flex overflow-hidden">
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
