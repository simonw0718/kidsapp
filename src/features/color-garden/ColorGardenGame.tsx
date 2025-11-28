import React, { useState, useRef } from 'react';
import { PageContainer } from '../../components/common/PageContainer';
import { BackToHomeButton } from '../../components/common/BackToHomeButton';
import { ColoringCanvas, type ColoringCanvasHandle } from './components/ColoringCanvas';
import { ImageSelector } from './components/ImageSelector';
import { COLORING_IMAGES } from './config/images';
import { SaveSlotsModal } from './components/SaveSlotsModal';
import type { SaveSlot } from './utils/storage';
import './color-garden.css';

interface ColorGardenGameProps {
    onSwitchMode: () => void;
}

// Configurable brush size range
const BRUSH_SIZE_MIN = 2;
const BRUSH_SIZE_MAX = 80;
const BRUSH_SIZE_DEFAULT = 10;

const PALETTE_COLORS = [
    // Column 1 (Warm)
    '#FF4444', // Red
    '#FF9800', // Deep Orange
    '#FF8C00', // Orange
    '#FFEB3B', // Light Yellow
    '#FFD700', // Yellow

    // Column 2 (Cool/Nature)
    '#CDDC39', // Lime
    '#8BC34A', // Light Green
    '#4CAF50', // Green
    '#00BCD4', // Cyan
    '#2196F3', // Blue

    // Column 3 (Neutral/Others)
    '#9C27B0', // Purple
    '#F48FB1', // Pink
    '#795548', // Brown
    '#607D8B', // Grey
    '#000000', // Black
];

// Images are now auto-imported from src/assets/images/color-garden/
const AVAILABLE_IMAGES = COLORING_IMAGES.map((img: { filename: string; url: string }) => ({
    id: img.filename,
    filename: img.filename,
    path: img.url
}));


export const ColorGardenGame: React.FC<ColorGardenGameProps> = ({ onSwitchMode }) => {
    // Coloring State
    const [selectedColor, setSelectedColor] = useState('#FF4444');
    const [brushSize, setBrushSize] = useState(BRUSH_SIZE_DEFAULT);
    const [toolMode, setToolMode] = useState<'brush' | 'eraser'>('brush');
    const [showPalette, setShowPalette] = useState(false);
    const [activeSlider, setActiveSlider] = useState<'brush' | 'eraser' | null>(null);

    // Image Selection State
    const [selectedImageId, setSelectedImageId] = useState(AVAILABLE_IMAGES[0]?.id || 'animal_pikachu_01');
    const [showImageSelector, setShowImageSelector] = useState(false);

    // Save Slots State
    const [showSaveSlots, setShowSaveSlots] = useState(false);

    // Save Preview State
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const canvasRef = useRef<ColoringCanvasHandle>(null);

    const handleClear = () => {
        if (window.confirm('Clear drawing?')) {
            canvasRef.current?.clear();
        }
    };

    const handleUndo = () => {
        canvasRef.current?.undo();
    };

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        setToolMode('brush');
        setShowPalette(false);
        setActiveSlider(null);
    };

    const handleToolClick = (mode: 'brush' | 'eraser') => {
        // Always hide palette when selecting brush/eraser
        setShowPalette(false);

        if (toolMode === mode) {
            // Toggle slider if already active tool
            setActiveSlider(activeSlider === mode ? null : mode);
        } else {
            // Switch tool and close other popovers
            setToolMode(mode);
            setActiveSlider(null);
        }
    };

    const handlePaletteToggle = () => {
        setShowPalette(!showPalette);
        setActiveSlider(null);
    };

    const handleImageSelect = (imageId: string) => {
        setSelectedImageId(imageId);
        // Clear canvas when switching images
        canvasRef.current?.clear();
    };

    const handleFolderClick = () => {
        setShowImageSelector(true);
        setShowPalette(false);
        setActiveSlider(null);
    };

    const handleSaveImage = async () => {
        // Show confirmation dialog
        if (!window.confirm('Do you want to save image?')) {
            return;
        }

        const canvas = canvasRef.current?.canvasRef.current;
        if (!canvas) return;

        // Create a temporary canvas to combine image and drawing
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) return;

        // Fill with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw the canvas content first
        ctx.drawImage(canvas, 0, 0);

        // Convert to blob
        tempCanvas.toBlob(async (blob) => {
            if (!blob) return;

            const filename = `coloring-${Date.now()}.png`;
            const file = new File([blob], filename, { type: 'image/png' });

            // Try Web Share API first (Mobile/Tablet preferred)
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'My Coloring',
                        text: 'Check out my coloring!'
                    });
                    // Success! No need to show preview.
                    return;
                } catch (error) {
                    console.log('Share failed or cancelled, falling back to preview:', error);
                    // If share failed (or user cancelled), we might want to show preview as fallback
                    // But if user cancelled, maybe we shouldn't?
                    // Let's show preview only if it wasn't a cancellation (hard to detect reliably across browsers, but usually error.name === 'AbortError')
                    if ((error as Error).name === 'AbortError') {
                        return;
                    }
                }
            }

            // If Share API unavailable or failed, show Preview Modal
            const url = URL.createObjectURL(blob);
            setPreviewImage(url);
        }, 'image/png');
    };

    const handleDownload = () => {
        if (!previewImage) return;

        const filename = `coloring-${Date.now()}.png`;
        const link = document.createElement('a');
        link.href = previewImage;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClosePreview = () => {
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
            setPreviewImage(null);
        }
    };

    const handleSaveToSlot = async (slotId: number) => {
        try {
            console.log('Starting save to slot', slotId);
            const canvas = canvasRef.current?.canvasRef.current;
            const coloringHandle = canvasRef.current;
            if (!canvas || !coloringHandle) {
                console.error('Canvas or handle not available');
                throw new Error('Canvas not ready');
            }

            // Get drawing data
            const drawingData = coloringHandle.getImageData();
            if (!drawingData) {
                console.error('Failed to get image data');
                throw new Error('Failed to get image data');
            }
            console.log('Got image data:', drawingData.width, 'x', drawingData.height);

            // Create preview
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const ctx = tempCanvas.getContext('2d');
            if (!ctx) {
                console.error('Failed to get 2d context');
                throw new Error('Failed to create preview');
            }

            // Fill white
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            // Draw background
            // We need to load the image to draw it
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = imageSrc;

            await new Promise<void>((resolve) => {
                if (img.complete) resolve();
                img.onload = () => resolve();
                img.onerror = () => resolve(); // Proceed even if fail
            });

            // Calculate dimensions to match object-fit: contain
            const scale = Math.min(tempCanvas.width / img.width, tempCanvas.height / img.height);
            const x = (tempCanvas.width - img.width * scale) / 2;
            const y = (tempCanvas.height - img.height * scale) / 2;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            // Draw drawing layer
            ctx.drawImage(canvas, 0, 0);

            const previewUrl = tempCanvas.toDataURL('image/png', 0.5); // Compress preview
            console.log('Created preview URL, length:', previewUrl.length);

            const slotData: SaveSlot = {
                id: slotId,
                timestamp: Date.now(),
                preview: previewUrl,
                drawingData: drawingData,
                backgroundImageId: selectedImageId,
                brushSettings: {
                    color: selectedColor,
                    size: brushSize,
                    tool: toolMode
                }
            };

            console.log('Saving slot data to IndexedDB...');
            const { saveSlot } = await import('./utils/storage');
            await saveSlot(slotData);
            console.log('Save completed successfully');
        } catch (error) {
            console.error('Error saving to slot:', error);
            throw error; // Re-throw so SaveSlotsModal can handle it
        }
    };


    const handleLoadFromSlot = (slot: SaveSlot) => {
        // Restore state
        setSelectedImageId(slot.backgroundImageId);
        setSelectedColor(slot.brushSettings.color);
        setBrushSize(slot.brushSettings.size);
        setToolMode(slot.brushSettings.tool);

        if (canvasRef.current) {
            canvasRef.current.restoreImageData(slot.drawingData);
        }

        setShowSaveSlots(false);
    };

    // Get selected image with fallback
    const selectedImage = AVAILABLE_IMAGES.find(img => img.id === selectedImageId) || AVAILABLE_IMAGES[0];

    // Fallback to a default image if no images are available
    const imageSrc = selectedImage?.path || '/images/color-garden/animal_pikachu_01.png';

    // Log for debugging
    if (AVAILABLE_IMAGES.length === 0) {
        console.warn('No images found in /images/color-garden/. Please add PNG files to this directory.');
    }

    // Simple iOS detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    return (
        <PageContainer
            title="自由著色"
            headerRight={
                <div className="cg-header-controls">
                    <button
                        onClick={onSwitchMode}
                        className="cg-mode-switch-btn"
                    >
                        切換模式
                    </button>
                    <BackToHomeButton />
                </div>
            }
            scrollable={false}
        >
            <div className="cg-game-layout">
                {/* Left Side: Canvas Area */}
                <div className="cg-canvas-area">
                    <div className="cg-canvas-container">
                        <ColoringCanvas
                            ref={canvasRef}
                            imageSrc={imageSrc}
                            color={selectedColor}
                            brushSize={brushSize}
                            mode={toolMode}
                        />
                    </div>
                </div>

                {/* Right Side: Toolbar */}
                <div className="cg-toolbar">
                    {/* Top Row: Folder & Camera */}
                    <div className="cg-toolbar-row">
                        <button
                            className="cg-tool-btn cg-btn-img cg-btn-small"
                            onClick={handleFolderClick}
                            title="選擇圖紙"
                        >
                            <img src="/assets/images/color-garden/tool-finish.png" alt="Select Image" />
                        </button>

                        <button
                            className="cg-tool-btn cg-btn-img cg-btn-small"
                            onClick={handleSaveImage}
                            title="儲存圖片"
                        >
                            <img src="/assets/images/color-garden/tool-camera.png" alt="Camera" />
                        </button>
                    </div>

                    {/* 3. Brush Button */}
                    <div style={{ position: 'relative', width: '100%' }}>
                        <button
                            className={`cg-tool-btn cg-btn-img ${toolMode === 'brush' ? 'active' : ''}`}
                            onClick={() => handleToolClick('brush')}
                            title="畫筆"
                        >
                            <img src="/assets/images/color-garden/tool-brush.png" alt="Brush" />
                            {/* Show current color indicator on brush */}
                            {toolMode === 'brush' && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: '4px',
                                        right: '4px',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: selectedColor,
                                        border: '2px solid white',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                    }}
                                />
                            )}
                        </button>
                        {/* Brush Size Slider */}
                        {activeSlider === 'brush' && (
                            <div className="cg-slider-popover">
                                <input
                                    type="range"
                                    min={BRUSH_SIZE_MIN}
                                    max={BRUSH_SIZE_MAX}
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(Number(e.target.value))}
                                    className="cg-vertical-range"
                                />
                                <div className="cg-palette-arrow" />
                            </div>
                        )}
                    </div>

                    {/* 4. Color Palette Button */}
                    <div style={{ position: 'relative', width: '100%' }}>
                        <button
                            className={`cg-tool-btn cg-btn-img ${showPalette ? 'active' : ''}`}
                            onClick={handlePaletteToggle}
                            title="選色"
                        >
                            <img src="/assets/images/color-garden/tool-palette.png" alt="Palette" />
                        </button>

                        {/* Palette Popover */}
                        {showPalette && (
                            <div
                                className="cg-palette-popover"
                                style={{
                                    gridTemplateColumns: 'repeat(3, 1fr)', // 3 Columns
                                    gridAutoFlow: 'column', // Fill columns first (vertical grouping)
                                    gridTemplateRows: 'repeat(5, 1fr)', // 5 Rows
                                    width: '240px', // Increased width for 3 columns
                                    height: 'auto',
                                    maxHeight: '400px'
                                }}
                            >
                                {PALETTE_COLORS.map(color => (
                                    <button
                                        key={color}
                                        className={`cg-palette-color ${selectedColor === color ? 'selected' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => handleColorSelect(color)}
                                    />
                                ))}
                                {/* Triangle Arrow */}
                                <div className="cg-palette-arrow" />
                            </div>
                        )}
                    </div>

                    {/* 5. Eraser Button */}
                    <div style={{ position: 'relative', width: '100%' }}>
                        <button
                            className={`cg-tool-btn cg-btn-img ${toolMode === 'eraser' ? 'active' : ''}`}
                            onClick={() => handleToolClick('eraser')}
                            title="橡皮擦"
                        >
                            <img src="/assets/images/color-garden/tool-eraser.png" alt="Eraser" />
                        </button>
                        {/* Eraser Size Slider */}
                        {activeSlider === 'eraser' && (
                            <div className="cg-slider-popover">
                                <input
                                    type="range"
                                    min={BRUSH_SIZE_MIN}
                                    max={BRUSH_SIZE_MAX}
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(Number(e.target.value))}
                                    className="cg-vertical-range"
                                />
                                <div className="cg-palette-arrow" />
                            </div>
                        )}
                    </div>

                    {/* 6. Temp Save Button (Below Eraser) */}
                    <div style={{ position: 'relative', width: '100%' }}>
                        <button
                            className="cg-tool-btn cg-btn-img"
                            onClick={() => setShowSaveSlots(true)}
                            title="暫存作品"
                        >
                            <img src="/assets/images/color-garden/tool-save-temp.png" alt="Temp Save" />
                        </button>
                    </div>

                    {/* Bottom Row: Undo & Clear (responsive) */}
                    <div className="cg-toolbar-row cg-toolbar-bottom">
                        <button className="cg-tool-btn cg-btn-img cg-btn-small" onClick={handleUndo} title="復原">
                            <img src="/assets/images/color-garden/tool-undo.png" alt="Undo" />
                        </button>

                        <button className="cg-tool-btn cg-btn-img cg-btn-small" onClick={handleClear} title="全部清除">
                            <img src="/assets/images/color-garden/tool-clear.png" alt="Clear" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Selector Modal */}
            {showImageSelector && AVAILABLE_IMAGES.length > 0 && (
                <ImageSelector
                    images={AVAILABLE_IMAGES}
                    selectedImageId={selectedImageId}
                    onSelect={handleImageSelect}
                    onClose={() => setShowImageSelector(false)}
                />
            )}

            {/* Save Slots Modal */}
            {showSaveSlots && (
                <SaveSlotsModal
                    onClose={() => setShowSaveSlots(false)}
                    onSave={handleSaveToSlot}
                    onLoad={handleLoadFromSlot}
                />
            )}

            {/* Save Preview Modal */}
            {previewImage && (
                <div className="cg-modal-overlay" style={{ zIndex: 2000 }}>
                    <div className="cg-modal-content" style={{ maxWidth: '90%', width: 'auto', textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', color: '#333' }}>
                            {isIOS ? '長按圖片儲存' : '預覽圖片'}
                        </h2>
                        <div style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '1rem',
                            maxHeight: '60vh',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <img
                                src={previewImage}
                                alt="Preview"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '60vh',
                                    objectFit: 'contain',
                                    // Add touch-callout to ensure long-press menu works on iOS
                                    WebkitTouchCallout: 'default'
                                }}
                            />
                        </div>
                        <p style={{ marginBottom: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
                            {isIOS
                                ? '請長按上方圖片，選擇「加入照片」'
                                : '長按圖片可直接儲存，或點擊下方按鈕'
                            }
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={handleClosePreview}
                                className="cg-modal-close-btn"
                                style={{ position: 'static', width: 'auto', padding: '0.5rem 1.5rem', fontSize: '1rem' }}
                            >
                                關閉
                            </button>
                            {!isIOS && (
                                <button
                                    onClick={handleDownload}
                                    style={{
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '20px',
                                        padding: '0.5rem 1.5rem',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    下載
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </PageContainer>
    );
};
