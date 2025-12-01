import { useState, useEffect, useCallback } from 'react';

export interface GameRecord {
    id: string;
    date: number; // timestamp
    score: number;
    total: number;
    mode: string;
    difficulty: string;
}

const STORAGE_KEY = 'picture_match_history';

export const useHistory = () => {
    const [history, setHistory] = useState<GameRecord[]>([]);

    // Load history on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load history:', e);
        }
    }, []);

    const addRecord = useCallback((score: number, total: number, mode: string, difficulty: string) => {
        const newRecord: GameRecord = {
            id: Date.now().toString(),
            date: Date.now(),
            score,
            total,
            mode,
            difficulty,
        };

        setHistory(prev => {
            const updated = [newRecord, ...prev].slice(0, 50); // Keep last 50 records
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (e) {
                console.error('Failed to save history:', e);
            }
            return updated;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return { history, addRecord, clearHistory };
};
