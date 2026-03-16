import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "@/components/ScrollToTop";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import PageTransition from "@/components/PageTransition";
import AiChat from "@/components/AiChat";
import HeatmapTracker from "@/components/HeatmapTracker";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import ProductList from "@/pages/ProductList";
import ProductDetail from "@/pages/ProductDetail";
import Checkout from "@/pages/Checkout";
import Admin from "@/pages/Admin";
import Vendedores from "@/pages/Vendedores";
import Auth from "@/pages/Auth";
import NotFound from "./pages/NotFound";
import { MessageCircle } from "lucide-react";

const queryClient = new QueryClient();

const WhatsAppFloating = () => (
  <a
    href="https://wa.me/5491165483728"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-20 left-4 z-40 bg-success text-success-foreground p-3 rounded-full shadow-xl hover:scale-110 transition-all duration-300 active:scale-95"
  >
    <MessageCircle size={22} />
  </a>
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>
        } />
        <Route path="/vendedores" element={
          <ProtectedRoute requiredRole="staff"><Vendedores /></ProtectedRoute>
        } />

        <Route path="*" element={
          <>
            <Header />
            <CartDrawer />
            <WhatsAppFloating />
            <AiChat />
            <HeatmapTracker />
            <main className="flex-1">
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                  <Route path="/productos" element={<PageTransition><ProductList /></PageTransition>} />
                  <Route path="/producto/:slug" element={<PageTransition><ProductDetail /></PageTransition>} />
                  <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
                  <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
                  <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
                </Routes>
              </AnimatePresence>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CartProvider>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen relative">
            <AnimatedRoutes />
          </div>
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
