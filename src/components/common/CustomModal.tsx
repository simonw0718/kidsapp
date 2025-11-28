import React, { useState, useCallback } from 'react';
import './modal.css';

interface CustomModalProps {
    show: boolean;
    type?: 'confirm' | 'alert';
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
}

export const CustomModal: React.FC<CustomModalProps> = ({
    show,
    type = 'confirm',
    message,
    confirmText = type === 'alert' ? 'OK' : 'YES',
    cancelText = 'NO',
    onConfirm,
    onCancel
}) => {
    if (!show) return null;

    return (
        <div className="cm-modal-overlay">
            <div className="cm-modal">
                <div className="cm-modal-message">
                    {message}
                </div>
                <div className="cm-modal-buttons">
                    <button
                        className="cm-modal-btn cm-modal-confirm"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                    {type === 'confirm' && (
                        <button
                            className="cm-modal-btn cm-modal-cancel"
                            onClick={onCancel}
                        >
                            {cancelText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export interface ModalConfig {
    show: boolean;
    type: 'confirm' | 'alert';
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
}

export const useModal = () => {
    const [modalConfig, setModalConfig] = useState<ModalConfig>({
        show: false,
        type: 'alert',
        message: '',
        onConfirm: () => { },
    });

    const showConfirm = useCallback((message: string, onConfirm: () => void, onCancel?: () => void) => {
        setModalConfig({
            show: true,
            type: 'confirm',
            message,
            onConfirm: () => {
                onConfirm();
                setModalConfig(prev => ({ ...prev, show: false }));
            },
            onCancel: () => {
                if (onCancel) onCancel();
                setModalConfig(prev => ({ ...prev, show: false }));
            }
        });
    }, []);

    const showAlert = useCallback((message: string, onConfirm?: () => void) => {
        setModalConfig({
            show: true,
            type: 'alert',
            message,
            onConfirm: () => {
                if (onConfirm) onConfirm();
                setModalConfig(prev => ({ ...prev, show: false }));
            }
        });
    }, []);

    const closeModal = useCallback(() => {
        setModalConfig(prev => ({ ...prev, show: false }));
    }, []);

    return {
        modalConfig,
        showConfirm,
        showAlert,
        closeModal,
        CustomModalComponent: (
            <CustomModal
                show={modalConfig.show}
                type={modalConfig.type}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={modalConfig.onCancel}
            />
        )
    };
};
