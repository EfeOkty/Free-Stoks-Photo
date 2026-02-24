'use client';

import { useEffect, useState } from 'react';
import styles from './AnalysisView.module.css';

interface AnalysisViewProps {
    imageUrl: string;
    onComplete: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ imageUrl, onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Görsel analiz ediliyor...');

    useEffect(() => {
        const duration = 3000; // 3 seconds simulation
        const interval = 50;
        const steps = duration / interval;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const newProgress = Math.min((currentStep / steps) * 100, 100);
            setProgress(newProgress);

            if (newProgress > 30 && newProgress < 60) {
                setStatus('Web siteleri taranıyor...');
            } else if (newProgress >= 60 && newProgress < 90) {
                setStatus('Eşleşen görseller karşılaştırılıyor...');
            } else if (newProgress >= 90) {
                setStatus('Filigransız versiyonlar bulunuyor...');
            }

            if (currentStep >= steps) {
                clearInterval(timer);
                setTimeout(onComplete, 500);
            }
        }, interval);

        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.imageWrapper}>
                    <img src={imageUrl} alt="Analiz edilen görsel" className={styles.image} />
                    <div className={styles.scanLine} />
                </div>

                <div className={styles.info}>
                    <h3 className={styles.status}>{status}</h3>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className={styles.percentage}>%{Math.round(progress)}</p>
                </div>
            </div>
        </div>
    );
};
