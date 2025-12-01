import React from 'react';
import type { GameRecord } from '../hooks/useHistory';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: GameRecord[];
    onClear: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onClear }) => {
    if (!isOpen) return null;

    return (
        <div className="pm-modal-overlay" onClick={onClose}>
            <div className="pm-modal-content" onClick={e => e.stopPropagation()}>
                <div className="pm-modal-header">
                    <h2>Game History</h2>
                    <button className="pm-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="pm-history-list">
                    {history.length === 0 ? (
                        <div className="pm-no-history">No games played yet.</div>
                    ) : (
                        <table className="pm-history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Score</th>
                                    <th>Mode</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(record => (
                                    <tr key={record.id}>
                                        <td>{new Date(record.date).toLocaleDateString()} {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="pm-score-cell">
                                            <span className={`pm-score-badge ${record.score === record.total ? 'perfect' : ''}`}>
                                                {record.score}/{record.total}
                                            </span>
                                        </td>
                                        <td>
                                            {record.mode === 'dinosaur' ? 'Dinosaur' : `Level ${record.difficulty}`}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="pm-modal-footer">
                    <button className="pm-clear-btn" onClick={onClear} disabled={history.length === 0}>
                        Clear History
                    </button>
                </div>
            </div>
        </div>
    );
};
