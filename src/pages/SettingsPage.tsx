import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/common/PageContainer';
import { BackToHomeButton } from '../components/common/BackToHomeButton';
import { useModal } from '../components/common/CustomModal';
import { VOCAB_LIST } from '../features/picture-match/data/vocab';
import { avatarPairs } from '../features/abacus/utils/avatarAssets';
import { audioManager } from '../core/audio/audioPlayer';
import './settings.css';

const CACHE_NAME = 'kidsapp-v11'; // Must match sw.js

// Hardcoded assets for Animal Game
const ANIMAL_GAME_ASSETS = [
    '/images/animals-game/rabbit_win.png',
    '/images/animals-game/rabbit_jump.png',
    '/images/animals-game/rabbit_to_up.png',
    '/images/animals-game/rabbit_to_down.png',
    '/images/animals-game/rabbit_to_left.png',
    '/images/animals-game/rabbit_to_right.png',
    '/images/animals-game/dino_win.png',
    '/images/animals-game/dino_jump.png',
    '/images/animals-game/dino_up.png',
    '/images/animals-game/dino_down.png',
    '/images/animals-game/dino_left.png',
    '/images/animals-game/dino_right.png',
];

// Common sounds
// Common sounds & UI assets
const COMMON_ASSETS = [
    '/audio/correct_sound.mp3',
    '/audio/failure_sound.mp3',
    '/images/picture-match/ready-go.png',
];

export const SettingsPage: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'downloading' | 'done' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);
    const [cachedCount, setCachedCount] = useState<number>(0);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const { showConfirm, showAlert, CustomModalComponent } = useModal();
    const [volume, setVolume] = useState<number>(() => {
        const saved = localStorage.getItem('app-volume');
        return saved ? parseInt(saved) : 70; // Default 70%
    });

    // Check cache status on mount
    useEffect(() => {
        checkCacheStatus();
    }, []);

    // Save volume to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('app-volume', volume.toString());
        // Update audioManager volume
        audioManager.setVolume(volume / 100);
    }, [volume]);

    const handleVolumeTest = async () => {
        try {
            // Ensure AudioContext is resumed before playing
            await audioManager.resumeContext();
            // Play test sound at current volume
            audioManager.playTestSound();
        } catch (error) {
            console.error('Failed to play test sound:', error);
        }
    };

    const checkCacheStatus = async () => {
        if (!('caches' in window)) return;
        try {
            const cache = await caches.open(CACHE_NAME);
            const keys = await cache.keys();
            setCachedCount(keys.length);
        } catch (e) {
            console.error('Failed to check cache', e);
        }
    };

    const collectAllAssets = () => {
        const assets = new Set<string>();

        // 1. Picture Match
        VOCAB_LIST.forEach(item => {
            if (item.image && item.image.startsWith('/')) {
                assets.add(item.image);
            }
            if (item.audio && item.audio.startsWith('/')) {
                assets.add(item.audio);
            }
        });

        // 2. Abacus
        avatarPairs.forEach(pair => {
            assets.add(pair.think);
            assets.add(pair.answer);
        });
        assets.add('/icons/abacus_entry.png');

        // 3. Animal Game
        ANIMAL_GAME_ASSETS.forEach(url => assets.add(url));

        // 4. Common
        COMMON_ASSETS.forEach(url => assets.add(url));

        return Array.from(assets);
    };

    const calculateEstimatedSize = (urls: string[]) => {
        let size = 0;
        urls.forEach(url => {
            if (url.endsWith('.mp3')) {
                size += 50 * 1024; // 50KB for audio
            } else {
                size += 100 * 1024; // 100KB for images
            }
        });
        return (size / 1024 / 1024).toFixed(1); // MB
    };

    // Helper to clean response (remove redirected flag)
    const cleanResponse = async (response: Response) => {
        const blob = await response.blob();
        const clean = new Response(blob, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
        return clean;
    };

    const handleDownload = async () => {
        if (!window.isSecureContext) {
            showAlert('離線功能需要 HTTPS 或 localhost 環境 (Secure Context)。\n如果您正在使用區域網路 IP (如 192.168.x.x) 測試，請改用 localhost 或設定 HTTPS。');
            return;
        }

        if (!('caches' in window)) {
            showAlert('您的瀏覽器不支援離線功能 (Cache API not available)');
            return;
        }

        const urls = collectAllAssets();
        const estimatedSize = calculateEstimatedSize(urls);

        showConfirm(`預計將下載約 ${estimatedSize} MB 的資料。確定要繼續嗎？`, async () => {
            setStatus('downloading');
            setProgress(0);
            setErrorMsg('');

            try {
                setTotal(urls.length);

                const cache = await caches.open(CACHE_NAME);

                // Download one by one to track progress
                let completed = 0;
                const batchSize = 5; // Parallel requests

                for (let i = 0; i < urls.length; i += batchSize) {
                    const batch = urls.slice(i, i + batchSize);
                    await Promise.all(batch.map(async (url) => {
                        try {
                            // Manual Fetch -> Clean -> Put (to avoid redirected response error)
                            const response = await fetch(url);
                            if (!response.ok) throw new Error(`Failed to fetch ${url}`);

                            const clean = await cleanResponse(response);
                            await cache.put(url, clean);
                        } catch (e) {
                            console.warn(`Failed to cache ${url}`, e);
                            // Don't fail the whole process, just log
                        } finally {
                            completed++;
                            setProgress(completed);
                        }
                    }));
                }

                setStatus('done');
                checkCacheStatus();
            } catch (e) {
                console.error(e);
                setStatus('error');
                setErrorMsg('下載過程中發生錯誤，請重試');
            }
        });
    };

    const handleClearCache = () => {
        showConfirm('確定要清除所有離線暫存嗎？下次使用將需要重新下載。', async () => {
            try {
                await caches.delete(CACHE_NAME);
                setCachedCount(0);
                showAlert('暫存已清除');
            } catch (e) {
                console.error(e);
                showAlert('清除失敗');
            }
        });
    };

    const handleForceUpdate = () => {
        showConfirm('這將強制重新整理並更新應用程式。確定要繼續嗎？', async () => {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
                window.location.reload();
            } else {
                window.location.reload();
            }
        });
    };

    return (
        <PageContainer
            title="設定"
            headerRight={<BackToHomeButton />}
            scrollable={true}
        >
            <div className="settings-container">
                <div className="settings-section">
                    <h3 className="settings-title">離線使用設定</h3>
                    <p className="settings-info">
                        您可以預先下載所有遊戲內容（圖片、音檔），以便在沒有網路的環境下（如飛機上）使用。
                        <br />
                        <span style={{ fontSize: '14px', color: '#888', marginTop: '8px', display: 'block' }}>
                            預估下載大小：約 {calculateEstimatedSize(collectAllAssets())} MB
                        </span>
                    </p>

                    <div className="cache-stats">
                        <div className="stat-item">
                            <span className="stat-value">{cachedCount}</span>
                            <span className="stat-label">已快取檔案</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{total > 0 ? total : '-'}</span>
                            <span className="stat-label">總檔案數</span>
                        </div>
                    </div>

                    {status === 'downloading' && (
                        <div className="progress-container">
                            <div className="settings-status">
                                <span className="status-icon">⬇️</span>
                                <span>下載中... ({progress} / {total})</span>
                            </div>
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${(progress / total) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {status === 'done' && (
                        <div className="settings-status" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                            <span className="status-icon">✅</span>
                            <span>下載完成！現在可以離線使用了。</span>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="settings-status" style={{ background: '#ffebee', color: '#c62828' }}>
                            <span className="status-icon">⚠️</span>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <div className="settings-actions">
                        <button
                            className="settings-btn btn-download"
                            onClick={handleDownload}
                            disabled={status === 'downloading'}
                        >
                            {status === 'downloading' ? '下載中...' : '📥 下載所有離線內容'}
                        </button>

                        <button
                            className="settings-btn btn-clear"
                            onClick={handleClearCache}
                            disabled={status === 'downloading'}
                        >
                            🗑️ 清除暫存
                        </button>
                    </div>
                </div>

                <div className="settings-section">
                    <h3 className="settings-title">🔊 音量控制</h3>
                    <p className="settings-info">
                        調整所有遊戲的音效音量大小
                    </p>

                    <div className="volume-control">
                        <div className="volume-header">
                            <span className="volume-label">音量</span>
                            <span className="volume-value">{volume}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => setVolume(parseInt(e.target.value))}
                            className="volume-slider"
                        />
                        <div className="volume-marks">
                            <span>🔇 靜音</span>
                            <span>🔊 最大</span>
                        </div>
                        <button
                            className="settings-btn btn-test"
                            onClick={handleVolumeTest}
                            style={{ marginTop: '16px', background: '#4CAF50' }}
                        >
                            🎵 測試音量
                        </button>
                    </div>
                </div>

                <div className="settings-section">
                    <h3 className="settings-title">關於</h3>
                    <p className="settings-info">
                        KidsApp v1.0.1<br />
                        Cache Version: {CACHE_NAME}
                    </p>
                    <button
                        className="settings-btn"
                        onClick={handleForceUpdate}
                        style={{ marginTop: '12px', background: '#607d8b' }}
                    >
                        🔄 強制更新 App
                    </button>
                </div>
            </div>
            {CustomModalComponent}
        </PageContainer>
    );
};
