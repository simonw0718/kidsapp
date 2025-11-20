/**
 * Weight Manager
 * Manages question weights for adaptive learning
 */

import { loadWeights, saveWeights, type QuestionWeight } from './learningStorage';

// Weight configuration
const DEFAULT_WEIGHT = 1.0;
const MIN_WEIGHT = 1.0;
const MAX_WEIGHT = 5.0;
const WEIGHT_INCREASE = 0.3; // On incorrect answer (降低權重增加，減少出題機率提升幅度)
const WEIGHT_DECREASE = 0.2; // On correct answer

class WeightManager {
    private weights: Record<string, QuestionWeight> = {};

    constructor() {
        this.weights = loadWeights();
    }

    /**
     * Get current weight for a question
     */
    getWeight(id: string): number {
        return this.weights[id]?.weight ?? DEFAULT_WEIGHT;
    }

    /**
     * Update weight based on answer correctness
     */
    updateWeight(id: string, correct: boolean): void {
        const current = this.weights[id] || {
            id,
            weight: DEFAULT_WEIGHT,
            correctCount: 0,
            wrongCount: 0,
            lastSeen: Date.now(),
        };

        if (correct) {
            current.correctCount++;
            current.weight = Math.max(MIN_WEIGHT, current.weight - WEIGHT_DECREASE);
        } else {
            current.wrongCount++;
            current.weight = Math.min(MAX_WEIGHT, current.weight + WEIGHT_INCREASE);
        }

        current.lastSeen = Date.now();
        this.weights[id] = current;
        saveWeights(this.weights);
    }

    /**
     * Select an item by weight (weighted random selection)
     */
    selectByWeight<T>(items: T[], getId: (item: T) => string): T {
        if (items.length === 0) {
            throw new Error('Cannot select from empty array');
        }

        // Calculate total weight
        const totalWeight = items.reduce((sum, item) => {
            return sum + this.getWeight(getId(item));
        }, 0);

        // Random selection based on weight
        let random = Math.random() * totalWeight;

        for (const item of items) {
            const weight = this.getWeight(getId(item));
            random -= weight;
            if (random <= 0) {
                return item;
            }
        }

        // Fallback (should not reach here)
        return items[items.length - 1];
    }

    /**
     * Get statistics for a question
     */
    getStats(id: string): QuestionWeight | null {
        return this.weights[id] || null;
    }

    /**
     * Get all statistics
     */
    getAllStats(): Record<string, QuestionWeight> {
        return { ...this.weights };
    }

    /**
     * Reset all weights to default
     */
    resetWeights(): void {
        this.weights = {};
        saveWeights(this.weights);
    }

    /**
     * Reset weight for a specific question
     */
    resetWeight(id: string): void {
        delete this.weights[id];
        saveWeights(this.weights);
    }
}

// Singleton instance
export const weightManager = new WeightManager();
