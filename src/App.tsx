
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Index from "./pages/Index";
import About from "./pages/About";
import Players from "./pages/Players";
import PlayerDetails from "./pages/PlayerDetails";
import Events from "./pages/Events";
import Scores from "./pages/Scores";
import NotFound from "./pages/NotFound";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import CompleteProfile from "./pages/CompleteProfile";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";

// Animation libraries
import { motion, AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const AuthOnboardingGate = () => {
  const { user, isAdmin, needsPlayerProfile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (isAdmin) return;
    if (!needsPlayerProfile) return;
    if (location.pathname === "/complete-profile") return;
    navigate("/complete-profile");
  }, [loading, user, isAdmin, needsPlayerProfile, location.pathname, navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthOnboardingGate />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/players" element={<Players />} />
                  <Route path="/players/:id" element={<PlayerDetails />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/scores" element={<Scores />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/complete-profile" element={<CompleteProfile />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
