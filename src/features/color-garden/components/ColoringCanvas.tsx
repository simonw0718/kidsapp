import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
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
}

export const ColoringCanvas = forwardRef<ColoringCanvasHandle, ColoringCanvasProps>(({ imageSrc, color, brushSize, mode }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { canvasRef, startDrawing, draw, stopDrawing, undo, clearCanvas, initializeCanvas } = useCanvas({ color, brushSize, mode });

    useImperativeHandle(ref, () => ({
        undo,
        clear: clearCanvas,
        canvasRef
    }));
    // Handle Touch Events
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault(); // Prevent scrolling
        const touch = e.touches[0];
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            draw(touch.clientX - rect.left, touch.clientY - rect.top);
        }
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
            draw(e.clientX - rect.left, e.clientY - rect.top);
        }
    };

    // Resize canvas on mount/resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { offsetWidth, offsetHeight } = containerRef.current;
                // Initialize canvas with container dimensions
                initializeCanvas(offsetWidth, offsetHeight);
            }
        };

        // Use setTimeout to ensure layout is complete
        const timeoutId = setTimeout(handleResize, 100);
        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
        };
    }, [initializeCanvas]);

    return (
        <div ref={containerRef} className="cg-canvas-wrapper">
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
                onTouchEnd={stopDrawing}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
});

ColoringCanvas.displayName = 'ColoringCanvas';
