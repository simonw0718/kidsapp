/**
 * Learning Storage Service
 * Manages localStorage persistence for question weights and learning statistics
 */

export interface QuestionWeight {
    id: string;
    weight: number;
    correctCount: number;
    wrongCount: number;
    lastSeen: number; // timestamp
}

const STORAGE_KEY = 'kidsapp_learning_weights';

/**
 * Save weights to localStorage
 */
export function saveWeights(weights: Record<string, QuestionWeight>): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
    } catch (error) {
        console.error('Failed to save learning weights:', error);
    }
}

/**
 * Load weights from localStorage
 */
export function loadWeights(): Record<string, QuestionWeight> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return {};
        return JSON.parse(stored);
    } catch (error) {
        console.error('Failed to load learning weights:', error);
        return {};
    }
}

/**
 * Clear all stored weights
 */
export function clearWeights(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear learning weights:', error);
    }
}
