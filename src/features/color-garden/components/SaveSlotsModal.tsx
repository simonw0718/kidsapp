import React, { useEffect, useState } from 'react';
import { getAllSlots, deleteSlot, type SaveSlot } from '../utils/storage';
import { useModal } from '../../../components/common/CustomModal';

interface SaveSlotsModalProps {
    onClose: () => void;
    onSave: (slotId: number) => Promise<void>;
    onLoad: (slot: SaveSlot) => void;
}

export const SaveSlotsModal: React.FC<SaveSlotsModalProps> = ({ onClose, onSave, onLoad }) => {
    const [slots, setSlots] = useState<SaveSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const { showConfirm, showAlert, CustomModalComponent } = useModal();

    const loadSlots = async () => {
        try {
            const data = await getAllSlots();
            setSlots(data);
        } catch (error) {
            console.error('Failed to load slots:', error);
        }
    };

    useEffect(() => {
        loadSlots();
    }, []);

    const handleSaveClick = async (e: React.MouseEvent, slotId: number) => {
        e.stopPropagation();
        console.log('handleSaveClick called for slot', slotId);
        showConfirm('Save current work to this slot?', async () => {
            console.log('User confirmed save');
            setLoading(true);
            try {
                console.log('Calling onSave...');
                await onSave(slotId);
                console.log('onSave completed, refreshing slots...');
                await loadSlots(); // Refresh slots after save
                console.log('Slots refreshed');
            } catch (error) {
                console.error('Failed to save slot:', error);
                showAlert('Failed to save. Please try again.');
            } finally {
                setLoading(false);
            }
        });
    };


    const handleLoadClick = (e: React.MouseEvent, slot: SaveSlot) => {
        e.stopPropagation();
        showConfirm('Load this save? Current work will be lost.', () => {
            onLoad(slot);
            onClose();
        });
    };

    const handleDeleteClick = async (e: React.MouseEvent, slotId: number) => {
        e.stopPropagation();
        showConfirm('Delete this saved work?', async () => {
            setLoading(true);
            try {
                await deleteSlot(slotId);
                await loadSlots(); // Refresh slots after delete
            } catch (error) {
                console.error('Failed to delete slot:', error);
                showAlert('Failed to delete. Please try again.');
            } finally {
                setLoading(false);
            }
        });
    };

    const renderSlot = (id: number) => {
        const slot = slots.find(s => s.id === id);

        return (
            <div className="cg-save-slot-container" key={id}>
                <div
                    className={`cg-save-slot ${!slot ? 'empty' : ''}`}
                    onClick={(e) => slot ? handleLoadClick(e, slot) : handleSaveClick(e, id)}
                >
                    {slot ? (
                        <>
                            <img src={slot.preview} alt={`Slot ${id}`} className="cg-slot-preview" />
                            <div className="cg-slot-info">
                                {new Date(slot.timestamp).toLocaleString()}
                            </div>
                            <div className="cg-slot-actions">
                                <button
                                    className="cg-slot-btn save"
                                    onClick={(e) => handleSaveClick(e, id)}
                                    disabled={loading}
                                >
                                    覆蓋
                                </button>
                                <button
                                    className="cg-slot-btn load"
                                    onClick={(e) => handleLoadClick(e, slot)}
                                    disabled={loading}
                                >
                                    讀取
                                </button>
                                <button
                                    className="cg-slot-btn delete"
                                    onClick={(e) => handleDeleteClick(e, id)}
                                    disabled={loading}
                                >
                                    刪除
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="cg-slot-empty-content">
                            <span className="cg-slot-empty-text">Empty Slot</span>
                            <button
                                className="cg-slot-btn save"
                                onClick={(e) => handleSaveClick(e, id)}
                                disabled={loading}
                            >
                                儲存
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="cg-image-selector-overlay">
            <div className="cg-image-selector-modal" style={{ maxWidth: '600px', height: 'auto' }}>
                <div className="cg-image-selector-header">
                    <h2 className="cg-image-selector-title">暫存作品</h2>
                    <button className="cg-image-selector-close" onClick={onClose} style={{ width: 'auto' }}>
                        關閉
                    </button>
                </div>

                <div className="cg-slots-grid">
                    {renderSlot(1)}
                    {renderSlot(2)}
                </div>
            </div>
            {CustomModalComponent}
        </div>
    );
};

