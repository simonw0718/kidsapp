import { useState, useEffect, useCallback } from 'react';

export interface AbacusGameRecord {
    id: string;
    date: number; // timestamp
    score: number;
    total: number;
    mode: string;
    difficulty: string;
}

const STORAGE_KEY = 'abacus_game_history';

export const useAbacusHistory = () => {
    const [history, setHistory] = useState<AbacusGameRecord[]>([]);

    // Load history on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load abacus history:', e);
        }
    }, []);

    const addRecord = useCallback((score: number, total: number, mode: string, difficulty: string) => {
        const newRecord: AbacusGameRecord = {
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
                console.error('Failed to save abacus history:', e);
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
