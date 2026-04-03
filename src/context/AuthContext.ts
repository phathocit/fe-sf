import { createContext, useContext } from 'react';
import type { Account } from '../types/auth.types';

export interface AuthContextType {
	user: Account | null;
	token: string | null;
	login: (token: string, user: Account) => void;
	logout: () => void;
	isAuthenticated: boolean;
	isAdmin: boolean;
	isVendor: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
