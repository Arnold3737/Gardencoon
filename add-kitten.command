#!/usr/bin/env bash
# =========================================================================
#  Garden State Coon — Добавить котёнка (macOS)
#
#  КАК ПОЛЬЗОВАТЬСЯ:
#    Дважды кликните по этому файлу (add-kitten.command).
#    Скрипт попросит перетащить папку с фотографиями котёнка в окно
#    Терминала — перетащите её и нажмите Enter.
#
#  Первый раз на macOS: если файл не запускается двойным кликом,
#  выполните один раз в Терминале:  chmod +x add-kitten.command
#  Путь к репозиторию определяется автоматически.
# =========================================================================
set -e
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$REPO/scripts/add-kitten.js"

if [ ! -f "$SCRIPT" ]; then
  echo "[ОШИБКА] Не найден scripts/add-kitten.js рядом с этим файлом."
  echo "Этот файл должен лежать в корне репозитория garden-state-coon."
  read -r -p "Нажмите Enter для выхода..."
  exit 1
fi

KITTEN="$1"
if [ -z "$KITTEN" ]; then
  echo ""
  echo "Перетащите сюда папку с фотографиями котёнка и нажмите Enter:"
  read -r KITTEN
fi

# Убираем кавычки/экранирование от drag-and-drop
KITTEN="${KITTEN%\"}"; KITTEN="${KITTEN#\"}"
KITTEN="${KITTEN//\\ / }"

if [ -z "$KITTEN" ] || [ ! -d "$KITTEN" ]; then
  echo "[ОШИБКА] Папка не найдена: $KITTEN"
  read -r -p "Нажмите Enter для выхода..."
  exit 1
fi

cd "$REPO"
node "$SCRIPT" "$KITTEN"

echo ""
echo "[УСПЕХ] Карточка опубликована. Сайт обновится через ~1 минуту."
read -r -p "Нажмите Enter для выхода..."
