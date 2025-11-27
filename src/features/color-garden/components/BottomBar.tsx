import React from 'react';
import '../color-garden.css';

interface BottomBarProps {
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
    onGallery: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
    onUndo,
    onRedo,
    onSave,
    onGallery,
}) => {
    return (
        <div className="cg-bottom-bar">
            <div className="cg-action-group">
                <button onClick={onUndo} className="cg-action-btn" title="Undo">
                    ↩️
                </button>
                <button onClick={onRedo} className="cg-action-btn" title="Redo">
                    ↪️
                </button>
            </div>

            <div className="cg-action-group">
                <button onClick={onGallery} className="cg-action-btn" title="Gallery">
                    🖼️
                </button>
                <button onClick={onSave} className="cg-action-btn" title="Save">
                    💾
                </button>
            </div>
        </div>
    );
};
