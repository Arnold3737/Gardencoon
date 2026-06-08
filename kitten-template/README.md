# 🐱 Добавление нового котёнка на сайт

Папка-шаблон для автоматической публикации новой карточки котёнка на gardenstatecoon.com.

## Как работает

1. Ты собираешь **одну папку на одного котёнка**, в ней:
   - `kitten.json` — данные (имя, пол, окрас, цена и т.д.)
   - **1–4 фотографии** (`.jpg`, `.jpeg`, `.png`, `.webp`) — первое фото будет главным
   - **0–1 видео** (`.mp4`, `.mov`, `.webm`) — опционально
   - `run.bat` (Windows) или `run.sh` (Mac/Linux) — запускает всю магию
2. Двойной клик по `run.bat` — и скрипт:
   - 📸 обрежет каждое фото в 7 размеров-форматов (AVIF/WebP/JPG × 640/1024/1920)
   - 🎬 скопирует видео
   - 📝 создаст `kitten-detail-N.html` со всеми SEO-мета, JSON-LD, Open Graph
   - 🔄 добавит карточку на `kittens.html` и обновит JSON-LD каталога
   - 🗺️ допишет URL в `sitemap.xml`
   - 📤 сделает git commit + push в `main`
   - 🚀 GitHub Pages задеплоит сайт за ~1 минуту

## Первоначальная настройка (один раз)

1. **Открой `run.bat`** (или `run.sh`) в блокноте.
2. **Измени строку `set "REPO=..."`** на путь к репозиторию `garden-state-coon` на твоём ПК.
   Например: `set "REPO=C:\Users\ВашеИмя\Documents\github\garden-state-coon"`
3. Убедись, что установлен **Node.js** ([nodejs.org](https://nodejs.org)) и в репозитории выполнено `npm install` (это подтянет `sharp`).
4. Убедись, что `git push` в репозиторий проходит без запроса пароля (GitHub Desktop, SSH-ключ или credential manager).

## Использование для каждого нового помёта/котёнка

1. **Скопируй** папку `kitten-template` рядом с фотографиями, переименуй её в имя котёнка (например, `nova`).
2. **Положи внутрь** 1–4 фото и (опционально) одно видео.
3. **Открой `kitten.json`** в любом текстовом редакторе и заполни:
   ```json
   {
     "name": "Nova",
     "gender": "Female",
     "color": "Silver Shaded",
     "status": "available",
     "description": "Текст описания характера котёнка...",
     "healthTesting": "Health-screened parents from registered lines; examined by our veterinarian.",
     "sire": { "name": "Hudson", "title": "Brown Classic Tabby · Registered lines · Health-screened" },
     "dam":  { "name": "Willow", "title": "Blue Smoke · Registered lines · Health-screened" }
   }
   ```
4. **Двойной клик по `run.bat`**. Всё.

## Поля в `kitten.json`

| Поле            | Обязательно | Пример                                                  |
|-----------------|-------------|---------------------------------------------------------|
| `name`          | ✅          | `"Nova"`                                                |
| `gender`        | ✅          | `"Female"` / `"Male"`                                   |
| `color`         | ✅          | `"Silver Shaded"`                                       |
| `status`        | ✅          | `"available"` / `"reserved"` / `"sold"` / `"coming-soon"` |
| `description`   | ✅          | 1–3 предложения                                         |
| `born`          | ⬜          | `"April 5, 2026"`                                       |
| `price`         | ⬜          | Price available upon request                            |
| `healthTesting` | ⬜          | По умолчанию стандартный текст                          |
| `sire`          | ⬜          | `{ "name": "...", "title": "..." }` — отец             |
| `dam`           | ⬜          | `{ "name": "...", "title": "..." }` — мать             |

## Режимы запуска

- **Обычный** (двойной клик на `run.bat`) — публикует всё.
- **Dry-run** — ничего не меняет, только показывает план.
  Запусти из терминала: `node scripts/add-kitten.js C:\path\to\kitten-folder --dry-run`
- **Без пуша** — делает локальные изменения и коммит, но не пушит.
  `node scripts/add-kitten.js C:\path\to\kitten-folder --no-push`

## Что делать если что-то пошло не так

- **`[ОШИБКА] Скрипт не найден`** — исправь путь `REPO` в `run.bat`.
- **`kitten.json не найден`** — убедись, что файл лежит в той же папке что и `run.bat`.
- **`sharp not found`** — в папке репозитория выполни `npm install`.
- **Ошибка `git push`** — нужно залогиниться в GitHub (GitHub Desktop, `gh auth login`, или SSH-ключ).
- **Неверные данные в карточке** — отредактируй сгенерированные файлы вручную и сделай ещё один коммит, либо откати последний коммит: `git reset --hard HEAD~1` и запусти скрипт заново.

## Советы по фото

- **Первое фото** (после сортировки по имени — `01.jpg`, `02.jpg`, ...) станет главным: оно будет в превью на `kittens.html`, в hero на карточке и в Open Graph для соцсетей.
- Оптимально: исходник **≥1920px** по ширине, соотношение близко к 4:3 или 16:9.
- Чем больше исходное фото, тем лучше будут AVIF/WebP варианты. Скрипт автоматически уменьшит, но не увеличит.
