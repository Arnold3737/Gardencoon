#!/usr/bin/env node
/**
 * add-kitten.js — Garden State Coon
 *
 * Автоматически создаёт карточку нового котёнка из папки с фото и видео,
 * обновляет kittens.html + sitemap.xml и публикует изменения на GitHub.
 * После пуша сайт обновится автоматически через GitHub Pages (≈1 минута).
 *
 * Использование:
 *   node scripts/add-kitten.js /путь/к/папке/котёнка
 *   или двойным кликом по run.bat внутри папки с котёнком.
 *
 * Папка котёнка должна содержать:
 *   - kitten.json          — данные котёнка (шаблон в kitten-template/)
 *   - 1–4 фото             — .jpg/.jpeg/.png/.webp (первое = главное)
 *   - 0–1 видео            — .mp4/.mov/.webm (опционально)
 *
 * Флаги:
 *   --no-push              — не пушить в git (только локальные изменения)
 *   --dry-run              — напечатать план и выйти, ничего не менять
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// ── Пути репозитория ────────────────────────────────────────────────────────
const REPO_ROOT  = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(REPO_ROOT, 'assets');

// ── Аргументы ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const FLAGS = new Set(args.filter(a => a.startsWith('--')));
const positional = args.filter(a => !a.startsWith('--'));
const KITTEN_DIR = positional[0] ? path.resolve(positional[0]) : process.cwd();

const NO_PUSH  = FLAGS.has('--no-push');
const DRY_RUN  = FLAGS.has('--dry-run');

// ── Чтение kitten.json ──────────────────────────────────────────────────────
const CONFIG_PATH = path.join(KITTEN_DIR, 'kitten.json');
if (!fs.existsSync(CONFIG_PATH)) {
  console.error(`❌ Файл kitten.json не найден: ${CONFIG_PATH}`);
  console.error('   Скопируй шаблон из kitten-template/kitten.json');
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

const REQUIRED = ['name', 'gender', 'color', 'status', 'description'];
const missing  = REQUIRED.filter(f => !cfg[f]);
if (missing.length) {
  console.error(`❌ В kitten.json не хватает полей: ${missing.join(', ')}`);
  process.exit(1);
}

const VALID_STATUS = ['available', 'reserved', 'sold', 'coming-soon'];
if (!VALID_STATUS.includes(cfg.status)) {
  console.error(`❌ Недопустимый status: "${cfg.status}". Можно: ${VALID_STATUS.join(', ')}`);
  process.exit(1);
}

// ── Поиск фото и видео ──────────────────────────────────────────────────────
const all = fs.readdirSync(KITTEN_DIR).sort();
const photos = all.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
const videos = all.filter(f => /\.(mp4|mov|webm)$/i.test(f));

if (photos.length === 0) {
  console.error('❌ В папке нет фотографий (.jpg/.jpeg/.png/.webp)');
  process.exit(1);
}
if (photos.length > 4) {
  console.warn(`⚠️  Найдено ${photos.length} фото, использую первые 4.`);
}
const usedPhotos = photos.slice(0, 4);
const videoFile  = videos[0] || null;

// ── Следующий номер котёнка ─────────────────────────────────────────────────
function getNextKittenNumber() {
  const nums = fs.readdirSync(REPO_ROOT)
    .filter(f => /^kitten-detail-\d+\.html$/.test(f))
    .map(f => parseInt(f.match(/\d+/)[0], 10));
  return nums.length ? Math.max(...nums) + 1 : 1;
}
const N = getNextKittenNumber();
const detailPage = `kitten-detail-${N}.html`;
const slug = cfg.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// ── Утилиты ─────────────────────────────────────────────────────────────────
function escHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function escAttrJson(obj) {
  // JSON внутри атрибута с одинарными кавычками → экранируем одинарные кавычки
  return JSON.stringify(obj).replace(/'/g, '&#39;');
}
function statusLabel(s) {
  return { available: 'Available', reserved: 'Reserved', sold: 'Sold', 'coming-soon': 'Coming Soon' }[s];
}

// ── Обработка фото через sharp ──────────────────────────────────────────────
async function processPhotos() {
  const sharp = require('sharp');
  const sizes = [640, 1024, 1920];
  const result = [];

  for (let i = 0; i < usedPhotos.length; i++) {
    const src = path.join(KITTEN_DIR, usedPhotos[i]);
    const baseName = i === 0 ? `kitten-${N}` : `kitten-${N}-extra-${i}`;

    if (DRY_RUN) {
      console.log(`  [dry-run] ${usedPhotos[i]} → ${baseName}-{640,1024,1920}.{avif,webp} + ${baseName}-1920.jpg`);
    } else {
      for (const w of sizes) {
        await sharp(src).resize(w).avif({ quality: 60 })
          .toFile(path.join(ASSETS_DIR, `${baseName}-${w}.avif`));
        await sharp(src).resize(w).webp({ quality: 80 })
          .toFile(path.join(ASSETS_DIR, `${baseName}-${w}.webp`));
      }
      await sharp(src).resize(1920).jpeg({ quality: 85 })
        .toFile(path.join(ASSETS_DIR, `${baseName}-1920.jpg`));
    }

    result.push({
      baseName,
      alt: `${cfg.name} ${cfg.color} Maine Coon ${cfg.gender.toLowerCase()} kitten${i > 0 ? ` — photo ${i + 1}` : ''}`
    });
    console.log(`  ✓ ${usedPhotos[i]} → ${baseName} (7 вариантов)`);
  }
  return result;
}

// ── Копирование видео ───────────────────────────────────────────────────────
function copyVideo() {
  if (!videoFile) return null;
  const ext = path.extname(videoFile).toLowerCase();
  const destName = `kitten-${N}-video${ext}`;
  if (!DRY_RUN) {
    fs.copyFileSync(path.join(KITTEN_DIR, videoFile), path.join(ASSETS_DIR, destName));
  }
  console.log(`  ✓ ${videoFile} → ${destName}`);
  return destName;
}

// ── HTML страницы карточки ──────────────────────────────────────────────────
function buildDetailHTML(images, videoName) {
  const main = images[0];
  const availability = cfg.status === 'available'
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  // data-gallery-images: массив всех фото
  const galleryImages = images.map(img => ({
    srcsetAvif: `assets/${img.baseName}-640.avif 640w, assets/${img.baseName}-1024.avif 1024w, assets/${img.baseName}-1920.avif 1920w`,
    srcsetWebp: `assets/${img.baseName}-640.webp 640w, assets/${img.baseName}-1024.webp 1024w, assets/${img.baseName}-1920.webp 1920w`,
    srcFallback: `assets/${img.baseName}-1920.jpg`,
    src640: `assets/${img.baseName}-640.webp`,
    alt: img.alt
  }));
  const galleryImagesAttr = escAttrJson(galleryImages);

  // data-gallery-video
  const videoAttr = videoName
    ? ` data-gallery-video='${escAttrJson({
        src: `assets/${videoName}`,
        poster: `assets/${main.baseName}-640.webp`,
        label: `Play ${cfg.name} video`
      })}'`
    : '';

  const sireName  = cfg.sire?.name  || 'Hudson';
  const sireTitle = cfg.sire?.title || 'Brown Classic Tabby · Registered lines · Health-screened';
  const damName   = cfg.dam?.name   || 'Willow';
  const damTitle  = cfg.dam?.title  || 'Blue Smoke · Registered lines · Health-screened';
  const health    = cfg.healthTesting || `${cfg.name} comes from health-screened breeding cats of registered lines. Before going home she is examined by our veterinarian, receives age-appropriate vaccinations, is dewormed on schedule, and is litter-box trained. We provide a record of veterinary care for your own vet.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Product', 'Pet'],
        additionalType: 'https://schema.org/Pet',
        name: `${cfg.name} — ${cfg.color} Maine Coon Kitten`,
        description: cfg.description,
        image: `https://gardenstatecoon.com/assets/${main.baseName}-1920.jpg`,
        brand: { '@type': 'Organization', name: 'Garden State Coon' },
        offers: {
          '@type': 'Offer',
          url: `https://gardenstatecoon.com/${detailPage}`,
          availability,
          priceSpecification: {
            '@type': 'PriceSpecification',
            priceCurrency: 'USD',
            description: 'Price available upon request'
          },
          seller: {
            '@type': 'Organization',
            name: 'Garden State Coon',
            url: 'https://gardenstatecoon.com/'
          }
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gardenstatecoon.com/' },
          { '@type': 'ListItem', position: 2, name: 'Available Kittens', item: 'https://gardenstatecoon.com/kittens.html' },
          { '@type': 'ListItem', position: 3, name: cfg.name, item: `https://gardenstatecoon.com/${detailPage}` }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(cfg.name)} — ${escHtml(cfg.color)} Maine Coon | Garden State Coon</title>
  <link rel="icon" href="favicon.ico" sizes="32x32">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="assets/icon-192.png">
  <meta name="description" content="${escHtml(cfg.name)} — ${escHtml(cfg.color)} ${escHtml(cfg.gender)} Maine Coon kitten at Garden State Coon, Edison, New Jersey. Health-screened lines, raised in our home. Price available upon request.">
  <link rel="canonical" href="https://gardenstatecoon.com/${detailPage}">
  <link rel="preload" as="font" type="font/woff2" href="fonts/cormorant-garamond-regular.woff2" crossorigin>
  <link rel="preload" as="font" type="font/woff2" href="fonts/jost-regular.woff2" crossorigin>
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/pages/kitten-detail.css">
  <!-- Open Graph -->
  <meta property="og:title" content="${escHtml(cfg.name)} — ${escHtml(cfg.color)} Maine Coon Kitten | Garden State Coon">
  <meta property="og:description" content="${escHtml(cfg.name)} — ${escHtml(cfg.color)} ${escHtml(cfg.gender)} Maine Coon kitten at Garden State Coon, Edison, New Jersey. Price available upon request.">
  <meta property="og:image" content="https://gardenstatecoon.com/assets/${main.baseName}-1920.jpg">
  <meta property="og:url" content="https://gardenstatecoon.com/${detailPage}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <!-- PWA -->
  <link rel="manifest" href="site.webmanifest">
  <meta name="theme-color" content="#1a2e1a">
  <!-- View Transitions -->
  <meta name="view-transition" content="same-origin">
  <!-- Security -->
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <!-- JSON-LD -->
  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2).split('\n').map(l => '  ' + l).join('\n')}
  </script>
  <!-- Speculation Rules -->
  <script type="speculationrules">
  {
    "prerender": [
      { "where": { "href_matches": "/kittens.html" }, "eagerness": "moderate" },
      { "where": { "href_matches": "/${detailPage}" }, "eagerness": "moderate" }
    ]
  }
  </script>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- NAV -->
  <header role="banner" class="site-header">
    <nav aria-label="Main navigation" data-nav class="nav">
      <a href="index.html" class="nav__logo">Garden State Coon</a>
      <button type="button" data-hamburger
              aria-expanded="false"
              aria-controls="nav-menu"
              aria-label="Toggle navigation menu"
              class="nav__toggle">
        <span aria-hidden="true">&#9776;</span>
      </button>
      <ul id="nav-menu" role="list" data-nav-menu class="nav__menu" hidden>
          <li><a href="index.html" data-nav-link>Home</a></li>
          <li><a href="about.html" data-nav-link>About</a></li>
          <li><a href="gallery.html" data-nav-link>Gallery</a></li>
          <li><a href="kittens.html" data-nav-link>Available Kittens</a></li>
          <li><a href="our-cats.html" data-nav-link>Our Cats</a></li>
          <li><a href="contact.html" data-nav-link>Contact</a></li>
          <li><a href="faq.html" data-nav-link>FAQ</a></li>
          <li><a href="health-testing.html" data-nav-link>Health Testing</a></li>
          <li><a href="shipping.html" data-nav-link>Shipping</a></li>
      </ul>
    </nav>
  </header>

  <main id="main-content">
        <!-- BREADCRUMB -->
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a>
      <span class="breadcrumb__separator" aria-hidden="true">/</span>
      <a href="kittens.html">Available Kittens</a>
      <span class="breadcrumb__separator" aria-hidden="true">/</span>
      <span aria-current="page">${escHtml(cfg.name)}</span>
    </nav>

    <!-- BACK LINK -->
    <div class="section">
      <a href="kittens.html" class="btn btn-secondary">&larr; Back to All Kittens</a>
    </div>

    <!-- KITTEN DETAIL -->
    <section class="section" aria-labelledby="kitten-name-heading">
      <div class="kitten-detail">
        <!-- GALLERY -->
        <div class="kitten-detail__gallery gallery--${slug}"
             data-gallery-images='${galleryImagesAttr}'${videoAttr}>
        <picture>
          <source type="image/avif"
                  srcset="assets/${main.baseName}-640.avif 640w,
                          assets/${main.baseName}-1024.avif 1024w,
                          assets/${main.baseName}-1920.avif 1920w"
                  sizes="100vw">
          <source type="image/webp"
                  srcset="assets/${main.baseName}-640.webp 640w,
                          assets/${main.baseName}-1024.webp 1024w,
                          assets/${main.baseName}-1920.webp 1920w"
                  sizes="100vw">
          <img src="assets/${main.baseName}-1920.jpg"
               alt="${escHtml(main.alt)}"
               width="1920" height="1434"
               fetchpriority="high"
               loading="eager"
               decoding="async">
        </picture>
        </div>

        <!-- INFO -->
        <div class="kitten-detail__info">
          <h1 id="kitten-name-heading" class="kitten-detail__name">${escHtml(cfg.name)}</h1>
          <span class="kitten-badge">${statusLabel(cfg.status)}</span>
          <div class="kitten-detail__meta">
            <p>${escHtml(cfg.gender)}</p>
            <p>${escHtml(cfg.color)}</p>
            <p>Price available upon request</p>
          </div>
          <p>${escHtml(cfg.description)}</p>

          <h2>Health &amp; Care</h2>
          <p>${escHtml(health)}</p>

          <div class="kitten-detail__actions">
            <a href="contact.html" class="btn btn-primary">Reserve ${escHtml(cfg.name)}</a>
            <a href="waiting-list.html" class="btn btn-secondary">Join Waiting List</a>
          </div>
        </div>
      </div>
    </section>

    <!-- PARENTS -->
    <section class="section section--below-fold" aria-labelledby="parents-heading">
      <h2 id="parents-heading" class="section__heading">Parents</h2>
      <div class="kitten-detail__parents">
        <div class="card">
          <div class="card__image-wrap">
        <picture>
          <source type="image/avif"
                  srcset="assets/parent-sire-640.avif 640w,
                          assets/parent-sire-1024.avif 1024w,
                          assets/parent-sire-1920.avif 1920w"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw">
          <source type="image/webp"
                  srcset="assets/parent-sire-640.webp 640w,
                          assets/parent-sire-1024.webp 1024w,
                          assets/parent-sire-1920.webp 1920w"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw">
          <img src="assets/parent-sire-1920.jpg"
               alt="${escHtml(sireName)} — sire of ${escHtml(cfg.name)}"
               width="1920" height="1080"
               loading="lazy">
        </picture>
          </div>
          <div class="card__body">
            <h3 class="card__title">${escHtml(sireName)} (Sire)</h3>
            <p class="card__text">${escHtml(sireTitle)}</p>
          </div>
        </div>
        <div class="card">
          <div class="card__image-wrap">
        <picture>
          <source type="image/avif"
                  srcset="assets/parent-dam-640.avif 640w,
                          assets/parent-dam-1024.avif 1024w,
                          assets/parent-dam-1920.avif 1920w"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw">
          <source type="image/webp"
                  srcset="assets/parent-dam-640.webp 640w,
                          assets/parent-dam-1024.webp 1024w,
                          assets/parent-dam-1920.webp 1920w"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw">
          <img src="assets/parent-dam-1920.jpg"
               alt="${escHtml(damName)} — dam of ${escHtml(cfg.name)}"
               width="1920" height="1080"
               loading="lazy">
        </picture>
          </div>
          <div class="card__body">
            <h3 class="card__title">${escHtml(damName)} (Dam)</h3>
            <p class="card__text">${escHtml(damTitle)}</p>
          </div>
        </div>
      </div>
      <a href="our-cats.html" class="btn btn-secondary">Meet the Parents</a>
    </section>
    <!-- LIGHTBOX DIALOG (reused by gallery JS) -->
    <dialog id="lightbox-dialog" class="lightbox">
      <picture>
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Enlarged kitten photo" width="1920" height="1434">
      </picture>
    </dialog>
  </main>

  <!-- FOOTER -->
  <footer role="contentinfo" class="site-footer">
    <div class="footer__inner">
      <nav aria-label="Footer navigation">
        <ul role="list" class="footer__nav">
          <li><a href="index.html" class="footer__link">Home</a></li>
          <li><a href="about.html" class="footer__link">About</a></li>
          <li><a href="gallery.html" class="footer__link">Gallery</a></li>
          <li><a href="kittens.html" class="footer__link">Available Kittens</a></li>
          <li><a href="our-cats.html" class="footer__link">Our Cats</a></li>
          <li><a href="contact.html" class="footer__link">Contact</a></li>
          <li><a href="faq.html" class="footer__link">FAQ</a></li>
          <li><a href="health-testing.html" class="footer__link">Health Testing</a></li>
          <li><a href="shipping.html" class="footer__link">Shipping</a></li>
          <li><a href="purchase-contract.html" class="footer__link">Purchase Contract</a></li>
          <li><a href="waiting-list.html" class="footer__link">Waiting List</a></li>
          <li><a href="privacy-policy.html" class="footer__link">Privacy Policy</a></li>
          <li><a href="terms-of-sale.html" class="footer__link">Terms of Sale</a></li>
          <li><a href="cookie-policy.html" class="footer__link">Cookie Policy</a></li>
        </ul>
      </nav>
      <p class="footer__copy">© 2026 Garden State Coon. All rights reserved.</p>
    </div>
  </footer>

  <script src="js/nav.js" defer></script>
  <script src="js/lightbox.js" defer></script>
  <script src="js/kitten-gallery.js" defer></script>
  <script defer>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js');
    }
  </script>
</body>
</html>
`;
}

// ── Обновление kittens.html ─────────────────────────────────────────────────
function updateKittensPage(mainBase) {
  const kittensPath = path.join(REPO_ROOT, 'kittens.html');
  let html = fs.readFileSync(kittensPath, 'utf8');

  const newCard = `
        <a href="${detailPage}" class="card" data-status="${cfg.status}">
          <div class="card__image-wrap">
        <picture>
          <source type="image/avif"
                  srcset="assets/${mainBase}-640.avif 640w,
                          assets/${mainBase}-1024.avif 1024w,
                          assets/${mainBase}-1920.avif 1920w"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw">
          <source type="image/webp"
                  srcset="assets/${mainBase}-640.webp 640w,
                          assets/${mainBase}-1024.webp 1024w,
                          assets/${mainBase}-1920.webp 1920w"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw">
          <img src="assets/${mainBase}-1920.jpg"
               alt="${escHtml(cfg.name)} — ${escHtml(cfg.color)} Maine Coon ${escHtml(cfg.gender.toLowerCase())} kitten"
               width="1920" height="1080"
               loading="lazy">
        </picture>
          </div>
          <div class="card__body">
            <span class="kitten-badge">${statusLabel(cfg.status)}</span>
            <h3 class="card__title">${escHtml(cfg.name)}</h3>
            <p class="card__text">${escHtml(cfg.gender)} · ${escHtml(cfg.color)} · Price available upon request</p>
          </div>
        </a>`;

  // 1) Вставка карточки в грид
  const gridMarker = '      </div>\n    </section>\n\n    <!-- PAGINATION -->';
  if (!html.includes(gridMarker)) {
    throw new Error('Не найден маркер конца .kittens-grid — структура kittens.html изменилась.');
  }
  html = html.replace(gridMarker, `${newCard}\n      </div>\n    </section>\n\n    <!-- PAGINATION -->`);

  // 2) Обновление JSON-LD через парсинг
  const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/;
  const m = html.match(jsonLdRegex);
  if (m) {
    try {
      const data = JSON.parse(m[1]);
      const itemList = data['@graph']?.find(i => i['@type'] === 'ItemList');
      if (itemList) {
        itemList.numberOfItems = (itemList.numberOfItems || 0) + 1;
        itemList.itemListElement = itemList.itemListElement || [];
        itemList.itemListElement.push({
          '@type': 'ListItem',
          position: itemList.itemListElement.length + 1,
          name: `${cfg.name} — ${cfg.color} ${cfg.gender}`,
          url: `https://gardenstatecoon.com/${detailPage}`
        });
      }
      const pretty = JSON.stringify(data, null, 2).split('\n').map(l => '  ' + l).join('\n');
      html = html.replace(jsonLdRegex, `<script type="application/ld+json">\n${pretty}\n  </script>`);
    } catch (e) {
      console.warn('⚠️  JSON-LD не обновлён:', e.message);
    }
  }

  if (!DRY_RUN) fs.writeFileSync(kittensPath, html, 'utf8');
  console.log('  ✓ kittens.html обновлён');
}

// ── Обновление sitemap.xml ──────────────────────────────────────────────────
function updateSitemap() {
  const sp = path.join(REPO_ROOT, 'sitemap.xml');
  let xml = fs.readFileSync(sp, 'utf8');
  const today = new Date().toISOString().slice(0, 10);
  const entry = `  <url>\n    <loc>https://gardenstatecoon.com/${detailPage}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.8</priority>\n  </url>\n`;
  xml = xml.replace('</urlset>', entry + '</urlset>');
  if (!DRY_RUN) fs.writeFileSync(sp, xml, 'utf8');
  console.log('  ✓ sitemap.xml обновлён');
}

// ── Git commit + push ───────────────────────────────────────────────────────
function gitPublish() {
  const run = (cmd) => execSync(cmd, { cwd: REPO_ROOT, stdio: 'inherit' });
  console.log('\n📤 Git: синхронизация и публикация...');
  try {
    run('git pull --rebase');
  } catch (_) {
    console.warn('⚠️  git pull не удался, продолжаю.');
  }
  run('git add -A');
  run(`git commit -m "feat(kittens): add ${cfg.name} (${detailPage})"`);
  if (NO_PUSH) {
    console.log('ℹ️  --no-push: пуш пропущен.');
    return;
  }
  run('git push');
  console.log(`\n🚀 Опубликовано! Сайт обновится за ~1 минуту.`);
  console.log(`   → https://gardenstatecoon.com/${detailPage}`);
}

// ── Главная функция ─────────────────────────────────────────────────────────
(async function main() {
  console.log(`\n🐱 Garden State Coon — добавление котёнка: ${cfg.name}`);
  console.log(`   Папка: ${KITTEN_DIR}`);
  console.log(`   Карточка: ${detailPage} (№${N})`);
  console.log(`   Фото: ${usedPhotos.length}, видео: ${videoFile ? 'да' : 'нет'}`);
  if (DRY_RUN) console.log('   [DRY-RUN — файлы не меняются]\n');

  console.log('\n📸 Обработка фотографий...');
  const images = await processPhotos();

  if (videoFile) console.log('\n🎬 Копирование видео...');
  const video = copyVideo();

  console.log('\n📝 Создание страницы карточки...');
  const htmlOut = buildDetailHTML(images, video);
  if (!DRY_RUN) fs.writeFileSync(path.join(REPO_ROOT, detailPage), htmlOut, 'utf8');
  console.log(`  ✓ ${detailPage} создан`);

  console.log('\n🔄 Обновление kittens.html...');
  updateKittensPage(images[0].baseName);

  console.log('\n🗺️  Обновление sitemap.xml...');
  updateSitemap();

  if (DRY_RUN) {
    console.log('\n✅ DRY-RUN завершён. Запусти без --dry-run для реальной публикации.');
    return;
  }

  gitPublish();
})().catch(err => {
  console.error('\n❌ Ошибка:', err.message);
  console.error(err.stack);
  process.exit(1);
});
