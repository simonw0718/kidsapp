import React, { useState, useRef } from 'react';
import { PageContainer } from '../../components/common/PageContainer';
import { BackToHomeButton } from '../../components/common/BackToHomeButton';
import { ColoringCanvas, type ColoringCanvasHandle } from './components/ColoringCanvas';
import { ImageSelector } from './components/ImageSelector';
import { COLORING_IMAGES } from './config/images';
import './color-garden.css';

interface ColorGardenGameProps {
    onSwitchMode: () => void;
}

const PALETTE_COLORS = [
    '#FF4444', // Red
    '#FF8C00', // Orange
    '#FFD700', // Yellow
    '#4CAF50', // Green
    '#2196F3', // Blue
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
    const [brushSize, setBrushSize] = useState(10);
    const [toolMode, setToolMode] = useState<'brush' | 'eraser'>('brush');
    const [showPalette, setShowPalette] = useState(false);
    const [activeSlider, setActiveSlider] = useState<'brush' | 'eraser' | null>(null);

    // Image Selection State
    const [selectedImageId, setSelectedImageId] = useState(AVAILABLE_IMAGES[0]?.id || 'animal_pikachu_01');
    const [showImageSelector, setShowImageSelector] = useState(false);

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
        if (toolMode === mode) {
            // Toggle slider if already active tool
            setActiveSlider(activeSlider === mode ? null : mode);
        } else {
            // Switch tool and close other popovers
            setToolMode(mode);
            setActiveSlider(null);
            setShowPalette(false);
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

    const handleSaveImage = () => {
        // Show confirmation dialog
        if (!window.confirm('確定要儲存圖片嗎？')) {
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

        // Draw the background image if exists
        if (imageSrc) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                // Calculate image position (centered with object-fit: contain)
                const scale = Math.min(
                    tempCanvas.width / img.naturalWidth,
                    tempCanvas.height / img.naturalHeight
                );
                const width = img.naturalWidth * scale;
                const height = img.naturalHeight * scale;
                const x = (tempCanvas.width - width) / 2;
                const y = (tempCanvas.height - height) / 2;

                ctx.drawImage(img, x, y, width, height);

                // Draw the canvas content on top
                ctx.drawImage(canvas, 0, 0);

                // Download the image
                tempCanvas.toBlob((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `coloring-${Date.now()}.png`;
                        a.click();
                        URL.revokeObjectURL(url);
                    }
                }, 'image/png');
            };
            img.src = imageSrc;
        } else {
            // No background image, just save the drawing
            ctx.drawImage(canvas, 0, 0);
            tempCanvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `coloring-${Date.now()}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                }
            }, 'image/png');
        }
    };

    // Get selected image with fallback
    const selectedImage = AVAILABLE_IMAGES.find(img => img.id === selectedImageId) || AVAILABLE_IMAGES[0];

    // Fallback to a default image if no images are available
    const imageSrc = selectedImage?.path || '/images/color-garden/animal_pikachu_01.png';

    // Log for debugging
    if (AVAILABLE_IMAGES.length === 0) {
        console.warn('No images found in /images/color-garden/. Please add PNG files to this directory.');
    }

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
                    {/* Top Row: Folder & Camera (responsive) */}
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
                                    min="5"
                                    max="50"
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
                            <div className="cg-palette-popover">
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
                                    min="5"
                                    max="50"
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(Number(e.target.value))}
                                    className="cg-vertical-range"
                                />
                                <div className="cg-palette-arrow" />
                            </div>
                        )}
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
        </PageContainer>
    );
};
