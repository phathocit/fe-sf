import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import StallDetail from './pages/StallDetail';
import MapPage from './pages/MapPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import VendorDashboard from './pages/vendor/VendorDashboard';
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone Pages without Global Navbar */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/vendor" element={<VendorDashboard />} />

        {/* Public Routes with Navbar */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="stall/:id" element={<StallDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
