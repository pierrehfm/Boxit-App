
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthType = {
    user: string | null;
    isLoading: boolean;
    signIn: () => void;
    signOut: () => void;
};

const AuthContext = createContext<AuthType>({
    user: null,
    isLoading: true,
    signIn: () => { },
    signOut: () => { },
});

export function useSession() {
    return useContext(AuthContext);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored session
        AsyncStorage.getItem('user_session').then((session) => {
            if (session) {
                setUser(session);
            }
            // Simulate a small delay for the splash screen effect if needed
            // ensuring the splash screen is visible for at least a moment
            setTimeout(() => {
                setIsLoading(false);
            }, 2000);
        });
    }, []);

    const signIn = () => {
        setIsLoading(true);
        // Simulate login
        setTimeout(() => {
            setUser('demo_user');
            AsyncStorage.setItem('user_session', 'demo_user');
            setIsLoading(false);
        }, 500);
    };

    const signOut = () => {
        setUser(null);
        AsyncStorage.removeItem('user_session');
    };

    return (
        <AuthContext.Provider
            value={{
                signIn,
                signOut,
                user,
                isLoading,
            }}>
            {children}
        </AuthContext.Provider>
    );
}
