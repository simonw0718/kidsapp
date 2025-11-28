import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { useCanvas } from '../hooks/useCanvas';

interface ColoringCanvasProps {
    imageSrc?: string;
    color: string;
    brushSize: number;
    mode: 'brush' | 'eraser';
}

export interface ColoringCanvasHandle {
    undo: () => void;
    clear: () => void;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    getImageData: () => ImageData | null;
    restoreImageData: (data: ImageData) => void;
}

export const ColoringCanvas = forwardRef<ColoringCanvasHandle, ColoringCanvasProps>(({ imageSrc, color, brushSize, mode }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { canvasRef, startDrawing, draw, stopDrawing, undo, clearCanvas, initializeCanvas, resizeCanvas, getImageData, restoreImageData } = useCanvas({ color, brushSize, mode });

    // Cursor State
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
    const [isHovering, setIsHovering] = useState(false);

    useImperativeHandle(ref, () => ({
        undo,
        clear: clearCanvas,
        canvasRef,
        getImageData,
        restoreImageData
    }));

    // Handle Touch Events
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault(); // Prevent scrolling
        const touch = e.touches[0];
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            startDrawing(x, y);
            setCursorPos({ x, y });
            setIsHovering(true);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            draw(x, y);
            setCursorPos({ x, y });
        }
    };

    const handleTouchEnd = () => {
        stopDrawing();
        setIsHovering(false);
    };

    // Handle Mouse Events
    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            startDrawing(e.clientX - rect.left, e.clientY - rect.top);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            draw(x, y);
            setCursorPos({ x, y });
        }
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
        stopDrawing();
        setIsHovering(false);
    };

    // Resize canvas on container resize using ResizeObserver
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let isFirstMount = true;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                // Use contentRect for precise dimensions
                if (width > 0 && height > 0) {
                    if (isFirstMount) {
                        initializeCanvas(width, height);
                        isFirstMount = false;
                    } else {
                        resizeCanvas(width, height);
                    }
                }
            }
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, [initializeCanvas, resizeCanvas]);

    return (
        <div
            ref={containerRef}
            className="cg-canvas-wrapper"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ position: 'relative', overflow: 'hidden', touchAction: 'none' }}
        >
            {/* Layer 0: Background Image */}
            {imageSrc && (
                <img
                    src={imageSrc}
                    alt="Coloring Template"
                    className="cg-canvas-layer cg-canvas-image"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
            )}

            {/* Layer 1: Brush Canvas - Always render and fill container */}
            <canvas
                ref={canvasRef}
                className="cg-canvas-layer cg-canvas-drawing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={stopDrawing}
                style={{ width: '100%', height: '100%', cursor: 'none' }} // Hide default cursor
            />

            {/* Eraser/Brush Cursor */}
            {isHovering && cursorPos && (mode === 'eraser' || mode === 'brush') && (
                <div
                    style={{
                        position: 'absolute',
                        left: cursorPos.x,
                        top: cursorPos.y,
                        width: brushSize,
                        height: brushSize,
                        borderRadius: '50%',
                        border: mode === 'eraser' ? '1px solid #333' : '1px solid rgba(0,0,0,0.2)',
                        backgroundColor: mode === 'eraser' ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        zIndex: 10,
                        boxShadow: mode === 'eraser' ? '0 0 2px rgba(0,0,0,0.5)' : 'none'
                    }}
                />
            )}
        </div>
    );
});

ColoringCanvas.displayName = 'ColoringCanvas';
