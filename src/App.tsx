import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SchemaSync } from "@/components/SchemaSync";
import { AuthSourceProvider } from "@/contexts/AuthSourceContext";
import { LanguageProvider } from "@/hooks/useLanguage";
import { DataSourceProvider } from "@/lib/data-layer";
import { DataSourceSyncProvider } from "@/hooks/useDataSourceSync";
import { UISettingsProvider } from "@/contexts/UISettingsProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoader } from "@/components/PageLoader";
import { RouteProgressBar } from "@/components/motion/RouteProgressBar";

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
// Public pages
const ExplorePage = lazy(() => import("@/pages/ExplorePage"));
const Features = lazy(() => import("@/pages/Features"));
const About = lazy(() => import("@/pages/About"));
const Community = lazy(() => import("@/pages/Community"));
const DocsPage = lazy(() => import("@/pages/DocsPage"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const Changelog = lazy(() => import("@/pages/Changelog"));
const PublicLayout = lazy(() =>
  import("@/components/website/PublicLayout").then((m) => ({ default: m.PublicLayout })),
);
const Login = lazy(() => import("@/pages/Login"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Sign-up flow
const SignUpRoleSelection = lazy(() => import("@/pages/signup/SignUpRoleSelection"));
const DeveloperInfo = lazy(() => import("@/pages/signup/DeveloperInfo"));
const PartnerVerification = lazy(() => import("@/pages/signup/PartnerVerification"));
const PartnerKeyVerification = lazy(() => import("@/pages/signup/PartnerKeyVerification"));
const PartnerEmailVerification = lazy(() => import("@/pages/signup/PartnerEmailVerification"));
const PartnerRegistration = lazy(() => import("@/pages/signup/PartnerRegistration"));

// Protected pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const OneLibrary = lazy(() => import("@/pages/OneLibrary"));
const WorkspaceData = lazy(() => import("@/pages/WorkspaceData"));
const WorkspaceDeveloper = lazy(() => import("@/pages/WorkspaceDeveloper"));
const DevelopingData = lazy(() => import("@/pages/DevelopingData"));
const OneAppAI = lazy(() => import("@/pages/OneAppAI"));
const AIChat = lazy(() => import("@/pages/AIChat"));
const AIPopup = lazy(() => import("@/pages/AIPopup"));
const AITranslate = lazy(() => import("@/pages/AITranslate"));
const PublicNote = lazy(() => import("@/pages/PublicNote"));
const Interface = lazy(() => import("@/pages/Interface"));
const ThemeSettings = lazy(() => import("@/pages/ThemeSettings"));
const LayoutOptions = lazy(() => import("@/pages/LayoutOptions"));
const DisplaySettings = lazy(() => import("@/pages/DisplaySettings"));
const SidebarSettings = lazy(() => import("@/pages/SidebarSettings"));
const HeaderSettings = lazy(() => import("@/pages/HeaderSettings"));
const SystemAdmin = lazy(() => import("@/pages/SystemAdmin"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));
const AccountSettings = lazy(() => import("@/pages/AccountSettings"));
const ProfileSettings = lazy(() => import("@/pages/ProfileSettings"));
const AppearanceSettings = lazy(() => import("@/pages/AppearanceSettings"));
const SecuritySettings = lazy(() => import("@/pages/SecuritySettings"));
const NotificationSettings = lazy(() => import("@/pages/NotificationSettings"));
const OneCrypto = lazy(() => import("@/pages/OneCrypto"));
const OneNote = lazy(() => import("@/pages/OneNote"));
const OneNoteTemplates = lazy(() => import("@/pages/onenote/Templates"));

// ─── QueryClient — created OUTSIDE component to survive re-renders ────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,       // 1 minute before refetch
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── App ─────────────────────────────────────────────────────────────────────
const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthSourceProvider>
            <DataSourceProvider>
              <DataSourceSyncProvider>
                <UISettingsProvider>
                  <TooltipProvider>
                    <SchemaSync />
                    <Toaster />
                    <Sonner />
                    <RouteProgressBar />
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* ── Public ── */}
                        <Route path="/explore" element={<ExplorePage />} />
                        <Route path="/home" element={<Navigate to="/explore" replace />} />
                        <Route path="/docs" element={<DocsPage />} />
                        {/* Public pages with shared header/footer */}
                        <Route element={<PublicLayout />}>
                          <Route path="/ecosystem" element={<Features />} />
                          <Route path="/journey" element={<About />} />
                          <Route path="/forum" element={<Community />} />
                          <Route path="/pricing" element={<Pricing />} />
                          <Route path="/changelog" element={<Changelog />} />
                        </Route>
                        <Route path="/auth/login" element={<Login />} />
                        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                        <Route path="/auth/signup" element={<SignUpRoleSelection />} />
                        <Route path="/auth/signup/developer" element={<DeveloperInfo />} />
                        <Route path="/auth/signup/partner" element={<PartnerVerification />} />
                        <Route path="/auth/signup/partner/key" element={<PartnerKeyVerification />} />
                        <Route path="/auth/signup/partner/email" element={<PartnerEmailVerification />} />
                        <Route path="/auth/signup/partner/register" element={<PartnerRegistration />} />

                        {/* ── Public shared note ── */}
                        <Route path="/note/share/:token" element={<PublicNote />} />

                        {/* ── Protected ── */}
                        <Route element={<ProtectedRoute />}>
                          <Route element={<AppLayout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/library" element={<OneLibrary />} />
                            <Route path="/workspace/data" element={<WorkspaceData />} />
                            <Route path="/workspace/developer" element={<WorkspaceDeveloper />} />
                            <Route path="/developing/data" element={<DevelopingData />} />
                            <Route path="/developing/ai" element={<OneAppAI />} />
                            <Route path="/developing/ai/chat" element={<AIChat />} />
                            <Route path="/developing/ai/popup" element={<AIPopup />} />
                            <Route path="/developing/ai/translate" element={<AITranslate />} />
                            <Route path="/customization/interface" element={<Interface />} />
                            <Route path="/customization/interface/theme" element={<ThemeSettings />} />
                            <Route path="/customization/interface/layout" element={<LayoutOptions />} />
                            <Route path="/customization/interface/display" element={<DisplaySettings />} />
                            <Route path="/customization/interface/sidebar" element={<SidebarSettings />} />
                            <Route path="/customization/interface/header" element={<HeaderSettings />} />
                            <Route path="/customization/admin" element={<SystemAdmin />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/settings/account" element={<AccountSettings />} />
                            <Route path="/settings/profile" element={<ProfileSettings />} />
                            <Route path="/settings/appearance" element={<AppearanceSettings />} />
                            <Route path="/settings/security" element={<SecuritySettings />} />
                            <Route path="/settings/notifications" element={<NotificationSettings />} />
                            <Route path="/apps/crypto" element={<OneCrypto />} />
                            <Route path="/apps/onenote" element={<OneNote />} />
                            <Route path="/apps/onenote/templates" element={<OneNoteTemplates />} />
                          </Route>
                        </Route>

                        {/* ── Fallback ── */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </TooltipProvider>
                </UISettingsProvider>
              </DataSourceSyncProvider>
            </DataSourceProvider>
          </AuthSourceProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
