'use client';

import Link from 'next/link';
import { Button } from '../ui/Button';
import styles from './Header.module.css';
import { useLanguage } from '../../context/LanguageContext';

export const Header = () => {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'tr' : 'en');
    };

    return (
        <header className={styles.header}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.logo}>
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon} aria-hidden>
                        {/* Aperture: 6 blades (outer r=11, inner r=4) */}
                        <path fill="currentColor" d="M27 16L19.5 18.5L22 26.2L16 21L10 26.2L12.5 18.5L5 16L12.5 13.5L10 5.8L16 11L22 5.8L19.5 13.5L27 16Z" />
                        <circle cx="16" cy="16" r="3.5" fill="var(--color-bg)" />
                    </svg>
                    <span>Free Stoks Photo</span>
                </Link>

                <nav className={styles.nav}>
                    <button
                        type="button"
                        className={styles.langBtn}
                        onClick={toggleLanguage}
                        title={language === 'en' ? 'Türkçe' : 'English'}
                        aria-label={language === 'en' ? 'Switch to Turkish' : 'Switch to English'}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <circle cx="12" cy="12" r="10" />
                            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <span>{language === 'en' ? 'TR' : 'EN'}</span>
                    </button>
                </nav>
            </div>
        </header>
    );
};
