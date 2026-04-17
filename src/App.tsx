import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import StallDetail from './pages/StallDetail';
import MapPage from './pages/MapPage';
import VendorLayout from './layouts/VendorLayout';
import VendorMenu from './pages/vendor/VendorMenu';
import VendorSettings from './pages/vendor/VendorSettings';
import VendorAnalytics from './pages/vendor/VendorAnalytics';
import AuthPage from './pages/AuthPage';
import Forbidden from './pages/error/Forbidden';
import ErrorPage from './pages/error/ErrorPage';
import NotFound from './pages/error/NotFound';

import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ScanPage from './pages/scan/ScanPage';
import VisitLogger from './components/VisitLogger';
import LandingPage from './pages/LandingPage';

// New Admin Sub-pages
import DashboardPage from './pages/admin/DashboardPage';
import StallsPage from './pages/admin/StallsPage';
import PendingPage from './pages/admin/PendingPage';
import UsersPage from './pages/admin/UsersPage';
import QRCodesPage from './pages/admin/QRCodesPage';
import POIPage from './pages/admin/POIPage';

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<ToastContainer position='top-right' autoClose={3000} />
				<Routes>
					<Route path='/auth' element={<AuthPage />} />
					<Route path='/map' element={<MapPage />} />
					<Route path='/403' element={<Forbidden />} />
					<Route path='/error' element={<ErrorPage />} />

					{/* Private Admin Routes */}
					<Route
						path='/admin'
						element={
							<ProtectedRoute allowedRoles={['ADMIN']}>
								<Outlet />
							</ProtectedRoute>
						}
					>
						<Route index element={<Navigate to='/admin/dashboard' replace />} />
						<Route path='dashboard' element={<DashboardPage />} />
						<Route path='stalls' element={<StallsPage />} />
						<Route path='pending' element={<PendingPage />} />
						<Route path='users' element={<UsersPage />} />
						<Route path='qrcodes' element={<QRCodesPage />} />
						<Route path='pois' element={<POIPage />} />
					</Route>

					{/* Private Vendor Routes */}
					<Route
						path='/vendor'
						element={
							<ProtectedRoute allowedRoles={['VENDOR']}>
								<VendorLayout />
							</ProtectedRoute>
						}
					>
						<Route index element={<Navigate to='/vendor/menu' replace />} />
						<Route path='menu' element={<VendorMenu />} />
						<Route path='analytics' element={<VendorAnalytics />} />
						<Route path='settings' element={<VendorSettings />} />
					</Route>

					{/* Public Routes with Navbar */}
					<Route path='/home' element={<MainLayout />}>
						<Route index element={<Home />} />
						<Route path='stall/:id' element={<StallDetail />} />
					</Route>

					<Route path='/' element={<LandingPage />} />
					<Route path='/scan' element={<ScanPage />} />

					{/* Catch-all route */}
					<Route path='*' element={<NotFound />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
