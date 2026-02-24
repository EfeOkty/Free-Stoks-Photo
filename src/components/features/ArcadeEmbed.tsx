'use client';

import { useLanguage } from '../../context/LanguageContext';

const EMBED = {
  en: {
    src: 'https://demo.arcade.software/b2AX4srbNnO1f9di3xCo?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true',
    title: 'Free Stoks Photo Intro',
  },
  tr: {
    src: 'https://demo.arcade.software/yTPIUoLdDluHC7Atcmsp?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true',
    title: 'Free Stoks Photo Tanıtım',
  },
};

export function ArcadeEmbed() {
  const { language } = useLanguage();
  const { src, title } = EMBED[language];

  return (
    <div style={{ position: 'relative', paddingBottom: 'calc(50.52301255230126% + 41px)', height: 0, width: '100%' }}>
      <iframe
        src={src}
        title={title}
        frameBorder={0}
        loading="lazy"
        allowFullScreen
        allow="clipboard-write"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', colorScheme: 'light' }}
      />
    </div>
  );
}
