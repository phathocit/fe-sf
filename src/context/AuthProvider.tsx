import React, { useState } from 'react';
import type { Account } from '../types/auth.types';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<Account | null>(() => {
		const storedUser = localStorage.getItem('account');
		if (storedUser && storedUser !== 'undefined') {
			return JSON.parse(storedUser);
		}
		return null;
	});
	const [token, setToken] = useState<string | null>(() => {
		return localStorage.getItem('token');
	});

	const login = (token: string, user: Account) => {
		localStorage.setItem('token', token);
		localStorage.setItem('account', JSON.stringify(user));
		setToken(token);
		setUser(user);
	};

	const logout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('account');
		setToken(null);
		setUser(null);
	};

	const isAuthenticated = !!token;
	const isAdmin = user?.roles.some((role) => role.name === 'ADMIN') || false;
	const isVendor = user?.roles.some((role) => role.name === 'VENDOR') || false;

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				login,
				logout,
				isAuthenticated,
				isAdmin,
				isVendor,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
