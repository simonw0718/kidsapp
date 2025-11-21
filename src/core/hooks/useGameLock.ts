import { useEffect } from 'react';

/**
 * useGameLock
 * 
 * A hook to lock the viewport for game pages.
 * It prevents scrolling and zooming by modifying the document body styles.
 * 
 * Effect:
 * - Sets `touch-action: none` to prevent double-tap zoom and pinch zoom (on some browsers).
 * - Sets `overflow: hidden` to prevent scrolling.
 * - Prevents default behavior for `touchmove` if scale > 1 (attempt to block pinch-zoom).
 */
export const useGameLock = () => {
    useEffect(() => {
        // 1. Save original styles
        const originalTouchAction = document.body.style.touchAction;
        const originalOverflow = document.body.style.overflow;

        // 2. Apply lock styles
        document.body.style.touchAction = 'none';
        document.body.style.overflow = 'hidden';

        // 3. Prevent pinch-zoom via event listener (more aggressive)
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        };

        // Add non-passive event listener to intercept touch moves
        document.addEventListener('touchmove', handleTouchMove, { passive: false });

        // Cleanup
        return () => {
            document.body.style.touchAction = originalTouchAction;
            document.body.style.overflow = originalOverflow;
            document.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);
};
