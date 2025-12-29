import React from 'react';

const LoadingSpinner = ({ fullScreen = true, message = 'Loading...' }) => {
    const containerStyle = fullScreen ? {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        minHeight: '200px',
        color: '#64748b'
    } : {};

    return (
        <div style={containerStyle}>
             <div className="spinner"></div>
             {message && <p style={{ marginTop: '1rem', fontWeight: 500, fontSize: '0.9rem', animation: 'pulse 2s infinite' }}>{message}</p>}
             <style>{`
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #e2e8f0;
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
             `}</style>
        </div>
    );
};

export default LoadingSpinner;
