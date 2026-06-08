#!/usr/bin/env bash
# =========================================================================
#  Garden State Coon — Add Kitten Launcher (macOS / Linux)
#
#  КАК ПОЛЬЗОВАТЬСЯ:
#  1. Скопируй эту папку (kitten-template) рядом с фото нового котёнка
#     ИЛИ положи run.sh + kitten.json в папку с фото.
#  2. Ниже укажи путь к папке репозитория garden-state-coon на своём компе.
#  3. Отредактируй kitten.json (имя, пол, окрас, дата, цена...).
#  4. Запусти: chmod +x run.sh && ./run.sh
# =========================================================================

# >>> ОТРЕДАКТИРУЙ ЭТУ СТРОКУ <<<
REPO="$HOME/garden-state-coon"

# ─── не меняй ниже ───────────────────────────────────────────────────────
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -f "$REPO/scripts/add-kitten.js" ]; then
  echo "[ОШИБКА] Скрипт не найден: $REPO/scripts/add-kitten.js"
  echo "Проверь переменную REPO в этом файле."
  exit 1
fi

cd "$REPO"
node "$REPO/scripts/add-kitten.js" "$SCRIPT_DIR"

echo ""
echo "[УСПЕХ] Карточка опубликована. Сайт обновится через ~1 минуту."
