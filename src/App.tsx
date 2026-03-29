
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import PropertyDetail from "./pages/PropertyDetail.tsx";
import BookingFlow from "./pages/BookingFlow.tsx";
import Messages from "./pages/Messages.tsx";
import GuestDashboard from "./pages/GuestDashboard.tsx";
import HostDashboard from "./pages/HostDashboard.tsx";
import AddProperty from "./pages/AddProperty.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProtectedRoute from "@/components/ProtectedRoute";

const App = () => (
  <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <ErrorBoundary>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/property/:id" element={<PropertyDetail />} />

              {/* Protected Guest Routes */}
              <Route path="/booking/:id" element={<ProtectedRoute requiredRole="guest"><BookingFlow /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute requiredRole="guest"><GuestDashboard /></ProtectedRoute>} />

              {/* Protected Host Routes */}
              <Route path="/host" element={<ProtectedRoute requiredRole="host"><HostDashboard /></ProtectedRoute>} />
              <Route path="/host/add-property" element={<ProtectedRoute requiredRole="host"><AddProperty /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </AppProvider>
      </BrowserRouter>
  </TooltipProvider>
);

export default App;

