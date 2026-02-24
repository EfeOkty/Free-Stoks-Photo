'use client';

import { useLanguage } from '../../context/LanguageContext';
import { ArcadeEmbed } from './ArcadeEmbed';
import styles from './VideoSection.module.css';

export function VideoSection() {
  const { t } = useLanguage();

  return (
    <section className={styles.section} aria-labelledby="video-title">
      <div className="container">
        <h2 id="video-title" className={styles.title}>
          {t.video.title}
        </h2>
        <p className={styles.description}>
          {t.video.description}
        </p>
        <div className={styles.embedWrap}>
          <ArcadeEmbed />
        </div>
      </div>
    </section>
  );
}
