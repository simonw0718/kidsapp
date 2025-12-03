import React from 'react';
import type { AbacusGameRecord } from '../hooks/useAbacusHistory';

interface AbacusHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: AbacusGameRecord[];
    onClear: () => void;
}

export const AbacusHistoryModal: React.FC<AbacusHistoryModalProps> = ({
    isOpen,
    onClose,
    history,
    onClear,
}) => {
    if (!isOpen) return null;

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('zh-TW', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="abacus-history-modal" onClick={onClose}>
            <div className="abacus-history-content" onClick={(e) => e.stopPropagation()}>
                <div className="abacus-history-header">
                    <h2>遊戲紀錄</h2>
                    <button className="abacus-history-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {history.length === 0 ? (
                    <div className="abacus-history-empty">尚無遊戲紀錄</div>
                ) : (
                    <>
                        <div className="abacus-history-table-container">
                            <table className="abacus-history-table">
                                <thead>
                                    <tr>
                                        <th>時間</th>
                                        <th>分數</th>
                                        <th>模式</th>
                                        <th>難度</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((record) => (
                                        <tr key={record.id}>
                                            <td>{formatDate(record.date)}</td>
                                            <td>
                                                <span className="abacus-history-score">
                                                    {record.score}/{record.total}
                                                </span>
                                            </td>
                                            <td>{record.mode === 'abacus' ? '算盤' : '純數學'}</td>
                                            <td>難度 {record.difficulty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button className="abacus-history-clear-btn" onClick={onClear}>
                            清除紀錄
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
