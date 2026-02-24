'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import styles from './ResultsGrid.module.css';
import { useLanguage } from '../../context/LanguageContext';

interface ResultsGridProps {
    initialQuery?: string;
    imageUrl?: string;
}

interface ImageResult {
    id: number;
    title: string;
    url: string;
    source: string;
    width: number;
    height: number;
    isClean?: boolean;
    snippet?: string;
    downloadUrl?: string;
}

const QUALITY_DOMAINS = [
    'unsplash', 'pexels', 'pixabay', 'getty', 'shutterstock', 'adobe.stock',
    'istockphoto', 'alamy', 'depositphotos', 'dreamstime', 'flickr',
];
const SIZE_PATTERNS = [
    /[\/\-_](?:large|original|full|xl|xxl|hd|fullsize|high[-_]?res|hi[-_]?res)[\/\-_]/i,
    /[\/\-_](\d{3,4})x(\d{3,4})[\/\-_.]/,
    /[\/\-_](\d{3,4})[\/\-_.]/,
    /[?&](?:w|width)=(\d+)/i,
    /[?&](?:h|height)=(\d+)/i,
];

function scoreForSize(url: string): number {
    if (!url) return 0;
    let score = 0;
    for (const re of SIZE_PATTERNS) {
        const m = url.match(re);
        if (m) {
            if (m[1] && m[2]) score = Math.max(score, parseInt(m[1], 10) * parseInt(m[2], 10));
            else if (m[1]) score = Math.max(score, parseInt(m[1], 10));
        }
    }
    return Math.min(score, 4000000);
}

function scoreForDomain(source: string, downloadUrl?: string): number {
    const lower = (source + ' ' + (downloadUrl || '')).toLowerCase();
    for (const d of QUALITY_DOMAINS) {
        if (lower.includes(d)) return 200;
    }
    return 0;
}

function pickBestMatch(results: ImageResult[]): ImageResult | null {
    if (results.length === 0) return null;
    const scored = results.map((r) => {
        const clean = (r.isClean ? 10000 : 0);
        const area = (r.width || 0) * (r.height || 0);
        const domain = scoreForDomain(r.source, r.downloadUrl);
        const urlSize = scoreForSize(r.downloadUrl || r.url || '');
        return { result: r, score: clean + area + domain + urlSize };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored[0].result;
}

function ResultCard({
    result,
    isBest,
    index,
    t,
}: {
    result: ImageResult;
    isBest: boolean;
    index: number;
    t: ReturnType<typeof useLanguage>['t'];
}) {
    return (
        <div
            className={`${styles.card} ${isBest ? styles.bestCard : ''}`}
            style={{ animationDelay: `${index * 0.07}s` }}
        >
            <div className={styles.imageWrapper}>
                {result.url ? (
                    <a
                        href={result.downloadUrl || result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.imageLink}
                    >
                        <img
                            src={result.url}
                            alt={result.title}
                            className={styles.image}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const placeholder = e.currentTarget
                                    .closest(`.${styles.imageWrapper}`)
                                    ?.querySelector(`.${styles.webResultPlaceholder}`);
                                if (placeholder) placeholder.classList.remove(styles.hidden);
                            }}
                        />
                    </a>
                ) : (
                    <div className={`${styles.webResultPlaceholder} ${result.url ? styles.hidden : ''}`}>
                        <span aria-hidden>🔗</span>
                    </div>
                )}
                <div className={styles.overlay}>
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => window.open(result.downloadUrl || result.url, '_blank')}
                    >
                        {result.isClean ? t.results.download : t.results.openImage}
                    </Button>
                </div>
                {result.isClean && (
                    <div className={styles.cleanBadge}>✨ {t.results.clean}</div>
                )}
                {isBest && <div className={styles.bestBadge}>{t.results.bestMatch}</div>}
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{result.title}</h3>
                <div className={styles.meta}>
                    <span>{result.source}</span>
                </div>
            </div>
        </div>
    );
}

const LOADING_STEP_INTERVAL_MS = 2200;

export const ResultsGrid = ({ initialQuery, imageUrl }: ResultsGridProps) => {
    const { t } = useLanguage();
    const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);
    const [results, setResults] = useState<ImageResult[]>([]);
    const [visibleCount, setVisibleCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);

    const steps = (t.results as { loadingSteps?: string[] }).loadingSteps ?? [t.results.analyzing];

    useEffect(() => {
        if (!loading) return;
        setLoadingStep(0);
        const interval = setInterval(() => {
            setLoadingStep((prev) => (prev + 1) % steps.length);
        }, LOADING_STEP_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [loading, steps.length]);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            setVisibleCount(0);
            try {
                let newResults: ImageResult[] = [];
                if (imageUrl) {
                    const response = await fetch('/api/reverse-search', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imageUrl }),
                    });
                    const data = await response.json();
                    if (data.success && data.results) newResults = data.results;
                } else {
                    const query = initialQuery || 'technology';
                    await new Promise((r) => setTimeout(r, 800));
                    newResults = Array.from({ length: 12 }).map((_, i) => ({
                        id: i,
                        title: `${query} ${i + 1}`,
                        url: `https://loremflickr.com/800/600/${encodeURIComponent(query)}?random=${i}`,
                        source: i % 3 === 0 ? 'Unsplash' : i % 3 === 1 ? 'Pexels' : 'Pixabay',
                        width: 800,
                        height: 600,
                    }));
                }
                setResults(newResults);
                setVisibleCount(Math.min(6, newResults.length));
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [initialQuery, imageUrl]);

    useEffect(() => {
        if (results.length === 0 || visibleCount >= results.length) return;
        const t = setTimeout(() => {
            setVisibleCount((c) => Math.min(c + 6, results.length));
        }, 100);
        return () => clearTimeout(t);
    }, [results.length, visibleCount]);

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p className={styles.loadingMessage} key={loadingStep}>
                    {steps[loadingStep]}
                </p>
                <div className={styles.loadingSteps}>
                    {steps.map((_, i) => (
                        <span
                            key={i}
                            className={`${styles.stepDot} ${i === loadingStep ? styles.stepDotActive : ''} ${i < loadingStep ? styles.stepDotDone : ''}`}
                            aria-hidden
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!loading && results.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>{t.results.noResults}</p>
            </div>
        );
    }

    const best = imageUrl ? pickBestMatch(results) : null;
    const rest = best ? results.filter((r) => r.id !== best.id) : results;
    const restToShow = best ? visibleCount - 1 : visibleCount;
    const visibleRest = rest.slice(0, Math.max(0, restToShow));
    const isImageSearch = !!imageUrl;

    return (
        <>
            <div className={isImageSearch ? styles.listLayout : styles.gridLayout}>
                {best && (
                    <div className={styles.bestSection}>
                        <ResultCard result={best} isBest index={0} t={t} />
                    </div>
                )}
                <div className={styles.twoColGrid}>
                    {visibleRest.map((result, i) => (
                        <ResultCard
                            key={result.id}
                            result={result}
                            isBest={false}
                            index={i + (best ? 1 : 0)}
                            t={t}
                        />
                    ))}
                </div>
            </div>

            <Modal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                title={t.results.imageDetail}
            >
                {selectedImage && (
                    <div className={styles.modalContent}>
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.title}
                            className={styles.modalImage}
                        />
                        <div>
                            <h4 className={styles.modalTitle}>{selectedImage.title}</h4>
                            <p className={styles.modalMeta}>
                                Kaynak: {selectedImage.source} <br />
                                Boyut: {selectedImage.width} x {selectedImage.height} px <br />
                                {selectedImage.isClean && (
                                    <span className={styles.cleanText}>✔ Filigransız temiz sürüm</span>
                                )}
                            </p>
                            <div className={styles.modalActions}>
                                <a
                                    href={selectedImage.downloadUrl || selectedImage.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ flex: 1 }}
                                >
                                    <Button fullWidth>Ücretsiz İndir</Button>
                                </a>
                                <Button variant="outline" fullWidth onClick={() => setSelectedImage(null)}>
                                    Kapat
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};
