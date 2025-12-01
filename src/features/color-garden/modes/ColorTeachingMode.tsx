import React from 'react';

export const ColorTeachingMode: React.FC = () => {
    return (
        <div className="cl-teaching-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#888'
        }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>👩‍🏫</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>顏色教學模式</h2>
            <p>即將推出 (Coming Soon)</p>
        </div>
    );
};
