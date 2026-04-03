import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	allowedRoles,
}) => {
	const { isAuthenticated, user } = useAuth();
	const location = useLocation();

	if (!isAuthenticated) {
		// Redirect to login page but save the current location they were trying to go to
		return <Navigate to='/auth' state={{ from: location }} replace />;
	}

	if (allowedRoles && user) {
		const userRoles = user.roles.map((role) => role.name);
		const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

		if (!hasAccess) {
			// Role not authorized, so redirect to 403 Forbidden page
			return <Navigate to='/403' replace />;
		}
	}

	return <>{children}</>;
};

export default ProtectedRoute;
