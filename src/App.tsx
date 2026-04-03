import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import StallDetail from './pages/StallDetail';
import MapPage from './pages/MapPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import VendorLayout from './layouts/VendorLayout';
import VendorMenu from './pages/vendor/VendorMenu';
import VendorSettings from './pages/vendor/VendorSettings';
import VendorAnalytics from './pages/vendor/VendorAnalytics';
import AuthPage from './pages/AuthPage';
import Forbidden from './pages/error/Forbidden';


import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<ToastContainer position='top-right' autoClose={3000} />
				<Routes>
					<Route path='/auth' element={<AuthPage />} />
					<Route path='/map' element={<MapPage />} />
					<Route path='/403' element={<Forbidden />} />

					{/* Private Routes */}
					<Route
						path='/admin/*'
						element={
							<ProtectedRoute allowedRoles={['ADMIN']}>
								<AdminDashboard />
							</ProtectedRoute>
						}
					/>
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
						<Route path='settings' element={<VendorSettings />} />
						<Route path='analytics' element={<VendorAnalytics />} />
					</Route>

					{/* Public Routes with Navbar */}
					<Route path='/' element={<MainLayout />}>
						<Route index element={<Home />} />
						<Route path='stall/:id' element={<StallDetail />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
