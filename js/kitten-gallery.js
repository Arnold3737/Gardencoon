/**
 * Kitten Detail Gallery — Progressive Enhancement
 *
 * Data-driven gallery infrastructure for kitten detail pages.
 * Reads a JSON manifest from [data-gallery-images] and [data-gallery-video]
 * on .kitten-detail__gallery. When only one image exists and no video,
 * the page looks exactly as before (no empty slots, no duplicate thumbnails).
 * When additional assets are added, a thumbnail strip and/or video tile
 * appear automatically.
 */
if (!('scheduler' in globalThis)) { globalThis.scheduler = { yield: () => Promise.resolve() }; }
(function () {
  'use strict';

  const galleryEl = document.querySelector('.kitten-detail__gallery');
  if (!galleryEl) return;

  /* --- Parse data attributes ------------------------------------------------ */
  let images;
  try {
    images = JSON.parse(galleryEl.getAttribute('data-gallery-images') || '[]');
  } catch (_) {
    images = [];
  }

  let video;
  try {
    video = JSON.parse(galleryEl.getAttribute('data-gallery-video') || 'null');
  } catch (_) {
    video = null;
  }

  /* Nothing to enhance: single image, no video — bail out, page unchanged */
  if (images.length <= 1 && !video) return;

  /* --- Build thumbnail strip ------------------------------------------------ */
  const mainPicture = galleryEl.querySelector('picture');
  const mainImg = mainPicture ? mainPicture.querySelector('img') : null;
  if (!mainPicture || !mainImg) return;

  /* Wrap existing <picture> as the hero slot */
  galleryEl.classList.add('kitten-detail__gallery--multi');

  const strip = document.createElement('div');
  strip.className = 'kitten-detail__thumbs';
  strip.setAttribute('role', 'list');
  strip.setAttribute('aria-label', 'Photo thumbnails');

  images.forEach(function (img, i) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kitten-detail__thumb';
    btn.setAttribute('role', 'listitem');
    btn.setAttribute('aria-label', img.alt || 'Photo ' + (i + 1));
    if (i === 0) btn.classList.add('kitten-detail__thumb--active');

    const thumb = document.createElement('img');
    thumb.src = img.src640 || img.srcFallback;
    thumb.alt = img.alt || '';
    thumb.width = 120;
    thumb.height = 90;
    thumb.loading = 'lazy';
    thumb.decoding = 'async';
    btn.appendChild(thumb);

    btn.addEventListener('click', async function () {
      await scheduler.yield();
      /* Update hero image sources */
      var sources = mainPicture.querySelectorAll('source');
      sources.forEach(function (source) {
        var type = source.getAttribute('type');
        if (type === 'image/avif' && img.srcsetAvif) {
          source.srcset = img.srcsetAvif;
        } else if (type === 'image/webp' && img.srcsetWebp) {
          source.srcset = img.srcsetWebp;
        }
      });
      mainImg.src = img.srcFallback;
      mainImg.alt = img.alt || mainImg.alt;

      /* Update active thumb */
      strip.querySelectorAll('.kitten-detail__thumb--active').forEach(function (el) {
        el.classList.remove('kitten-detail__thumb--active');
      });
      btn.classList.add('kitten-detail__thumb--active');
    }, { passive: true });

    strip.appendChild(btn);
  });

  /* Add video tile to strip if video asset exists */
  if (video && video.src) {
    var videoBtn = document.createElement('button');
    videoBtn.type = 'button';
    videoBtn.className = 'kitten-detail__thumb kitten-detail__thumb--video';
    videoBtn.setAttribute('role', 'listitem');
    videoBtn.setAttribute('aria-label', video.label || 'Play video');

    /* Use poster as thumb, with play icon overlay */
    if (video.poster) {
      var posterImg = document.createElement('img');
      posterImg.src = video.poster;
      posterImg.alt = '';
      posterImg.width = 120;
      posterImg.height = 90;
      posterImg.loading = 'lazy';
      posterImg.decoding = 'async';
      videoBtn.appendChild(posterImg);
    }
    var playIcon = document.createElement('span');
    playIcon.className = 'kitten-detail__play-icon';
    playIcon.setAttribute('aria-hidden', 'true');
    playIcon.textContent = '\u25B6';
    videoBtn.appendChild(playIcon);

    videoBtn.addEventListener('click', async function () {
      await scheduler.yield();
      /* Replace hero with video player */
      var videoEl = document.createElement('video');
      videoEl.src = video.src;
      videoEl.controls = true;
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoEl.className = 'kitten-detail__video';
      if (video.poster) videoEl.poster = video.poster;

      /* Hide picture, insert video */
      mainPicture.hidden = true;
      var existingVideo = galleryEl.querySelector('.kitten-detail__video');
      if (existingVideo) existingVideo.remove();
      galleryEl.insertBefore(videoEl, strip);

      /* Update active state */
      strip.querySelectorAll('.kitten-detail__thumb--active').forEach(function (el) {
        el.classList.remove('kitten-detail__thumb--active');
      });
      videoBtn.classList.add('kitten-detail__thumb--active');
    }, { passive: true });

    strip.appendChild(videoBtn);
  }

  /* Re-show picture when a photo thumb is clicked (if video was playing) */
  strip.querySelectorAll('.kitten-detail__thumb:not(.kitten-detail__thumb--video)').forEach(function (btn) {
    btn.addEventListener('click', function () {
      mainPicture.hidden = false;
      var existingVideo = galleryEl.querySelector('.kitten-detail__video');
      if (existingVideo) existingVideo.remove();
    }, { passive: true });
  });

  galleryEl.appendChild(strip);

  /* --- Lightbox: click hero image to open full-size -------------------------
     Reuses existing lightbox-dialog if present on page                     */
  mainPicture.style.cursor = 'pointer';
  mainPicture.addEventListener('click', async function () {
    var dialog = document.getElementById('lightbox-dialog');
    if (!dialog) return;
    await scheduler.yield();
    dialog.querySelector('img').src = mainImg.src;
    dialog.querySelector('img').alt = mainImg.alt;
    dialog.showModal();
  }, { passive: true });
})();
