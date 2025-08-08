
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import UnitDashboard from "./pages/UnitDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import WeeklyAttendance from "./pages/WeeklyAttendance";
import WeeklyAttendanceHistory from "./pages/WeeklyAttendanceHistory";
import NotFound from "./pages/NotFound";
import InstallPrompt from "./components/InstallPrompt";
import SystemHealthCheck from "./components/SystemHealthCheck";
import NewsTestComponent from "./components/NewsTestComponent";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <InstallPrompt />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/unit-dashboard" element={<UnitDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/weekly-attendance" element={<WeeklyAttendance />} />
              <Route path="/weekly-attendance-history" element={<WeeklyAttendanceHistory />} />
              <Route path="/health-check" element={<SystemHealthCheck />} />
              <Route path="/news-test" element={<NewsTestComponent />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
