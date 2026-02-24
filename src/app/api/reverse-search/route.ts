import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const maxDuration = 60;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

interface SearchResult {
    id: number;
    title: string;
    url: string;
    source: string;
    width: number;
    height: number;
    isClean: boolean;
    snippet: string;
    downloadUrl: string;
}

function normalizeUrl(raw: string | undefined | null): string {
    if (!raw) return '';
    if (raw.startsWith('//')) return 'https:' + raw;
    if (raw.startsWith('http')) return raw;
    return '';
}

const FETCH_HEADERS: Record<string, string> = {
    'User-Agent': UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://yandex.com/',
};

// CORS proxy: Yandex'e istek proxy sunucusundan gider, Vercel IP'si gizlenir (captcha atlatılabilir).
const CORS_PROXY_BASE = 'https://api.allorigins.win/raw?url=';

async function fetchHtml(url: string, useProxy: boolean): Promise<{ html: string; ok: boolean }> {
    const targetUrl = useProxy ? CORS_PROXY_BASE + encodeURIComponent(url) : url;
    const opts: RequestInit = useProxy
        ? { signal: AbortSignal.timeout(20000) }
        : { headers: FETCH_HEADERS, redirect: 'follow', signal: AbortSignal.timeout(15000) };

    const resp = await fetch(targetUrl, opts);
    const html = await resp.text();
    return { html, ok: resp.ok };
}

async function fetchYandexResults(imageUrl: string, tryProxyFirst: boolean): Promise<SearchResult[]> {
    const urls = [
        `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(imageUrl)}&cbir_page=sites`,
        `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(imageUrl)}`,
        `https://yandex.ru/images/search?rpt=imageview&url=${encodeURIComponent(imageUrl)}&cbir_page=sites`,
    ];

    for (const yandexUrl of urls) {
        if (tryProxyFirst) {
            try {
                console.log('[Yandex] Trying via allorigins.win proxy:', yandexUrl.slice(0, 60) + '…');
                const { html, ok } = await fetchHtml(yandexUrl, true);
                if (!ok) continue;
                const hasCaptcha = html.includes('captcha') || html.includes('CheckboxCaptcha') || html.includes('SmartCaptcha');
                console.log('[Yandex] proxy len=', html.length, 'captcha=', hasCaptcha, 'CbirSites=', html.includes('CbirSites'));
                if (!hasCaptcha) {
                    const parsed = parseYandexHtml(html);
                    if (parsed.length > 0) return parsed;
                }
            } catch (e) {
                console.error('[Yandex] proxy error:', (e as Error).message);
            }
        }

        try {
            console.log('[Yandex] Direct fetch:', yandexUrl.slice(0, 60) + '…');
            const { html, ok } = await fetchHtml(yandexUrl, false);
            if (!ok) continue;
            const hasCaptcha = html.includes('captcha') || html.includes('CheckboxCaptcha') || html.includes('SmartCaptcha');
            console.log('[Yandex] direct len=', html.length, 'captcha=', hasCaptcha, 'CbirSites=', html.includes('CbirSites'));
            if (hasCaptcha) continue;
            const parsed = parseYandexHtml(html);
            if (parsed.length > 0) return parsed;
        } catch (e) {
            console.error('[Yandex] direct error:', (e as Error).message);
        }
    }
    return [];
}

function parseYandexHtml(html: string): SearchResult[] {
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    $('.CbirSites-Item').each((i, el) => {
        if (i >= 30) return;
        const $el = $(el);
        const titleEl = $el.find('.CbirSites-ItemTitle a, a[class*="Title"]').first();
        const domainEl = $el.find('.CbirSites-ItemDomain, [class*="Domain"]').first();
        const thumbImg = $el.find('.Thumb-Image, img').first();
        const descEl = $el.find('.CbirSites-ItemDescription, [class*="Description"]').first();
        const thumbLink = $el.find('.Thumb, a[href*="http"]').first();

        let downloadUrl = normalizeUrl(thumbLink.attr('href'));
        if (!downloadUrl) downloadUrl = normalizeUrl(titleEl.attr('href'));
        const thumbSrc = normalizeUrl(thumbImg.attr('src'));

        if (downloadUrl) {
            results.push({
                id: 300 + i,
                title: titleEl.text().trim() || 'Image result',
                url: thumbSrc,
                source: domainEl.text().trim() || 'Yandex',
                width: 0, height: 0, isClean: false,
                snippet: descEl.text().trim(),
                downloadUrl,
            });
        }
    });
    if (results.length > 0) return results;

    $('[data-bem]').each((_, el) => {
        if (results.length >= 30) return;
        try {
            const raw = $(el).attr('data-bem');
            if (!raw) return;
            const data = JSON.parse(raw);
            const walk = (obj: Record<string, unknown>) => {
                for (const v of Object.values(obj)) {
                    if (typeof v === 'string' && v.startsWith('http') && /\.(jpe?g|png|webp)/i.test(v)) {
                        results.push({
                            id: 600 + results.length,
                            title: 'Image result', url: v, source: 'Yandex',
                            width: 0, height: 0, isClean: false, snippet: '', downloadUrl: v,
                        });
                    } else if (v && typeof v === 'object') walk(v as Record<string, unknown>);
                }
            };
            walk(data);
        } catch { /* skip */ }
    });
    if (results.length > 0) return results;

    $('a[href*="http"]').each((_, el) => {
        if (results.length >= 20) return;
        const href = $(el).attr('href') || '';
        if (!href || href.includes('yandex') || href.includes('captcha')) return;
        const img = $(el).find('img').first();
        if (img.length || $(el).closest('[class*="Cbir"]').length) {
            results.push({
                id: 700 + results.length,
                title: $(el).text().trim().slice(0, 80) || 'Result',
                url: normalizeUrl(img.attr('src')),
                source: 'Yandex', width: 0, height: 0, isClean: false, snippet: '',
                downloadUrl: href,
            });
        }
    });

    return results;
}

async function scrapeYandexPuppeteer(imageUrl: string): Promise<SearchResult[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let browser: any = null;
    try {
        const puppeteer = (await import('puppeteer')).default;
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent(UA);
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

        const yandexUrl = `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(imageUrl)}&cbir_page=sites`;
        await page.goto(yandexUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
        await new Promise(r => setTimeout(r, 4000));
        try { await page.waitForSelector('.CbirSites-Item', { timeout: 12000 }); } catch { /* ok */ }

        await page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const timer = setInterval(() => {
                    window.scrollBy(0, 150);
                    totalHeight += 150;
                    if (totalHeight >= document.body.scrollHeight || totalHeight > 4000) { clearInterval(timer); resolve(); }
                }, 120);
            });
        });
        await new Promise(r => setTimeout(r, 2000));

        const results: SearchResult[] = await page.evaluate(() => {
            const out: Array<SearchResult> = [];
            document.querySelectorAll('.CbirSites-Item').forEach((item, index) => {
                if (index >= 30) return;
                const titleEl = item.querySelector('.CbirSites-ItemTitle a');
                const domainEl = item.querySelector('.CbirSites-ItemDomain');
                const thumbLinkEl = item.querySelector('.Thumb');
                const thumbImgEl = item.querySelector('.Thumb-Image, img');
                const descEl = item.querySelector('.CbirSites-ItemDescription');
                let downloadUrl = thumbLinkEl?.getAttribute('href') || titleEl?.getAttribute('href') || '';
                if (downloadUrl.startsWith('//')) downloadUrl = 'https:' + downloadUrl;
                let thumbSrc = thumbImgEl?.getAttribute('src') || '';
                if (thumbSrc.startsWith('//')) thumbSrc = 'https:' + thumbSrc;
                if (downloadUrl.startsWith('http')) {
                    out.push({
                        id: 300 + index,
                        title: titleEl?.textContent?.trim() || 'Image result',
                        url: thumbSrc,
                        source: domainEl?.textContent?.trim() || 'Yandex',
                        width: 0, height: 0, isClean: false,
                        snippet: descEl?.textContent?.trim() || '',
                        downloadUrl,
                    } as SearchResult);
                }
            });
            return out;
        });
        await page.close();
        return results;
    } catch (e) {
        console.error('Puppeteer error:', e);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { imageUrl } = body;

        console.log('Reverse search started for:', imageUrl);

        if (!imageUrl) {
            return NextResponse.json({ success: false, message: 'No image URL provided' });
        }

        const isVercel = !!process.env.VERCEL;
        let results: SearchResult[];

        if (isVercel) {
            results = await fetchYandexResults(imageUrl, true);
        } else {
            results = await scrapeYandexPuppeteer(imageUrl);
            if (results.length === 0) {
                results = await fetchYandexResults(imageUrl, false);
            }
        }

        if (results.length === 0) {
            results = [{
                id: 999,
                title: 'No results found',
                url: '',
                source: 'System',
                width: 0, height: 0, isClean: false,
                snippet: 'Could not find matching images. Try a different image URL.',
                downloadUrl: '',
            }];
        }

        return NextResponse.json({ success: true, results });

    } catch (error) {
        console.error('API Handler Error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
