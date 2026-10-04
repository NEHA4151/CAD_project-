import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <h2 className="profile-username" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'normal', fontSize: '1rem' }} className="profile-label">Username: </span>
                        {user.username || user.email?.split('@')[0] || 'User'}
                    </h2>
                    <p className="profile-email" style={{ fontSize: '1rem' }}>
                        <span className="profile-label">Email: </span>
                        {user.email}
                    </p>
                </div>

                <div className="profile-actions">
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
