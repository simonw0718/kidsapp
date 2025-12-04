import React from 'react';
import './AudioLoadingOverlay.css';

interface AudioLoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

export const AudioLoadingOverlay: React.FC<AudioLoadingOverlayProps> = ({
    isLoading,
    message = '載入中...'
}) => {
    if (!isLoading) return null;

    return (
        <div className="audio-loading-overlay">
            <div className="audio-loading-content">
                <div className="audio-loading-spinner"></div>
                <p className="audio-loading-message">{message}</p>
            </div>
        </div>
    );
};
