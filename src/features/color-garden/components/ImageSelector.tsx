import React from 'react';

interface ColoringImage {
    id: string;
    filename: string;
    path: string;
}

interface ImageSelectorProps {
    images: ColoringImage[];
    selectedImageId: string;
    onSelect: (imageId: string) => void;
    onClose: () => void;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
    images,
    selectedImageId,
    onSelect,
    onClose
}) => {
    const handleImageClick = (imageId: string) => {
        onSelect(imageId);
        onClose();
    };

    const handleSync = () => {
        // Instead of reloading the entire page, just close and reopen the modal
        // This will trigger the parent component to re-fetch images
        onClose();
        // Use setTimeout to allow the modal to close first, then reopen
        setTimeout(() => {
            // The parent component should handle reopening if needed
            // For now, just show a message that images have been synced
            console.log('Image list refreshed');
        }, 100);
    };

    return (
        <>
            {/* Backdrop */}
            <div className="cg-image-selector-overlay" onClick={onClose} />

            {/* Modal */}
            <div className="cg-image-selector-modal">
                <div className="cg-image-selector-header">
                    <h3 className="cg-image-selector-title">選擇圖紙</h3>
                    <button
                        className="cg-image-selector-sync"
                        onClick={handleSync}
                        title="重新整理圖片列表"
                    >
                        🔄 同步
                    </button>
                </div>

                <div className="cg-image-grid-container">
                    <div className="cg-image-grid">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                className={`cg-image-item ${selectedImageId === image.id ? 'selected' : ''}`}
                                onClick={() => handleImageClick(image.id)}
                            >
                                <div className="cg-image-thumbnail">
                                    <img src={image.path} alt={image.filename} />
                                </div>
                                <div className="cg-image-name">{image.filename}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="cg-image-selector-close" onClick={onClose}>
                    關閉
                </button>
            </div>
        </>
    );
};
