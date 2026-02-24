# Free Stoks Photo

**Ücretsiz stok fotoğraf ve tersine görsel arama.** Filigransız, temiz sürümleri anında bulun.

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Releases](https://img.shields.io/badge/Downloads-Releases-amber.svg)](https://github.com/EfeOkty/Free-Stoks-Photo/releases)

---

## 🌐 Web sitesi

**[freestoksphoto.com](https://www.freestoksphoto.com)** — Tarayıcıdan doğrudan kullanın.

---

## 📥 Masaüstü uygulaması (indirme)

| Platform | İndir | Kurulum |
|----------|--------|---------|
| **macOS** | [Releases → .dmg](https://github.com/EfeOkty/Free-Stoks-Photo/releases) | DMG’yi açıp uygulamayı **Applications** klasörüne sürükleyin. |
| **Windows** | [Releases → .exe](https://github.com/EfeOkty/Free-Stoks-Photo/releases) | Kurulum sihirbazını çalıştırın veya portable sürümü kullanın. |

1. [**GitHub Releases**](https://github.com/EfeOkty/Free-Stoks-Photo/releases) sayfasına gidin.
2. En güncel sürümde **Assets** bölümünden işletim sisteminize uygun dosyayı indirin.

> **macOS:** İmzasız uygulama ilk açılışta uyarı verebilir; **Sağ tık → Aç** ile çalıştırabilirsiniz.

---

## Nasıl çalışır

Uygulama **tersine görsel arama** ile stok fotoğrafların web’deki eşleşmelerini bulur. Girdi olarak görsel URL’si alır; Yandex (CORS proxy üzerinden) ile tarama yapar ve sonuçları listeler. Hem **web** hem **masaüstü** (Electron) aynı API’yi kullanır.

```mermaid
flowchart TB
    subgraph Client[" "]
        A[Kullanıcı]
    end
    subgraph App["Free Stoks Photo"]
        B[Web veya Desktop]
        C[/api/reverse-search]
        D[fetch + cheerio]
    end
    subgraph External[" "]
        E[CORS proxy / Yandex]
        F[Sonuç listesi]
    end
    A -->|Görsel URL| B
    B -->|POST imageUrl| C
    C -->|HTML parse| D
    D --> E
    E --> F
    F --> B
    B --> A
```

- **`/api/reverse-search`** görsel URL’ini alır; Vercel’de **fetch + cheerio** ile Yandex taraması yapar; yerelde isteğe bağlı **Puppeteer** kullanılır.
- **SITE_URL** (`.env`) ile masaüstü uygulaması **canlı siteyi** veya **yerel sunucuyu** açar.

---

## Geliştirme

```bash
npm install
npm run dev           # Tarayıcı: http://localhost:3000
npm run electron:dev  # Masaüstü (Next 3004 + Electron)
```

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Next.js geliştirme sunucusu. |
| `npm run electron:dev` | Yerel Next + Electron penceresi. |

---

## Build (yerel)

`.env` içinde **SITE_URL** ile hedef belirlenir:

| SITE_URL | Davranış |
|----------|----------|
| `https://www.freestoksphoto.com` | Uygulama canlı siteyi açar (önerilen). |
| `http://localhost:3000` | Yerel sunucu; standalone paketlenir. |

```bash
npm run electron:build       # Mevcut işletim sistemi
npm run electron:build:mac   # macOS: DMG + ZIP
npm run electron:build:win   # Windows: EXE
```

Çıktılar **`dist/`** klasöründe (macOS: `.dmg`, `.zip`; Windows: `.exe`).

---

## Yeni sürüm yayımlama (GitHub)

Tag push’landığında GitHub Actions otomatik build alır ve Release’e DMG/EXE ekler.

```bash
git tag v0.1.0
git push origin v0.1.0
```

[Releases](https://github.com/EfeOkty/Free-Stoks-Photo/releases) sayfasında yeni sürüm ve indirme bağlantıları oluşur.

---

## Katkı

Katkıda bulunmak için [CONTRIBUTING.md](CONTRIBUTING.md) dosyasına bakın.

---

## Lisans

[MIT](LICENSE)
