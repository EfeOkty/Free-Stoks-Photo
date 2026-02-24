'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useRef } from 'react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { ResultsGrid } from '../../components/features/ResultsGrid';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import styles from './page.module.css';
import { useLanguage } from '../../context/LanguageContext';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const imageUrl = searchParams.get('imageUrl');
    const { t } = useLanguage();
    const inputRef = useRef<HTMLInputElement>(null);

    const runSearch = () => {
        const val = inputRef.current?.value?.trim();
        if (!val) return;
        if (val.startsWith('http')) {
            window.location.href = `/search?imageUrl=${encodeURIComponent(val)}`;
        } else {
            window.location.href = `/search?q=${encodeURIComponent(val)}`;
        }
    };

    return (
        <>
            <div className={styles.searchHeader}>
                <div className="container">
                    <div className={styles.searchBarWrapper}>
                        <Input
                            ref={inputRef}
                            placeholder={t.hero.placeholder}
                            defaultValue={query || imageUrl || ''}
                            fullWidth
                            className={styles.input}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') runSearch();
                            }}
                        />
                        <Button onClick={runSearch}>{t.hero.cta}</Button>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className={styles.resultsInfo}>
                    <h1>
                        {imageUrl ? t.results.metaAnalysis : `${t.results.metaResults} "${query}"`}
                    </h1>
                </div>

                <ResultsGrid initialQuery={query || ''} imageUrl={imageUrl || ''} />
            </div>
        </>
    );
}

export default function SearchPage() {
    return (
        <main className={styles.main}>
            <Header />
            <div className={styles.contentGrow}>
                <Suspense fallback={<div className="container">Yükleniyor...</div>}>
                    <SearchContent />
                </Suspense>
            </div>
            <Footer />
        </main>
    );
}
