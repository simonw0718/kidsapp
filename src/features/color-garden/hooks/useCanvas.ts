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

    return {
        canvasRef,
        startDrawing,
        draw,
        stopDrawing,
        clearCanvas,
        undo,
        canUndo: history.length > 1,
        initializeCanvas
    };
};
