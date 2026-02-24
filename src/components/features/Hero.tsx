'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ArcadeEmbed } from './ArcadeEmbed';
import styles from './Hero.module.css';
import { useLanguage } from '../../context/LanguageContext';

export const Hero = () => {
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [videoOpen, setVideoOpen] = useState(false);
    const { t } = useLanguage();

    const handleSearch = () => {
        if (url) {
            router.push(`/search?imageUrl=${encodeURIComponent(url)}`);
        }
    };

    return (
        <section className={styles.hero}>
            <div className={`container ${styles.container}`}>
                <div className={styles.content}>
                    <h1 className={styles.title} dangerouslySetInnerHTML={{ __html: t.hero.title.replace(',', '<br/>') }}>
                    </h1>
                    <p className={styles.subtitle}>
                        {t.hero.subtitle}
                    </p>

                    <div className={styles.searchBox}>
                        <div className={styles.inputGroup}>
                            <Input
                                placeholder={t.hero.placeholder}
                                fullWidth
                                className={styles.input}
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>
                        <div className={styles.buttonWrap}>
                            <Button size="lg" className={styles.searchButton} onClick={handleSearch}>
                                {t.hero.cta}
                            </Button>
                        </div>

                        <p className={styles.hint}>
                            Supported: Shutterstock, Adobe Stock, iStock, Getty Images, etc.
                        </p>
                        <button
                            type="button"
                            className={styles.howToUse}
                            onClick={() => setVideoOpen(true)}
                            aria-label={t.video.howToUse}
                        >
                            <span className={styles.howToUseIcon} aria-hidden>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                            </span>
                            {t.video.howToUse}
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={videoOpen}
                onClose={() => setVideoOpen(false)}
                title={t.video.title}
                size="lg"
            >
                <ArcadeEmbed />
            </Modal>

            {/* Abstract Background Elements */}
            <div className={styles.circle1} />
            <div className={styles.circle2} />
        </section>
    );
};
