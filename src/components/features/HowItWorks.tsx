'use client';

import { useLanguage } from '../../context/LanguageContext';
import styles from './HowItWorks.module.css';

const stepIcons = [
  <svg key="1" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>,
  <svg key="2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>,
  <svg key="3" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>,
];

export function HowItWorks() {
  const { t } = useLanguage();
  const steps = [
    { title: t.howItWorks.step1_title, desc: t.howItWorks.step1_desc },
    { title: t.howItWorks.step2_title, desc: t.howItWorks.step2_desc },
    { title: t.howItWorks.step3_title, desc: t.howItWorks.step3_desc },
  ];

  return (
    <section className={styles.section} aria-labelledby="how-it-works-title">
      <div className="container">
        <h2 id="how-it-works-title" className={styles.title}>
          {t.howItWorks.title}
        </h2>
        <div className={styles.steps}>
          {steps.map((step, i) => (
            <div key={i} className={styles.step} style={{ animationDelay: `${i * 0.2}s` }}>
              <div className={styles.stepNum}>{i + 1}</div>
              <div className={styles.iconWrap}>{stepIcons[i]}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
              {i < steps.length - 1 && <div className={styles.connector} aria-hidden />}
            </div>
          ))}
        </div>
        <div className={styles.flowLine} aria-hidden>
          <span className={styles.flowDot} />
        </div>
      </div>
    </section>
  );
}
