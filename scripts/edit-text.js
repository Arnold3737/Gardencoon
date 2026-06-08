#!/usr/bin/env node
/* =============================================================================
 *  Garden State Coon — Инструмент редактирования текста на сайте
 *  ---------------------------------------------------------------------------
 *  Запускается так же просто, как add-kitten: запустил → выбрал страницу →
 *  ввёл старый текст → ввёл новый текст → подтвердил → опубликовалось.
 *
 *  Безопасность: заменяется ТОЛЬКО видимый текст между тегами. HTML-теги,
 *  ссылки, классы и атрибуты не трогаются, поэтому вёрстка не ломается.
 *
 *  Запуск (обычно через edit-text.bat / edit-text.command):
 *     node scripts/edit-text.js
 *  Флаги:
 *     --no-push   — не пушить (только локально закоммитить)
 *     --dry-run   — ничего не менять, только показать, что будет заменено
 * ===========================================================================*/

const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const NO_PUSH = process.argv.includes('--no-push');
const DRY_RUN = process.argv.includes('--dry-run');

// ── Человеко-понятные названия страниц (рус.) ────────────────────────────────
const PAGE_LABELS = {
  'index.html': 'Главная',
  'about.html': 'О нас / О питомнике',
  'our-cats.html': 'Наши кошки (производители)',
  'kittens.html': 'Доступные котята (список)',
  'gallery.html': 'Галерея',
  'contact.html': 'Контакты',
  'faq.html': 'Вопросы и ответы (FAQ)',
  'health-testing.html': 'Тестирование здоровья',
  'shipping.html': 'Доставка',
  'waiting-list.html': 'Лист ожидания',
  'purchase-contract.html': 'Договор покупки',
  'terms-of-sale.html': 'Условия продажи',
  'privacy-policy.html': 'Политика конфиденциальности',
  'cookie-policy.html': 'Политика cookie',
  '404.html': 'Страница 404 (не найдено)',
};

// ── Line-buffered ввод (работает и в терминале, и при передаче через pipe) ───
function makeAsker() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
  const queue = [];
  const waiters = [];
  rl.on('line', line => { if (waiters.length) waiters.shift()(line); else queue.push(line); });
  let closed = false;
  rl.on('close', () => { closed = true; while (waiters.length) waiters.shift()(null); });
  const nextLine = () => new Promise(res => {
    if (queue.length) return res(queue.shift());
    if (closed) return res(null);
    waiters.push(res);
  });
  const ask = async (question, { def = '', required = false } = {}) => {
    const hint = def ? ` [${def}]` : '';
    for (;;) {
      process.stdout.write(`${question}${hint}: `);
      const raw = await nextLine();
      let v = (raw == null ? '' : raw).trim();
      if (!v && def) v = def;
      if (!v && required) {
        if (raw == null) { console.error('\n❌ Ввод прерван, а поле обязательное.'); process.exit(1); }
        console.log('   ⚠️  Это поле обязательное, введите значение.'); continue;
      }
      return v;
    }
  };
  return { ask, close: () => rl.close() };
}

// ── Список HTML-страниц сайта (в корне репозитория) ──────────────────────────
function listPages() {
  const all = fs.readdirSync(REPO_ROOT)
    .filter(f => /\.html$/i.test(f))
    .filter(f => f !== 'kitten-detail.html'); // это шаблон, не реальная страница

  // Сначала «главные» страницы в удобном порядке, потом карточки котят, потом остальные
  const order = Object.keys(PAGE_LABELS);
  const main = order.filter(f => all.includes(f));
  const kittens = all.filter(f => /^kitten-detail-\d+\.html$/.test(f))
    .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));
  const known = new Set([...main, ...kittens]);
  const rest = all.filter(f => !known.has(f)).sort();
  return [...main, ...kittens, ...rest];
}

function pageLabel(file) {
  if (PAGE_LABELS[file]) return PAGE_LABELS[file];
  const m = file.match(/^kitten-detail-(\d+)\.html$/);
  if (m) return `Карточка котёнка №${m[1]}`;
  return file;
}

// ── Найти видимый текст между тегами, который содержит искомую строку ─────────
// Возвращаем массив совпадений: { index, before, match, after }
// Заменяем ТОЛЬКО текст вне тегов (между > и <), чтобы не сломать разметку.
function findVisibleMatches(html, needle) {
  const matches = [];
  const textNodeRe = />([^<]*)</g;
  let m;
  while ((m = textNodeRe.exec(html)) !== null) {
    const textNode = m[1];
    if (!textNode || !textNode.includes(needle)) continue;
    const nodeStart = m.index + 1; // позиция текста в html (после '>')
    let from = 0;
    let pos;
    while ((pos = textNode.indexOf(needle, from)) !== -1) {
      const absIndex = nodeStart + pos;
      const ctxBefore = html.slice(Math.max(0, absIndex - 40), absIndex);
      const ctxAfter = html.slice(absIndex + needle.length, absIndex + needle.length + 40);
      matches.push({ index: absIndex, before: ctxBefore, match: needle, after: ctxAfter });
      from = pos + needle.length;
    }
  }
  return matches;
}

function cleanCtx(s) {
  return s.replace(/\s+/g, ' ').trim();
}

function replaceAt(html, index, oldStr, newStr) {
  return html.slice(0, index) + newStr + html.slice(index + oldStr.length);
}

// ── Git: коммит + публикация (тот же поток, что у add-kitten) ────────────────
function gitPublish(file) {
  const run = (cmd) => execSync(cmd, { cwd: REPO_ROOT, stdio: 'inherit' });
  const runQuiet = (cmd) => { try { execSync(cmd, { cwd: REPO_ROOT, stdio: 'pipe' }); return true; } catch (_) { return false; } };
  console.log('\n📤 Git: коммит и публикация...');
  run('git add -A');
  run(`git commit -m "edit(text): update text on ${file}"`);
  if (NO_PUSH) { console.log('ℹ️  --no-push: пуш пропущен.'); return; }
  runQuiet('git pull --rebase');
  run('git push');
  console.log(`\n🚀 Опубликовано! Сайт обновится за ~1 минуту.`);
  console.log(`   → https://arnold3737.github.io/Gardencoon/${file}`);
}

// ── Главная логика ───────────────────────────────────────────────────────────
(async function main() {
  console.log('\n✏️  Garden State Coon — редактирование текста на сайте');
  if (DRY_RUN) console.log('   [DRY-RUN — изменения не сохраняются]');

  const { ask, close } = makeAsker();
  const pages = listPages();

  // 1) Выбор страницы
  console.log('\n📄 Выберите страницу (введите номер):\n');
  pages.forEach((f, i) => {
    console.log(`  ${String(i + 1).padStart(2)}. ${pageLabel(f)}   (${f})`);
  });
  console.log('');
  let pageIdx;
  for (;;) {
    const a = await ask('Номер страницы', { required: true });
    const n = parseInt(a, 10);
    if (Number.isInteger(n) && n >= 1 && n <= pages.length) { pageIdx = n - 1; break; }
    console.log(`   ⚠️  Введите число от 1 до ${pages.length}.`);
  }
  const file = pages[pageIdx];
  const filePath = path.join(REPO_ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');
  console.log(`\n✓ Выбрана страница: ${pageLabel(file)} (${file})`);

  // Цикл правок (можно сделать несколько замен за один запуск)
  let totalReplacements = 0;
  for (;;) {
    // 2) Что ищем
    console.log('\n— Введите кусочек СТАРОГО текста, который надо заменить.');
    console.log('  Подсказка: можно скопировать прямо с сайта. Достаточно короткой уникальной фразы.');
    const oldText = await ask('Старый текст', { required: true });

    const matches = findVisibleMatches(html, oldText);
    if (matches.length === 0) {
      console.log(`\n❌ Текст не найден на этой странице (или он внутри ссылки/кода).`);
      const again = await ask('Попробовать другой текст? (да/нет)', { def: 'да' });
      if (/^(да|д|yes|y)$/i.test(again)) continue;
      break;
    }

    // 3) Если несколько совпадений — показать и дать выбрать
    let target;
    if (matches.length === 1) {
      target = matches[0];
      console.log(`\n  Найдено 1 совпадение:`);
      console.log(`    …${cleanCtx(target.before)} 〈${target.match}〉 ${cleanCtx(target.after)}…`);
    } else {
      console.log(`\n  Найдено совпадений: ${matches.length}. Выберите нужное:\n`);
      matches.forEach((mt, i) => {
        console.log(`  ${i + 1}. …${cleanCtx(mt.before)} 〈${mt.match}〉 ${cleanCtx(mt.after)}…`);
      });
      console.log(`  ${matches.length + 1}. ВСЕ сразу (рекомендуется, если текст повторяется)`);
      console.log('');
      let sel;
      for (;;) {
        const a = await ask('Номер совпадения', { required: true });
        const n = parseInt(a, 10);
        if (Number.isInteger(n) && n >= 1 && n <= matches.length + 1) { sel = n; break; }
        console.log(`   ⚠️  Введите число от 1 до ${matches.length + 1}.`);
      }
      target = (sel === matches.length + 1) ? 'ALL' : matches[sel - 1];
    }

    // 4) Новый текст
    const newText = await ask('Новый текст', { required: true });

    // 5) Предпросмотр
    const refCtx = (target === 'ALL' ? matches[0] : target);
    console.log('\n  Предпросмотр замены:');
    console.log(`    БЫЛО:  …${cleanCtx(refCtx.before)} 〈${oldText}〉 …`);
    console.log(`    СТАЛО: …${cleanCtx(refCtx.before)} 〈${newText}〉 …`);
    if (target === 'ALL') console.log(`    (будет заменено ВСЕ ${matches.length} совпадений)`);

    const ok = await ask('Применить замену? (да/нет)', { def: 'да' });
    if (!/^(да|д|yes|y)$/i.test(ok)) {
      console.log('  ⏭️  Пропущено.');
    } else {
      if (target === 'ALL') {
        const sorted = [...matches].sort((a, b) => b.index - a.index); // с конца, чтобы индексы не сбивались
        for (const mt of sorted) html = replaceAt(html, mt.index, oldText, newText);
        totalReplacements += matches.length;
        console.log(`  ✓ Заменено совпадений: ${matches.length}`);
      } else {
        html = replaceAt(html, target.index, oldText, newText);
        totalReplacements += 1;
        console.log('  ✓ Заменено.');
      }
    }

    // 6) Ещё правка на этой же странице?
    const more = await ask('\nСделать ещё одну замену на этой же странице? (да/нет)', { def: 'нет' });
    if (!/^(да|д|yes|y)$/i.test(more)) break;
  }

  close();

  if (totalReplacements === 0) {
    console.log('\nℹ️  Изменений не сделано — выходим без публикации.');
    return;
  }

  if (DRY_RUN) {
    console.log(`\n✅ DRY-RUN: было бы заменено ${totalReplacements} мест. Файл НЕ сохранён.`);
    return;
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`\n💾 Сохранено: ${file} (замен: ${totalReplacements})`);

  gitPublish(file);
})().catch(err => {
  console.error('\n❌ Ошибка:', err.message);
  process.exit(1);
});
