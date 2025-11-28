import { useRef, useState, useCallback, useEffect } from 'react';

interface UseCanvasProps {
    color: string;
    brushSize: number;
    mode: 'brush' | 'eraser';
}

export const useCanvas = ({ color, brushSize, mode }: UseCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    // Keep track of current props to use in initializeCanvas without adding dependencies
    const propsRef = useRef({ color, brushSize, mode });

    useEffect(() => {
        propsRef.current = { color, brushSize, mode };

        // Update existing context immediately when props change
        const context = contextRef.current;
        if (context) {
            context.strokeStyle = color;
            context.lineWidth = brushSize;
            if (mode === 'eraser') {
                context.globalCompositeOperation = 'destination-out';
            } else {
                context.globalCompositeOperation = 'source-over';
            }
        }
    }, [color, brushSize, mode]);

    const [history, setHistory] = useState<ImageData[]>([]);

    // Initialize canvas context and dimensions
    const initializeCanvas = useCallback((width: number, height: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas internal dimensions
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;

        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (context) {
            context.scale(window.devicePixelRatio, window.devicePixelRatio);
            context.lineCap = 'round';
            context.lineJoin = 'round';

            // Apply current styles from ref
            const { color, brushSize, mode } = propsRef.current;
            context.strokeStyle = color;
            context.lineWidth = brushSize;

            if (mode === 'eraser') {
                context.globalCompositeOperation = 'destination-out';
            } else {
                context.globalCompositeOperation = 'source-over';
            }

            contextRef.current = context;

            // Save initial blank state
            if (canvas.width > 0 && canvas.height > 0) {
                const initialData = context.getImageData(0, 0, canvas.width, canvas.height);
                setHistory([initialData]);
            }
        }
    }, []); // No dependencies to prevent re-initialization on prop changes

    const startDrawing = useCallback((x: number, y: number) => {
        if (!contextRef.current || !canvasRef.current) return;
        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);
        setIsDrawing(true);
    }, []);

    const draw = useCallback((x: number, y: number) => {
        if (!isDrawing || !contextRef.current) return;
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    }, [isDrawing]);

    const stopDrawing = useCallback(() => {
        if (!contextRef.current || !canvasRef.current || !isDrawing) return;
        contextRef.current.closePath();
        setIsDrawing(false);

        // Save state to history
        const canvas = canvasRef.current;
        const newData = contextRef.current.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prev => [...prev, newData]);
    }, [isDrawing]);

    const undo = useCallback(() => {
        if (history.length <= 1 || !contextRef.current || !canvasRef.current) return;

        const newHistory = [...history];
        newHistory.pop(); // Remove current state
        const previousState = newHistory[newHistory.length - 1];

        setHistory(newHistory);
        contextRef.current.putImageData(previousState, 0, 0);
    }, [history]);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !contextRef.current) return;
        contextRef.current.clearRect(0, 0, canvas.width, canvas.height);

        // Save cleared state
        const newData = contextRef.current.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prev => [...prev, newData]);
    }, []);

    // Resize canvas while preserving content
    const resizeCanvas = useCallback((width: number, height: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Check if dimensions actually changed to avoid unnecessary work
        const newWidth = Math.floor(width * window.devicePixelRatio);
        const newHeight = Math.floor(height * window.devicePixelRatio);

        if (canvas.width === newWidth && canvas.height === newHeight) return;

        // Save current content
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        tempCtx.drawImage(canvas, 0, 0);

        // Update dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;

        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (context) {
            context.scale(window.devicePixelRatio, window.devicePixelRatio);
            context.lineCap = 'round';
            context.lineJoin = 'round';

            // Restore content (scaled to fit new dimensions)
            context.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, width, height);

            // Restore context settings
            const { color, brushSize, mode } = propsRef.current;
            context.strokeStyle = color;
            context.lineWidth = brushSize;

            if (mode === 'eraser') {
                context.globalCompositeOperation = 'destination-out';
            } else {
                context.globalCompositeOperation = 'source-over';
            }

            contextRef.current = context;
        }
    }, []);

    // Get current image data for saving
    const getImageData = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !contextRef.current) return null;
        return contextRef.current.getImageData(0, 0, canvas.width, canvas.height);
    }, []);

    // Restore image data for loading
    const restoreImageData = useCallback((imageData: ImageData) => {
        const canvas = canvasRef.current;
        if (!canvas || !contextRef.current) return;

        // Resize canvas if needed to match saved data
        if (canvas.width !== imageData.width || canvas.height !== imageData.height) {
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            // Re-apply context settings after resize
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (context) {
                context.scale(window.devicePixelRatio, window.devicePixelRatio); // Wait, ImageData is raw pixels, scale might not matter for putImageData but matters for future drawing
                // Actually, putImageData ignores transformation matrix.
                // But we need to ensure context is valid for future drawing.
                context.lineCap = 'round';
                context.lineJoin = 'round';
                const { color, brushSize, mode } = propsRef.current;
                context.strokeStyle = color;
                context.lineWidth = brushSize;
                if (mode === 'eraser') {
                    context.globalCompositeOperation = 'destination-out';
                } else {
                    context.globalCompositeOperation = 'source-over';
                }
                contextRef.current = context;
            }
        }

        contextRef.current.putImageData(imageData, 0, 0);

        // Reset history
        setHistory([imageData]);
    }, []);

    return {
        canvasRef,
        startDrawing,
        draw,
        stopDrawing,
        clearCanvas,
        undo,
        canUndo: history.length > 1,
        initializeCanvas,
        resizeCanvas,
        getImageData,
        restoreImageData
    };
};
