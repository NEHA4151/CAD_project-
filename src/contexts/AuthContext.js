import React, { createContext, useState, useEffect } from 'react';
import apiGateway, { logToCloudWatch } from '../services/apiGateway';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bootstrap = () => {
            try {
                const savedToken = localStorage.getItem('pft_token');
                const savedUser = localStorage.getItem('pft_user');

                if (savedToken && savedUser) {
                    const parsedUser = JSON.parse(savedUser);
                    setToken(savedToken);
                    setUser(parsedUser);
                }
            } catch (e) {
                localStorage.removeItem('pft_token');
                localStorage.removeItem('pft_user');
            } finally {
                setLoading(false);
            }
        };

        bootstrap();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await apiGateway.post('/api/login', {
                email,
                password
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    data.error || 'Invalid email or password'
                );
            }

            // API response format:
            // {
            //   success: true,
            //   data: {
            //     user: {...},
            //     token: "..."
            //   }
            // }
            if (data.success && data.data?.token && data.data?.user) {
                setToken(data.data.token);
                setUser(data.data.user);

                localStorage.setItem(
                    'pft_token',
                    data.data.token
                );

                localStorage.setItem(
                    'pft_user',
                    JSON.stringify(data.data.user)
                );

                return data;
            }

            throw new Error(
                'Unexpected server response during login'
            );
        } catch (err) {
            logToCloudWatch(
                'error',
                'Login attempt failed',
                {
                    email,
                    error: err.message
                }
            );

            throw err;
        }
    };

    const signup = async (username, email, password) => {
        try {
            const res = await apiGateway.post('/api/signup', {
                username,
                email,
                password
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    data.error ||
                    data.details ||
                    'Signup failed'
                );
            }

            // If signup automatically returns a token and user,
            // store them and finish authentication.
            if (
                data.success &&
                data.data?.token &&
                data.data?.user
            ) {
                setToken(data.data.token);
                setUser(data.data.user);

                localStorage.setItem(
                    'pft_token',
                    data.data.token
                );

                localStorage.setItem(
                    'pft_user',
                    JSON.stringify(data.data.user)
                );

                return data;
            }

            // If signup succeeds without returning a token,
            // log the user in using the same credentials.
            return login(email, password);

        } catch (err) {
            logToCloudWatch(
                'error',
                'Signup attempt failed',
                {
                    username,
                    email,
                    error: err.message
                }
            );

            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('pft_token');
        localStorage.removeItem('pft_user');

        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                signup,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};