'use client';

import { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './SourcesStrip.module.css';

const SOURCES = ['Shutterstock', 'Adobe Stock', 'iStock', 'Getty Images', 'Pexels', 'Unsplash', 'Pixabay'];

const VISIBLE_THRESHOLD = 0.9;

export function SourcesStrip() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const [fullyVisible, setFullyVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setFullyVisible(entry.intersectionRatio >= VISIBLE_THRESHOLD);
      },
      { threshold: [0, 0.5, VISIBLE_THRESHOLD, 1] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const label = t?.sources?.label ?? 'Works with';
  const othersBeta = t?.sources?.othersBeta ?? 'Other sources (Beta)';

  return (
    <section
      ref={ref}
      className={`${styles.section} ${fullyVisible ? styles.visible : styles.hidden}`}
      aria-label={label}
    >
      <div className="container">
        <p className={styles.label}>{label}</p>
        <div className={styles.list}>
          {SOURCES.map((name) => (
            <span key={name} className={styles.pill}>
              {name}
            </span>
          ))}
          <span className={`${styles.pill} ${styles.beta}`}>{othersBeta}</span>
        </div>
      </div>
    </section>
  );
}
