import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { WalletIcon } from '../common/Icons';
import './Auth.css';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signup } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!email || !password || !username) {
                throw new Error('Please fill in all fields');
            }

            await signup(username, email, password);

            setSuccessMessage('Account created successfully. Redirecting...');

            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (err) {
            setError(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card show-form">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', gap: '8px' }}>
                    <WalletIcon size={28} />
                </div>
                <h2>Create an Account</h2>
                <p className="auth-subtitle">Get started with Personal Finance Tracker</p>

                {error && <div className="auth-error">{error}</div>}
                {successMessage && (
                    <div className="auth-success" style={{
                        backgroundColor: '#e8f5e9',
                        color: '#2e7d32',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '16px',
                        textAlign: 'center',
                        fontSize: '14px'
                    }}>
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="johndoe"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a strong password"
                            required
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
